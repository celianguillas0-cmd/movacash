import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME, getPlan, isGeminiConfigured } from "@/lib/config";
import { getUsage, hasActiveSubscription } from "@/lib/subscription";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const active = hasActiveSubscription(user);
  const usage = getUsage(user);
  const plan = getPlan(user.plan);
  const links = [
    ["/app", "Tableau de bord"],
    ["/app/idees", "Idées de formations"],
    ["/app/nouveau", "Nouvel e-book"],
    ["/app/regles-etsy", "Guide Etsy"],
    ["/app/compte", "Mon compte"],
  ];
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="p-4">
          <Link href="/app" className="text-lg font-bold text-brand-700">{APP_NAME}</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">{label}</Link>
          ))}
        </nav>
        <div className="hidden p-4 text-xs text-slate-500 md:block">
          {active ? (
            <p>Offre {plan?.name} : {usage.used} / {usage.limit} e-books ce mois-ci</p>
          ) : (
            <Link href="/tarifs" className="btn-primary w-full">Activer un abonnement</Link>
          )}
          <div className="mt-3"><LogoutButton /></div>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        {!isGeminiConfigured() && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Mode démo : aucune clé Gemini configurée. Les e-books générés contiennent un texte d'exemple. Ajoutez GEMINI_API_KEY pour générer le vrai contenu.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
