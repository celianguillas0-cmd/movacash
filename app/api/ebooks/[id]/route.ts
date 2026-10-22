import { z } from "zod";
import { getDb } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { getEbook } from "@/lib/ebooks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser((user) => {
    const data = getEbook(Number(id), user.id);
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
});

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const parsed = patch.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    if (!getEbook(Number(id), user.id)) return fail("Introuvable", 404);
    const d = parsed.data;
    const db = getDb();
    if (d.title !== undefined) db.prepare("UPDATE ebooks SET title = ? WHERE id = ?").run(d.title, id);
    if (d.subtitle !== undefined) db.prepare("UPDATE ebooks SET subtitle = ? WHERE id = ?").run(d.subtitle, id);
    if (d.author_name !== undefined) db.prepare("UPDATE ebooks SET author_name = ? WHERE id = ?").run(d.author_name, id);
    if (d.cover) db.prepare("UPDATE ebooks SET cover_json = ? WHERE id = ?").run(JSON.stringify(d.cover), id);
    db.prepare("UPDATE ebooks SET updated_at = unixepoch() WHERE id = ?").run(id);
    return ok();
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser((user) => {
    getDb().prepare("DELETE FROM ebooks WHERE id = ? AND user_id = ?").run(Number(id), user.id);
    return ok();
  });
}
