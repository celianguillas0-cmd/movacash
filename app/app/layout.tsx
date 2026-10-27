import Marque from "@/components/at/Marque";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin, isGeminiConfigured } from "@/lib/config";
import { getUsage, subState } from "@/lib/subscription";
import { usingDemoDatabase } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import WsNav from "@/components/ws/WsNav";
import { getT } from "@/lib/i18n/server";
import LangSwitch from "@/components/LangSwitch";
import InstallApp from "@/components/InstallApp";
import "../atelier.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const state = subState(user);
  const usage = await getUsage(user);
  const { t, locale } = await getT();
  const fmt = (s: number) => new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "long" });
  const live = state === "active" || state === "canceling" || state === "past_due";
  return (
    <div className="at">
      <header className="at-head">
        <div className="at-wrap">
          <Link href="/app" className="at-brand mc-marque"><Marque /></Link>
          <div className="at-head-liens">
            <Link href="/" className="at-retour">← {t("Retour à l'accueil")}</Link>
            <LangSwitch />
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
                <b>{usage.used} / {usage.limit}</b> {t("e-books ce mois-ci")}
                <div className="at-quota-rail"><i style={{ width: `${Math.min(100, (usage.used / Math.max(1, usage.limit)) * 100)}%` }} /></div>
                {usage.remaining === 0 && <Link href="/app/abonnement">{t("Passer à l'offre supérieure")}</Link>}
              </>
            ) : (
              <>{t("Aucun abonnement actif.")} <Link href="/tarifs">{t("Choisir une formule")}</Link></>
            )}
          </div>
        </aside>
        <main className="min-w-0">
          <div className="space-y-3">
            <InstallApp />
            {state === "past_due" && (
              <p className="notice-error">{t("Ton dernier paiement a échoué. Mets à jour ta carte pour garder l'accès.")} <Link href="/app/abonnement" className="font-semibold underline">{t("Régler maintenant")}</Link></p>
            )}
            {state === "canceling" && user.current_period_end && (
              <p className="notice-warn">{t("Ton abonnement s'arrête le {date}.", { date: fmt(user.current_period_end) })} <Link href="/app/abonnement" className="font-semibold underline">{t("Le réactiver")}</Link></p>
            )}
            {state === "ended" && (
              <p className="notice-warn">{t("Ton abonnement est terminé. Tes e-books restent consultables et téléchargeables.")} <Link href="/tarifs" className="font-semibold underline">{t("Reprendre un abonnement")}</Link></p>
            )}
            {usingDemoDatabase() && (
              <p className="notice-warn">Base de données pas encore branchée : ce site tourne en démonstration et les comptes sont effacés régulièrement. Ajoute une base Neon dans Vercel (Storage) pour tout conserver.</p>
            )}
            {!isGeminiConfigured() && (
              <p className="notice-info">{t("Mode démo : la clé Gemini n'est pas encore configurée, les e-books générés contiennent un texte d'exemple.")}</p>
            )}
          </div>
          <div className={state === "past_due" || state === "canceling" || state === "ended" || usingDemoDatabase() || !isGeminiConfigured() ? "mt-6" : ""}>{children}</div>
        </main>
      </div>
    </div>
  );
}
