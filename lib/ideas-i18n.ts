import { all, run } from "./db";
import { geminiGenerate, parseJsonLoose } from "./gemini";
import { isGeminiConfigured } from "./config";
import { LOCALES, SOURCE_LOCALE, type Locale } from "./i18n/locales";
import { searchWords } from "./ideas";

// Les idées de la base sont écrites en français. Pour les autres langues, Gemini les traduit une fois
// (titre, public, format) et la traduction est gardée dans idea_i18n.

type Base = { id: number; title: string; audience: string; format: string };
type Row = { idea_id: number; title: string; audience: string; format: string };
type Item = { id: number; title: string; audience: string; format: string };

const NAMES: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l.code, l.nom]));

export async function localizeIdeas<I extends Base>(ideas: I[], locale: Locale, opts: { onlyTranslated?: boolean } = {}): Promise<I[]> {
  if (locale === SOURCE_LOCALE || !ideas.length) return ideas;
  const ids = ideas.map((i) => i.id);
  const rows = await all<Row>(`SELECT idea_id, title, audience, format FROM idea_i18n WHERE locale = ? AND idea_id IN (${ids.map(() => "?").join(",")})`, [locale, ...ids]);
  const map = new Map(rows.map((r) => [r.idea_id, r]));
  const out: I[] = [];
  for (const i of ideas) {
    const r = map.get(i.id);
    if (r) out.push({ ...i, title: r.title, audience: r.audience || i.audience, format: r.format || i.format });
    else if (!opts.onlyTranslated) out.push(i);
  }
  return out;
}

// Traduit les idées qui ne le sont pas encore (par lots de 40). Sans clé Gemini, ne fait rien.
export async function translateIdeas(ideas: Base[], locale: Locale) {
  if (locale === SOURCE_LOCALE || !ideas.length || !isGeminiConfigured()) return 0;
  const ids = ideas.map((i) => i.id);
  const have = new Set(
    (await all<{ idea_id: number }>(`SELECT idea_id FROM idea_i18n WHERE locale = ? AND idea_id IN (${ids.map(() => "?").join(",")})`, [locale, ...ids])).map((r) => r.idea_id)
  );
  const todo = ideas.filter((i) => !have.has(i.id));
  let done = 0;
  for (let k = 0; k < todo.length; k += 40) {
    const lot = todo.slice(k, k + 40);
    const prompt = [
      `Translate these e-book ideas from French into ${NAMES[locale]} (${locale}). They are guides sold on Etsy.`,
      "Keep each title short, natural and appealing for a native speaker, like a real Etsy product title. Adapt local references only when the French one makes no sense abroad.",
      'Return only JSON: {"items":[{"id":number,"title":string,"audience":string,"format":string}]}',
      JSON.stringify(lot.map((i) => ({ id: i.id, title: i.title, audience: i.audience, format: i.format }))),
    ].join("\n");
    const res = parseJsonLoose<{ items?: Item[] }>(await geminiGenerate(prompt, { json: true, temperature: 0.3, maxOutputTokens: 8000 }));
    for (const it of res.items || []) {
      if (!lot.some((i) => i.id === it.id) || !it.title) continue;
      await run(
        "INSERT INTO idea_i18n (idea_id, locale, title, audience, format, search_text) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (idea_id, locale) DO UPDATE SET title = excluded.title, audience = excluded.audience, format = excluded.format, search_text = excluded.search_text",
        [it.id, locale, it.title.slice(0, 200), (it.audience || "").slice(0, 200), (it.format || "").slice(0, 100), searchWords(`${it.title} ${it.audience || ""}`, 100).join(" ")]
      );
      done++;
    }
  }
  return done;
}

// Avancement des traductions de la base, par langue (onglet Admin).
export async function translationProgress() {
  const [tot] = await all<{ n: number }>("SELECT COUNT(*) AS n FROM ideas");
  const rows = await all<{ locale: string; n: number }>("SELECT locale, COUNT(*) AS n FROM idea_i18n GROUP BY locale");
  return { total: Number(tot?.n || 0), byLocale: Object.fromEntries(rows.map((r) => [r.locale, Number(r.n)])) as Record<string, number> };
}
