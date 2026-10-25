// Liste toutes les phrases françaises à traduire et indique, pour chaque langue, celles qui manquent.
// Usage : npx tsx scripts/i18n-extract.ts            (écrit lib/i18n/messages/_source.json)
//         npx tsx scripts/i18n-extract.ts --missing de   (affiche les phrases sans traduction allemande)
import fs from "node:fs";
import path from "node:path";
import { STEPS, SLIDER, LEVIERS, TEMPS, ETAPES_CALCUL, PARCOURS } from "../lib/funnel/steps";
import { QUESTIONS } from "../lib/quiz-questions";
import { buildSeed } from "../lib/ideas-seed";
import { LOCALES } from "../lib/i18n/locales";

const ROOT = path.join(__dirname, "..");
const DIRS = ["app", "components", "lib"];
const SKIP = new Set(["app/app/admin", "app/api/admin", "lib/i18n/messages"]); // l'onglet Admin reste en français (Aurèle seul)
const keys = new Set<string>();

function walk(dir: string): string[] {
  const rel = path.relative(ROOT, dir);
  if ([...SKIP].some((s) => rel.startsWith(s))) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.(tsx?|mjs)$/.test(e.name) ? [p] : [];
  });
}

const STR = String.raw`("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\`\\$]|\\.)*\`)`;
const PATTERNS = [
  new RegExp(String.raw`\b(?:t|tr|tk|fail)\(\s*${STR}`, "g"),
  new RegExp(String.raw`\bmessage:\s*${STR}`, "g"),
  new RegExp(String.raw`\.(?:email|min\(\d+,|max\(\d+,)\s*${STR}`, "g"),
  new RegExp(String.raw`throw new Error\(\s*${STR}`, "g"),
];

function unquote(q: string): string {
  if (q[0] === '"') return JSON.parse(q);
  return q.slice(1, -1).replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c));
}

const add = (s: unknown) => {
  if (typeof s === "string" && /\p{L}/u.test(s)) keys.add(s);
};

for (const d of DIRS)
  for (const f of walk(path.join(ROOT, d))) {
    const src = fs.readFileSync(f, "utf8");
    for (const re of PATTERNS) for (const m of src.matchAll(re)) add(unquote(m[1]));
  }

// Textes du sondage public (traduits à l'affichage par le moteur)
for (const s of STEPS) {
  [s.kicker, s.titre, s.aide, s.placeholder, s.sous, s.cta, s.apresChoix, s.libre?.placeholder, s.libre?.label].forEach(add);
  s.options?.forEach((o) => [o.label, o.detail, o.note].forEach(add));
}
SLIDER.paliers.forEach((p) => [p.mot, p.note].forEach(add));
LEVIERS.forEach((l) => [l.question, l.detail, l.libelle, l.action].forEach(add));
Object.values(TEMPS).forEach(add);
ETAPES_CALCUL.forEach(add);
PARCOURS.forEach((p) => [p.titre, p.texte].forEach(add));
// Libellés des réponses (page de résultats) et noms des catégories d'idées
QUESTIONS.forEach((q) => q.o?.forEach((o) => add(o[1])));
buildSeed().categories.forEach((c) => add(c.name));

const list = [...keys].sort((a, b) => a.localeCompare(b, "fr"));
const OUT = path.join(ROOT, "lib/i18n/messages");
fs.writeFileSync(path.join(OUT, "_source.json"), JSON.stringify(list, null, 1) + "\n");

const want = process.argv.indexOf("--missing");
if (want > 0) {
  const loc = process.argv[want + 1];
  const file = path.join(OUT, `${loc}.json`);
  const dict = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  console.log(JSON.stringify(list.filter((k) => !dict[k]), null, 1));
} else {
  console.log(`${list.length} phrases.`);
  for (const l of LOCALES) {
    if (l.code === "fr") continue;
    const file = path.join(OUT, `${l.code}.json`);
    const dict = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
    console.log(`${l.code} : ${list.filter((k) => dict[k]).length}/${list.length}`);
  }
}
