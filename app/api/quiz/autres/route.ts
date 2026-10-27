import { run } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { pickIdeasForQuiz, type QuizAnswers } from "@/lib/ideas";
import { fail, ok } from "@/lib/api";

// « Ces idées ne me plaisent pas » : 3 nouvelles idées pour les mêmes réponses, sans reproposer celles déjà vues.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return fail("Connecte-toi pour voir d'autres idées.", 401);
  let quiz: { answers?: QuizAnswers; ideaIds?: number[]; seenIds?: number[] } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const vues = [...new Set([...(quiz.seenIds || []), ...(quiz.ideaIds || [])].map(Number).filter(Number.isFinite))].slice(-400);
  const ideas = await pickIdeasForQuiz(quiz.answers || {}, 3, vues);
  const ideaIds = ideas.map((i) => i.id);
  await run("UPDATE users SET quiz_json = ? WHERE id = ?", [JSON.stringify({ ...quiz, ideaIds, seenIds: [...vues, ...ideaIds].slice(-400) }), user.id]);
  return ok({ ideaIds });
}
