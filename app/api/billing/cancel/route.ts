import { z } from "zod";
import { fail, ok, withUser } from "@/lib/api";
import { cancelSubscription } from "@/lib/stripe";
import { hasActiveSubscription } from "@/lib/subscription";

const schema = z.object({ reason: z.string().max(40).default("other"), comment: z.string().max(1000).default("") });

// Résiliation en fin de période : l'accès reste ouvert jusqu'à la date de renouvellement, sans remboursement
export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    if (!hasActiveSubscription(user)) return fail("Aucun abonnement actif", 409);
    await cancelSubscription(user, parsed.data.reason, parsed.data.comment);
    return ok();
  });
}
