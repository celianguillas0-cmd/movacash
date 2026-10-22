import { z } from "zod";
import { getDb } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { APP_URL } from "@/lib/config";
import { activateDemoSubscription, getStripe, priceIdFor } from "@/lib/stripe";

const schema = z.object({
  plan: z.enum(["starter", "pro", "business"]),
  annual: z.boolean().default(false),
  // Renonciation expresse au droit de rétractation (art. L221-28 13° du Code de la consommation)
  waiver: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter l'exécution immédiate du service." }) }),
});

export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const { plan, annual } = parsed.data;
    getDb().prepare("UPDATE users SET withdrawal_waiver_at = unixepoch() WHERE id = ?").run(user.id);

    const stripe = getStripe();
    if (!stripe) {
      // Mode démo : pas de paiement réel
      activateDemoSubscription(user.id, plan, annual);
      return ok({ url: "/resultats?welcome=1" });
    }
    const price = priceIdFor(plan, annual);
    if (!price) return fail(`Prix Stripe non configuré pour l'offre ${plan}${annual ? " (annuelle)" : ""}`, 500);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer: user.stripe_customer_id || undefined,
      customer_email: user.stripe_customer_id ? undefined : user.email,
      client_reference_id: String(user.id),
      metadata: { userId: String(user.id), plan, withdrawalWaiver: "accepted" },
      subscription_data: { metadata: { userId: String(user.id), plan } },
      allow_promotion_codes: true,
      success_url: `${APP_URL}/resultats?welcome=1`,
      cancel_url: `${APP_URL}/tarifs?canceled=1`,
    });
    return ok({ url: session.url });
  });
}
