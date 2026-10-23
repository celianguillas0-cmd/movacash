import { z } from "zod";
import { fail, ok, withUser } from "@/lib/api";
import { previewChange } from "@/lib/stripe";
import { hasActiveSubscription } from "@/lib/subscription";

const schema = z.object({ plan: z.enum(["starter", "pro", "business"]), annual: z.boolean().default(false) });

// Ce que le changement d'offre coûtera aujourd'hui et ensuite
export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Offre invalide");
    if (!hasActiveSubscription(user)) return fail("Aucun abonnement actif", 409);
    return ok(await previewChange(user, parsed.data.plan, parsed.data.annual));
  });
}
