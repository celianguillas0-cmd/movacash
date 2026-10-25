import type { Metadata } from "next";
import "./globals.css";
import "./funnel.css";
import { APP_NAME, APP_URL } from "@/lib/config";
import { getDict, getLocale, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  const locale = await getLocale();
  const title = `${APP_NAME} — ${t("Créez des e-books de qualité à vendre sur Etsy")}`;
  const description = t("Trouvez une idée de formation, générez un e-book complet avec l'IA, exportez un PDF prêt à vendre et la fiche Etsy qui va avec.");
  return {
    metadataBase: new URL(APP_URL),
    title: { default: title, template: `%s · ${APP_NAME}` },
    description,
    applicationName: APP_NAME,
    openGraph: { type: "website", siteName: APP_NAME, title, description, url: "/", locale: locale.replace("-", "_") },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
      </head>
      <body>
        <I18nProvider locale={locale} dict={getDict(locale)}>{children}</I18nProvider>
      </body>
    </html>
  );
}
