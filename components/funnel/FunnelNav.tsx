import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function FunnelNav({ minimal = false }: { minimal?: boolean }) {
  if (minimal) {
    return (
      <header className="nav nav-min">
        <div className="wrap">
          <Link href="/" className="logo">Mova<span>cash</span></Link>
          <Link className="link back-home" href="/">← Retour à l&apos;accueil</Link>
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
          <Link className="link hide-sm" href="/#faq">Questions</Link>
          <Link className="link hide-sm" href="/tarifs">Tarifs</Link>
          <Link className="link link-login" href={user ? "/app" : "/connexion"}>{user ? "Mon atelier" : "Se connecter"}</Link>
          <Link className="btn btn-accent btn-sm" href="/quiz">Créer mes e-books</Link>
        </nav>
      </div>
    </header>
  );
}
