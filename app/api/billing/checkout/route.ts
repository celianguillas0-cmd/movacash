import { z } from "zod";
import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { APP_URL } from "@/lib/config";
import { activateDemoSubscription, annualAvailable, getStripe, priceIdFor } from "@/lib/stripe";
import { hasActiveSubscription } from "@/lib/subscription";

const schema = z.object({
  plan: z.enum(["starter", "pro", "business"]),
  annual: z.boolean().default(false),
  // Renonciation expresse au droit de rétractation (art. L221-28 13° du Code de la consommation)
  waiver: z.literal(true, { errorMap: () => ({ message: "Tu dois accepter l'exécution immédiate du service." }) }),
});

export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const { plan, annual } = parsed.data;
    if (annual && !annualAvailable()) return fail("La formule annuelle n'est pas encore disponible.");
    // Déjà abonné : on change d'offre depuis « Mon abonnement » (pas de second abonnement en parallèle)
    if (hasActiveSubscription(user)) return ok({ url: `/app/abonnement?plan=${plan}${annual ? "&annual=1" : ""}` });
    await run("UPDATE users SET withdrawal_waiver_at = unixepoch() WHERE id = ?", [user.id]);

    const stripe = getStripe();
    if (!stripe) {
      // Mode démo : pas de paiement réel
      await activateDemoSubscription(user.id, plan, annual);
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
      locale: "fr",
      success_url: `${APP_URL}/resultats?welcome=1`,
      cancel_url: `${APP_URL}/tarifs?canceled=1`,
    });
    return ok({ url: session.url });
  });
}
