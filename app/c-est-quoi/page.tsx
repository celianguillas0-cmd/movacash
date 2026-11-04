import type { Metadata } from "next";
import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import { CestQuoiBlocs, cqLede } from "@/components/funnel/CestQuoiContenu";
import { getT } from "@/lib/i18n/server";
import { rich } from "@/lib/i18n/rich";

// Page publique « Movacash, c'est quoi ? » : le résumé présenté avant chaque paiement, consultable par tous à tout moment
// (lien en bas de chaque page, article 2 bis des CGV).
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Movacash, c'est quoi ?"), description: cqLede(t) };
}

export default async function CestQuoiPage() {
  const { t } = await getT();
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow cq-page" style={{ marginInline: "auto", paddingBlock: 48 }}>
        <h1 className="q-title">{t("Movacash, c'est quoi ?")}</h1>
        <p className="cq-lede">{cqLede(t)}</p>
        <CestQuoiBlocs t={t} />
        <p className="cq-case">{t("Si tu choisis de vendre tes e-books, tes résultats dépendent de toi et des plateformes : aucun revenu n'est garanti.")}</p>
        <p className="cq-note">
          {rich(t("Ce résumé fait partie de nos <1>conditions générales de vente</1> (article 2 bis). Il est aussi présenté avant chaque paiement, où il faut confirmer l'avoir compris."), { 1: (s) => <Link href="/cgv">{s}</Link> })}{" "}
          <Link href="/avertissement-revenus">{t("Avertissement sur les revenus")}</Link>
        </p>
      </main>
      <FunnelFooter />
    </div>
  );
}
