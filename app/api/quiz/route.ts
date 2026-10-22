import { pickIdeasForQuiz } from "@/lib/ideas";
import { ok } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const cats = Array.isArray(body.categories) ? body.categories.filter((c: unknown) => typeof c === "string").slice(0, 10) : [];
  const beginner = body.experience !== "advanced";
  return ok({ ideas: pickIdeasForQuiz(cats, beginner, 6) });
}
