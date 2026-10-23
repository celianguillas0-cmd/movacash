import { ok, withUser } from "@/lib/api";
import { portalUrl } from "@/lib/stripe";

// Portail Stripe : carte bancaire, adresse de facturation, factures
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return withUser(async (user) => ok({ url: await portalUrl(user, body.flow === "payment_method_update" ? "payment_method_update" : undefined) }));
}
