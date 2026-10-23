import Link from "next/link";
import { redirect } from "next/navigation";
import FunnelNav from "@/components/funnel/FunnelNav";
import Bars from "@/components/funnel/Bars";
import { getCurrentUser } from "@/lib/auth";
import { countIdeas, explainIdea, getIdeasByIds, type QuizAnswers } from "@/lib/ideas";
import { label } from "@/lib/quiz-questions";
import { hasActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const STRENGTH: Record<string, string> = { teach: "tu expliques bien", organized: "tu es organisé(e)", creative: "tu es créatif(ve)", persistent: "tu es persévérant(e)", numbers: "tu es à l'aise avec les chiffres", social: "tu sais parler aux gens" };

// Plan des 30 premiers jours, ajusté au temps disponible, à la promotion acceptée et à la patience.
function plan30(a: QuizAnswers): [string, string][] {
  const few = a.time === "2";
  const promo = a.promo === "none" ? "optimise tes titres et tags Etsy (pas de réseaux, comme tu le souhaites)" : a.promo === "faceless" ? "épingle tes visuels sur Pinterest et publie un carrousel sans visage" : "publie une courte vidéo qui montre l'intérieur de ton e-book";
  return [
    ["Semaine 1", `génère ton premier e-book et relis-le${few ? " en deux sessions d'une heure" : ""}, crée ta boutique Etsy${a.etsy === "shop" ? " (ou ajoute une section à la tienne)" : ""}.`],
    ["Semaine 2", `publie-le avec la fiche et les visuels générés, puis ${promo}.`],
    ["Semaine 3", few ? "regarde les vues de ta fiche et ajuste le titre ou la première photo." : "crée un deuxième e-book dans la même thématique pour renforcer ta boutique."],
    ["Semaine 4", `${few ? "deuxième e-book" : "troisième e-book"}, et note ce qui attire le plus de vues.${a.patience === "weeks" ? " Les premières ventes peuvent prendre plus d'un mois : c'est normal." : ""}`],
  ];
}

export default async function Results({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/inscription");
  const { welcome } = await searchParams;
  let quiz: { answers?: QuizAnswers; ideaIds?: number[] } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const ideas = getIdeasByIds((quiz.ideaIds || []).map(Number).filter(Number.isFinite)).slice(0, 3);
  const unlocked = hasActiveSubscription(user);
  const a: QuizAnswers = quiz.answers || {};
  const name = user.name || a.name || "";
  const strengths = (Array.isArray(a.strengths) ? (a.strengths as string[]) : []).map((k) => STRENGTH[k]).filter(Boolean);

  if (!ideas.length)
    return (
      <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
        <FunnelNav />
        <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
          <h1 className="q-title">Réponds au questionnaire pour obtenir <em className="serif">tes 3 idées.</em></h1>
          <div className="q-actions"><Link className="btn btn-accent btn-lg" href="/quiz">Commencer →</Link></div>
        </main>
      </div>
    );

  return (
    <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <main className="wrap narrow" style={{ marginInline: "auto" }}>
        <div className="res-head">
          {welcome && <p className="pill" style={{ marginBottom: 14, color: "var(--ok)", background: "color-mix(in srgb, var(--ok) 15%, transparent)" }}>Abonnement activé</p>}
          <p className="eyebrow">Tes résultats</p>
          <h1 className="q-title" style={{ marginTop: 12 }}>{name ? `${name}, voici` : "Voici"} <em className="serif">tes 3 idées.</em></h1>
          <p className="q-help">Sélectionnées parmi {countIdeas()} sujets selon tes réponses. Les indicateurs sont des estimations : vérifie toujours la demande en cherchant le sujet sur Etsy.</p>
        </div>
        <div className="profile">
          <p className="eyebrow">Ton profil</p>
          <p>
            {[
              a.time && `${label("time", String(a.time)).toLowerCase()} par semaine`,
              a.etsy && ({ none: "premiers pas dans la vente en ligne", online: "déjà vendu en ligne", shop: "boutique Etsy déjà ouverte" } as Record<string, string>)[String(a.etsy)],
              a.format && `tu préfères ${label("format", String(a.format)).toLowerCase()}`,
              strengths.length && strengths.join(" et "),
              a.tone && `ton ${label("tone", String(a.tone)).toLowerCase()}`,
            ].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          {ideas.map((i, k) => {
            const locked = !unlocked && k > 0;
            return (
              <article key={i.id} className={`idea-card ${locked ? "locked" : ""}`}>
                <div className={locked ? "blur" : ""}>
                  <div className="idea-top"><span className="eyebrow">Idée {k + 1}</span><span className="dim">{i.category_name}</span></div>
                  <h3>{i.title}</h3>
                  <div className="meters">
                    <div className="meter"><div className="l">Potentiel estimé</div><Bars n={i.demand} /></div>
                    <div className="meter"><div className="l">Concurrence</div><Bars n={i.competition} /></div>
                    <div className="meter"><div className="l">Prix conseillé</div><div className="v">{i.price_min} – {i.price_max} €</div></div>
                  </div>
                  <ul className="why">{explainIdea(i, a).map((r) => <li key={r}>{r}</li>)}</ul>
                  {unlocked && (
                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                      <Link className="btn btn-accent btn-sm" href={`/app/nouveau?idea=${i.id}`}>Créer cet e-book →</Link>
                      <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://www.etsy.com/search?q=${encodeURIComponent(i.title)}`}>Vérifier sur Etsy ↗</a>
                    </div>
                  )}
                </div>
                {locked && <div className="lock-badge"><span>Débloquée avec l'abonnement</span></div>}
              </article>
            );
          })}
        </div>
        <div className="plan30">
          <p className="eyebrow">Ton plan des 30 premiers jours</p>
          <div style={unlocked ? undefined : { filter: "blur(6px)", userSelect: "none" }}>
            <p style={{ marginTop: 10 }}>
              {plan30(a).map(([w, t]) => <span key={w}><b>{w}</b> : {t}<br /></span>)}
            </p>
          </div>
        </div>
        <div className="sticky-cta">
          {unlocked ? (
            <Link className="btn btn-accent btn-lg" href="/app">Ouvrir mon atelier →</Link>
          ) : (
            <Link className="btn btn-accent btn-lg" href="/tarifs">Débloquer mes idées et créer mon premier e-book →</Link>
          )}
        </div>
      </main>
    </div>
  );
}
