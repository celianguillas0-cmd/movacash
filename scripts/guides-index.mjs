// Régénère lib/guides-i18n/index.ts à partir des fichiers <langue>.json présents (guides traduits).
import fs from "node:fs";
const dir = new URL("../lib/guides-i18n/", import.meta.url);
const langs = fs.readdirSync(dir).filter((f) => /^[a-z]{2}\.json$/.test(f)).map((f) => f.slice(0, 2)).sort();
const out = `// Fichier généré par scripts/guides-index.mjs : ne pas modifier à la main.
import type { GuideText } from "../guides";
import type { GuideUI } from "@/app/guides/ui";
import type { Locale } from "../i18n/locales";
${langs.map((l) => `import ${l} from "./${l}.json";`).join("\n")}

type Fichier = { ui: GuideUI; guides: Record<string, GuideText> };
// Les JSON ont la même forme que la version anglaise (vérifiée avant chaque ajout) ; TypeScript ne sait pas typer les paires de la FAQ.
export const TRADUCTIONS: Partial<Record<Locale, Fichier>> = { ${langs.map((l) => `${l}: ${l} as unknown as Fichier`).join(", ")} };
`;
fs.writeFileSync(new URL("index.ts", dir), out);
console.log("guides traduits :", langs.join(" ") || "(aucun)");
