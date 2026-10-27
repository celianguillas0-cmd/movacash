import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import { getLocale } from "@/lib/i18n/server";
import { getGuide } from "@/lib/guides";
import { GUIDES, guideLang, guideText, guideUI } from "@/lib/guides-tr";
import { APP_NAME, APP_URL } from "@/lib/config";
import { langUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  const txt = guideText(g, guideLang(await getLocale(), g.slug));
  return { title: txt.title, description: txt.description, openGraph: { title: txt.title, description: txt.description, type: "article", publishedTime: g.date, modifiedTime: g.date } };
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const lang = guideLang(await getLocale(), g.slug);
  const ui = guideUI(lang);
  const txt = guideText(g, lang);
  const url = langUrl(`/guides/${g.slug}`, lang);
  const date = new Date(g.date).toLocaleDateString(lang === "en" ? "en-GB" : lang, { day: "numeric", month: "long", year: "numeric" });
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article", headline: txt.title, description: txt.description, url, mainEntityOfPage: url, inLanguage: lang,
        datePublished: g.date, dateModified: g.date,
        author: { "@type": "Organization", name: APP_NAME, url: APP_URL }, publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL, logo: `${APP_URL}/icon-512.png` },
        image: `${APP_URL}/opengraph-image`,
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: APP_NAME, item: langUrl("/", lang) },
        { "@type": "ListItem", position: 2, name: "Guides", item: langUrl("/guides", lang) },
        { "@type": "ListItem", position: 3, name: txt.title, item: url },
      ] },
      ...(txt.faq?.length ? [{ "@type": "FAQPage", mainEntity: txt.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
    ],
  };
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow prose-legal" lang={lang} style={{ marginInline: "auto", paddingBlock: 48 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <nav className="guide-fil" aria-label="Breadcrumb">
          <Link href={`/?lang=${lang}`}>{ui.accueil}</Link> / <Link href={`/guides?lang=${lang}`}>Guides</Link>
        </nav>
        <article>
          <h1 className="q-title">{txt.title}</h1>
          <p className="dim"><time dateTime={g.date}>{ui.maj} {date}</time></p>
          <p className="guide-intro">{txt.intro}</p>
          {txt.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p?.map((p) => <p key={p}>{p}</p>)}
              {s.ul && <ul>{s.ul.map((li) => <li key={li}>{li}</li>)}</ul>}
            </section>
          ))}
          {txt.faq?.length ? (
            <section>
              <h2>{ui.faq}</h2>
              {txt.faq.map(([q, a]) => (
                <details key={q} className="guide-faq"><summary>{q}</summary><p>{a}</p></details>
              ))}
            </section>
          ) : null}
        </article>
        <aside className="guide-cta">
          <h2>{ui.ctaTitre}</h2>
          <p>{ui.ctaTexte}</p>
          <Link className="btn btn-accent btn-lg" href={`/quiz?lang=${lang}`}>{ui.cta} →</Link>
          <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>{ui.mention}</p>
        </aside>
        <h2>{ui.autres}</h2>
        <ul>
          {GUIDES.filter((o) => o.slug !== g.slug).map((o) => (
            <li key={o.slug}><Link href={`/guides/${o.slug}?lang=${lang}`}>{guideText(o, lang).title}</Link></li>
          ))}
        </ul>
      </main>
      <FunnelFooter />
    </div>
  );
}

