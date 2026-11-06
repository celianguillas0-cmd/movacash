import Link from "next/link";
import LogoM from "@/components/LogoM";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import LangSwitch from "@/components/LangSwitch";

export default async function FunnelNav({ minimal = false }: { minimal?: boolean }) {
  const { t } = await getT();
  if (minimal) {
    return (
      <header className="nav nav-min">
        <div className="wrap">
          <Link href="/" className="logo"><LogoM /><span>Mova<span>cash</span></span></Link>
          <Link className="link back-home" href="/">← {t("Retour à l'accueil")}</Link>
        </div>
      </header>
    );
  }
  const user = await getCurrentUser();
  return (
    <header className="nav">
      <div className="wrap">
        <Link href="/" className="logo"><LogoM /><span>Mova<span>cash</span></span></Link>
        <nav className="nav-links">
          <Link className="link hide-sm" href="/#faq">{t("Questions")}</Link>
          <Link className="link hide-sm" href="/tarifs">{t("Tarifs")}</Link>
          <LangSwitch className="nav-lang" />
          <Link className="link link-login" href={user ? "/app" : "/connexion"} aria-label={user ? t("Mon atelier") : t("Se connecter")}>
            {/* Sur téléphone, l'icône remplace le texte pour laisser la place au menu des langues */}
            <svg className="login-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4.8 19.5c1.3-3.3 4-5 7.2-5s5.9 1.7 7.2 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <span className="login-txt">{user ? t("Mon atelier") : t("Se connecter")}</span>
          </Link>
          <Link className="btn btn-accent btn-sm" href="/quiz">{t("Créer mes e-books")}</Link>
        </nav>
      </div>
    </header>
  );
}
