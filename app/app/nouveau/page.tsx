import Link from "next/link";
import NewEbookForm from "./NewEbookForm";
import { getCurrentUser } from "@/lib/auth";
import { getIdea } from "@/lib/ideas";
import { canCreateEbook } from "@/lib/subscription";

export default async function NewEbook({ searchParams }: { searchParams: Promise<{ idea?: string }> }) {
  const user = (await getCurrentUser())!;
  const { idea: ideaId } = await searchParams;
  const idea = ideaId ? getIdea(Number(ideaId)) : undefined;
  const allowed = canCreateEbook(user);
  let quiz: { answers?: Record<string, unknown> } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const qa = quiz.answers || {};
  const defaults = {
    tone: typeof qa.tone === "string" ? qa.tone : undefined,
    language: qa.lang === "en" ? "en" : undefined,
  };
  return (
    <div className="max-w-3xl">
      <h1 className="h1">Nouvel e-book</h1>
      <p className="muted mt-1">
        L'IA rédige d'abord un plan, puis chaque chapitre (1800 à 2500 mots). Comptez quelques minutes. Vous pourrez ensuite tout relire et modifier.
      </p>
      {!allowed.ok ? (
        <div className="card mt-6">
          <p className="text-sm">{allowed.reason}</p>
          <Link href="/tarifs" className="btn-primary mt-3">Voir les offres</Link>
        </div>
      ) : (
        <NewEbookForm
          defaultAuthor={user.name}
          defaults={defaults}
          idea={idea ? { id: idea.id, title: idea.title, audience: idea.audience, sensitive: idea.sensitive, format: idea.format } : null}
        />
      )}
    </div>
  );
}
