import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import LangSwitch from "@/components/LangSwitch";
import { ConsentLink } from "@/components/Consent";

export default async function FunnelFooter() {
  const { t } = await getT();
  return (
    <footer>
      <div className="wrap">
        <div>
          <span className="logo" style={{ fontSize: 20 }}>Mova<span>cash</span></span>
          <p style={{ marginTop: 6 }}>{t("L'atelier des e-books à vendre sur Etsy. Non affilié à Etsy. Aucun revenu garanti.")}</p>
          <div style={{ marginTop: 14 }}><LangSwitch /></div>
        </div>
        <div className="links">
          <Link href="/cgv">{t("CGV")}</Link>
          <Link href="/mentions-legales">{t("Mentions légales")}</Link>
          <Link href="/confidentialite">{t("Confidentialité")}</Link>
          <ConsentLink />
          <Link href="/avertissement-revenus">{t("Avertissement sur les revenus")}</Link>
          {/* Accès direct à la résiliation exigé par la loi (art. L215-1-1 du Code de la consommation) */}
          <Link href="/app/abonnement">{t("Résilier mon abonnement")}</Link>
        </div>
      </div>
    </footer>
  );
}
