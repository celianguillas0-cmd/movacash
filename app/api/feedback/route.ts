import { z } from "zod";
import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";

const schema = z.object({ note: z.number().int().min(1).max(5).optional(), message: z.string().trim().min(3).max(3000) });

// « Ton avis » (Paramètres) : lu par l'admin dans l'onglet Admin.
export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Écris quelques mots avant d'envoyer.");
    if (!(await rateLimit(`feedback:${user.id}`, 5, 3600))) return fail("Merci ! Tu as déjà envoyé plusieurs avis, réessaie plus tard.", 429);
    await run("INSERT INTO feedback (user_id, email, note, message) VALUES (?, ?, ?, ?)", [user.id, user.email, parsed.data.note ?? null, parsed.data.message]);
    return ok();
  });
}
