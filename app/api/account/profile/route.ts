import { z } from "zod";
import { CONTENT_LANG_CODES } from "@/lib/content-langs";
import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().max(100),
  author_name: z.string().trim().max(100),
  default_language: z.enum(CONTENT_LANG_CODES).nullable(),
  default_tone: z.enum(["pedagogique", "motivant", "expert", "convivial"]).nullable(),
  email_tips: z.boolean(),
});

export async function PATCH(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const d = parsed.data;
    await run("UPDATE users SET name = ?, author_name = ?, default_language = ?, default_tone = ?, tips_consent = ? WHERE id = ?", [
      d.name, d.author_name, d.default_language, d.default_tone, d.email_tips ? 1 : 0, user.id,
    ]);
    return ok();
  });
}
