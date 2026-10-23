import { run } from "@/lib/db";
import { ok, withUser } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (user) => {
    const r = await run("DELETE FROM favorites WHERE user_id = ? AND idea_id = ?", [user.id, Number(id)]);
    if (!r.changes) await run("INSERT OR IGNORE INTO favorites (user_id, idea_id) VALUES (?, ?)", [user.id, Number(id)]);
    return ok({ favorite: !r.changes });
  });
}
