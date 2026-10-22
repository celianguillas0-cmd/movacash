import type Stripe from "stripe";
import { getDb } from "@/lib/db";
import { applySubscription, getStripe } from "@/lib/stripe";

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
  const db = getDb();
  const userIdFromCustomer = (customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) => {
    const id = typeof customer === "string" ? customer : customer?.id;
    const row = id ? (db.prepare("SELECT id FROM users WHERE stripe_customer_id = ?").get(id) as { id: number } | undefined) : undefined;
    return row?.id;
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = Number(s.client_reference_id || s.metadata?.userId);
      if (userId && s.customer) db.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").run(String(s.customer), userId);
      if (userId && s.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(s.subscription));
        applySubscription(userId, sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = Number(sub.metadata?.userId) || userIdFromCustomer(sub.customer);
      if (userId) applySubscription(userId, sub);
      break;
    }
  }
  return new Response("ok");
}
