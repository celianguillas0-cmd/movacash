import { getDb } from "./db";
import { getPlan } from "./config";
import type { User } from "./auth";

export function hasActiveSubscription(user: User | null) {
  if (!user) return false;
  if (!["active", "trialing"].includes(user.sub_status)) return false;
  if (user.current_period_end && user.current_period_end * 1000 < Date.now() - 3 * 86400_000) return false;
  return Boolean(getPlan(user.plan));
}

function monthStart() {
  const d = new Date();
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
}

export function getUsage(user: User) {
  const plan = getPlan(user.plan);
  const { n } = getDb()
    .prepare("SELECT COUNT(*) AS n FROM ebooks WHERE user_id = ? AND created_at >= ?")
    .get(user.id, monthStart()) as { n: number };
  const limit = plan?.ebooksPerMonth ?? 0;
  return { used: n, limit, remaining: Math.max(0, limit - n) };
}

export function canCreateEbook(user: User): { ok: true } | { ok: false; reason: string } {
  if (!hasActiveSubscription(user)) return { ok: false, reason: "Un abonnement actif est nécessaire pour générer des e-books." };
  const u = getUsage(user);
  if (u.remaining <= 0) return { ok: false, reason: `Quota mensuel atteint (${u.limit} e-books). Il se renouvelle le 1er du mois, ou passez à l'offre supérieure.` };
  return { ok: true };
}
