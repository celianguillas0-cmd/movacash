import { run } from "@/lib/db";
import { fail, ok, withUser } from "@/lib/api";
import { getIdea } from "@/lib/ideas";

// Choisit l'idée affichée dans « Mon idée ».
export async function POST(req: Request) {
  return withUser(async (user) => {
    const body = await req.json().catch(() => ({}));
    const idea = await getIdea(Number(body.ideaId));
    if (!idea) return fail("Idée introuvable", 404);
    await run("UPDATE users SET my_idea_id = ? WHERE id = ?", [idea.id, user.id]);
    return ok({ id: idea.id });
  });
}
