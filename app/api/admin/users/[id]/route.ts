import { PLAN_IDS } from "@/lib/config";
import { z } from "zod";
import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { isAdmin } from "@/lib/config";
import { getUserById } from "@/lib/auth";
import { activateDemoSubscription } from "@/lib/stripe";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ban") }),
  z.object({ action: z.literal("unban") }),
  // null = revenir à la limite de la formule
  z.object({ action: z.literal("quota"), value: z.number().int().min(0).max(10000).nullable() }),
  z.object({ action: z.literal("offer"), plan: z.enum(PLAN_IDS) }),
  z.object({ action: z.literal("unoffer") }),
]);

// Gestion d'un compte depuis l'onglet Admin (réservé à l'adresse admin).
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (admin) => {
    if (!isAdmin(admin.email)) return fail("Introuvable", 404);
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Action invalide");
    const target = await getUserById(Number(id));
    if (!target) return fail("Compte introuvable", 404);
    const d = parsed.data;
    if ((d.action === "ban" || d.action === "unoffer") && isAdmin(target.email)) return fail("Impossible sur ton propre compte.");
    switch (d.action) {
      case "ban":
        // La version de session change : le compte est déconnecté partout immédiatement
        await run("UPDATE users SET banned = 1, session_version = session_version + 1 WHERE id = ?", [target.id]);
        break;
      case "unban":
        await run("UPDATE users SET banned = 0 WHERE id = ?", [target.id]);
        break;
      case "quota":
        await run("UPDATE users SET quota_override = ? WHERE id = ?", [d.value, target.id]);
        break;
      case "offer":
        if (target.stripe_subscription_id && !target.is_demo_sub && ["active", "trialing", "past_due"].includes(target.sub_status))
          return fail("Ce compte paie déjà un abonnement Stripe : change plutôt sa limite d'e-books.");
        await activateDemoSubscription(target.id, d.plan);
        break;
      case "unoffer":
        if (!target.is_demo_sub) return fail("Ce compte n'a pas de formule offerte.");
        await run("UPDATE users SET sub_status = 'canceled', current_period_end = unixepoch(), cancel_at_period_end = 0 WHERE id = ?", [target.id]);
        break;
    }
    return ok();
  });
}
