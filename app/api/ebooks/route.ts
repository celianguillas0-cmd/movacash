import { z } from "zod";
import { fail, ok, withUser } from "@/lib/api";
import { canCreateEbook } from "@/lib/subscription";
import { generateOutline } from "@/lib/generator";
import { createEbook } from "@/lib/ebooks";
import { getIdea } from "@/lib/ideas";
import { isGeminiConfigured } from "@/lib/config";

export const maxDuration = 120;

const schema = z.object({
  ideaId: z.number().int().optional().nullable(),
  topic: z.string().min(5, "Décrivez le sujet (5 caractères minimum)").max(300),
  audience: z.string().max(200).default(""),
  language: z.enum(["fr", "en", "es", "de", "it"]).default("fr"),
  tone: z.enum(["pedagogique", "motivant", "expert", "convivial"]).default("pedagogique"),
  chapters: z.number().int().min(5).max(14).default(9),
  extras: z.string().max(1000).default(""),
  authorName: z.string().max(100).default(""),
  sensitive: z.enum(["health", "finance", "legal"]).nullable().optional(),
});

export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const allowed = await canCreateEbook(user);
    if (!allowed.ok) return fail(allowed.reason, 402);
    const d = parsed.data;
    const idea = d.ideaId ? await getIdea(d.ideaId) : undefined;
    const brief = {
      topic: d.topic,
      audience: d.audience,
      language: d.language,
      tone: d.tone,
      chapters: d.chapters,
      extras: d.extras,
      sensitive: d.sensitive ?? idea?.sensitive ?? null,
      format: idea?.format || "Guide complet",
    };
    const outline = await generateOutline(brief);
    const id = await createEbook(user.id, idea?.id ?? null, brief, outline, d.authorName || user.name, !isGeminiConfigured());
    return ok({ id });
  });
}
