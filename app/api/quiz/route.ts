import { run } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { pickIdeasForQuiz, type QuizAnswers } from "@/lib/ideas";
import { ok } from "@/lib/api";

// Calcule les 3 idées du sondage. Si l'utilisateur est connecté, on enregistre directement le résultat.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  let answers: QuizAnswers = typeof body.answers === "object" && body.answers ? body.answers : {};
  if (JSON.stringify(answers).length > 6000) answers = {};
  const ideas = await pickIdeasForQuiz(answers, 3);
  const quiz = { answers, ideaIds: ideas.map((i) => i.id) };
  const user = await getCurrentUser();
  if (user) await run("UPDATE users SET quiz_json = ? WHERE id = ?", [JSON.stringify(quiz), user.id]);
  return ok({ quiz, saved: Boolean(user) });
}
