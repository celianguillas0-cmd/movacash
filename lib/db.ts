import path from "node:path";
import fs from "node:fs";
import { buildSeed } from "./ideas-seed";

// Base Postgres.
// En production (Vercel) : Neon, branché depuis Vercel → Storage, qui fournit DATABASE_URL tout seul.
// Sans DATABASE_URL : PGlite, un Postgres embarqué (dossier ./data/pglite en local ; en mémoire sur Vercel,
// pour que le site s'affiche en mode démo avant que la base soit branchée, sans rien conserver).
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const LOCAL_DIR = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "pglite");

export type Args = unknown[] | Record<string, unknown>;
export interface Statement { sql: string; args?: Args }
type Result = { rows: Record<string, unknown>[]; rowCount: number };

interface Driver {
  query(sql: string, params: unknown[]): Promise<Result>;
  transaction(stmts: { sql: string; params: unknown[] }[]): Promise<Result[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __db: { ready: Promise<Driver> } | undefined;
}

const SCHEMA = [
  // Équivalent de la fonction SQLite utilisée partout pour les dates (secondes depuis 1970)
  `CREATE OR REPLACE FUNCTION unixepoch() RETURNS integer LANGUAGE sql STABLE AS $$ SELECT extract(epoch FROM now())::integer $$`,
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    plan TEXT,
    sub_status TEXT NOT NULL DEFAULT 'none',
    current_period_end INTEGER,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    is_demo_sub INTEGER NOT NULL DEFAULT 0,
    withdrawal_waiver_at INTEGER,
    quiz_json TEXT,
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  `CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, name TEXT NOT NULL, emoji TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category_slug TEXT NOT NULL REFERENCES categories(slug),
    audience TEXT NOT NULL DEFAULT '',
    keywords TEXT NOT NULL DEFAULT '',
    format TEXT NOT NULL DEFAULT 'Guide complet',
    difficulty INTEGER NOT NULL DEFAULT 1,
    demand INTEGER NOT NULL DEFAULT 3,
    competition INTEGER NOT NULL DEFAULT 3,
    price_min INTEGER NOT NULL DEFAULT 5,
    price_max INTEGER NOT NULL DEFAULT 10,
    sensitive TEXT,
    search_text TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  `CREATE INDEX IF NOT EXISTS ideas_category ON ideas(category_slug)`,
  `CREATE INDEX IF NOT EXISTS ideas_demand ON ideas(demand DESC, competition ASC)`,
  `CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT unixepoch(),
    PRIMARY KEY (user_id, idea_id)
  )`,
  `CREATE TABLE IF NOT EXISTS ebooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    topic TEXT NOT NULL DEFAULT '',
    audience TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'fr',
    tone TEXT NOT NULL DEFAULT 'pedagogique',
    author_name TEXT NOT NULL DEFAULT '',
    sensitive TEXT,
    status TEXT NOT NULL DEFAULT 'outline',
    promise TEXT NOT NULL DEFAULT '',
    cover_json TEXT NOT NULL DEFAULT '{}',
    etsy_json TEXT,
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT unixepoch(),
    updated_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  `CREATE INDEX IF NOT EXISTS ebooks_user ON ebooks(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    ebook_id INTEGER NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
    idx INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    key_points TEXT NOT NULL DEFAULT '[]',
    content_md TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    UNIQUE (ebook_id, idx)
  )`,
  // Génération comptée au moment de la création : supprimer un e-book ne rend pas de crédit
  `CREATE TABLE IF NOT EXISTS generations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ebook_id INTEGER,
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  `CREATE INDEX IF NOT EXISTS generations_user ON generations(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS cancellations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    plan TEXT,
    reason TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)`,
  // Photo de la miniature Etsy (une par e-book, régénérable deux fois)
  `CREATE TABLE IF NOT EXISTS ebook_photos (
    ebook_id INTEGER PRIMARY KEY REFERENCES ebooks(id) ON DELETE CASCADE,
    mime TEXT NOT NULL DEFAULT 'image/jpeg',
    data TEXT NOT NULL,
    tries INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  // Coût estimé de chaque appel Gemini / Imagen (onglet Admin)
  `CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    kind TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_in INTEGER NOT NULL DEFAULT 0,
    tokens_out INTEGER NOT NULL DEFAULT 0,
    cost_eur DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
  // Avis laissés depuis Paramètres, visibles dans l'onglet Admin
  `CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email TEXT NOT NULL DEFAULT '',
    note INTEGER,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT unixepoch()
  )`,
];

// Colonnes ajoutées après la v1
const COLUMNS: [table: string, column: string, def: string][] = [
  ["users", "billing_interval", "TEXT NOT NULL DEFAULT 'month'"],
  ["users", "cancel_at_period_end", "INTEGER NOT NULL DEFAULT 0"],
  ["users", "quota_plan", "TEXT"], // offre dont le quota reste acquis jusqu'à quota_plan_until (après un passage à une offre inférieure)
  ["users", "quota_plan_until", "INTEGER"],
  ["users", "session_version", "INTEGER NOT NULL DEFAULT 1"],
  ["users", "author_name", "TEXT NOT NULL DEFAULT ''"],
  ["users", "default_language", "TEXT"],
  ["users", "default_tone", "TEXT"],
  ["users", "my_idea_id", "INTEGER"], // « Mon idée » : la première idée trouvée dans l'atelier, ou celle choisie ensuite
  ["users", "real_mode", "INTEGER NOT NULL DEFAULT 0"], // admin : 1 = vraies générations ; par défaut, mode tournage (écran de génération sans appel à l'API)
  ["users", "email_tips", "INTEGER NOT NULL DEFAULT 1"],
  ["users", "banned", "INTEGER NOT NULL DEFAULT 0"], // compte suspendu depuis l'onglet Admin : plus de connexion ni de génération
  ["users", "quota_override", "INTEGER"], // limite d'e-books par mois fixée à la main par l'admin (remplace celle de la formule)
  ["api_usage", "user_id", "INTEGER"],
];

// Texte de recherche d'une idée : minuscules, sans accents
export function searchText(...parts: string[]) {
  return parts.join(" ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function migrate(d: Driver) {
  // Un verrou évite que deux instances créent les tables en même temps au premier démarrage
  await d.transaction([
    { sql: "SELECT pg_advisory_xact_lock(727200)", params: [] },
    ...SCHEMA.map((sql) => ({ sql, params: [] })),
    ...COLUMNS.map(([t, col, def]) => ({ sql: `ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS ${col} ${def}`, params: [] })),
  ]);
  const n = Number((await d.query("SELECT COUNT(*) AS n FROM ideas", [])).rows[0].n);
  if (n === 0) await seedIdeas(d);
}

export async function seedIdeas(d?: Driver, { reset = false } = {}) {
  d ??= await getClient();
  const { categories, ideas } = buildSeed();
  const stmts: Statement[] = [];
  if (reset) stmts.push({ sql: "DELETE FROM favorites" }, { sql: "UPDATE ebooks SET idea_id = NULL" }, { sql: "DELETE FROM ideas" }, { sql: "DELETE FROM categories" });
  for (const c of categories)
    stmts.push({ sql: "INSERT INTO categories (slug, name, emoji) VALUES (?, ?, ?) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, emoji = EXCLUDED.emoji", args: [c.slug, c.name, c.emoji] });
  const catName = new Map(categories.map((x) => [x.slug, x.name]));
  // Insertion par lots de 200 idées (une requête par lot)
  for (let k = 0; k < ideas.length; k += 200) {
    const chunk = ideas.slice(k, k + 200);
    stmts.push({
      sql: `INSERT INTO ideas (slug, title, category_slug, audience, keywords, format, difficulty, demand, competition, price_min, price_max, sensitive, search_text)
            VALUES ${chunk.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")} ON CONFLICT (slug) DO NOTHING`,
      args: chunk.flatMap((i) => [i.slug, i.title, i.categorySlug, i.audience, i.keywords, i.format, i.difficulty, i.demand, i.competition, i.priceMin, i.priceMax, i.sensitive,
        searchText(i.title, i.audience, i.keywords, catName.get(i.categorySlug) || "")]),
    });
  }
  await d.transaction(stmts.map(compile));
  return ideas.length;
}

// « ? » et « @nom » (style SQLite) -> $1, $2… (Postgres). Les booléens deviennent 0/1 (colonnes INTEGER).
function compile({ sql, args = [] }: Statement) {
  const params: unknown[] = [];
  const named = new Map<string, number>();
  const val = (v: unknown) => (typeof v === "boolean" ? (v ? 1 : 0) : v === undefined ? null : v);
  let out = "", inStr = false, pos = 0;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'") { inStr = !inStr; out += ch; continue; }
    if (!inStr && ch === "?" && Array.isArray(args)) { params.push(val(args[pos++])); out += `$${params.length}`; continue; }
    if (!inStr && ch === "@" && !Array.isArray(args)) {
      const m = /^@([a-zA-Z_]\w*)/.exec(sql.slice(i));
      if (m) {
        if (!named.has(m[1])) { params.push(val(args[m[1]])); named.set(m[1], params.length); }
        out += `$${named.get(m[1])}`;
        i += m[0].length - 1;
        continue;
      }
    }
    out += ch;
  }
  return { sql: out, params };
}

async function open(): Promise<Driver> {
  if (DATABASE_URL) {
    const { neon, types } = await import("@neondatabase/serverless");
    // COUNT(*) et les grands entiers arrivent en texte : on les veut en nombres
    types.setTypeParser(20, (v: string) => parseInt(v, 10));
    types.setTypeParser(1700, (v: string) => parseFloat(v));
    const sql = neon(DATABASE_URL, { fullResults: true });
    return {
      query: async (text, params) => {
        const r = await sql.query(text, params);
        return { rows: r.rows as Record<string, unknown>[], rowCount: r.rowCount ?? 0 };
      },
      transaction: async (stmts) => {
        const rs = await sql.transaction(stmts.map((s) => sql.query(s.sql, s.params)));
        return rs.map((r) => ({ rows: r.rows as Record<string, unknown>[], rowCount: r.rowCount ?? 0 }));
      },
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const onVercel = !!process.env.VERCEL;
  if (!onVercel) fs.mkdirSync(path.dirname(LOCAL_DIR), { recursive: true });
  const db = new PGlite(onVercel ? undefined : LOCAL_DIR, { parsers: { 20: (v: string) => parseInt(v, 10), 1700: (v: string) => parseFloat(v) } });
  const wrap = (r: { rows: unknown[]; affectedRows?: number }) => ({ rows: r.rows as Record<string, unknown>[], rowCount: r.affectedRows ?? 0 });
  return {
    query: async (text, params) => wrap(await db.query(text, params)),
    transaction: (stmts) => db.transaction(async (tx) => {
      const out: Result[] = [];
      for (const s of stmts) out.push(wrap(await tx.query(s.sql, s.params)));
      return out;
    }),
  };
}

export async function getClient() {
  if (!global.__db) {
    const ready = (async () => {
      const d = await open();
      await migrate(d);
      // Les e-books créés avant l'existence de la table comptent dans le quota
      await d.query("INSERT INTO generations (user_id, ebook_id, created_at) SELECT user_id, id, created_at FROM ebooks WHERE id NOT IN (SELECT ebook_id FROM generations WHERE ebook_id IS NOT NULL)", []);
      return d;
    })();
    global.__db = { ready };
    ready.catch(() => (global.__db = undefined));
  }
  return global.__db.ready;
}

export function usingDemoDatabase() {
  return !DATABASE_URL && !!process.env.VERCEL;
}

export async function all<T>(sql: string, args: Args = []): Promise<T[]> {
  const c = compile({ sql, args });
  return (await (await getClient()).query(c.sql, c.params)).rows as T[];
}

export async function one<T>(sql: string, args: Args = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}

export async function run(sql: string, args: Args = []) {
  const c = compile({ sql, args });
  return { changes: (await (await getClient()).query(c.sql, c.params)).rowCount };
}

// Plusieurs écritures dans une même transaction
export async function batch(stmts: Statement[]) {
  return (await getClient()).transaction(stmts.map(compile));
}
