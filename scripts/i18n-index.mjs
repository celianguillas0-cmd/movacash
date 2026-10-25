// Régénère lib/i18n/messages/index.ts à partir des fichiers <langue>.json présents.
import fs from "fs";
const dir = new URL("../lib/i18n/messages/", import.meta.url);
const files = fs.readdirSync(dir).filter((f) => /^[a-z]{2}\.json$/.test(f)).sort();
const lines = ["// Fichier généré par scripts/i18n-index.mjs : ne pas modifier à la main.", 'import type { Dict } from "../t";'];
for (const f of files) lines.push(`import ${f.slice(0, 2)} from "./${f}";`);
lines.push("", `export const MESSAGES: Record<string, Dict> = { ${files.map((f) => f.slice(0, 2)).join(", ")} };`, "");
fs.writeFileSync(new URL("index.ts", dir), lines.join("\n"));
console.log("langues :", files.map((f) => f.slice(0, 2)).join(" "));
