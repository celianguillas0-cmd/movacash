import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import PhoneDemo from "@/components/funnel/PhoneDemo";
import Constellation from "@/components/funnel/Constellation";
import TypedLead from "@/components/funnel/TypedLead";
import { countIdeas, searchIdeas } from "@/lib/ideas";
import { getT } from "@/lib/i18n/server";
import { localizeIdeas } from "@/lib/ideas-i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { t, locale } = await getT();
  const FAQ: [string, string][] = [
    [t("Est-ce que je vais vraiment gagner de l'argent ?"), t("Personne ne peut te le garantir, et nous non plus. Ce qui met les chances de ton côté : un sujet précis, une fiche soignée et de la régularité. Les premières ventes peuvent prendre du temps, ou ne pas venir.")],
    [t("Etsy accepte les e-books créés avec l'IA ?"), t("Oui, à condition de l'indiquer dans la description de l'annonce. Movacash ajoute cette mention automatiquement dans la fiche et dans le PDF.")],
    [t("Si tout le monde utilise les mêmes idées, ça ne marche plus ?"), t("Chaque e-book est rédigé à partir de tes choix (public, ton, consignes). Deux personnes sur le même sujet obtiennent deux livres différents. Comme partout sur Etsy, l'exécution compte plus que l'idée.")],
    [t("Je ne sais pas écrire. C'est un problème ?"), t("Non. L'IA écrit tout pour toi : le plan, les chapitres et les exemples. Un chapitre ne te plaît pas ? Tu le régénères en un clic.")],
    [t("À quoi servent les questions ?"), t("On regarde ton temps, ton niveau, ce que tu connais déjà et ton style, pour écarter ce qui ne te correspond pas et te proposer 3 idées réalistes, avec un plan de 30 jours.")],
    [t("Je peux arrêter quand je veux ?"), t("Oui, l'abonnement est sans engagement et se résilie depuis ton compte. Il reste actif jusqu'à la fin de la période payée. Il n'y a pas de remboursement d'une période entamée.")],
  ];
  const total = await countIdeas();
  const best = (await searchIdeas({ sort: "opportunity", pageSize: 60 })).items;
  // Hors français, seuls les sujets déjà traduits sont montrés
  const sample = (await localizeIdeas([...best].sort(() => Math.random() - 0.5), locale, { onlyTranslated: true })).slice(0, 12);
  return (
    <div className="mc dark">
      <FunnelNav />
      <main>
        <section className="hero-band">
          <Constellation />
          <div className="wrap hero">
          <div className="hero-copy">
            <p className="kicker"><i aria-hidden="true" />{t("L'atelier des e-books à vendre sur Etsy")}</p>
            <h1 className="hero-title"><span className="l">{t("Crée ton premier business")}</span> <span className="soft"><span className="l">{t("dès maintenant.")}</span></span></h1>
            <TypedLead
              plain={t("Trouve l'idée de ton premier guide, laisse l'IA l'écrire avec toi et ")}
              endings={[t("trouve tes premiers acheteurs."), t("commence à construire un revenu à côté."), t("transforme ce que tu sais en source de revenus."), t("donne-toi une vraie chance de gagner en ligne.")]}
            />
            <div className="ctas">
              <Link className="btn btn-white btn-lg" href="/quiz">{t("Lancer mon business")} <span aria-hidden="true">→</span></Link>
            </div>
            <p className="fine-line">{t("Aucun revenu garanti : tes ventes dépendent de ton sujet, de ta fiche Etsy et de ta régularité.")}</p>
          </div>
          <div className="hero-visual">
            <div className="phone-stage">
              <PhoneDemo />
            </div>
            <p className="illus">{t("Illustration")}</p>
          </div>
          </div>
        </section>

        <section className="wrap section" id="how">
          <div className="section-head">
            <p className="eyebrow">{t("Comment ça marche")}</p>
            <h2>{t("De l'idée au PDF prêt à vendre,")} <em>{t("étape par étape.")}</em></h2>
            <p>{t("Tu restes l'auteur : l'IA écrit le livre pour toi, du plan au dernier chapitre.")}</p>
          </div>
          <div className="steps">
            {[
              [t("Choisis un sujet"), t("{total} idées classées par potentiel, concurrence et prix conseillé (nos estimations). Musculation, Vinted, vidéos IA, budget, chiots…", { total })],
              [t("Génère l'e-book"), t("Plan détaillé puis chapitres de 2 000 mots : méthodes, exemples, exercices, check-lists, plan d'action.")],
              [t("Relis et personnalise"), t("Modifie chaque chapitre, régénère ce qui ne te plaît pas, choisis ta couverture.")],
              [t("Publie sur Etsy"), t("PDF A4, A5 ou US Letter, titre, 13 tags, description et visuels de fiche. Tu fixes ton prix.")],
            ].map(([titre, d], i) => (
              <div className="step" key={titre}>
                <span className="n">{i + 1}</span>
                <h3>{titre}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <p className="eyebrow">{t("La base d'idées")}</p>
            <h2>{t("{total} idées de formations", { total })} <em>{t("pensées pour Etsy.")}</em></h2>
            <p>{t("Sans API, sans attente : la base est déjà là, avec un prix conseillé (estimé) pour chaque sujet. Un aperçu :")}</p>
          </div>
          {sample.length > 0 && <div className="ideas-wall">
            {sample.map((i) => (
              <span className="chip" key={i.id}>{i.title}<small>{i.price_min}–{i.price_max} €</small></span>
            ))}
          </div>}
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <p className="eyebrow">{t("Ce que tu obtiens")}</p>
            <h2>{t("Un vrai produit,")} <em>{t("pas un PDF de 5 pages.")}</em></h2>
          </div>
          <div className="deliver">
            <ul>
              {[
                [t("Un e-book de 40 à 60 pages"), t("Structuré, concret, avec exercices et plan d'action. Sans statistiques inventées ni promesses miracles.")],
                [t("Une couverture professionnelle"), t("3 styles, palettes au choix, intégrée au PDF avec sommaire et pagination.")],
                [t("La fiche Etsy complète"), t("Titre de 140 caractères, 13 tags, description et une miniature, avec la mention IA exigée par Etsy.")],
                [t("Les garde-fous Etsy"), t("Avertissements automatiques pour la santé et l'argent, contrôle des promesses excessives et des marques citées.")],
              ].map(([titre, d], i) => (
                <li key={titre}>
                  <span className="ic">{i + 1}</span>
                  <div><b>{titre}</b><span>{d}</span></div>
                </li>
              ))}
            </ul>
            <div className="spread" aria-hidden="true">
              <div className="page-mock">
                <div className="k">{t("CHAPITRE 3")}</div>
                <h4>{t("Des photos qui vendent")}</h4>
                <p>{t("La photo est la première chose que voit l'acheteur. Une lumière naturelle et un fond neutre suffisent pour la plupart des vêtements.")}</p>
                <div className="q"><b>{t("À retenir :")}</b> {t("photographie près d'une fenêtre, entre 10 h et 16 h.")}</div>
                <p>☐ {t("Prépare un fond blanc")}<br />☐ {t("Prends 5 angles par article")}<br />☐ {t("Montre les étiquettes")}</p>
              </div>
              <div className="page-mock">
                <div className="k">{t("CHAPITRE 5")}</div>
                <h4>{t("Ton plan d'action")}</h4>
                <p><b>{t("Semaine 1")}</b> : {t("trie ton dressing, sélectionne 15 pièces.")}<br /><b>{t("Semaine 2")}</b> : {t("photos et annonces.")}<br /><b>{t("Semaine 3")}</b> : {t("premier vide-grenier.")}</p>
                <div className="q">{t("Note tes temps de vente pour savoir quoi racheter.")}</div>
                <p>☐ {t("15 annonces publiées")}<br />☐ {t("3 prix ajustés")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <p className="eyebrow">{t("Transparence")}</p>
            <h2>{t("Ce que Movacash fait,")} <em>{t("et ce qu'il ne fait pas.")}</em></h2>
          </div>
          <div className="honest">
            <div>
              <h3>{t("Il fait")}</h3>
              <ul>
                <li>{t("Te faire gagner des heures de rédaction et de mise en page.")}</li>
                <li>{t("Te proposer des sujets adaptés à Etsy et à ton profil.")}</li>
                <li>{t("Produire des guides utiles que tu peux vendre au prix que tu choisis.")}</li>
                <li>{t("Respecter les règles Etsy sur l'IA.")}</li>
              </ul>
            </div>
            <div>
              <h3>{t("Il ne fait pas")}</h3>
              <ul>
                <li>{t("Garantir des ventes ou un revenu.")}</li>
                <li>{t("Publier à ta place sur Etsy.")}</li>
                <li>{t("Te dispenser des règles d'Etsy : tu restes responsable de ce que tu vends.")}</li>
                <li>{t("Rembourser une période entamée (voir CGV).")}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="wrap section narrow" id="faq" style={{ paddingTop: 0, marginInline: "auto" }}>
          <div className="section-head">
            <p className="eyebrow">{t("Questions fréquentes")}</p>
            <h2>{t("Les questions qu'on nous pose souvent")}</h2>
          </div>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="wrap final">
          <h2>{t("Trouve tes 3 premières idées")} <em>{t("d'e-books.")}</em></h2>
          <p className="sub-final">{t("Un questionnaire de quelques minutes, puis 3 idées adaptées à ton profil.")}</p>
          <Link className="btn btn-accent btn-lg" href="/quiz">{t("Commencer le questionnaire")}</Link>
        </section>
      </main>
      <FunnelFooter />
    </div>
  );
}
