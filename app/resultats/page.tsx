import Link from "next/link";
import { redirect } from "next/navigation";
import FunnelNav from "@/components/funnel/FunnelNav";
import Bars from "@/components/funnel/Bars";
import { getCurrentUser } from "@/lib/auth";
import { countIdeas, explainIdea, getIdeasByIds, terrainMatches, type QuizAnswers } from "@/lib/ideas";
import { label } from "@/lib/quiz-questions";
import { hasActiveSubscription } from "@/lib/subscription";
import { getT } from "@/lib/i18n/server";
import { localizeIdeas } from "@/lib/ideas-i18n";
import { tk, type T } from "@/lib/i18n/t";

export const dynamic = "force-dynamic";

const STRENGTH: Record<string, string> = { teach: tk("tu expliques bien"), organized: tk("tu es organisé(e)"), creative: tk("tu es créatif(ve)"), persistent: tk("tu es persévérant(e)"), numbers: tk("tu es à l'aise avec les chiffres"), social: tk("tu sais parler aux gens") };

// Plan des 30 premiers jours, ajusté au temps disponible, à la promotion acceptée et à la patience.
function plan30(a: QuizAnswers, t: T): [string, string][] {
  const few = a.time === "15";
  const promo = a.promo === "none" ? t("optimise tes titres et tags Etsy (pas de réseaux, comme tu le souhaites)") : a.promo === "faceless" ? t("épingle tes visuels sur Pinterest et publie un carrousel sans visage") : t("publie une courte vidéo qui montre l'intérieur de ton e-book");
  return [
    [t("Semaine 1"), t("génère ton premier e-book{sessions}, crée ta boutique Etsy{boutique}.", { sessions: few ? t(" par petites sessions de 15 minutes") : "", boutique: a.etsy === "shop" ? t(" (ou ajoute une section à la tienne)") : "" })],
    [t("Semaine 2"), t("publie-le avec la fiche et la miniature générées, puis {promo}.", { promo })],
    [t("Semaine 3"), few ? t("regarde les vues de ta fiche et ajuste le titre ou la première photo.") : t("crée un deuxième e-book dans la même thématique pour renforcer ta boutique.")],
    [t("Semaine 4"), t("{ebook}, et note ce qui attire le plus de vues.", { ebook: few ? t("deuxième e-book") : t("troisième e-book") }) + (a.patience === "weeks" ? t(" Les premières ventes peuvent prendre plus d'un mois : c'est normal.") : "")],
  ];
}

export default async function Results({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/inscription");
  const { t, locale } = await getT();
  const { welcome } = await searchParams;
  let quiz: { answers?: QuizAnswers; ideaIds?: number[] } = {};
  try {
    quiz = JSON.parse(user.quiz_json || "{}");
  } catch {}
  const ideas = await localizeIdeas(await getIdeasByIds((quiz.ideaIds || []).map(Number).filter(Number.isFinite).slice(0, 3)), locale);
  const unlocked = hasActiveSubscription(user);
  const a: QuizAnswers = quiz.answers || {};
  const [terrain, total] = await Promise.all([terrainMatches(a), countIdeas()]);
  const name = user.name || a.name || "";
  const strengths = (Array.isArray(a.strengths) ? (a.strengths as string[]) : []).map((k) => STRENGTH[k]).filter(Boolean).map((x) => t(x));

  if (!ideas.length)
    return (
      <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
        <FunnelNav />
        <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
          <h1 className="q-title">{t("Réponds au questionnaire pour obtenir")} <em className="serif">{t("tes 3 idées.")}</em></h1>
          <div className="q-actions"><Link className="btn btn-accent btn-lg" href="/quiz">{t("Commencer")} →</Link></div>
        </main>
      </div>
    );

  return (
    <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <main className="wrap narrow" style={{ marginInline: "auto" }}>
        <div className="res-head">
          {welcome && <p className="pill" style={{ marginBottom: 14, color: "var(--ok)", background: "color-mix(in srgb, var(--ok) 15%, transparent)" }}>{t("Abonnement activé")}</p>}
          <p className="eyebrow">{t("Tes résultats")}</p>
          <h1 className="q-title" style={{ marginTop: 12 }}>{name ? t("{prenom}, voici", { prenom: name }) : t("Voici")} <em className="serif">{t("tes 3 idées.")}</em></h1>
          <p className="q-help">{t("Sélectionnées parmi {total} sujets selon tes réponses. Les indicateurs sont des estimations : vérifie toujours la demande en cherchant le sujet sur Etsy.", { total })}</p>
        </div>
        <div className="profile">
          <p className="eyebrow">{t("Ton profil")}</p>
          <p>
            {[
              a.time && t("{temps} par jour", { temps: t(label("time", String(a.time))).toLowerCase() }),
              a.etsy && t(({ none: tk("premiers pas dans la vente en ligne"), online: tk("déjà vendu en ligne"), shop: tk("boutique Etsy déjà ouverte") } as Record<string, string>)[String(a.etsy)] || ""),
              a.format && t("tu préfères {format}", { format: t(label("format", String(a.format))).toLowerCase() }),
              strengths.length && strengths.join(t(" et ")),
              a.tone && t("ton {ton}", { ton: t(label("tone", String(a.tone))).toLowerCase() }),
            ].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          {ideas.map((i, k) => {
            const locked = !unlocked && k > 0;
            return (
              <article key={i.id} className={`idea-card ${locked ? "locked" : ""}`}>
                <div className={locked ? "blur" : ""}>
                  <div className="idea-top"><span className="eyebrow">{t("Idée {n}", { n: k + 1 })}</span><span className="dim">{t(i.category_name)}</span></div>
                  <h3>{i.title}</h3>
                  <div className="meters">
                    <div className="meter"><div className="l">{t("Demande")}</div><Bars n={i.demand} /></div>
                    <div className="meter"><div className="l">{t("Concurrence")}</div><Bars n={i.competition} /></div>
                    <div className="meter"><div className="l">{t("Prix conseillé")}</div><div className="v">{i.price_min} – {i.price_max} €</div></div>
                  </div>
                  <ul className="why">{explainIdea(i, a, terrain, t).map((r) => <li key={r}>{r}</li>)}</ul>
                  {unlocked && (
                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                      <Link className="btn btn-accent btn-sm" href={`/app/creer/${i.id}`}>{t("Créer cet e-book")} →</Link>
                      <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://www.etsy.com/search?q=${encodeURIComponent(i.title)}`}>{t("Vérifier sur Etsy")} ↗</a>
                    </div>
                  )}
                </div>
                {locked && <div className="lock-badge"><span>{t("Débloquée avec l'abonnement")}</span></div>}
              </article>
            );
          })}
        </div>
        <div className="plan30">
          <p className="eyebrow">{t("Ton plan des 30 premiers jours")}</p>
          <div style={unlocked ? undefined : { filter: "blur(6px)", userSelect: "none" }}>
            <p style={{ marginTop: 10 }}>
              {plan30(a, t).map(([w, x]) => <span key={w}><b>{w}</b> : {x}<br /></span>)}
            </p>
          </div>
        </div>
        <div className="sticky-cta">
          {unlocked ? (
            <Link className="btn btn-accent btn-lg" href="/app">{t("Ouvrir mon atelier")} →</Link>
          ) : (
            <Link className="btn btn-accent btn-lg" href="/tarifs">{t("Débloquer mes idées et créer mon premier e-book")} →</Link>
          )}
        </div>
      </main>
    </div>
  );
}
