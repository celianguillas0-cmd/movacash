import type Stripe from "stripe";
import { run } from "@/lib/db";
import { applySubscription, getStripe, userIdForCustomer } from "@/lib/stripe";
import { getUserById } from "@/lib/auth";
import { emailSubscriptionConfirmed } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe non configuré", { status: 400 });
  const sig = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    return new Response(`Signature invalide: ${(e as Error).message}`, { status: 400 });
  }
  const customerId = (c: string | Stripe.Customer | Stripe.DeletedCustomer | null) => (typeof c === "string" ? c : c?.id) ?? null;

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = Number(s.client_reference_id || s.metadata?.userId);
      if (userId && s.customer) await run("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [customerId(s.customer), userId]);
      if (userId && s.subscription) {
        await applySubscription(userId, await stripe.subscriptions.retrieve(String(s.subscription)));
        // Confirmation du contrat sur support durable (art. L221-13 du Code de la consommation)
        const u = await getUserById(userId);
        if (u) await emailSubscriptionConfirmed(u);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed": {
      const sub = event.data.object as Stripe.Subscription;
      const cid = customerId(sub.customer);
      const userId = Number(sub.metadata?.userId) || (cid ? await userIdForCustomer(cid) : undefined);
      if (userId) await applySubscription(userId, sub);
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      // Renouvellement payé ou en échec : on relit l'abonnement pour mettre à jour la date et le statut
      const inv = event.data.object as Stripe.Invoice;
      const subId = (inv as unknown as { subscription?: string | null }).subscription ?? inv.parent?.subscription_details?.subscription;
      const cid = customerId(inv.customer);
      const userId = cid ? await userIdForCustomer(cid) : undefined;
      if (userId && subId) await applySubscription(userId, await stripe.subscriptions.retrieve(typeof subId === "string" ? subId : subId.id));
      break;
    }
  }
  return new Response("ok");
}
