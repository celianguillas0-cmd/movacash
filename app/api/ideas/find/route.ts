import { run } from "@/lib/db";
import { ok, withUser } from "@/lib/api";
import { findIdeasForUser, type PublicCible, type QuizAnswers } from "@/lib/ideas";

// « Trouver mon idée » : idées classées selon le sondage, un sujet et un public facultatifs.
export async function POST(req: Request) {
  return withUser(async (user) => {
    const body = await req.json().catch(() => ({}));
    const q = typeof body.q === "string" ? body.q.slice(0, 80) : "";
    const cible: PublicCible = ["particuliers", "pros", "parents"].includes(body.cible) ? body.cible : "tous";
    let answers: QuizAnswers = {};
    try {
      answers = JSON.parse(user.quiz_json || "{}").answers || {};
    } catch {}
    const res = await findIdeasForUser(answers, q, cible);
    // La première idée trouvée s'installe dans « Mon idée » si la place est libre
    if (!user.my_idea_id && res.ideas[0]) await run("UPDATE users SET my_idea_id = ? WHERE id = ?", [res.ideas[0].id, user.id]);
    return ok(res);
  });
}
