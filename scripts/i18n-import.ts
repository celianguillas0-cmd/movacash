// Importe des traductions au format « numéro<TAB>traduction » (numéros de lib/i18n/messages/_source.json)
// dans lib/i18n/messages/<langue>.json, en vérifiant que les {variables} et les balises <1></1> sont conservées.
// Usage : npx tsx scripts/i18n-import.ts de traductions-de.tsv
import fs from "node:fs";
import path from "node:path";

const [loc, file] = process.argv.slice(2);
const DIR = path.join(__dirname, "../lib/i18n/messages");
const source: string[] = JSON.parse(fs.readFileSync(path.join(DIR, "_source.json"), "utf8"));
const out = path.join(DIR, `${loc}.json`);
const dict: Record<string, string> = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};

const marks = (s: string) => [...s.matchAll(/\{\w+\}|<\/?\d+>|<\/?strong>|<\/?b>/g)].map((m) => m[0]).sort().join(" ");
let n = 0;
const problems: string[] = [];
for (const line of fs.readFileSync(file, "utf8").split("\n")) {
  const tab = line.indexOf("\t");
  if (tab < 0) continue;
  const i = Number(line.slice(0, tab));
  const fr = source[i];
  if (!Number.isInteger(i) || fr === undefined) { problems.push(`numéro inconnu : ${line.slice(0, 40)}`); continue; }
  const tr = line.slice(tab + 1).replace(/\\n/g, "\n");
  if (marks(fr) !== marks(tr)) problems.push(`${i} variables différentes : « ${fr} » → « ${tr} »`);
  // Les espaces au début et à la fin font partie de la phrase (morceaux de texte collés à d'autres)
  const lead = fr.match(/^\s*/)![0], trail = fr.match(/\s*$/)![0];
  dict[fr] = lead + tr.trim() + trail;
  n++;
}
const sorted = Object.fromEntries(Object.keys(dict).filter((k) => source.includes(k)).sort((a, b) => a.localeCompare(b, "fr")).map((k) => [k, dict[k]]));
fs.writeFileSync(out, JSON.stringify(sorted, null, 1) + "\n");
console.log(`${loc} : ${n} traductions importées, ${Object.keys(sorted).length}/${source.length} au total.`);
if (problems.length) console.log(problems.join("\n"));
