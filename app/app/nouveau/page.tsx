import Link from "next/link";
import { redirect } from "next/navigation";
import NewEbookForm from "./NewEbookForm";
import { requireUser } from "@/lib/auth";
import { getIdea } from "@/lib/ideas";
import { canCreateEbook, getUsage } from "@/lib/subscription";
import { getT } from "@/lib/i18n/server";

export default async function NewEbook({ searchParams }: { searchParams: Promise<{ idea?: string }> }) {
  const user = await requireUser();
  const { idea: ideaId } = await searchParams;
  const { t, locale } = await getT();
  // Depuis une idée : on passe par les questions de l'atelier
  if (ideaId && /^\d+$/.test(ideaId)) redirect(`/app/creer/${ideaId}`);
  const [idea, allowed, usage] = await Promise.all([ideaId ? getIdea(Number(ideaId)) : undefined, canCreateEbook(user, t, locale), getUsage(user)]);
  let quiz: { answers?: Record<string, unknown> } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const qa = quiz.answers || {};
  // Préférences du compte d'abord, sinon réponses au questionnaire
  const defaults = {
    tone: user.default_tone || (typeof qa.tone === "string" ? qa.tone : undefined),
    language: user.default_language || locale,
  };
  return (
    <div className="max-w-3xl">
      <p className="at-kicker">{t("Ton atelier")}</p>
      <h1 className="at-titre">{t("Sujet libre.")}</h1>
      <p className="muted mt-2">
        {t("L'IA rédige d'abord un plan, puis chaque chapitre (1800 à 2500 mots). Compte quelques minutes. Tu pourras ensuite tout relire et modifier.")}
        {allowed.ok && " " + (usage.remaining > 1 ? t("Il te reste {n} e-books sur cette période.", { n: usage.remaining }) : t("Il te reste {n} e-book sur cette période.", { n: usage.remaining }))}
      </p>
      {!allowed.ok ? (
        <div className="card mt-6 space-y-3">
          <p className="text-sm text-slate-700">{allowed.reason}</p>
          <Link href={usage.limit ? "/app/abonnement" : "/tarifs"} className="btn-primary">{usage.limit ? t("Voir les offres supérieures") : t("Voir les offres")}</Link>
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
