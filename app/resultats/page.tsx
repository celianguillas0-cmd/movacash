import Link from "next/link";
import { redirect } from "next/navigation";
import FunnelNav from "@/components/funnel/FunnelNav";
import Bars from "@/components/funnel/Bars";
import { getCurrentUser } from "@/lib/auth";
import { countIdeas, getIdeasByIds, type Idea } from "@/lib/ideas";
import { hasActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const LEVEL = ["très faible", "faible", "moyenne", "bonne", "forte"];
const COMP = ["très faible", "faible", "moyenne", "élevée", "très élevée"];
const TIME: Record<string, string> = { "2": "moins de 2 h", "5": "2 à 5 h", "10": "5 à 10 h", "15": "plus de 10 h" };

function why(i: Idea, time?: string) {
  return `Sujet de la catégorie « ${i.category_name} », que tu as choisie. Demande ${LEVEL[i.demand - 1]}, concurrence ${COMP[i.competition - 1]}. Avec ${TIME[time || ""] || "quelques heures"} par semaine, compte une à deux soirées pour le relire et publier la fiche.${i.sensitive ? " Sujet sensible : un avertissement sera ajouté automatiquement." : ""}`;
}

export default async function Results({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/inscription");
  const { welcome } = await searchParams;
  let quiz: { answers?: { time?: string; name?: string }; ideaIds?: number[] } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const ideas = getIdeasByIds((quiz.ideaIds || []).map(Number).filter(Number.isFinite)).slice(0, 3);
  const unlocked = hasActiveSubscription(user);
  const name = user.name || quiz.answers?.name || "";

  if (!ideas.length)
    return (
      <div className="mc">
        <FunnelNav />
        <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
          <h1 className="q-title">Réponds au questionnaire pour obtenir <em className="serif">tes 3 idées.</em></h1>
          <div className="q-actions"><Link className="btn btn-accent btn-lg" href="/quiz">Commencer →</Link></div>
        </main>
      </div>
    );

  return (
    <div className="mc">
      <FunnelNav />
      <main className="wrap narrow" style={{ marginInline: "auto" }}>
        <div className="res-head">
          {welcome && <p className="pill" style={{ marginBottom: 14, color: "var(--ok)", background: "color-mix(in srgb, var(--ok) 15%, transparent)" }}>Abonnement activé</p>}
          <p className="eyebrow">Tes résultats</p>
          <h1 className="q-title" style={{ marginTop: 12 }}>{name ? `${name}, voici` : "Voici"} <em className="serif">tes 3 idées.</em></h1>
          <p className="q-help">Sélectionnées parmi {countIdeas()} sujets selon tes réponses. Les indicateurs sont des estimations : vérifie toujours la demande en cherchant le sujet sur Etsy.</p>
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
                  <p className="why">{why(i, quiz.answers?.time)}</p>
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
              <b>Semaine 1</b> : génère et relis ton premier e-book, crée ta boutique Etsy.<br />
              <b>Semaine 2</b> : publie-le avec la fiche générée, épingle les visuels sur Pinterest.<br />
              <b>Semaine 3</b> : deuxième e-book sur la même thématique.<br />
              <b>Semaine 4</b> : ajuste titres et tags selon les vues, troisième e-book.
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
