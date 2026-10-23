import type { Client, InArgs, InStatement } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { buildSeed } from "./ideas-seed";

// En production (Vercel) : base Turso via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
// En local : fichier SQLite (DATABASE_PATH, par défaut ./data/movacash.db).
const LOCAL_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "movacash.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: { ready: Promise<Client> } | undefined;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, name TEXT NOT NULL, emoji TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE INDEX IF NOT EXISTS ideas_category ON ideas(category_slug)`,
  `CREATE INDEX IF NOT EXISTS ideas_demand ON ideas(demand DESC, competition ASC)`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS ideas_fts USING fts5(title, audience, keywords, category, content='', tokenize='unicode61 remove_diacritics 2')`,
  `CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (user_id, idea_id)
  )`,
  `CREATE TABLE IF NOT EXISTS ebooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE INDEX IF NOT EXISTS ebooks_user ON ebooks(user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ebook_id INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE INDEX IF NOT EXISTS generations_user ON generations(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS cancellations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan TEXT,
    reason TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)`,
];

// Colonnes ajoutées après la v1 (ALTER TABLE ignoré si la colonne existe déjà)
const COLUMNS: [table: string, column: string, def: string][] = [
  ["users", "billing_interval", "TEXT NOT NULL DEFAULT 'month'"],
  ["users", "cancel_at_period_end", "INTEGER NOT NULL DEFAULT 0"],
  ["users", "quota_plan", "TEXT"], // offre dont le quota reste acquis jusqu'à quota_plan_until (après un passage à une offre inférieure)
  ["users", "quota_plan_until", "INTEGER"],
  ["users", "session_version", "INTEGER NOT NULL DEFAULT 1"],
  ["users", "author_name", "TEXT NOT NULL DEFAULT ''"],
  ["users", "default_language", "TEXT"],
  ["users", "default_tone", "TEXT"],
  ["users", "email_tips", "INTEGER NOT NULL DEFAULT 1"],
];

async function migrate(c: Client) {
  await c.batch(SCHEMA, "write");
  for (const [t, col, def] of COLUMNS) {
    const cols = (await c.execute(`PRAGMA table_info(${t})`)).rows.map((r) => r.name);
    if (!cols.includes(col)) await c.execute(`ALTER TABLE ${t} ADD COLUMN ${col} ${def}`);
  }
  // Les e-books créés avant l'existence de la table comptent dans le quota
  await c.execute("INSERT INTO generations (user_id, ebook_id, created_at) SELECT user_id, id, created_at FROM ebooks WHERE id NOT IN (SELECT ebook_id FROM generations WHERE ebook_id IS NOT NULL)");
  const n = Number((await c.execute("SELECT COUNT(*) AS n FROM ideas")).rows[0].n);
  if (n === 0) await seedIdeas(c);
}

export async function seedIdeas(c: Client, { reset = false } = {}) {
  const { categories, ideas } = buildSeed();
  const stmts: InStatement[] = [];
  if (reset)
    stmts.push(
      "INSERT INTO ideas_fts(ideas_fts) VALUES('delete-all')",
      "DELETE FROM favorites",
      "UPDATE ebooks SET idea_id = NULL",
      "DELETE FROM ideas",
      "DELETE FROM categories"
    );
  for (const cat of categories) stmts.push({ sql: "INSERT OR REPLACE INTO categories (slug, name, emoji) VALUES (?, ?, ?)", args: [cat.slug, cat.name, cat.emoji] });
  await c.batch(stmts, "write");
  const catName = new Map(categories.map((x) => [x.slug, x.name]));
  // Insertion par lots : l'idée puis son entrée de recherche (même rowid)
  for (let k = 0; k < ideas.length; k += 200) {
    const chunk: InStatement[] = [];
    for (const i of ideas.slice(k, k + 200)) {
      chunk.push({
        sql: `INSERT OR IGNORE INTO ideas (slug, title, category_slug, audience, keywords, format, difficulty, demand, competition, price_min, price_max, sensitive)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [i.slug, i.title, i.categorySlug, i.audience, i.keywords, i.format, i.difficulty, i.demand, i.competition, i.priceMin, i.priceMax, i.sensitive],
      });
      chunk.push({
        sql: `INSERT INTO ideas_fts (rowid, title, audience, keywords, category)
              SELECT id, ?, ?, ?, ? FROM ideas WHERE slug = ? AND id NOT IN (SELECT rowid FROM ideas_fts WHERE rowid = ideas.id)`,
        args: [i.title, i.audience, i.keywords, catName.get(i.categorySlug) || "", i.slug],
      });
    }
    await c.batch(chunk, "write");
  }
  return ideas.length;
}

// Turso : client HTTP pur JavaScript (aucun module natif à embarquer sur Vercel). Local : fichier SQLite.
async function open(): Promise<Client> {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    const { createClient } = await import("@libsql/client/web");
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  const { createClient } = await import("@libsql/client");
  fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
  return createClient({ url: `file:${LOCAL_PATH}` });
}

export async function getClient() {
  if (!global.__db) {
    const ready = (async () => {
      const client = await open();
      if (!process.env.TURSO_DATABASE_URL) await client.execute("PRAGMA journal_mode = WAL");
      await client.execute("PRAGMA foreign_keys = ON");
      await migrate(client);
      return client;
    })();
    global.__db = { ready };
    ready.catch(() => (global.__db = undefined));
  }
  return global.__db.ready;
}

type Args = InArgs;

// Ligne SQL -> objet simple (les valeurs bigint éventuelles deviennent des nombres)
function plain<T>(row: Record<string, unknown>, columns: string[]): T {
  const o: Record<string, unknown> = {};
  for (const c of columns) {
    const v = row[c];
    o[c] = typeof v === "bigint" ? Number(v) : v;
  }
  return o as T;
}

export async function all<T>(sql: string, args: Args = []): Promise<T[]> {
  const r = await (await getClient()).execute({ sql, args });
  return r.rows.map((row) => plain<T>(row as unknown as Record<string, unknown>, r.columns));
}

export async function one<T>(sql: string, args: Args = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}

export async function run(sql: string, args: Args = []) {
  const r = await (await getClient()).execute({ sql, args });
  return { changes: r.rowsAffected, lastId: r.lastInsertRowid === undefined ? 0 : Number(r.lastInsertRowid) };
}

// Plusieurs écritures dans une même transaction
export async function batch(stmts: InStatement[]) {
  return (await getClient()).batch(stmts, "write");
}
