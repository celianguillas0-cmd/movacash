import { z } from "zod";
import { run } from "@/lib/db";
import { createSession, getUserByEmail, hashPassword, verifyPassword } from "@/lib/auth";
import { fail, ok, withUser } from "@/lib/api";

const schema = z.object({ current: z.string().min(1, "Mot de passe actuel requis"), next: z.string().min(8, "Nouveau mot de passe : 8 caractères minimum").max(200) });

// Change le mot de passe et déconnecte les autres appareils
export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const me = await getUserByEmail(user.email);
    if (!me || !(await verifyPassword(parsed.data.current, me.password_hash))) return fail("Mot de passe actuel incorrect", 401);
    await run("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?", [await hashPassword(parsed.data.next), user.id]);
    await createSession(user.id);
    return ok();
  });
}
