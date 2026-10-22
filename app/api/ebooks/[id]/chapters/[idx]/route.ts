import { z } from "zod";
import { getDb } from "@/lib/db";
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
    const data = getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    const i = Number(idx);
    const ch = data.chapters.find((c) => c.idx === i);
    if (!ch) return fail("Chapitre introuvable", 404);
    const db = getDb();
    db.prepare("UPDATE chapters SET status = 'generating' WHERE id = ?").run(ch.id);
    try {
      const md = await generateChapter(briefFromEbook(data.ebook, data.chapters.length), outlineFromRows(data.ebook, data.chapters), i);
      db.prepare("UPDATE chapters SET content_md = ?, status = 'done' WHERE id = ?").run(md, ch.id);
    } catch (e) {
      db.prepare("UPDATE chapters SET status = 'error' WHERE id = ?").run(ch.id);
      throw e;
    } finally {
      refreshStatus(data.ebook.id);
    }
    return ok({ chapter: db.prepare("SELECT * FROM chapters WHERE id = ?").get(ch.id) });
  });
}

const patch = z.object({ title: z.string().min(1).max(200).optional(), content_md: z.string().max(200_000).optional() });

// Édition manuelle d'un chapitre
export async function PATCH(req: Request, { params }: Ctx) {
  const { id, idx } = await params;
  return withUser(async (user) => {
    const parsed = patch.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    const data = getEbook(Number(id), user.id);
    const ch = data?.chapters.find((c) => c.idx === Number(idx));
    if (!data || !ch) return fail("Introuvable", 404);
    const db = getDb();
    if (parsed.data.title !== undefined) db.prepare("UPDATE chapters SET title = ? WHERE id = ?").run(parsed.data.title, ch.id);
    if (parsed.data.content_md !== undefined)
      db.prepare("UPDATE chapters SET content_md = ?, status = CASE WHEN ? != '' THEN 'done' ELSE status END WHERE id = ?").run(parsed.data.content_md, parsed.data.content_md, ch.id);
    refreshStatus(data.ebook.id);
    return ok();
  });
}
