import { run } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ok, withUser } from "@/lib/api";

// Déconnecte tous les autres appareils (la session courante est renouvelée)
export async function POST() {
  return withUser(async (user) => {
    await run("UPDATE users SET session_version = session_version + 1 WHERE id = ?", [user.id]);
    await createSession(user.id);
    return ok();
  });
}
