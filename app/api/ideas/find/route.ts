import { run } from "@/lib/db";
import { ok, withUser } from "@/lib/api";
import { findIdeasForUser, type PublicCible, type QuizAnswers } from "@/lib/ideas";
import { localizeIdeas, translateIdeas } from "@/lib/ideas-i18n";
import { getT } from "@/lib/i18n/server";
import { isFilmMode } from "@/lib/config";

export const maxDuration = 60;

// « Trouver mon idée » : idées classées selon le sondage, un sujet et un public facultatifs.
// Hors français, les idées affichées sont traduites une fois par Gemini puis gardées en base.
export async function POST(req: Request) {
  return withUser(async (user) => {
    const body = await req.json().catch(() => ({}));
    const q = typeof body.q === "string" ? body.q.slice(0, 80) : "";
    const cible: PublicCible = ["particuliers", "pros", "parents"].includes(body.cible) ? body.cible : "tous";
    let answers: QuizAnswers = {};
    try {
      answers = JSON.parse(user.quiz_json || "{}").answers || {};
    } catch {}
    const page = Math.min(20, Math.max(1, Number(body.page) || 1));
    const { t, locale } = await getT();
    const res = await findIdeasForUser(answers, q, cible, 12 * page, { t, locale });
    const raw = res.picks.map((p) => p.idea);
    if (!isFilmMode(user)) await translateIdeas(raw, locale).catch((e) => console.error("traduction des idées", e));
    const local = await localizeIdeas(raw, locale);
    const ideas = local.map((i, k) => res.describe(i, res.picks[k].compat));
    // La première idée trouvée s'installe dans « Mon idée » si la place est libre
    if (!user.my_idea_id && ideas[0]) await run("UPDATE users SET my_idea_id = ? WHERE id = ?", [ideas[0].id, user.id]);
    return ok({ total: res.total, ideas });
  });
}
