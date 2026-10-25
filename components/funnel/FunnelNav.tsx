import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";

export default async function FunnelNav({ minimal = false }: { minimal?: boolean }) {
  const { t } = await getT();
  if (minimal) {
    return (
      <header className="nav nav-min">
        <div className="wrap">
          <Link href="/" className="logo">Mova<span>cash</span></Link>
          <Link className="link back-home" href="/">← {t("Retour à l'accueil")}</Link>
        </div>
      </header>
    );
  }
  const user = await getCurrentUser();
  return (
    <header className="nav">
      <div className="wrap">
        <Link href="/" className="logo">Mova<span>cash</span></Link>
        <nav className="nav-links">
          <Link className="link hide-sm" href="/#faq">{t("Questions")}</Link>
          <Link className="link hide-sm" href="/tarifs">{t("Tarifs")}</Link>
          <Link className="link link-login" href={user ? "/app" : "/connexion"}>{user ? t("Mon atelier") : t("Se connecter")}</Link>
          <Link className="btn btn-accent btn-sm" href="/quiz">{t("Créer mes e-books")}</Link>
        </nav>
      </div>
    </header>
  );
}
