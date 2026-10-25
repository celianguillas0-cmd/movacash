import { z } from "zod";
import { fail, ok, withUser } from "@/lib/api";
import { annualAvailable, changePlan } from "@/lib/stripe";
import { hasActiveSubscription } from "@/lib/subscription";

const schema = z.object({ plan: z.enum(["starter", "pro", "business"]), annual: z.boolean().default(false) });

export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Offre invalide");
    if (!hasActiveSubscription(user)) return fail("Aucun abonnement actif", 409);
    if (parsed.data.annual && !annualAvailable()) return fail("La formule annuelle n'est pas encore disponible.");
    return ok(await changePlan(user, parsed.data.plan, parsed.data.annual));
  });
}
