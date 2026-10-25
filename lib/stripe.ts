import Stripe from "stripe";
import { one, run } from "./db";
import { APP_URL, getPlan, PLANS, type PlanId } from "./config";
import type { User } from "./auth";

let client: Stripe | null = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function priceIdFor(plan: PlanId) {
  const p = getPlan(plan);
  return p ? process.env[p.stripePriceEnv] || null : null;
}

export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  return PLANS.find((p) => process.env[p.stripePriceEnv] === priceId)?.id ?? null;
}

const periodOf = (sub: Stripe.Subscription) => {
  // current_period_* est porté par l'item dans les versions récentes de l'API
  const item = sub.items.data[0] as unknown as { current_period_start?: number; current_period_end?: number } | undefined;
  const old = sub as unknown as { current_period_start?: number; current_period_end?: number };
  return { start: item?.current_period_start ?? old.current_period_start ?? null, end: item?.current_period_end ?? old.current_period_end ?? null };
};

export async function applySubscription(userId: number, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const plan = planFromPriceId(item?.price?.id);
  const { start, end } = periodOf(sub);
  const canceling = sub.cancel_at_period_end || Boolean(sub.cancel_at) ? 1 : 0;
  await run(
    `UPDATE users SET plan = COALESCE(?, plan), sub_status = ?, current_period_start = ?, current_period_end = ?, stripe_subscription_id = ?, stripe_customer_id = ?,
       billing_interval = COALESCE(?, billing_interval), cancel_at_period_end = ?, is_demo_sub = 0 WHERE id = ?`,
    [plan, sub.status, start, end, sub.id, typeof sub.customer === "string" ? sub.customer : sub.customer.id, plan, canceling, userId]
  );
}

const now = () => Math.floor(Date.now() / 1000);

export async function activateDemoSubscription(userId: number, plan: PlanId) {
  await run(
    `UPDATE users SET plan = ?, sub_status = 'active', current_period_start = ?, current_period_end = ?, billing_interval = ?, cancel_at_period_end = 0,
       quota_plan = NULL, quota_plan_until = NULL, is_demo_sub = 1 WHERE id = ?`,
    [plan, now(), now() + getPlan(plan)!.periodDays * 86400, plan, userId]
  );
}

// ---------------------------------------------------------------------------
// Changement de durée
// ---------------------------------------------------------------------------

export type ChangeKind = "same" | "change" | "invalid";

// Tout changement prend effet tout de suite : une nouvelle période commence aujourd'hui, avec son quota complet.
// Le temps non utilisé de la période en cours est déduit (prorata Stripe) ; un éventuel crédit sert aux prochains paiements, rien n'est remboursé.
export function changeKind(user: User, plan: PlanId): ChangeKind {
  const cur = getPlan(user.plan);
  const next = getPlan(plan);
  if (!cur || !next) return "invalid";
  return cur.id === next.id ? "same" : "change";
}

export interface ChangePreview {
  kind: ChangeKind;
  dueNow: number | null; // montant prélevé aujourd'hui (en euros), null si rien
  nextAmount: number; // montant des prochains renouvellements
  nextDate: number | null;
  message?: string;
}

async function subItem(stripe: Stripe, user: User) {
  const sub = await stripe.subscriptions.retrieve(user.stripe_subscription_id!);
  const item = sub.items.data[0];
  if (!item) throw new Error("Abonnement Stripe sans ligne de prix");
  return { sub, item };
}

export async function previewChange(user: User, plan: PlanId): Promise<ChangePreview> {
  const kind = changeKind(user, plan);
  const next = getPlan(plan)!;
  const base = { kind, nextAmount: next.priceEur, nextDate: now() + next.periodDays * 86400 };
  if (kind !== "change") return { ...base, dueNow: null, nextDate: user.current_period_end };
  const stripe = getStripe();
  if (!stripe || user.is_demo_sub || !user.stripe_subscription_id) {
    // Estimation : nouveau prix moins la part non utilisée de la période en cours
    const cur = getPlan(user.plan)!;
    const start = user.current_period_start ?? (user.current_period_end ?? now()) - cur.periodDays * 86400;
    const total = Math.max(1, (user.current_period_end ?? now()) - start);
    const left = Math.max(0, Math.min(1, ((user.current_period_end ?? now()) - now()) / total));
    return { ...base, dueNow: Math.max(0, Math.round((next.priceEur - cur.priceEur * left) * 100) / 100) };
  }
  const price = priceIdFor(plan);
  if (!price) throw new Error(`Prix Stripe non configuré pour l'offre ${plan}`);
  const { item } = await subItem(stripe, user);
  const inv = await stripe.invoices.createPreview({
    customer: user.stripe_customer_id!,
    subscription: user.stripe_subscription_id,
    subscription_details: { items: [{ id: item.id, price }], proration_behavior: "always_invoice", billing_cycle_anchor: "now" },
  });
  return { ...base, dueNow: Math.max(0, inv.amount_due / 100) };
}

export async function changePlan(user: User, plan: PlanId): Promise<{ kind: ChangeKind; payUrl?: string }> {
  const kind = changeKind(user, plan);
  if (kind !== "change") throw new Error(kind === "same" ? "C'est déjà ton offre actuelle." : "Changement non disponible ici.");
  const stripe = getStripe();

  if (!stripe || user.is_demo_sub || !user.stripe_subscription_id) {
    await run(
      `UPDATE users SET plan = ?, billing_interval = ?, cancel_at_period_end = 0, quota_plan = NULL, quota_plan_until = NULL,
         current_period_start = ?, current_period_end = ? WHERE id = ?`,
      [plan, plan, now(), now() + getPlan(plan)!.periodDays * 86400, user.id]
    );
    return { kind };
  }

  const price = priceIdFor(plan);
  if (!price) throw new Error(`Prix Stripe non configuré pour l'offre ${plan}`);
  const { item, sub: current } = await subItem(stripe, user);
  if (current.cancel_at_period_end || current.cancel_at) await stripe.subscriptions.update(current.id, { cancel_at_period_end: false });
  const sub = await stripe.subscriptions.update(current.id, {
    items: [{ id: item.id, price }],
    proration_behavior: "always_invoice",
    billing_cycle_anchor: "now",
    // Si le paiement échoue, l'abonnement reste sur l'offre actuelle
    payment_behavior: "pending_if_incomplete",
    expand: ["latest_invoice"],
  });
  if (sub.pending_update) {
    const inv = sub.latest_invoice as Stripe.Invoice | null;
    return { kind, payUrl: inv?.hosted_invoice_url ?? undefined };
  }
  await applySubscription(user.id, sub);
  return { kind };
}

// ---------------------------------------------------------------------------
// Résiliation, reprise, factures, moyen de paiement
// ---------------------------------------------------------------------------

export async function cancelSubscription(user: User, reason: string, comment: string) {
  await run("INSERT INTO cancellations (user_id, plan, reason, comment) VALUES (?, ?, ?, ?)", [user.id, user.plan, reason, comment.slice(0, 1000)]);
  const stripe = getStripe();
  if (!stripe || user.is_demo_sub || !user.stripe_subscription_id) {
    await run("UPDATE users SET cancel_at_period_end = 1 WHERE id = ?", [user.id]);
    return;
  }
  const FEEDBACK: Record<string, Stripe.SubscriptionUpdateParams.CancellationDetails.Feedback> = {
    price: "too_expensive", quality: "low_quality", missing: "missing_features", unused: "unused", other: "other", switch: "switched_service", complex: "too_complex",
  };
  const sub = await stripe.subscriptions.update(user.stripe_subscription_id, {
    cancel_at_period_end: true,
    cancellation_details: { feedback: FEEDBACK[reason] ?? "other", comment: comment.slice(0, 500) || undefined },
  });
  await applySubscription(user.id, sub);
}

export async function resumeSubscription(user: User) {
  const stripe = getStripe();
  if (!stripe || user.is_demo_sub || !user.stripe_subscription_id) {
    await run("UPDATE users SET cancel_at_period_end = 0 WHERE id = ?", [user.id]);
    return;
  }
  const sub = await stripe.subscriptions.update(user.stripe_subscription_id, { cancel_at_period_end: false });
  await applySubscription(user.id, sub);
}

export interface InvoiceView {
  id: string;
  number: string | null;
  date: number;
  amount: number;
  status: string | null;
  url: string | null;
  pdf: string | null;
}

export async function listInvoices(user: User): Promise<InvoiceView[]> {
  const stripe = getStripe();
  if (!stripe || !user.stripe_customer_id) return [];
  const list = await stripe.invoices.list({ customer: user.stripe_customer_id, limit: 24 });
  return list.data
    .filter((i) => i.status !== "draft")
    .map((i) => ({ id: i.id!, number: i.number, date: i.created, amount: i.total / 100, status: i.status, url: i.hosted_invoice_url ?? null, pdf: i.invoice_pdf ?? null }));
}

export async function paymentMethod(user: User): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe || !user.stripe_customer_id) return null;
  const pm = await stripe.customers.listPaymentMethods(user.stripe_customer_id, { limit: 1 });
  const m = pm.data[0];
  if (!m) return null;
  if (m.card) return `${m.card.brand.toUpperCase()} •••• ${m.card.last4} (exp. ${String(m.card.exp_month).padStart(2, "0")}/${String(m.card.exp_year).slice(-2)})`;
  return m.type === "sepa_debit" && m.sepa_debit ? `Prélèvement SEPA •••• ${m.sepa_debit.last4}` : m.type;
}

export async function portalUrl(user: User, flow?: "payment_method_update") {
  const stripe = getStripe();
  if (!stripe || !user.stripe_customer_id) throw new Error("Portail de facturation indisponible (mode démo ou pas encore abonné).");
  const s = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${APP_URL}/app/abonnement`,
    ...(flow ? { flow_data: { type: flow } } : {}),
  });
  return s.url;
}

// Suppression de compte : arrêt immédiat de l'abonnement (sans remboursement, cf. CGV)
export async function stopSubscriptionNow(user: User) {
  const stripe = getStripe();
  if (stripe && user.stripe_subscription_id && !user.is_demo_sub && ["active", "trialing", "past_due", "incomplete"].includes(user.sub_status)) {
    await stripe.subscriptions.cancel(user.stripe_subscription_id, { invoice_now: false, prorate: false });
  }
}

export async function userIdForCustomer(customerId: string) {
  return (await one<{ id: number }>("SELECT id FROM users WHERE stripe_customer_id = ?", [customerId]))?.id;
}
