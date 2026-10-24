import { z } from "zod";
import { one, run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { briefFromEbook, getEbook, outlineFromRows, refreshStatus } from "@/lib/ebooks";
import { generateChapter } from "@/lib/generator";
import { hasActiveSubscription } from "@/lib/subscription";

export const maxDuration = 300;
type Ctx = { params: Promise<{ id: string; idx: string }> };

// Génère (ou régénère) un chapitre
export async function POST(_req: Request, { params }: Ctx) {
  const { id, idx } = await params;
  return withUser(async (user) => {
    if (!hasActiveSubscription(user)) return fail("Abonnement requis", 402);
    const data = await getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    const i = Number(idx);
    const ch = data.chapters.find((c) => c.idx === i);
    if (!ch) return fail("Chapitre introuvable", 404);
    await run("UPDATE chapters SET status = 'generating' WHERE id = ?", [ch.id]);
    try {
      const md = await generateChapter(briefFromEbook(data.ebook, data.chapters.length), outlineFromRows(data.ebook, data.chapters), i);
      await run("UPDATE chapters SET content_md = ?, status = 'done' WHERE id = ?", [md, ch.id]);
    } catch (e) {
      await run("UPDATE chapters SET status = 'error' WHERE id = ?", [ch.id]);
      throw e;
    } finally {
      await refreshStatus(data.ebook.id);
    }
    return ok({ chapter: await one("SELECT * FROM chapters WHERE id = ?", [ch.id]) });
  });
}

const patch = z.object({ title: z.string().min(1).max(200).optional(), content_md: z.string().max(200_000).optional() });

// Édition manuelle d'un chapitre
export async function PATCH(req: Request, { params }: Ctx) {
  const { id, idx } = await params;
  return withUser(async (user) => {
    const parsed = patch.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    const data = await getEbook(Number(id), user.id);
    const ch = data?.chapters.find((c) => c.idx === Number(idx));
    if (!data || !ch) return fail("Introuvable", 404);
    if (parsed.data.title !== undefined) await run("UPDATE chapters SET title = ? WHERE id = ?", [parsed.data.title, ch.id]);
    if (parsed.data.content_md !== undefined)
      await run("UPDATE chapters SET content_md = ?, status = CASE WHEN ?::text != '' THEN 'done' ELSE status END WHERE id = ?", [parsed.data.content_md, parsed.data.content_md, ch.id]);
    await refreshStatus(data.ebook.id);
    return ok();
  });
}
