import { z } from "zod";
import { batch } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { getEbook } from "@/lib/ebooks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const data = await getEbook(Number(id), user.id);
    return data ? ok(data) : fail("Introuvable", 404);
  });
}

const patch = z.object({
  title: z.string().min(2).max(200).optional(),
  subtitle: z.string().max(300).optional(),
  author_name: z.string().max(100).optional(),
  cover: z
    .object({
      style: z.enum(["moderne", "elegant", "bold"]),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })
    .optional(),
  // Choix de la miniature Etsy, gardés dans cover_json
  thumb: z.object({ style: z.enum(["affiche", "epure", "magazine"]), palette: z.number().int().min(0).max(20) }).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const parsed = patch.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    const current = await getEbook(Number(id), user.id);
    if (!current) return fail("Introuvable", 404);
    const d = parsed.data;
    let cover: Record<string, unknown> = {};
    try { cover = JSON.parse(current.ebook.cover_json || "{}"); } catch {}
    if (d.cover) cover = { ...cover, ...d.cover };
    if (d.thumb) cover = { ...cover, thumb: d.thumb.style, thumbPalette: d.thumb.palette };
    const eid = Number(id);
    await batch([
      ...(d.title !== undefined ? [{ sql: "UPDATE ebooks SET title = ? WHERE id = ?", args: [d.title, eid] }] : []),
      ...(d.subtitle !== undefined ? [{ sql: "UPDATE ebooks SET subtitle = ? WHERE id = ?", args: [d.subtitle, eid] }] : []),
      ...(d.author_name !== undefined ? [{ sql: "UPDATE ebooks SET author_name = ? WHERE id = ?", args: [d.author_name, eid] }] : []),
      ...(d.cover || d.thumb ? [{ sql: "UPDATE ebooks SET cover_json = ? WHERE id = ?", args: [JSON.stringify(cover), eid] }] : []),
      { sql: "UPDATE ebooks SET updated_at = unixepoch() WHERE id = ?", args: [eid] },
    ]);
    return ok();
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const args = [Number(id), user.id];
    await batch([
      { sql: "DELETE FROM chapters WHERE ebook_id = (SELECT id FROM ebooks WHERE id = ? AND user_id = ?)", args },
      { sql: "DELETE FROM ebooks WHERE id = ? AND user_id = ?", args },
    ]);
    return ok();
  });
}
