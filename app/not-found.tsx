import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import { getT } from "@/lib/i18n/server";

// Page introuvable : dans le thème du site, avec un chemin pour repartir.
export default async function Introuvable() {
  const { t } = await getT();
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow" style={{ marginInline: "auto", paddingBlock: "14vh", textAlign: "center" }}>
        <p className="eyebrow">404</p>
        <h1 className="q-title" style={{ marginTop: 12 }}>{t("Cette page n'existe pas.")}</h1>
        <p className="q-help" style={{ marginTop: 10 }}>{t("Le lien est peut-être incomplet, ou la page a changé d'adresse.")}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
          <Link className="btn btn-accent btn-lg" href="/">{t("Retour à l'accueil")}</Link>
          <Link className="btn btn-ghost btn-lg" href="/app">{t("Mon atelier")}</Link>
        </div>
      </main>
      <FunnelFooter />
    </div>
  );
}
