import { getDb } from "@/lib/db";
import { ok, withUser } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser((user) => {
    const db = getDb();
    const r = db.prepare("DELETE FROM favorites WHERE user_id = ? AND idea_id = ?").run(user.id, Number(id));
    if (!r.changes) db.prepare("INSERT OR IGNORE INTO favorites (user_id, idea_id) VALUES (?, ?)").run(user.id, Number(id));
    return ok({ favorite: !r.changes });
  });
}
