import { one } from "./db";
import { getPlan } from "./config";
import type { User } from "./auth";
import { makeT, type T } from "./i18n/t";

const now = () => Math.floor(Date.now() / 1000);
const DAY = 86400;

export function hasActiveSubscription(user: User | null) {
  if (!user || !getPlan(user.plan)) return false;
  const end = user.current_period_end ?? 0;
  if (["active", "trialing"].includes(user.sub_status)) {
    // Abonnement de démo : se renouvelle tout seul tant qu'il n'est pas résilié
    if (user.is_demo_sub) return !user.cancel_at_period_end || end > now();
    // Petite marge si le webhook de renouvellement arrive en retard
    return !end || end + 3 * DAY > now();
  }
  // Paiement en échec : Stripe retente pendant quelques jours, l'accès est conservé en attendant
  if (user.sub_status === "past_due") return end + 7 * DAY > now();
  return false;
}

export type SubState = "none" | "active" | "canceling" | "past_due" | "ended";

export function subState(user: User): SubState {
  if (hasActiveSubscription(user)) {
    if (user.sub_status === "past_due") return "past_due";
    return user.cancel_at_period_end ? "canceling" : "active";
  }
  return user.plan ? "ended" : "none";
}

export function monthStart(d = new Date()) {
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
}

// Période en cours : le quota d'e-books se compte depuis le début de la période payée (semaine, mois ou trimestre)
export function currentPeriod(user: User) {
  const plan = getPlan(user.plan);
  const end = user.current_period_end ?? now() + (plan?.periodDays ?? 30) * DAY;
  const start = user.current_period_start ?? end - (plan?.periodDays ?? 30) * DAY;
  return { start, end };
}

export async function getUsage(user: User) {
  const plan = getPlan(user.plan);
  const { start, end } = currentPeriod(user);
  const r = await one<{ n: number }>("SELECT COUNT(*) AS n FROM generations WHERE user_id = ? AND created_at >= ?", [user.id, start]);
  const used = r?.n ?? 0;
  // Limite fixée à la main dans l'onglet Admin, sinon celle de la formule
  const limit = hasActiveSubscription(user) ? user.quota_override ?? plan?.ebooks ?? 0 : 0;
  return { used, limit, remaining: Math.max(0, limit - used), resetsOn: new Date(end * 1000) };
}

export async function canCreateEbook(user: User, t: T = makeT({}), locale = "fr"): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasActiveSubscription(user)) return { ok: false, reason: t("Un abonnement actif est nécessaire pour générer des e-books.") };
  const u = await getUsage(user);
  if (u.remaining <= 0) {
    const date = u.resetsOn.toLocaleDateString(locale, { day: "numeric", month: "long" });
    return { ok: false, reason: t("Quota atteint ({n} e-books pour cette période). Il repart à zéro le {date}, à ton prochain renouvellement.", { n: u.limit, date }) };
  }
  return { ok: true };
}
