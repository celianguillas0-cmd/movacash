import { ok, withUser } from "@/lib/api";
import { cancelDemoSubscription } from "@/lib/stripe";

// Résiliation d'un abonnement de démonstration (les vrais abonnements passent par le portail Stripe)
export async function POST() {
  return withUser((user) => {
    cancelDemoSubscription(user.id);
    return ok();
  });
}
