import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getUserById } from "@/lib/auth";
import { getPlan, isAdmin } from "@/lib/config";
import { all, one } from "@/lib/db";
import { getUsage, subState } from "@/lib/subscription";
import AdminNav from "../../AdminNav";
import UserActions from "./UserActions";

export const dynamic = "force-dynamic";

const ETATS: Record<string, string> = { none: "Aucun abonnement", active: "Actif", canceling: "Résilié (actif jusqu'à la fin de la période)", past_due: "Paiement en échec", ended: "Terminé" };
const euros = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const date = (s: number | null) => (s ? new Date(s * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—");

export default async function Compte({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || !isAdmin(admin.email)) notFound();
  const { id } = await params;
  const u = await getUserById(Number(id));
  if (!u) notFound();
  const usage = await getUsage(u);
  const debut = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
  const [couts, ebooks] = await Promise.all([
    one<{ mois: number | null; total: number | null }>("SELECT SUM(CASE WHEN created_at >= ? THEN cost_eur ELSE 0 END) AS mois, SUM(cost_eur) AS total FROM api_usage WHERE user_id = ?", [debut, u.id]),
    all<{ id: number; title: string; status: string; created_at: number }>("SELECT id, title, status, created_at FROM ebooks WHERE user_id = ? ORDER BY id DESC LIMIT 15", [u.id]),
  ]);
  const plan = getPlan(u.plan);
  const etat = subState(u);

  return (
    <div className="space-y-6">
      <div>
        <p className="at-kicker"><Link href="/app/admin/comptes" className="underline">← Comptes</Link></p>
        <h1 className="at-titre">{u.name || u.email}</h1>
        <p className="at-dim" style={{ marginTop: 6 }}>{u.email}{u.banned ? " · suspendu" : ""}</p>
      </div>
      <AdminNav current="comptes" />

      <section className="at-table">
        <div><span>Inscrit le</span><b>{new Date(u.created_at * 1000).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</b></div>
        <div><span>Formule</span><b>{plan ? `${plan.name}${u.is_demo_sub ? " (offerte)" : ""}` : "Aucune"}</b></div>
        <div><span>Abonnement</span><b>{ETATS[etat]}</b></div>
        <div><span>Prochaine échéance</span><b>{date(u.current_period_end)}</b></div>
        <div><span>Paiement Stripe</span><b>{u.stripe_subscription_id && !u.is_demo_sub ? "Oui" : "Non"}</b></div>
        <div><span>E-books ce mois-ci</span><b>{usage.used} / {usage.limit}{u.quota_override != null ? " (limite fixée à la main)" : ""}</b></div>
        <div><span>E-books au total</span><b>{ebooks.length >= 15 ? "15 et plus" : ebooks.length}</b></div>
        <div><span>Coût API ce mois-ci</span><b>{euros(Number(couts?.mois || 0))}</b></div>
        <div><span>Coût API au total</span><b>{euros(Number(couts?.total || 0))}</b></div>
      </section>

      <UserActions
        id={u.id}
        self={isAdmin(u.email)}
        banned={Boolean(u.banned)}
        quotaOverride={u.quota_override}
        planLimit={plan?.ebooksPerMonth ?? 0}
        offered={Boolean(u.is_demo_sub) && (etat === "active" || etat === "canceling")}
        payingStripe={Boolean(u.stripe_subscription_id) && !u.is_demo_sub && ["active", "canceling", "past_due"].includes(etat)}
      />

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Derniers e-books</h2>
        {ebooks.length ? (
          <ul className="mt-3 text-sm">
            {ebooks.map((e) => (
              <li key={e.id} className="flex justify-between gap-4 border-t border-slate-100 py-2">
                <span className="text-slate-900">{e.title}</span>
                <span className="shrink-0 text-slate-500">{e.status === "ready" ? "Prêt" : "En cours"} · {new Date(e.created_at * 1000).toLocaleDateString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        ) : <p className="muted mt-3 text-sm">Aucun e-book.</p>}
      </section>
    </div>
  );
}
