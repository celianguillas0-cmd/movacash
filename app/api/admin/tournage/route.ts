import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { isAdmin } from "@/lib/config";

// Active ou coupe le mode tournage (réservé à l'admin).
export async function POST(req: Request) {
  return withUser(async (user) => {
    if (!isAdmin(user.email)) return fail("Introuvable", 404);
    const body = await req.json().catch(() => ({}));
    const on = Boolean(body.on);
    await run("UPDATE users SET mode_reel = ? WHERE id = ?", [on ? 0 : 1, user.id]);
    return ok({ on });
  });
}
