import { z } from "zod";
import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { isAdmin } from "@/lib/config";
import { activateDemoSubscription } from "@/lib/stripe";

const schema = z.object({ vue: z.enum(["aucun", "starter", "pro", "business"]) });

// L'admin choisit l'abonnement avec lequel il voit le site (sans payer), pour tester ou filmer.
export async function POST(req: Request) {
  return withUser(async (user) => {
    if (!isAdmin(user.email)) return fail("Introuvable", 404);
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Choix invalide");
    if (user.stripe_subscription_id && !user.is_demo_sub && ["active", "trialing", "past_due"].includes(user.sub_status))
      return fail("Ton compte a un vrai abonnement Stripe : résilie-le d'abord.");
    const { vue } = parsed.data;
    if (vue === "aucun") {
      await run("UPDATE users SET plan = NULL, sub_status = 'none', current_period_end = NULL, is_demo_sub = 0, cancel_at_period_end = 0, quota_plan = NULL, quota_plan_until = NULL WHERE id = ?", [user.id]);
    } else {
      await activateDemoSubscription(user.id, vue);
    }
    return ok();
  });
}
