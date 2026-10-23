import Link from "next/link";
import NewEbookForm from "./NewEbookForm";
import { requireUser } from "@/lib/auth";
import { getIdea } from "@/lib/ideas";
import { canCreateEbook, getUsage } from "@/lib/subscription";

export default async function NewEbook({ searchParams }: { searchParams: Promise<{ idea?: string }> }) {
  const user = await requireUser();
  const { idea: ideaId } = await searchParams;
  const [idea, allowed, usage] = await Promise.all([ideaId ? getIdea(Number(ideaId)) : undefined, canCreateEbook(user), getUsage(user)]);
  let quiz: { answers?: Record<string, unknown> } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const qa = quiz.answers || {};
  // Préférences du compte d'abord, sinon réponses au questionnaire
  const defaults = {
    tone: user.default_tone || (typeof qa.tone === "string" ? qa.tone : undefined),
    language: user.default_language || (qa.lang === "en" ? "en" : undefined),
  };
  return (
    <div className="max-w-3xl">
      <p className="eyebrow-ws">Atelier</p>
      <h1 className="h1 mt-2">Nouvel e-book</h1>
      <p className="muted mt-2">
        L'IA rédige d'abord un plan, puis chaque chapitre (1800 à 2500 mots). Compte quelques minutes. Tu pourras ensuite tout relire et modifier.
        {allowed.ok && ` Il te reste ${usage.remaining} e-book${usage.remaining > 1 ? "s" : ""} ce mois-ci.`}
      </p>
      {!allowed.ok ? (
        <div className="card mt-6 space-y-3">
          <p className="text-sm text-slate-700">{allowed.reason}</p>
          <Link href={usage.limit ? "/app/abonnement" : "/tarifs"} className="btn-primary">{usage.limit ? "Voir les offres supérieures" : "Voir les offres"}</Link>
        </div>
      ) : (
        <NewEbookForm
          defaultAuthor={user.author_name || user.name}
          defaults={defaults}
          idea={idea ? { id: idea.id, title: idea.title, audience: idea.audience, sensitive: idea.sensitive, format: idea.format } : null}
        />
      )}
    </div>
  );
}
