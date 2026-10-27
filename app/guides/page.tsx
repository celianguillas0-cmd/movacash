import type { Metadata } from "next";
import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import { getLocale } from "@/lib/i18n/server";
import { GUIDES, guideLang } from "@/lib/guides";
import { APP_NAME, APP_URL } from "@/lib/config";
import { langUrl } from "@/lib/seo";
import { UI } from "./ui";

export async function generateMetadata(): Promise<Metadata> {
  const ui = UI[guideLang(await getLocale())];
  return { title: ui.titre, description: ui.desc, openGraph: { title: ui.titre, description: ui.desc, type: "website" } };
}

export default async function Guides() {
  const lang = guideLang(await getLocale());
  const ui = UI[lang];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: ui.titre, description: ui.desc, url: langUrl("/guides", lang), inLanguage: lang, isPartOf: { "@type": "WebSite", name: APP_NAME, url: APP_URL } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: APP_NAME, item: langUrl("/", lang) },
        { "@type": "ListItem", position: 2, name: "Guides", item: langUrl("/guides", lang) },
      ] },
      { "@type": "ItemList", itemListElement: GUIDES.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: langUrl(`/guides/${g.slug}`, lang), name: g[lang].title })) },
    ],
  };
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow prose-legal" lang={lang} style={{ marginInline: "auto", paddingBlock: 48 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <h1 className="q-title">{ui.titre}</h1>
        <p>{ui.intro}</p>
        <div className="guides-liste">
          {GUIDES.map((g) => (
            <Link key={g.slug} className="guide-carte" href={`/guides/${g.slug}?lang=${lang}`}>
              <h2>{g[lang].title}</h2>
              <p>{g[lang].description}</p>
              <span>{ui.lire} →</span>
            </Link>
          ))}
        </div>
      </main>
      <FunnelFooter />
    </div>
  );
}
