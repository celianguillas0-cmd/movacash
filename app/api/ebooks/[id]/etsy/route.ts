import { z } from "zod";
import { one, run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { briefFromEbook, getEbook, outlineFromRows } from "@/lib/ebooks";
import { generateEtsyKit } from "@/lib/generator";
import { hasActiveSubscription } from "@/lib/subscription";
import { wordCount } from "@/lib/markdown";
import { isFilmMode } from "@/lib/config";
import { ATTENTE, pause } from "@/lib/film";

export const maxDuration = 120;
type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    if (!hasActiveSubscription(user)) return fail("Abonnement requis", 402);
    const data = await getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    const words = data.chapters.reduce((n, c) => n + wordCount(c.content_md), 0);
    const film = isFilmMode(user);
    // En tournage, les chapitres d'exemple sont courts : on affiche une longueur réaliste.
    const pages = film ? 48 : Math.max(10, Math.round(words / 380) + 3);
    const source = film && data.ebook.film_source_id ? await one<{ etsy_json: string | null }>("SELECT etsy_json FROM ebooks WHERE id = ?", [data.ebook.film_source_id]) : null;
    const kit = source?.etsy_json
      ? await pause(...ATTENTE.fiche).then(() => JSON.parse(source.etsy_json!))
      : await generateEtsyKit(briefFromEbook(data.ebook, data.chapters.length), outlineFromRows(data.ebook, data.chapters), pages, film);
    await run("UPDATE ebooks SET etsy_json = ? WHERE id = ?", [JSON.stringify(kit), data.ebook.id]);
    return ok({ kit });
  });
}

const kitSchema = z.object({
  title: z.string().max(300),
  tags: z.array(z.string().max(60)).max(20),
  description: z.string().max(20000),
  priceSuggestion: z.string().max(500).default(""),
  imageIdeas: z.array(z.string()).default([]),
  category: z.string().max(300).default(""),
});

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const parsed = kitSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    const data = await getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    await run("UPDATE ebooks SET etsy_json = ? WHERE id = ?", [JSON.stringify(parsed.data), data.ebook.id]);
    return ok();
  });
}
