import { createSession, getUserByEmail, verifyPassword } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") return fail("E-mail et mot de passe requis");
  if (!(await rateLimit(`login:${clientIp(req)}`, 20, 15 * 60)) || !(await rateLimit(`login:${email.toLowerCase()}`, 10, 15 * 60)))
    return fail("Trop de tentatives. Réessaie dans 15 minutes.", 429);
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) return fail("E-mail ou mot de passe incorrect", 401);
  await createSession(user.id);
  return ok();
}
