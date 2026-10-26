import { one, run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { getEbook } from "@/lib/ebooks";
import { imagenPhoto } from "@/lib/gemini";
import { hasActiveSubscription } from "@/lib/subscription";
import { isFilmMode, isGeminiConfigured } from "@/lib/config";
import { ATTENTE, pause } from "@/lib/film";

export const maxDuration = 60;
type Ctx = { params: Promise<{ id: string }> };
// Une photo par e-book, plus deux régénérations : la miniature reste dans le coût prévu.
const MAX_TRIES = 3;

type PhotoRow = { mime: string; data: string; tries: number };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const data = await getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    const p = await one<PhotoRow>("SELECT mime, data, tries FROM ebook_photos WHERE ebook_id = ?", [data.ebook.id]);
    if (!p) return fail("Pas encore de photo", 404);
    return new Response(Buffer.from(p.data, "base64"), { headers: { "Content-Type": p.mime, "Cache-Control": "private, max-age=3600" } });
  });
}

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    if (!hasActiveSubscription(user)) return fail("Abonnement requis", 402);
    const data = await getEbook(Number(id), user.id);
    if (!data) return fail("Introuvable", 404);
    const prev = await one<PhotoRow>("SELECT tries FROM ebook_photos WHERE ebook_id = ?", [data.ebook.id]);
    // Tournage ou pas de clé : même attente que la vraie génération, sans appel à l'API.
    if (isFilmMode(user) || !isGeminiConfigured()) {
      await pause(...ATTENTE.photo);
      // Tournage : la photo du vrai e-book rejoué, s'il en a une
      const src = isFilmMode(user) && data.ebook.film_source_id ? await one<PhotoRow>("SELECT mime, data, tries FROM ebook_photos WHERE ebook_id = ?", [data.ebook.film_source_id]) : null;
      if (src) {
        await run(
          "INSERT INTO ebook_photos (ebook_id, mime, data, tries) VALUES (?, ?, ?, 1) ON CONFLICT (ebook_id) DO UPDATE SET tries = LEAST(ebook_photos.tries + 1, ?), created_at = unixepoch()",
          [data.ebook.id, src.mime, src.data, MAX_TRIES]
        );
        return ok({ photo: true, tries: Math.min((prev?.tries ?? 0) + 1, MAX_TRIES), max: MAX_TRIES });
      }
      return ok({ photo: false, tries: prev?.tries ?? 0, max: MAX_TRIES });
    }
    if (prev && prev.tries >= MAX_TRIES) return fail("Tu as déjà généré 3 photos pour cet e-book. Tu peux toujours changer de mise en page.", 429);
    const e = data.ebook;
    const prompt = [
      `Realistic editorial photograph that illustrates the subject of a guide titled "${e.title}" (topic: ${e.topic}).`,
      "Shot like a lifestyle magazine photo: natural light, real objects and textures, shallow depth of field, warm and inviting, true-to-life colours.",
      "Simple composition with one clear subject and some calm background space.",
      "Absolutely no text, letters, numbers, logos, watermarks or book covers. Not an illustration, not a 3D render, no gold, no glitter.",
    ].join(" ");
    const img = await imagenPhoto(prompt);
    await run(
      "INSERT INTO ebook_photos (ebook_id, mime, data, tries) VALUES (?, ?, ?, 1) ON CONFLICT (ebook_id) DO UPDATE SET mime = excluded.mime, data = excluded.data, tries = ebook_photos.tries + 1, created_at = unixepoch()",
      [e.id, img.mime, img.b64]
    );
    return ok({ photo: true, tries: (prev?.tries ?? 0) + 1, max: MAX_TRIES });
  });
}
