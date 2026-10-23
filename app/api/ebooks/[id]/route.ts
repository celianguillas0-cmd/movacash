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
});

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(async (user) => {
    const parsed = patch.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail("Données invalides");
    if (!(await getEbook(Number(id), user.id))) return fail("Introuvable", 404);
    const d = parsed.data;
    const eid = Number(id);
    await batch([
      ...(d.title !== undefined ? [{ sql: "UPDATE ebooks SET title = ? WHERE id = ?", args: [d.title, eid] }] : []),
      ...(d.subtitle !== undefined ? [{ sql: "UPDATE ebooks SET subtitle = ? WHERE id = ?", args: [d.subtitle, eid] }] : []),
      ...(d.author_name !== undefined ? [{ sql: "UPDATE ebooks SET author_name = ? WHERE id = ?", args: [d.author_name, eid] }] : []),
      ...(d.cover ? [{ sql: "UPDATE ebooks SET cover_json = ? WHERE id = ?", args: [JSON.stringify(d.cover), eid] }] : []),
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
