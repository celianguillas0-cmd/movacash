import { fail, ok, withUser } from "@/lib/api";
import { APP_URL } from "@/lib/config";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  return withUser(async (user) => {
    const stripe = getStripe();
    if (!stripe || !user.stripe_customer_id) return fail("Portail de facturation indisponible (mode démo ou pas encore abonné).", 400);
    const s = await stripe.billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${APP_URL}/app/compte` });
    return ok({ url: s.url });
  });
}
