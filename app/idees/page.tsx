import type { Metadata } from "next";
import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import { categoriesPubliques } from "@/lib/idees-seo";
import { countIdeas } from "@/lib/ideas";
import { APP_NAME, APP_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

const TITRE = "Idées d'e-books à vendre sur Etsy, par thème";
const DESC = "Plus de 500 idées d'e-books adaptées à Etsy, classées en 31 thèmes (sport, cuisine, parentalité, budget, IA…), avec demande, concurrence et prix conseillé.";
const URL = `${APP_URL}/idees?lang=fr`;

export const metadata: Metadata = { title: TITRE, description: DESC, openGraph: { title: TITRE, description: DESC, type: "website", locale: "fr_FR" } };

// Hub des thèmes (en français : la base d'idées est écrite en français)
export default async function Idees() {
  const [cats, total] = await Promise.all([categoriesPubliques(), countIdeas()]);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: TITRE, description: DESC, url: URL, inLanguage: "fr", isPartOf: { "@type": "WebSite", name: APP_NAME, url: APP_URL } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: APP_NAME, item: `${APP_URL}/?lang=fr` },
        { "@type": "ListItem", position: 2, name: "Idées d'e-books", item: URL },
      ] },
      { "@type": "ItemList", itemListElement: cats.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${APP_URL}/idees/${c.slug}?lang=fr`, name: `Idées d'e-books : ${c.name}` })) },
    ],
  };
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap prose-legal" lang="fr" style={{ marginInline: "auto", paddingBlock: 48, maxWidth: 980 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <nav className="guide-fil" aria-label="Fil d'Ariane"><Link href="/?lang=fr">Accueil</Link> / Idées d'e-books</nav>
        <h1 className="q-title">{TITRE}</h1>
        <p>
          La base de {APP_NAME} rassemble {total} idées d'e-books pensées pour Etsy : des sujets précis, pour un public précis, avec une estimation de la demande,
          de la concurrence et un prix conseillé. Choisis un thème pour voir des exemples, ou réponds au questionnaire pour recevoir les 3 idées qui te correspondent.
        </p>
        <div className="idees-themes">
          {cats.map((c) => (
            <Link key={c.slug} className="guide-carte" href={`/idees/${c.slug}?lang=fr`}>
              <h2><span aria-hidden="true">{c.emoji}</span> {c.name}</h2>
              <p>{c.n} idées d'e-books</p>
            </Link>
          ))}
        </div>
        <aside className="guide-cta">
          <h2>Trouve ton idée d'e-book en 2 minutes</h2>
          <p>Réponds au questionnaire gratuit : {APP_NAME} choisit pour toi 3 sujets dans la base, puis écrit l'e-book et prépare la fiche Etsy.</p>
          <Link className="btn btn-accent btn-lg" href="/quiz?lang=fr">Commencer le questionnaire →</Link>
          <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>{APP_NAME} n'est pas affilié à Etsy. Aucun revenu n'est garanti.</p>
        </aside>
        <p><Link href="/guides?lang=fr">Lire nos guides pour vendre des e-books sur Etsy →</Link></p>
      </main>
      <FunnelFooter />
    </div>
  );
}
