import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/config";
import { all } from "@/lib/db";
import { listCategories } from "@/lib/ideas";
import FilmModeToggle from "./FilmModeToggle";
import AdminNav from "./AdminNav";
import { usageSummary } from "@/lib/usage";
import { missingLegal } from "@/lib/legal";
import { isEmailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

// Regroupe les réponses en ignorant majuscules, accents et espaces en trop.
const cle = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();

  const [rows, categories] = await Promise.all([
    all<{ quiz_json: string | null }>("SELECT quiz_json FROM users WHERE quiz_json IS NOT NULL"),
    listCategories(),
  ]);
  const noms = new Map(categories.map((c) => [c.slug, c.name]));

  const libres = new Map<string, { texte: string; variantes: Set<string>; n: number }>();
  const choisies = new Map<string, number>();
  let repondants = 0;
  for (const r of rows) {
    let answers: Record<string, unknown> = {};
    try {
      answers = JSON.parse(r.quiz_json || "{}").answers || {};
    } catch {
      continue;
    }
    const themes = Array.isArray(answers.themes) ? (answers.themes as string[]) : [];
    if (!themes.length) continue;
    repondants += 1;
    for (const t of themes) if (t !== "autre") choisies.set(t, (choisies.get(t) || 0) + 1);
    const texte = typeof answers.themes_libre === "string" ? answers.themes_libre.trim() : "";
    if (!texte) continue;
    const k = cle(texte);
    if (!k) continue;
    const e = libres.get(k) || { texte, variantes: new Set<string>(), n: 0 };
    e.variantes.add(texte);
    e.n += 1;
    libres.set(k, e);
  }
  const depenses = await usageSummary();
  const euros = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  const avis = await all<{ id: number; email: string; note: number | null; message: string; created_at: number }>("SELECT id, email, note, message, created_at FROM feedback ORDER BY id DESC LIMIT 100");
  const top = [...libres.values()].sort((a, b) => b.n - a.n);
  const cats = [...choisies.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <div>
        <p className="at-kicker">Ton atelier</p>
        <h1 className="at-titre">Admin.</h1>
        <p className="muted mt-2">Visible uniquement par toi. {repondants} personne{repondants > 1 ? "s ont" : " a"} répondu à la question des thématiques.</p>
      </div>

      <AdminNav current="vue" />

      {(missingLegal().length > 0 || !isEmailConfigured()) && (
        <section className="card border-amber-300 p-6">
          <h2 className="text-lg font-bold text-slate-900">À compléter avant d'ouvrir les ventes</h2>
          <p className="muted mt-1 text-sm">Ces informations sont obligatoires sur un site qui vend aux particuliers. Ajoute-les dans Vercel (Settings → Environment Variables), puis redéploie.</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-800">
            {missingLegal().map(([, env, label]) => <li key={env}>• {label} : variable <code>{env}</code></li>)}
            {!isEmailConfigured() && <li>• Le service d'e-mails (Resend) : variables <code>RESEND_API_KEY</code> et <code>EMAIL_FROM</code>. Sans lui, les confirmations d'abonnement et de résiliation exigées par la loi ne partent pas.</li>}
          </ul>
        </section>
      )}

      <FilmModeToggle initial={!user.real_mode} />

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Dépenses API (Gemini + photos)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="muted text-sm">Ce mois-ci</p><p className="mt-1 text-3xl font-bold text-slate-900">{euros(depenses.month)}</p></div>
          <div><p className="muted text-sm">Depuis le début</p><p className="mt-1 text-3xl font-bold text-slate-900">{euros(depenses.total)}</p></div>
          <div>
            <p className="muted text-sm">Par e-book ce mois-ci</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{depenses.monthEbooks ? `${(depenses.month / depenses.monthEbooks).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} €` : "—"}</p>
            <p className="muted mt-1 text-xs">{depenses.monthEbooks} e-book{depenses.monthEbooks > 1 ? "s" : ""} · {depenses.monthImages} photo{depenses.monthImages > 1 ? "s" : ""}</p>
          </div>
        </div>
        <p className="muted mt-4 text-xs">
          Estimation calculée à chaque appel avec les tarifs Google{depenses.since ? `, depuis le ${new Date(depenses.since * 1000).toLocaleDateString("fr-FR")}` : ""}. Le mode tournage ne coûte rien. Le solde exact reste celui de ta facturation Google Cloud.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Domaines proposés en « Autre »</h2>
        <p className="muted mt-1 text-sm">Les réponses écrites à la main, regroupées sans tenir compte des majuscules ni des accents. Les plus demandées en premier.</p>
        {top.length ? (
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr><th className="py-2 pr-4 font-medium">Domaine</th><th className="py-2 pr-4 font-medium">Réponses</th><th className="py-2 font-medium">Écrit comme</th></tr>
            </thead>
            <tbody>
              {top.map((e) => (
                <tr key={e.texte} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-semibold text-slate-900">{e.texte}</td>
                  <td className="py-2 pr-4">{e.n}</td>
                  <td className="py-2 text-slate-500">{[...e.variantes].slice(0, 4).join(" · ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Personne n'a encore proposé de domaine.</p>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Thématiques cochées</h2>
        {cats.length ? (
          <ul className="mt-4 space-y-1 text-sm">
            {cats.map(([slug, n]) => (
              <li key={slug} className="flex justify-between border-t border-slate-100 py-2"><span>{noms.get(slug) || slug}</span><span className="font-semibold">{n}</span></li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Pas encore de réponses.</p>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Avis des utilisateurs</h2>
        <p className="muted mt-1 text-sm">Envoyés depuis Paramètres, rubrique « Ton avis ». Les 100 derniers.</p>
        {avis.length ? (
          <ul className="mt-4 space-y-3 text-sm">
            {avis.map((a) => (
              <li key={a.id} className="border-t border-slate-100 pt-3">
                <p className="text-slate-500">{new Date(a.created_at * 1000).toLocaleDateString("fr-FR")} · {a.email}{a.note ? ` · ${a.note}/5` : ""}</p>
                <p className="mt-1 whitespace-pre-line text-slate-900">{a.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Pas encore d&apos;avis.</p>
        )}
      </section>
    </div>
  );
}
