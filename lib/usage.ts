import { all, run } from "./db";
import { usageContext } from "./usage-context";

// Suivi des dépenses API (affiché dans l'onglet Admin). Estimation à partir des tarifs publics Google :
// le solde réel reste celui de la facturation Google Cloud.
const EUR_PER_USD = Number(process.env.EUR_PER_USD || 0.86);

// Prix en dollars par million de jetons (entrée, sortie ; la « réflexion » est facturée comme de la sortie).
function textPrice(model: string): [number, number] {
  if (model.includes("flash-lite")) return [0.1, 0.4];
  if (model.includes("pro")) return [1.25, 10];
  return [0.3, 2.5];
}

function imagePrice(model: string) {
  if (model.includes("ultra")) return 0.06;
  if (model.includes("fast")) return 0.02;
  return 0.04;
}

async function save(kind: string, model: string, tokensIn: number, tokensOut: number, usd: number) {
  try {
    await run("INSERT INTO api_usage (user_id, kind, model, tokens_in, tokens_out, cost_eur) VALUES (?, ?, ?, ?, ?, ?)", [usageContext.getStore()?.userId ?? null, kind, model, tokensIn, tokensOut, usd * EUR_PER_USD]);
  } catch (e) {
    // Le suivi ne doit jamais faire échouer une génération
    console.error("Suivi API :", (e as Error).message);
  }
}

export function recordText(model: string, tokensIn: number, tokensOut: number) {
  const [pin, pout] = textPrice(model);
  return save("texte", model, tokensIn, tokensOut, (tokensIn * pin + tokensOut * pout) / 1e6);
}

export function recordImage(model: string) {
  return save("image", model, 0, 0, imagePrice(model));
}

export interface UsageSummary { month: number; total: number; monthImages: number; monthEbooks: number; since: number | null }

export async function usageSummary(): Promise<UsageSummary> {
  const d = new Date();
  const monthStart = Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 1000);
  const [row] = await all<{ month: number | null; total: number | null; images: number | null; since: number | null }>(
    `SELECT SUM(CASE WHEN created_at >= ? THEN cost_eur ELSE 0 END) AS month, SUM(cost_eur) AS total,
      SUM(CASE WHEN created_at >= ? AND kind = 'image' THEN 1 ELSE 0 END) AS images, MIN(created_at) AS since FROM api_usage`,
    [monthStart, monthStart]
  );
  // E-books réellement générés ce mois-ci (hors mode tournage et démo)
  const [eb] = await all<{ n: number }>("SELECT COUNT(*) AS n FROM ebooks WHERE created_at >= ? AND is_demo = 0 AND id IN (SELECT ebook_id FROM generations WHERE ebook_id IS NOT NULL)", [monthStart]);
  return { month: Number(row?.month || 0), total: Number(row?.total || 0), monthImages: Number(row?.images || 0), monthEbooks: Number(eb?.n || 0), since: row?.since ? Number(row.since) : null };
}
