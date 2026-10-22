import Stripe from "stripe";
import { getDb } from "./db";
import { PLANS, type PlanId } from "./config";

let client: Stripe | null = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function priceIdFor(plan: PlanId, annual = false) {
  const p = PLANS.find((x) => x.id === plan);
  return p ? process.env[annual ? p.stripeAnnualPriceEnv : p.stripePriceEnv] || null : null;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  const p = PLANS.find((x) => process.env[x.stripePriceEnv] === priceId || process.env[x.stripeAnnualPriceEnv] === priceId);
  return p?.id ?? null;
}

export function applySubscription(userId: number, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const plan = planFromPriceId(item?.price?.id);
  // current_period_end est porté par l'item dans les versions récentes de l'API
  const periodEnd = (item as unknown as { current_period_end?: number })?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ?? null;
  getDb()
    .prepare(
      "UPDATE users SET plan = COALESCE(?, plan), sub_status = ?, current_period_end = ?, stripe_subscription_id = ?, stripe_customer_id = ?, is_demo_sub = 0 WHERE id = ?"
    )
    .run(plan, sub.status, periodEnd, sub.id, typeof sub.customer === "string" ? sub.customer : sub.customer.id, userId);
}

export function activateDemoSubscription(userId: number, plan: PlanId, annual = false) {
  getDb()
    .prepare("UPDATE users SET plan = ?, sub_status = 'active', current_period_end = ?, is_demo_sub = 1 WHERE id = ?")
    .run(plan, Math.floor(Date.now() / 1000) + (annual ? 365 : 30) * 86400, userId);
}

export function cancelDemoSubscription(userId: number) {
  getDb().prepare("UPDATE users SET sub_status = 'canceled' WHERE id = ? AND is_demo_sub = 1").run(userId);
}
