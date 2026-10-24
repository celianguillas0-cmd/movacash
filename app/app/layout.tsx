import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPlan, isGeminiConfigured } from "@/lib/config";
import { getUsage, subState } from "@/lib/subscription";
import { usingDemoDatabase } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import WsNav from "@/components/ws/WsNav";
import Logo from "@/components/ws/Logo";
import QuotaMeter from "@/components/ws/QuotaMeter";

export const dynamic = "force-dynamic";

const fmt = (t: number) => new Date(t * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const state = subState(user);
  const usage = await getUsage(user);
  const plan = getPlan(user.plan);
  const live = state === "active" || state === "canceling" || state === "past_due";
  return (
    <div className="min-h-screen md:flex">
      <div className="ws-bg" aria-hidden="true" />
      <aside className="sticky top-0 z-20 border-b border-slate-200 bg-black/60 backdrop-blur-md md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 pb-3 pt-4 md:pb-6 md:pt-6">
            <Logo />
            <span className="md:hidden"><LogoutButton /></span>
          </div>
          <WsNav />
          <div className="mt-auto hidden space-y-4 p-4 md:block">
            {live ? (
              <div className="card space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Offre {plan?.name}</span>
                  {user.is_demo_sub ? <span className="badge bg-slate-100 text-slate-500">démo</span> : null}
                </div>
                <QuotaMeter used={usage.used} limit={usage.limit} compact />
                {usage.remaining === 0 && <Link href="/app/abonnement" className="btn-primary w-full">Passer à l'offre supérieure</Link>}
              </div>
            ) : (
              <Link href="/tarifs" className="btn-primary w-full">Activer un abonnement</Link>
            )}
            <div className="flex items-center justify-between px-1 text-xs text-slate-500">
              <span className="truncate pr-2">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl space-y-3">
          {state === "past_due" && (
            <p className="notice-error">
              Ton dernier paiement a échoué. Mets à jour ta carte pour garder l'accès. <Link href="/app/abonnement" className="font-semibold underline">Régler maintenant</Link>
            </p>
          )}
          {state === "canceling" && user.current_period_end && (
            <p className="notice-warn">
              Ton abonnement s'arrête le {fmt(user.current_period_end)}. <Link href="/app/abonnement" className="font-semibold underline">Le réactiver</Link>
            </p>
          )}
          {state === "ended" && (
            <p className="notice-warn">
              Ton abonnement est terminé. Tes e-books restent consultables et téléchargeables. <Link href="/tarifs" className="font-semibold underline">Reprendre un abonnement</Link>
            </p>
          )}
          {usingDemoDatabase() && (
            <p className="notice-warn">Base de données pas encore branchée : ce site tourne en démonstration et les comptes sont effacés régulièrement. Ajoute une base Neon dans Vercel (Storage) pour tout conserver.</p>
          )}
          {!isGeminiConfigured() && (
            <p className="notice-info">Mode démo : la clé Gemini n'est pas encore configurée, les e-books générés contiennent un texte d'exemple.</p>
          )}
        </div>
        <div className="mx-auto mt-3 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
