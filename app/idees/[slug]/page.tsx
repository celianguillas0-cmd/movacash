import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import Bars from "@/components/funnel/Bars";
import { categoriePublique, categoriesPubliques, INTROS } from "@/lib/idees-seo";
import { APP_NAME, APP_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const titre = (nom: string) => `Idées d'e-books à vendre sur Etsy : ${nom}`;
const NIVEAU = ["", "très faible", "faible", "moyenne", "forte", "très forte"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await categoriePublique((await params).slug);
  if (!c) return {};
  const desc = `${c.n} idées d'e-books sur le thème ${c.name.toLowerCase()} à vendre sur Etsy, avec public cible, demande, concurrence et prix conseillé (${c.prixMin} à ${c.prixMax} €).`;
  return { title: titre(c.name), description: desc, openGraph: { title: titre(c.name), description: desc, type: "article", locale: "fr_FR" } };
}

// Un thème de la base : quelques idées en clair (les plus demandées), le reste se découvre avec le questionnaire.
export default async function Theme({ params }: Props) {
  const slug = (await params).slug;
  const [c, cats] = await Promise.all([categoriePublique(slug), categoriesPubliques()]);
  if (!c) notFound();
  const url = `${APP_URL}/idees/${c.slug}?lang=fr`;
  const reste = Math.max(0, c.n - c.idees.length);
  const faq: [string, string][] = [
    [`Quels e-books vendre sur Etsy dans le thème ${c.name.toLowerCase()} ?`, `Des guides précis pour un public précis : par exemple « ${c.idees[0]?.title} »${c.idees[1] ? ` ou « ${c.idees[1].title} »` : ""}. Vérifie toujours la demande en cherchant le sujet sur Etsy avant de te lancer.`],
    [`À quel prix vendre un e-book ${c.name.toLowerCase()} ?`, `Dans notre base, les prix conseillés pour ce thème vont de ${c.prixMin} à ${c.prixMax} €, estimés à partir de produits comparables. Ce sont des repères, pas des garanties : regarde les prix des e-books proches sur Etsy et tiens compte des frais.`],
    ["Peut-on écrire ces e-books avec l'IA ?", `Oui. ${APP_NAME} écrit le plan et les chapitres avec l'IA, exporte le PDF et prépare la fiche Etsy avec la mention de l'IA demandée par Etsy. Tu relis et ajustes avant de vendre.`],
  ];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: titre(c.name), description: INTROS[c.slug] || "", url, inLanguage: "fr", isPartOf: { "@type": "WebSite", name: APP_NAME, url: APP_URL } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: APP_NAME, item: `${APP_URL}/?lang=fr` },
        { "@type": "ListItem", position: 2, name: "Idées d'e-books", item: `${APP_URL}/idees?lang=fr` },
        { "@type": "ListItem", position: 3, name: c.name, item: url },
      ] },
      { "@type": "ItemList", name: titre(c.name), numberOfItems: c.idees.length, itemListElement: c.idees.map((i, k) => ({ "@type": "ListItem", position: k + 1, name: i.title })) },
      { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  const autres = cats.filter((o) => o.slug !== c.slug);
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow prose-legal" lang="fr" style={{ marginInline: "auto", paddingBlock: 48 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <nav className="guide-fil" aria-label="Fil d'Ariane"><Link href="/?lang=fr">Accueil</Link> / <Link href="/idees?lang=fr">Idées d'e-books</Link> / {c.name}</nav>
        <h1 className="q-title"><span aria-hidden="true">{c.emoji}</span> {titre(c.name)}</h1>
        <p className="guide-intro">{INTROS[c.slug]} Notre base compte {c.n} idées sur ce thème ; voici les {c.idees.length} plus demandées selon nos estimations.</p>
        <div style={{ marginTop: 24 }}>
          {c.idees.map((i, k) => (
            <article key={i.id} className="idea-card">
              <div className="idea-top"><span className="eyebrow">Idée {k + 1}</span><span className="dim">{i.format}</span></div>
              <h3>{i.title}</h3>
              {i.audience && <p className="dim" style={{ marginTop: 6 }}>Pour : {i.audience}</p>}
              <div className="meters">
                <div className="meter"><div className="l">Demande&nbsp;: {NIVEAU[i.demand]}</div><Bars n={i.demand} /></div>
                <div className="meter"><div className="l">Concurrence&nbsp;: {NIVEAU[i.competition]}</div><Bars n={i.competition} /></div>
                <div className="meter"><div className="l">Prix conseillé</div><div className="v">{i.price_min} – {i.price_max} €</div></div>
              </div>
            </article>
          ))}
        </div>
        <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>Demande, concurrence et prix sont nos estimations, pas des garanties : vérifie toujours le sujet en le cherchant sur Etsy.</p>
        <aside className="guide-cta">
          <h2>{reste > 0 ? `${reste} autres idées ${c.name.toLowerCase()} t'attendent` : "Trouve l'idée qui te correspond"}</h2>
          <p>Réponds au questionnaire gratuit : {APP_NAME} choisit 3 idées selon ton temps, ton niveau et tes envies, puis écrit l'e-book, le PDF et la fiche Etsy.</p>
          <Link className="btn btn-accent btn-lg" href="/quiz?lang=fr">Recevoir mes 3 idées →</Link>
          <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>{APP_NAME} n'est pas affilié à Etsy. Aucun revenu n'est garanti.</p>
        </aside>
        <section>
          <h2>Questions fréquentes</h2>
          {faq.map(([q, a]) => <details key={q} className="guide-faq"><summary>{q}</summary><p>{a}</p></details>)}
        </section>
        <h2>Pour aller plus loin</h2>
        <ul>
          <li><Link href="/guides/creer-ebook-ia?lang=fr">Créer un e-book avec l'IA : la méthode pas à pas</Link></li>
          <li><Link href="/guides/fiche-etsy-produit-numerique?lang=fr">Rédiger la fiche Etsy : titre, 13 tags et description</Link></li>
          <li><Link href="/guides/prix-ebook-etsy?lang=fr">Quel prix pour un e-book sur Etsy ?</Link></li>
        </ul>
        <h2>Autres thèmes</h2>
        <p className="idees-autres">
          {autres.map((o, k) => <span key={o.slug}>{k > 0 && " · "}<Link href={`/idees/${o.slug}?lang=fr`}>{o.name}</Link></span>)}
        </p>
      </main>
      <FunnelFooter />
    </div>
  );
}
