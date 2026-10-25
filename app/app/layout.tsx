import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin, isGeminiConfigured } from "@/lib/config";
import { getUsage, subState } from "@/lib/subscription";
import { usingDemoDatabase } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import WsNav from "@/components/ws/WsNav";
import "../atelier.css";

export const dynamic = "force-dynamic";

const fmt = (t: number) => new Date(t * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const state = subState(user);
  const usage = await getUsage(user);
  const live = state === "active" || state === "canceling" || state === "past_due";
  return (
    <div className="at">
      <header className="at-head">
        <div className="at-wrap">
          <Link href="/app" className="at-brand">Mova<span>cash</span></Link>
          <div className="at-head-liens">
            <Link href="/" className="at-retour">← Retour à l&apos;accueil</Link>
            <LogoutButton className="" />
          </div>
        </div>
      </header>
      <div className="at-wrap at-grille">
        <aside className="at-menu">
          <WsNav admin={isAdmin(user.email)} />
          <div className="at-quota">
            {live ? (
              <>
                <b>{usage.used} / {usage.limit}</b> e-books ce mois-ci
                <div className="at-quota-rail"><i style={{ width: `${Math.min(100, (usage.used / Math.max(1, usage.limit)) * 100)}%` }} /></div>
                {usage.remaining === 0 && <Link href="/app/abonnement">Passer à l&apos;offre supérieure</Link>}
              </>
            ) : (
              <>Aucun abonnement actif. <Link href="/tarifs">Choisir une formule</Link></>
            )}
          </div>
        </aside>
        <main className="min-w-0">
          <div className="space-y-3">
            {state === "past_due" && (
              <p className="notice-error">Ton dernier paiement a échoué. Mets à jour ta carte pour garder l&apos;accès. <Link href="/app/abonnement" className="font-semibold underline">Régler maintenant</Link></p>
            )}
            {state === "canceling" && user.current_period_end && (
              <p className="notice-warn">Ton abonnement s&apos;arrête le {fmt(user.current_period_end)}. <Link href="/app/abonnement" className="font-semibold underline">Le réactiver</Link></p>
            )}
            {state === "ended" && (
              <p className="notice-warn">Ton abonnement est terminé. Tes e-books restent consultables et téléchargeables. <Link href="/tarifs" className="font-semibold underline">Reprendre un abonnement</Link></p>
            )}
            {usingDemoDatabase() && (
              <p className="notice-warn">Base de données pas encore branchée : ce site tourne en démonstration et les comptes sont effacés régulièrement. Ajoute une base Neon dans Vercel (Storage) pour tout conserver.</p>
            )}
            {!isGeminiConfigured() && (
              <p className="notice-info">Mode démo : la clé Gemini n&apos;est pas encore configurée, les e-books générés contiennent un texte d&apos;exemple.</p>
            )}
          </div>
          <div className={state === "past_due" || state === "canceling" || state === "ended" || usingDemoDatabase() || !isGeminiConfigured() ? "mt-6" : ""}>{children}</div>
        </main>
      </div>
    </div>
  );
}
