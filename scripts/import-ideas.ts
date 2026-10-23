// Import en masse d'idées depuis un CSV (séparateur « ; »), pour faire grandir la base vers 10 000+ idées.
// Colonnes : titre;categorie_slug;public;mots_cles;prix_min;prix_max
// Usage : npm run import-ideas -- chemin/vers/idees.csv
import fs from "node:fs";
import type { InStatement } from "@libsql/client";
import { all, batch } from "../lib/db";
import { slugify } from "../lib/ideas-seed";

(async () => {
  const file = process.argv[2];
  if (!file) throw new Error("Chemin du CSV manquant");
  const cats = new Map((await all<{ slug: string; name: string }>("SELECT slug, name FROM categories")).map((c) => [c.slug, c.name]));
  const known = new Set((await all<{ slug: string }>("SELECT slug FROM ideas")).map((r) => r.slug));
  const stmts: InStatement[] = [];
  let added = 0, skipped = 0;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/).slice(1)) {
    const [title, cat, audience = "", keywords = "", pmin = "5", pmax = "10"] = line.split(";").map((s) => s.trim());
    const slug = title ? slugify(title) : "";
    if (!title || !cats.has(cat) || known.has(slug)) { if (line.trim()) skipped++; continue; }
    known.add(slug);
    stmts.push(
      {
        sql: `INSERT INTO ideas (slug, title, category_slug, audience, keywords, format, difficulty, demand, competition, price_min, price_max, sensitive)
              VALUES (?, ?, ?, ?, ?, 'Guide complet', 2, 3, 3, ?, ?, (SELECT sensitive FROM ideas WHERE category_slug = ? AND sensitive IS NOT NULL LIMIT 1))`,
        args: [slug, title, cat, audience, keywords, Number(pmin), Number(pmax), cat],
      },
      { sql: "INSERT INTO ideas_fts (rowid, title, audience, keywords, category) VALUES (last_insert_rowid(), ?, ?, ?, ?)", args: [title, audience, keywords, cats.get(cat) || ""] }
    );
    added++;
  }
  for (let k = 0; k < stmts.length; k += 400) await batch(stmts.slice(k, k + 400));
  console.log(`${added} idée(s) ajoutée(s), ${skipped} ignorée(s) (doublon ou catégorie inconnue)`);
})();
