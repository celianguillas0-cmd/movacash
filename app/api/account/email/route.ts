import { z } from "zod";
import { run } from "@/lib/db";
import { getUserByEmail, verifyPassword } from "@/lib/auth";
import { fail, ok, withUser } from "@/lib/api";
import { getStripe } from "@/lib/stripe";

const schema = z.object({ email: z.string().trim().email("Adresse e-mail invalide").max(200), password: z.string().min(1, "Mot de passe requis") });

export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const email = parsed.data.email.toLowerCase();
    const me = await getUserByEmail(user.email);
    if (!me || !(await verifyPassword(parsed.data.password, me.password_hash))) return fail("Mot de passe incorrect", 401);
    if (email === user.email) return ok();
    if (await getUserByEmail(email)) return fail("Cette adresse est déjà utilisée par un autre compte", 409);
    await run("UPDATE users SET email = ? WHERE id = ?", [email, user.id]);
    // Les factures Stripe partent à la même adresse
    const stripe = getStripe();
    if (stripe && user.stripe_customer_id) await stripe.customers.update(user.stripe_customer_id, { email }).catch(() => {});
    return ok();
  });
}
