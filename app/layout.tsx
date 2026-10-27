import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./funnel.css";
import { APP_NAME, APP_URL } from "@/lib/config";
import { headers } from "next/headers";
import { getDict, getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/seo";
import { I18nProvider } from "@/lib/i18n/client";
import { Analytics } from "@vercel/analytics/next";
import Consent from "@/components/Consent";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const locale = await getLocale();
  const path = (await headers()).get("x-mc-path") || "/";
  const title = `${APP_NAME} — ${t("Crée et vends tes e-books sur Etsy avec l'IA")}`;
  const description = t("Trouve une idée d'e-book adaptée à Etsy, laisse l'IA l'écrire (40 à 60 pages, PDF prêt à vendre), puis récupère la fiche Etsy complète : titre, 13 tags, description et miniature. Sans engagement.");
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  return {
    metadataBase: new URL(APP_URL),
    title: { default: title, template: `%s · ${APP_NAME}` },
    description,
    applicationName: APP_NAME,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    verification: { ...(google ? { google } : {}), ...(bing ? { other: { "msvalidate.01": bing } } : {}) },
    appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black" },
    icons: { apple: "/apple-touch-icon.png" },
    openGraph: { type: "website", siteName: APP_NAME, title, description, url: path, locale: locale.replace("-", "_") },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = { themeColor: "#000000" };

// Service worker (appli installable) + mémorise l'invitation d'installation d'Android pour le bandeau de l'atelier.
const PWA = `if("serviceWorker"in navigator)addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})});addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__mcInstall=e;dispatchEvent(new Event("mc-install"))});`;

// Chat Crisp, chargé seulement si NEXT_PUBLIC_CRISP_WEBSITE_ID est renseigné dans Vercel, dans la langue du visiteur.
const CRISP_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
const crisp = (id: string, locale: string) =>
  `window.$crisp=[];window.CRISP_WEBSITE_ID=${JSON.stringify(id)};window.CRISP_RUNTIME_CONFIG={locale:${JSON.stringify(locale)}};(function(){var s=document.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;document.head.appendChild(s)})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  // hreflang écrits à la main : les métadonnées de Next retirent le « ?lang=xx » des adresses.
  const alt = alternates((await headers()).get("x-mc-path") || "/", locale);
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
        {alt && <link rel="canonical" href={alt.canonical} />}
        {alt && "languages" in alt && Object.entries(alt.languages!).map(([l, href]) => <link key={l} rel="alternate" hrefLang={l} href={href} />)}
        <script dangerouslySetInnerHTML={{ __html: PWA }} />
      </head>
      <body>
        <I18nProvider locale={locale} dict={getDict(locale)}>
          {children}
          <Consent />
        </I18nProvider>
        <Analytics />
        {CRISP_ID && <script dangerouslySetInnerHTML={{ __html: crisp(CRISP_ID, locale) }} />}
      </body>
    </html>
  );
}
