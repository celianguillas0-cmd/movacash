import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listEbooks } from "@/lib/ebooks";
import { getUsage, hasActiveSubscription } from "@/lib/subscription";
import { getPlan } from "@/lib/config";
import { searchIdeas } from "@/lib/ideas";
import QuotaMeter from "@/components/ws/QuotaMeter";
import EbookCard from "@/components/ws/EbookCard";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const { welcome } = await searchParams;
  let quizCats: string[] = [];
  try {
    quizCats = JSON.parse(user.quiz_json || "{}").answers?.themes || [];
  } catch {}
  const [ebooks, usage, suggestions] = await Promise.all([
    listEbooks(user.id),
    getUsage(user),
    searchIdeas({ category: quizCats[Math.floor(Math.random() * Math.max(1, quizCats.length))], sort: "random", pageSize: 4, userId: user.id }),
  ]);
  const active = hasActiveSubscription(user);
  const ready = ebooks.filter((e) => e.status === "ready").length;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-10">
      {welcome && <p className="notice-ok">Abonnement activé. Bienvenue ! Commence par choisir une idée.</p>}

      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow-ws">Ton atelier</p>
          <h1 className="h1 mt-2">Bonjour{firstName ? ` ${firstName}` : ""}</h1>
          <p className="muted mt-2">{active ? `Offre ${getPlan(user.plan)?.name} · ${usage.remaining} e-book${usage.remaining > 1 ? "s" : ""} disponible${usage.remaining > 1 ? "s" : ""} ce mois-ci` : "Aucun abonnement actif"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/idees" className="btn-secondary">Parcourir les idées</Link>
          {active ? <Link href="/app/nouveau" className="btn-hot">+ Nouvel e-book</Link> : <Link href="/tarifs" className="btn-primary">S'abonner</Link>}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          {active ? <QuotaMeter used={usage.used} limit={usage.limit} /> : <p className="text-sm text-slate-600">Abonne-toi pour générer des e-books.</p>}
          <p className="mt-3 text-xs text-slate-500">Se renouvelle le {usage.resetsOn.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">E-books créés</p>
          <p className="mt-1 font-display text-4xl text-slate-900">{ebooks.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Prêts à vendre</p>
          <p className="mt-1 font-display text-4xl glacier-text">{ready}</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="h2">Mes e-books</h2>
          {ebooks.length > 8 && <Link href="/app/ebooks" className="text-sm text-brand-700 hover:underline">Tout voir ({ebooks.length})</Link>}
        </div>
        {ebooks.length === 0 ? (
          <div className="card flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">Tu n'as pas encore créé d'e-book. Choisis une idée, l'IA rédige le plan puis chaque chapitre.</p>
            {active && <Link href="/app/nouveau" className="btn-hot">Créer mon premier e-book</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {ebooks.slice(0, 8).map((e) => <EbookCard key={e.id} e={e} />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="h2">Idées pour toi</h2>
          <Link href="/app/idees" className="text-sm text-brand-700 hover:underline">Toutes les idées</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.items.map((i) => (
            <Link key={i.id} href={`/app/nouveau?idea=${i.id}`} className="card block transition hover:border-brand-100">
              <p className="text-xs text-slate-500">{i.emoji} {i.category_name}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{i.title}</p>
              <p className="mt-3 text-xs text-brand-700">Créer cet e-book →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
