import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import LangSwitch from "@/components/LangSwitch";

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
          <Link href="/avertissement-revenus">{t("Avertissement sur les revenus")}</Link>
        </div>
      </div>
    </footer>
  );
}
