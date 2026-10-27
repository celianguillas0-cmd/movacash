import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, type User } from "@/lib/auth";
import { getPlan, isAdmin } from "@/lib/config";
import { all, one } from "@/lib/db";
import { hasActiveSubscription, monthStart } from "@/lib/subscription";
import AdminNav from "../AdminNav";

export const dynamic = "force-dynamic";
const PAR_PAGE = 50;

type Row = User & { mois: number; total: number; cout_mois: number | null };

export default async function Comptes({ searchParams }: { searchParams: Promise<{ q?: string; f?: string; page?: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || !isAdmin(admin.email)) notFound();
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const f = sp.f || "tous";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (q) { where.push("(LOWER(u.email) LIKE ? OR LOWER(u.name) LIKE ?)"); args.push(`%${q}%`, `%${q}%`); }
  if (f === "bannis") where.push("u.banned = 1");
  if (f === "abonnes") where.push("u.sub_status IN ('active', 'trialing', 'past_due')");
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const debut = monthStart();
  const [rows, count] = await Promise.all([
    all<Row>(
      `SELECT u.*,
        (SELECT COUNT(*) FROM generations g WHERE g.user_id = u.id AND g.created_at >= ?) AS mois,
        (SELECT COUNT(*) FROM ebooks e WHERE e.user_id = u.id) AS total,
        (SELECT SUM(a.cost_eur) FROM api_usage a WHERE a.user_id = u.id AND a.created_at >= ?) AS cout_mois
       FROM users u ${w} ORDER BY u.id DESC LIMIT ${PAR_PAGE} OFFSET ${(page - 1) * PAR_PAGE}`,
      [debut, debut, ...args]
    ),
    one<{ n: number }>(`SELECT COUNT(*) AS n FROM users u ${w}`, args),
  ]);
  const n = Number(count?.n || 0);
  const lien = (o: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(q ? { q } : {}), ...(f !== "tous" ? { f } : {}), ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) });
    return `/app/admin/comptes${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="at-kicker">Ton atelier</p>
        <h1 className="at-titre">Comptes.</h1>
      </div>
      <AdminNav current="comptes" />

      <form className="flex flex-wrap gap-2" action="/app/admin/comptes">
        <input name="q" defaultValue={q} placeholder="Chercher un e-mail ou un prénom…" className="input max-w-sm" aria-label="Recherche" />
        {f !== "tous" && <input type="hidden" name="f" value={f} />}
        <button className="at-btn">Chercher</button>
      </form>
      <div className="flex flex-wrap gap-2 text-sm">
        {[["tous", "Tous"], ["abonnes", "Abonnés"], ["bannis", "Suspendus"]].map(([k, l]) => (
          <Link key={k} href={`/app/admin/comptes?${new URLSearchParams({ ...(q ? { q } : {}), ...(k !== "tous" ? { f: k } : {}) })}`} className={`badge ${f === k ? "bg-slate-300 text-slate-900" : "bg-slate-100 text-slate-600"}`}>{l}</Link>
        ))}
        <span className="muted self-center">{n} compte{n > 1 ? "s" : ""}</span>
      </div>

      <section className="card overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 font-medium">Compte</th><th className="py-3 font-medium">Formule</th><th className="py-3 font-medium">E-books ce mois</th>
              <th className="py-3 font-medium">Coût API ce mois</th><th className="py-3 font-medium">Inscrit le</th><th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const actif = hasActiveSubscription(u);
              const plan = getPlan(u.plan);
              const limite = actif ? u.quota_override ?? plan?.ebooksPerMonth ?? 0 : 0;
              return (
                <tr key={u.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900">{u.name || "—"}{isAdmin(u.email) ? " (toi)" : ""}</p>
                    <p className="text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-3">
                    {u.banned ? <span className="badge bg-red-100 text-red-700">Suspendu</span> : actif ? <span>{plan?.name}{u.is_demo_sub ? " · offerte" : ""}</span> : <span className="text-slate-500">Aucune</span>}
                  </td>
                  <td className="py-3">{Number(u.mois)} / {limite}{u.quota_override != null ? " *" : ""}</td>
                  <td className="py-3">{(Number(u.cout_mois) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                  <td className="py-3 text-slate-500">{new Date(u.created_at * 1000).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-5 py-3 text-right"><Link className="underline" href={`/app/admin/comptes/${u.id}`}>Gérer</Link></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="px-5 py-6 text-slate-500">Aucun compte.</td></tr>}
          </tbody>
        </table>
      </section>
      <p className="muted text-xs">* limite d&apos;e-books fixée à la main.</p>
      {n > PAR_PAGE && (
        <div className="flex gap-3 text-sm">
          {page > 1 && <Link className="underline" href={lien({ page: page - 1 })}>← Précédents</Link>}
          {page * PAR_PAGE < n && <Link className="underline" href={lien({ page: page + 1 })}>Suivants →</Link>}
        </div>
      )}
    </div>
  );
}
