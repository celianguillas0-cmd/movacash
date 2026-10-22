// Import en masse d'idées depuis un CSV (séparateur « ; »), pour faire grandir la base vers 10 000+ idées.
// Colonnes : titre;categorie_slug;public;mots_cles;prix_min;prix_max
// Usage : npm run import-ideas -- chemin/vers/idees.csv
import fs from "node:fs";
import { getDb } from "../lib/db";
import { slugify } from "../lib/ideas-seed";

const file = process.argv[2];
if (!file) throw new Error("Chemin du CSV manquant");
const db = getDb();
const cats = new Map(
  (db.prepare("SELECT slug, name FROM categories").all() as { slug: string; name: string }[]).map((c) => [c.slug, c.name])
);
const ins = db.prepare(`INSERT OR IGNORE INTO ideas (slug, title, category_slug, audience, keywords, format, difficulty, demand, competition, price_min, price_max, sensitive)
  VALUES (?, ?, ?, ?, ?, 'Guide complet', 2, 3, 3, ?, ?, (SELECT sensitive FROM ideas WHERE category_slug = ? AND sensitive IS NOT NULL LIMIT 1))`);
const fts = db.prepare("INSERT INTO ideas_fts (rowid, title, audience, keywords, category) VALUES (?, ?, ?, ?, ?)");
let added = 0, skipped = 0;
db.transaction(() => {
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/).slice(1)) {
    const [title, cat, audience = "", keywords = "", pmin = "5", pmax = "10"] = line.split(";").map((s) => s.trim());
    if (!title || !cats.has(cat)) { if (line.trim()) skipped++; continue; }
    const r = ins.run(slugify(title), title, cat, audience, keywords, Number(pmin), Number(pmax), cat);
    if (r.changes) { fts.run(r.lastInsertRowid, title, audience, keywords, cats.get(cat)); added++; } else skipped++;
  }
})();
console.log(`${added} idée(s) ajoutée(s), ${skipped} ignorée(s) (doublon ou catégorie inconnue)`);
