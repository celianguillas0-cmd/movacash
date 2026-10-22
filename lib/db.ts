import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { buildSeed } from "./ideas-seed";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "movacash.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
    );

    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS ideas (
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
    );
    CREATE INDEX IF NOT EXISTS ideas_category ON ideas(category_slug);
    CREATE INDEX IF NOT EXISTS ideas_demand ON ideas(demand DESC, competition ASC);

    CREATE VIRTUAL TABLE IF NOT EXISTS ideas_fts USING fts5(
      title, audience, keywords, category,
      content='', tokenize='unicode61 remove_diacritics 2'
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, idea_id)
    );

    CREATE TABLE IF NOT EXISTS ebooks (
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
    );
    CREATE INDEX IF NOT EXISTS ebooks_user ON ebooks(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ebook_id INTEGER NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
      idx INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      key_points TEXT NOT NULL DEFAULT '[]',
      content_md TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      UNIQUE (ebook_id, idx)
    );
  `);
}

export function seedIdeas(db: Database.Database, { reset = false } = {}) {
  const { categories, ideas } = buildSeed();
  const tx = db.transaction(() => {
    if (reset) {
      db.exec("INSERT INTO ideas_fts(ideas_fts) VALUES('delete-all'); DELETE FROM favorites; UPDATE ebooks SET idea_id = NULL; DELETE FROM ideas; DELETE FROM categories;");
    }
    const insCat = db.prepare("INSERT OR REPLACE INTO categories (slug, name, emoji) VALUES (?, ?, ?)");
    for (const c of categories) insCat.run(c.slug, c.name, c.emoji);
    const catName = new Map(categories.map((c) => [c.slug, c.name]));
    const insIdea = db.prepare(`INSERT OR IGNORE INTO ideas
      (slug, title, category_slug, audience, keywords, format, difficulty, demand, competition, price_min, price_max, sensitive)
      VALUES (@slug, @title, @categorySlug, @audience, @keywords, @format, @difficulty, @demand, @competition, @priceMin, @priceMax, @sensitive)`);
    const insFts = db.prepare("INSERT INTO ideas_fts (rowid, title, audience, keywords, category) VALUES (?, ?, ?, ?, ?)");
    for (const i of ideas) {
      const r = insIdea.run(i);
      if (r.changes) insFts.run(r.lastInsertRowid, i.title, i.audience, i.keywords, catName.get(i.categorySlug) || "");
    }
  });
  tx();
  return ideas.length;
}

export function getDb() {
  if (!global.__db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM ideas").get() as { n: number };
    if (n === 0) seedIdeas(db);
    global.__db = db;
  }
  return global.__db;
}
