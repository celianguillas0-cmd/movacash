import { one } from "./db";
import { getPlan, PLANS, type Plan } from "./config";
import type { User } from "./auth";

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

// Offre qui fixe le quota : après un passage à une offre inférieure, le quota de l'ancienne offre reste acquis jusqu'à la fin de la période payée.
export function quotaPlan(user: User): Plan | undefined {
  const plan = getPlan(user.plan);
  const held = user.quota_plan_until && user.quota_plan_until > now() ? getPlan(user.quota_plan) : undefined;
  if (held && (!plan || held.ebooksPerMonth > plan.ebooksPerMonth)) return held;
  return plan;
}

export function monthStart(d = new Date()) {
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
}

export function nextMonthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export async function getUsage(user: User) {
  const plan = quotaPlan(user);
  const r = await one<{ n: number }>("SELECT COUNT(*) AS n FROM generations WHERE user_id = ? AND created_at >= ?", [user.id, monthStart()]);
  const used = r?.n ?? 0;
  // Limite fixée à la main dans l'onglet Admin, sinon celle de la formule
  const limit = hasActiveSubscription(user) ? user.quota_override ?? plan?.ebooksPerMonth ?? 0 : 0;
  return { used, limit, remaining: Math.max(0, limit - used), resetsOn: nextMonthStart() };
}

export async function canCreateEbook(user: User): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasActiveSubscription(user)) return { ok: false, reason: "Un abonnement actif est nécessaire pour générer des e-books." };
  const u = await getUsage(user);
  if (u.remaining <= 0) {
    const better = PLANS.find((p) => p.ebooksPerMonth > u.limit);
    return {
      ok: false,
      reason: `Quota du mois atteint (${u.limit} e-books). Il se renouvelle le 1er du mois${better ? `, ou passe à l'offre ${better.name} (${better.ebooksPerMonth} e-books par mois) depuis la page Abonnement` : ""}.`,
    };
  }
  return { ok: true };
}
