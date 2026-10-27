import FunnelNav from "./funnel/FunnelNav";
import FunnelFooter from "./funnel/FunnelFooter";
import { getT } from "@/lib/i18n/server";

export default async function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  const { t, locale } = await getT();
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow prose-legal" style={{ marginInline: "auto", paddingBlock: 48 }}>
        {locale !== "fr" && (
          <p className="dim" lang={locale} style={{ marginBottom: 16 }}>{t("Ce document fait foi en français. Ton navigateur peut le traduire automatiquement si besoin.")}</p>
        )}
        <h1 className="q-title">{title}</h1>
        {children}
      </main>
      <FunnelFooter />
    </div>
  );
}
