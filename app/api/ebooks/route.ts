import { z } from "zod";
import { CONTENT_LANG_CODES } from "@/lib/content-langs";
import { fail, ok, withUser } from "@/lib/api";
import { canCreateEbook } from "@/lib/subscription";
import { generateOutline } from "@/lib/generator";
import { createEbook, outlineFromRows } from "@/lib/ebooks";
import { one, run } from "@/lib/db";
import { getIdea } from "@/lib/ideas";
import { isFilmMode, isGeminiConfigured } from "@/lib/config";
import { ATTENTE, filmSource, pause } from "@/lib/film";
import { getT } from "@/lib/i18n/server";

export const maxDuration = 120;

const schema = z.object({
  ideaId: z.number().int().optional().nullable(),
  topic: z.string().min(5, "Décrivez le sujet (5 caractères minimum)").max(300),
  audience: z.string().max(200).default(""),
  language: z.enum(CONTENT_LANG_CODES).default("fr"),
  tone: z.enum(["pedagogique", "motivant", "expert", "convivial"]).default("pedagogique"),
  chapters: z.number().int().min(5).max(14).default(9),
  extras: z.string().max(1000).default(""),
  authorName: z.string().max(100).default(""),
  sensitive: z.enum(["health", "finance", "legal"]).nullable().optional(),
  thumb: z.enum(["affiche", "epure", "magazine"]).optional(),
});

export async function POST(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const allowed = await canCreateEbook(user, (await getT()).t);
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
    const film = isFilmMode(user);
    // Tournage : on rejoue le dernier vrai e-book de l'admin sur ce sujet, s'il existe
    const source = film ? await filmSource(user.id, brief.topic) : null;
    const outline = source
      ? await pause(...ATTENTE.plan).then(() => outlineFromRows(source.ebook, source.chapters))
      : await generateOutline(brief, film);
    const id = await createEbook(user.id, idea?.id ?? null, brief, outline, d.authorName || user.name, !film && !isGeminiConfigured(), film);
    if (source) await run("UPDATE ebooks SET film_source_id = ? WHERE id = ?", [source.ebook.id, id]);
    if (d.thumb) {
      const row = await one<{ cover_json: string }>("SELECT cover_json FROM ebooks WHERE id = ?", [id]);
      let cover: Record<string, unknown> = {};
      try { cover = JSON.parse(row?.cover_json || "{}"); } catch {}
      await run("UPDATE ebooks SET cover_json = ? WHERE id = ?", [JSON.stringify({ ...cover, thumb: d.thumb }), id]);
    }
    return ok({ id });
  });
}
