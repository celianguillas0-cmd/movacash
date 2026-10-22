import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listEbooks } from "@/lib/ebooks";
import { getUsage, hasActiveSubscription } from "@/lib/subscription";
import { getPlan } from "@/lib/config";
import { searchIdeas } from "@/lib/ideas";
import CoverThumb from "@/components/CoverThumb";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = (await getCurrentUser())!;
  const { welcome } = await searchParams;
  const ebooks = listEbooks(user.id);
  const active = hasActiveSubscription(user);
  const usage = getUsage(user);
  let quizCats: string[] = [];
  try {
    quizCats = JSON.parse(user.quiz_json || "{}").categories || [];
  } catch {}
  const suggestions = searchIdeas({ category: quizCats[0], sort: "random", pageSize: 4, userId: user.id }).items;

  return (
    <div className="space-y-8">
      {welcome && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Abonnement activé. Bienvenue ! Commencez par choisir une idée.</p>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h1">Bonjour{user.name ? ` ${user.name}` : ""}</h1>
          <p className="muted">
            {active ? `Offre ${getPlan(user.plan)?.name} · ${usage.remaining} e-book(s) restant(s) ce mois-ci` : "Aucun abonnement actif"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/idees" className="btn-secondary">Parcourir les idées</Link>
          {active ? <Link href="/app/nouveau" className="btn-primary">Nouvel e-book</Link> : <Link href="/tarifs" className="btn-primary">S'abonner</Link>}
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Mes e-books</h2>
        {ebooks.length === 0 ? (
          <div className="card text-sm text-slate-600">Vous n'avez pas encore créé d'e-book.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ebooks.map((e) => (
              <Link key={e.id} href={`/app/ebooks/${e.id}`} className="card block hover:border-brand-500">
                <CoverThumb title={e.title} cover={JSON.parse(e.cover_json)} />
                <p className="mt-3 line-clamp-2 font-medium">{e.title}</p>
                <p className="muted mt-1">
                  {e.status === "ready" ? "Prêt" : `En cours : ${e.chapters_done}/${e.chapters_total} chapitres`}
                  {e.is_demo ? " · démo" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Idées pour vous</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {suggestions.map((i) => (
            <Link key={i.id} href={`/app/nouveau?idea=${i.id}`} className="card block hover:border-brand-500">
              <p className="text-xs text-slate-500">{i.emoji} {i.category_name}</p>
              <p className="mt-1 text-sm font-medium">{i.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
