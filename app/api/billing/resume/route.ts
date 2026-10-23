import { fail, ok, withUser } from "@/lib/api";
import { resumeSubscription } from "@/lib/stripe";
import { hasActiveSubscription } from "@/lib/subscription";

// Annule une résiliation programmée
export async function POST() {
  return withUser(async (user) => {
    if (!hasActiveSubscription(user) || !user.cancel_at_period_end) return fail("Rien à réactiver", 409);
    await resumeSubscription(user);
    return ok();
  });
}
