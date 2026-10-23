import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import PhoneDemo from "@/components/funnel/PhoneDemo";
import { countIdeas, searchIdeas } from "@/lib/ideas";

export const dynamic = "force-dynamic";

const TOOLS = ["Gemini", "Etsy", "PDF", "Pinterest", "TikTok", "Instagram", "Canva", "Stripe"];

const FAQ: [string, string][] = [
  ["Est-ce que je vais vraiment gagner de l'argent ?", "Peut-être, mais rien n'est garanti. Les e-books se vendent souvent entre 5 et 10 € sur Etsy. Ce qui fait la différence : des sujets précis, une vraie relecture, des fiches soignées et de la régularité. Beaucoup de boutiques mettent plusieurs semaines avant leur première vente."],
  ["Etsy accepte les e-books créés avec l'IA ?", "Oui, à condition de l'indiquer dans la description de l'annonce. Movacash ajoute cette mention automatiquement dans la fiche et dans le PDF."],
  ["Si tout le monde utilise les mêmes idées, ça ne marche plus ?", "Chaque e-book est rédigé à partir de tes choix (public, ton, consignes) et de ta relecture. Deux personnes sur le même sujet obtiennent deux livres différents. Comme partout sur Etsy, l'exécution compte plus que l'idée."],
  ["Je ne sais pas écrire. C'est un problème ?", "Non. L'IA rédige, tu relis comme un lecteur exigeant : ce qui est flou, ce qui manque, ce que tu ajouterais. Tu peux régénérer un chapitre en un clic."],
  ["Pourquoi autant de questions ?", "Un questionnaire de trois questions donnerait les mêmes idées à tout le monde. Ici on regarde ton temps, ton niveau, ce que tu refuses de faire, ce que tu connais déjà et la vie que tu vises, pour écarter ce qui ne te correspond pas et te proposer 3 idées réalistes, avec un plan de 30 jours."],
  ["Je peux arrêter quand je veux ?", "Oui, l'abonnement est sans engagement et se résilie depuis ton compte. Il reste actif jusqu'à la fin de la période payée. Il n'y a pas de remboursement d'une période entamée."],
];

export default function Home() {
  const total = countIdeas();
  const best = searchIdeas({ sort: "opportunity", pageSize: 60 }).items;
  const top = best[0];
  const sample = [...best].sort(() => Math.random() - 0.5).slice(0, 12);
  const wall = searchIdeas({ sort: "random", pageSize: 40 }).items;
  return (
    <div className="mc">
      <FunnelNav />
      <main>
        <section className="hero-bw">
          <div className="hero-photo" aria-hidden="true" />
          <div className="hero-wall" aria-hidden="true">
            {wall.map((i, k) => (
              <div className="wall-cover" key={i.id} style={{ ["--r" as string]: `${(k % 5) - 2}deg` }}><span>GUIDE</span><b>{i.title}</b></div>
            ))}
          </div>
          <div className="wrap hero">
            <div className="hero-copy">
              <h1 className="hero-title"><span>Trouve.</span><span>Crée.</span><span className="chrome-text">Vends sur Etsy.</span></h1>
              <p className="lead">
                Chaque e-book est un produit que tu peux vendre.<br />Choisis une idée parmi {total}, l'IA rédige un guide de 50 pages, tu le relis et tu le publies.
              </p>
              {top && (
                <div className="top-card">
                  <div className="laurel"><b>#1</b></div>
                  <div className="top-mid"><span className="k">Meilleure opportunité de la base</span><b>{top.title}</b><span className="s">{top.category_name}</span></div>
                  <div className="top-price"><b>{top.price_min}–{top.price_max}</b><span>€ conseillés</span></div>
                </div>
              )}
              <Link className="btn btn-chrome btn-xl" href="/quiz">Trouver mes 3 idées <span aria-hidden="true">→</span></Link>
              <p className="fine-line"><span aria-hidden="true">◇</span> Questionnaire de quelques minutes · aucun revenu garanti, tes ventes dépendent de ton travail</p>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="float-tile t1"><b>{total}</b><span>idées de<br />formations</span></div>
              <div className="float-tile t2"><b>50</b><span>pages<br />par e-book</span></div>
              <div className="float-tile t3"><b>13</b><span>tags Etsy<br />générés</span></div>
              <div className="float-tile t4"><b>PDF</b><span>A4 · A5<br />US Letter</span></div>
              <PhoneDemo tilt />
            </div>
          </div>
        </section>

        <section className="marquee" aria-label="Outils">
          <p className="eyebrow marquee-title">Les outils sur lesquels tu vas t'appuyer</p>
          <div className="marquee-track">
            {[...TOOLS, ...TOOLS].map((t, i) => <span key={i}>{t}</span>)}
          </div>
        </section>

        <section className="wrap section" id="how">
          <div className="section-head">
            <p className="eyebrow">Comment ça marche</p>
            <h2>De l'idée au PDF vendable, <em>en une soirée.</em></h2>
            <p>Tu restes l'auteur : l'outil fait le gros du travail, tu apportes la relecture et ta touche.</p>
          </div>
          <div className="steps">
            {[
              ["Choisis un sujet", `${total} idées classées par potentiel, concurrence et prix conseillé. Musculation, Vinted, vidéos IA, budget, chiots…`],
              ["Génère l'e-book", "Plan détaillé puis chapitres de 2 000 mots : méthodes, exemples, exercices, check-lists, plan d'action."],
              ["Relis et personnalise", "Modifie chaque chapitre, régénère ce qui ne te plaît pas, choisis ta couverture."],
              ["Publie sur Etsy", "PDF A4, A5 ou US Letter, titre, 13 tags, description et visuels de fiche. Tu fixes ton prix."],
            ].map(([t, d], i) => (
              <div className="step" key={t}>
                <span className="n">Étape {i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <p className="eyebrow">La base d'idées</p>
            <h2>{total} formations qui <em>ont un public.</em></h2>
            <p>Sans API, sans attente : la base est déjà là, avec un prix conseillé pour chaque sujet. Un aperçu :</p>
          </div>
          <div className="ideas-wall">
            {sample.map((i) => (
              <span className="chip" key={i.id}>{i.title}<small>{i.price_min}–{i.price_max} €</small></span>
            ))}
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <p className="eyebrow">Ce que tu obtiens</p>
            <h2>Un vrai produit, <em>pas un PDF de 5 pages.</em></h2>
          </div>
          <div className="deliver">
            <ul>
              {[
                ["Un e-book de 40 à 60 pages", "Structuré, concret, avec exercices et plan d'action. Sans statistiques inventées ni promesses miracles."],
                ["Une couverture professionnelle", "3 styles, palettes au choix, intégrée au PDF avec sommaire et pagination."],
                ["La fiche Etsy complète", "Titre de 140 caractères, 13 tags, description et 3 visuels, avec la mention IA exigée par Etsy."],
                ["Les garde-fous Etsy", "Avertissements automatiques pour la santé et l'argent, contrôle des promesses excessives et des marques citées."],
              ].map(([t, d], i) => (
                <li key={t}>
                  <span className="ic">{i + 1}</span>
                  <div><b>{t}</b><span>{d}</span></div>
                </li>
              ))}
            </ul>
            <div className="spread" aria-hidden="true">
              <div className="page-mock">
                <div className="k">CHAPITRE 3</div>
                <h4>Des photos qui vendent</h4>
                <p>La photo est la première chose que voit l'acheteur. Une lumière naturelle et un fond neutre suffisent pour la plupart des vêtements.</p>
                <div className="q"><b>À retenir :</b> photographie près d'une fenêtre, entre 10 h et 16 h.</div>
                <p>☐ Prépare un fond blanc<br />☐ Prends 5 angles par article<br />☐ Montre les étiquettes</p>
              </div>
              <div className="page-mock">
                <div className="k">CHAPITRE 5</div>
                <h4>Ton plan d'action</h4>
                <p><b>Semaine 1</b> : trie ton dressing, sélectionne 15 pièces.<br /><b>Semaine 2</b> : photos et annonces.<br /><b>Semaine 3</b> : premier vide-grenier.</p>
                <div className="q">Note tes temps de vente pour savoir quoi racheter.</div>
                <p>☐ 15 annonces publiées<br />☐ 3 prix ajustés</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <p className="eyebrow">Transparence</p>
            <h2>Ce que Movacash fait, <em>et ce qu'il ne fait pas.</em></h2>
          </div>
          <div className="honest">
            <div>
              <h3>Il fait</h3>
              <ul>
                <li>Te faire gagner des heures de rédaction et de mise en page.</li>
                <li>Te proposer des sujets qui ont un public.</li>
                <li>Produire des guides utiles que tu peux vendre au prix que tu choisis.</li>
                <li>Respecter les règles Etsy sur l'IA.</li>
              </ul>
            </div>
            <div>
              <h3>Il ne fait pas</h3>
              <ul>
                <li>Garantir des ventes ou un revenu.</li>
                <li>Publier à ta place sur Etsy.</li>
                <li>Remplacer ta relecture : tu restes responsable de ce que tu vends.</li>
                <li>Rembourser une période entamée (voir CGV).</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="wrap section narrow" id="faq" style={{ paddingTop: 0, marginInline: "auto" }}>
          <div className="section-head">
            <p className="eyebrow">Objections</p>
            <h2>Les questions qu'on nous pose souvent</h2>
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
          <p className="eyebrow">Quelques minutes</p>
          <h2>Trouve tes 3 premières idées <em>d'e-books.</em></h2>
          <Link className="btn btn-accent btn-lg" href="/quiz">Commencer le questionnaire →</Link>
        </section>
      </main>
      <FunnelFooter />
    </div>
  );
}
