import { getDb } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") return fail("Email et mot de passe requis");
  const user = getDb().prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email.toLowerCase()) as
    | { id: number; password_hash: string }
    | undefined;
  if (!user || !(await verifyPassword(password, user.password_hash))) return fail("Identifiants incorrects", 401);
  await createSession(user.id);
  return ok();
}
