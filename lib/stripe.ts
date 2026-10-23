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

export function priceIdFor(plan: PlanId, annual = false) {
  const p = PLANS.find((x) => x.id === plan);
  return p ? process.env[annual ? p.stripeAnnualPriceEnv : p.stripePriceEnv] || null : null;
}

// Facturation annuelle proposée seulement si les 3 prix annuels existent (toujours en mode démo)
export function annualAvailable() {
  return !getStripe() || PLANS.every((p) => Boolean(process.env[p.stripeAnnualPriceEnv]));
}

export function planFromPriceId(priceId: string | null | undefined): { plan: PlanId; annual: boolean } | null {
  if (!priceId) return null;
  for (const p of PLANS) {
    if (process.env[p.stripePriceEnv] === priceId) return { plan: p.id, annual: false };
    if (process.env[p.stripeAnnualPriceEnv] === priceId) return { plan: p.id, annual: true };
  }
  return null;
}

const periodEndOf = (sub: Stripe.Subscription) => {
  const item = sub.items.data[0] as unknown as { current_period_end?: number } | undefined;
  // current_period_end est porté par l'item dans les versions récentes de l'API
  return item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end ?? null;
};

export async function applySubscription(userId: number, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const found = planFromPriceId(item?.price?.id);
  const interval = item?.price?.recurring?.interval === "year" ? "year" : found?.annual ? "year" : "month";
  const canceling = sub.cancel_at_period_end || Boolean(sub.cancel_at) ? 1 : 0;
  await run(
    `UPDATE users SET plan = COALESCE(?, plan), sub_status = ?, current_period_end = ?, stripe_subscription_id = ?, stripe_customer_id = ?,
       billing_interval = ?, cancel_at_period_end = ?, is_demo_sub = 0 WHERE id = ?`,
    [found?.plan ?? null, sub.status, periodEndOf(sub), sub.id, typeof sub.customer === "string" ? sub.customer : sub.customer.id, interval, canceling, userId]
  );
}

const now = () => Math.floor(Date.now() / 1000);

export async function activateDemoSubscription(userId: number, plan: PlanId, annual = false) {
  await run(
    `UPDATE users SET plan = ?, sub_status = 'active', current_period_end = ?, billing_interval = ?, cancel_at_period_end = 0,
       quota_plan = NULL, quota_plan_until = NULL, is_demo_sub = 1 WHERE id = ?`,
    [plan, now() + (annual ? 365 : 30) * 86400, annual ? "year" : "month", userId]
  );
}

// ---------------------------------------------------------------------------
// Changement d'offre
// ---------------------------------------------------------------------------

export type ChangeKind = "same" | "upgrade" | "downgrade" | "invalid";

// upgrade : effet immédiat, différence payée au prorata aujourd'hui.
// downgrade : nouveau prix au prochain renouvellement, quota actuel conservé jusque-là, rien n'est remboursé.
export function changeKind(user: User, plan: PlanId, annual: boolean): ChangeKind {
  const cur = getPlan(user.plan);
  const next = getPlan(plan);
  if (!cur || !next) return "invalid";
  const curAnnual = user.billing_interval === "year";
  if (cur.id === next.id && curAnnual === annual) return "same";
  // Annuel -> mensuel : Stripe facturerait tout de suite, on le fait plutôt en fin de période (résilier puis reprendre)
  if (curAnnual && !annual) return "invalid";
  if (annual && !curAnnual) return "upgrade";
  return next.ebooksPerMonth > cur.ebooksPerMonth ? "upgrade" : "downgrade";
}

const priceOf = (plan: PlanId, annual: boolean) => {
  const p = getPlan(plan)!;
  return annual ? Math.round(p.annualMonthlyEur * 1200) / 100 : p.priceEur;
};

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

export async function previewChange(user: User, plan: PlanId, annual: boolean): Promise<ChangePreview> {
  const kind = changeKind(user, plan, annual);
  const nextAmount = priceOf(plan, annual);
  const base = { kind, nextAmount, nextDate: user.current_period_end };
  if (kind === "invalid")
    return { ...base, dueNow: null, message: "Le passage de l'annuel au mensuel se fait à la fin de ta période annuelle : résilie, puis reprends l'offre mensuelle de ton choix à la date de fin." };
  if (kind !== "upgrade") return { ...base, dueNow: null };
  const stripe = getStripe();
  if (!stripe || user.is_demo_sub || !user.stripe_subscription_id) {
    // Estimation : nouveau prix moins la part non utilisée de la période en cours
    const cur = priceOf(user.plan as PlanId, user.billing_interval === "year");
    const total = user.billing_interval === "year" ? 365 * 86400 : 30 * 86400;
    const left = Math.max(0, Math.min(1, ((user.current_period_end ?? now()) - now()) / total));
    const intervalChange = annual !== (user.billing_interval === "year");
    const due = intervalChange ? nextAmount - cur * left : (nextAmount - cur) * left;
    return { ...base, dueNow: Math.max(0, Math.round(due * 100) / 100), nextDate: intervalChange ? now() + 365 * 86400 : user.current_period_end };
  }
  const price = priceIdFor(plan, annual);
  if (!price) throw new Error(`Prix Stripe non configuré pour l'offre ${plan}${annual ? " (annuelle)" : ""}`);
  const { item } = await subItem(stripe, user);
  const inv = await stripe.invoices.createPreview({
    customer: user.stripe_customer_id!,
    subscription: user.stripe_subscription_id,
    subscription_details: { items: [{ id: item.id, price }], proration_behavior: "always_invoice" },
  });
  return { ...base, dueNow: inv.amount_due / 100 };
}

export async function changePlan(user: User, plan: PlanId, annual: boolean): Promise<{ kind: ChangeKind; payUrl?: string }> {
  const kind = changeKind(user, plan, annual);
  if (kind === "invalid" || kind === "same") throw new Error(kind === "same" ? "C'est déjà ton offre actuelle." : "Changement non disponible ici.");
  const stripe = getStripe();

  if (!stripe || user.is_demo_sub || !user.stripe_subscription_id) {
    if (kind === "upgrade") {
      const intervalChange = annual !== (user.billing_interval === "year");
      await run(
        `UPDATE users SET plan = ?, billing_interval = ?, cancel_at_period_end = 0, quota_plan = NULL, quota_plan_until = NULL,
           current_period_end = CASE WHEN ? THEN ? ELSE current_period_end END WHERE id = ?`,
        [plan, annual ? "year" : "month", intervalChange ? 1 : 0, now() + 365 * 86400, user.id]
      );
    } else {
      await run("UPDATE users SET quota_plan = plan, quota_plan_until = current_period_end, plan = ?, cancel_at_period_end = 0 WHERE id = ?", [plan, user.id]);
    }
    return { kind };
  }

  const price = priceIdFor(plan, annual);
  if (!price) throw new Error(`Prix Stripe non configuré pour l'offre ${plan}${annual ? " (annuelle)" : ""}`);
  const { item, sub: current } = await subItem(stripe, user);
  if (current.cancel_at_period_end || current.cancel_at) await stripe.subscriptions.update(current.id, { cancel_at_period_end: false });

  if (kind === "upgrade") {
    const sub = await stripe.subscriptions.update(current.id, {
      items: [{ id: item.id, price }],
      proration_behavior: "always_invoice",
      // Si le paiement échoue, l'abonnement reste sur l'offre actuelle
      payment_behavior: "pending_if_incomplete",
      expand: ["latest_invoice"],
    });
    if (sub.pending_update) {
      const inv = sub.latest_invoice as Stripe.Invoice | null;
      return { kind, payUrl: inv?.hosted_invoice_url ?? undefined };
    }
    await applySubscription(user.id, sub);
    await run("UPDATE users SET quota_plan = NULL, quota_plan_until = NULL WHERE id = ?", [user.id]);
    return { kind };
  }

  const sub = await stripe.subscriptions.update(current.id, { items: [{ id: item.id, price }], proration_behavior: "none" });
  await run("UPDATE users SET quota_plan = plan, quota_plan_until = current_period_end WHERE id = ?", [user.id]);
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
