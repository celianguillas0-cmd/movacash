import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicNav() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-700">{APP_NAME}</Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/tarifs" className="btn-ghost">Tarifs</Link>
          {user ? (
            <Link href="/app" className="btn-primary">Mon espace</Link>
          ) : (
            <>
              <Link href="/connexion" className="btn-ghost">Connexion</Link>
              <Link href="/quiz" className="btn-primary">Commencer</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
