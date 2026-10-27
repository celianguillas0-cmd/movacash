import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/config";
import { all, one } from "@/lib/db";
import { hasActiveSubscription } from "@/lib/subscription";
import { listCategories } from "@/lib/ideas";
import AdminTest from "./AdminTest";
import { PLANS, isGeminiConfigured, isStripeConfigured } from "@/lib/config";
import { googleConfigured } from "@/lib/google";
import { annualAvailable } from "@/lib/stripe";
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

  // Chiffres clés
  const jour = Math.floor(Date.now() / 1000) - 86400;
  const semaine = Math.floor(Date.now() / 1000) - 7 * 86400;
  const debutMois = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
  const [c, abonnes, gen, derniers, rejouables] = await Promise.all([
    one<{ n: number; s: number; j: number }>("SELECT COUNT(*) AS n, COUNT(*) FILTER (WHERE created_at >= ?) AS s, COUNT(*) FILTER (WHERE created_at >= ?) AS j FROM users", [semaine, jour]),
    all<{ plan: string; billing_interval: string; is_demo_sub: number; n: number }>(
      "SELECT plan, billing_interval, is_demo_sub, COUNT(*) AS n FROM users WHERE plan IS NOT NULL AND sub_status IN ('active', 'trialing', 'past_due') GROUP BY plan, billing_interval, is_demo_sub"
    ),
    one<{ m: number; j: number }>("SELECT COUNT(*) FILTER (WHERE created_at >= ?) AS m, COUNT(*) FILTER (WHERE created_at >= ?) AS j FROM generations", [debutMois, jour]),
    all<{ id: number; email: string; plan: string | null; sub_status: string; is_demo_sub: number; created_at: number }>("SELECT id, email, plan, sub_status, is_demo_sub, created_at FROM users ORDER BY id DESC LIMIT 8"),
    all<{ topic: string }>(
      `SELECT DISTINCT e.topic FROM ebooks e WHERE e.user_id = ? AND e.is_demo = 0 AND e.film_source_id IS NULL
         AND EXISTS (SELECT 1 FROM generations g WHERE g.ebook_id = e.id)
         AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.ebook_id = e.id AND ch.status != 'done') LIMIT 12`,
      [user.id]
    ),
  ]);
  const payants = abonnes.filter((a) => !a.is_demo_sub);
  const stats = {
    comptes: Number(c?.n ?? 0),
    nouveaux7: Number(c?.s ?? 0),
    nouveaux1: Number(c?.j ?? 0),
    payants: payants.reduce((n, a) => n + Number(a.n), 0),
    offerts: abonnes.filter((a) => a.is_demo_sub).reduce((n, a) => n + Number(a.n), 0),
    mrr: payants.reduce((t, a) => {
      const p = PLANS.find((x) => x.id === a.plan);
      return t + (p ? (a.billing_interval === "year" ? p.annualMonthlyEur : p.priceEur) * Number(a.n) : 0);
    }, 0),
    parOffre: PLANS.map((p) => ({ nom: p.name, n: payants.filter((a) => a.plan === p.id).reduce((n, a) => n + Number(a.n), 0) })).filter((o) => o.n),
    ebooksMois: Number(gen?.m ?? 0),
    ebooksJour: Number(gen?.j ?? 0),
  };

  // Ce qui est branché ou non
  const env = (k: string) => Boolean(process.env[k]);
  const prixManquants = PLANS.flatMap((p) => [p.stripePriceEnv, p.stripeAnnualPriceEnv]).filter((k) => !env(k));
  const etat = [
    { nom: "Base de données", ok: env("DATABASE_URL") || env("POSTGRES_URL"), requis: true, aide: "sans elle, rien n'est conservé (Neon dans Vercel)." },
    { nom: "Génération des e-books (Gemini)", ok: isGeminiConfigured(), requis: true, aide: "variable GEMINI_API_KEY." },
    { nom: "Paiements Stripe", ok: isStripeConfigured(), requis: true, aide: "variable STRIPE_SECRET_KEY (clé sk_live)." },
    { nom: "Webhook Stripe", ok: env("STRIPE_WEBHOOK_SECRET"), requis: true, aide: "variable STRIPE_WEBHOOK_SECRET : sans elle, l'accès ne s'ouvre pas après paiement." },
    { nom: "Prix Stripe", ok: !prixManquants.length, requis: true, aide: `manque ${prixManquants.join(", ")}.` },
    { nom: "Offres annuelles", ok: annualAvailable(), requis: false, aide: "les prix annuels Stripe ne sont pas tous renseignés." },
    { nom: "E-mails (Resend)", ok: isEmailConfigured(), requis: true, aide: "RESEND_API_KEY et EMAIL_FROM, après l'achat du domaine. Obligatoire : confirmations d'abonnement et de résiliation, rappel annuel." },
    { nom: "Mentions légales", ok: !missingLegal().length, requis: true, aide: `manque ${missingLegal().map(([, , label]) => label.toLowerCase()).join(", ")}.` },
    { nom: "Connexion avec Google", ok: googleConfigured(), requis: false, aide: "GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET." },
    { nom: "Clé de session", ok: (process.env.AUTH_SECRET || "").length >= 16, requis: false, aide: "AUTH_SECRET, conseillée." },
    { nom: "Adresse du site", ok: env("NEXT_PUBLIC_APP_URL"), requis: false, aide: "NEXT_PUBLIC_APP_URL, à changer quand tu auras le domaine." },
  ];
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

      <AdminTest
        tournage={!user.real_mode}
        vue={hasActiveSubscription(user) && user.is_demo_sub && user.plan ? (user.plan as "starter" | "pro" | "business") : hasActiveSubscription(user) ? "starter" : "aucun"}
        payant={Boolean(user.stripe_subscription_id && !user.is_demo_sub && hasActiveSubscription(user))}
        sujetsRejouables={rejouables.map((r) => r.topic)}
      />

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Chiffres</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-4">
          {[
            ["Comptes", String(stats.comptes), `${stats.nouveaux7} cette semaine · ${stats.nouveaux1} aujourd'hui`],
            ["Abonnés payants", String(stats.payants), stats.offerts ? `+ ${stats.offerts} formule${stats.offerts > 1 ? "s" : ""} offerte${stats.offerts > 1 ? "s" : ""}` : "par Stripe"],
            ["Revenu mensuel estimé", euros(stats.mrr), "abonnements actifs, annuels ramenés au mois"],
            ["E-books ce mois-ci", String(stats.ebooksMois), `${stats.ebooksJour} aujourd'hui · hors tournage`],
          ].map(([titre, valeur, detail]) => (
            <div key={titre}><p className="muted text-sm">{titre}</p><p className="mt-1 text-3xl font-bold text-slate-900">{valeur}</p><p className="muted mt-1 text-xs">{detail}</p></div>
          ))}
        </div>
        {stats.parOffre.length > 0 && (
          <p className="muted mt-4 text-sm">Par offre : {stats.parOffre.map((o) => `${o.nom} ${o.n}`).join(" · ")}</p>
        )}
        <p className="muted mt-1 text-sm">Conversion : {stats.comptes ? Math.round((stats.payants / stats.comptes) * 100) : 0} % des comptes ont un abonnement payant.</p>
        {derniers.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-slate-900">Dernières inscriptions</h3>
            <ul className="mt-2 text-sm">
              {derniers.map((d) => (
                <li key={d.id} className="flex justify-between gap-3 border-t border-slate-100 py-2">
                  <a href={`/app/admin/comptes/${d.id}`} className="truncate text-slate-900 underline-offset-2 hover:underline">{d.email}</a>
                  <span className="muted shrink-0">{d.plan && ["active", "trialing", "past_due"].includes(d.sub_status) ? `${d.plan}${d.is_demo_sub ? " (offert)" : ""}` : "sans abonnement"} · {new Date(d.created_at * 1000).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">État du site</h2>
        <p className="muted mt-1 text-sm">{etat.filter((e) => !e.ok && e.requis).length ? "Les lignes en rouge bloquent l'ouverture des ventes." : "Tout ce qui est obligatoire est en place."}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {etat.map((e) => (
            <li key={e.nom} className="flex gap-3">
              <span aria-hidden="true" className={e.ok ? "text-slate-900" : e.requis ? "text-red-600" : "text-amber-600"}>{e.ok ? "✓" : e.requis ? "✗" : "○"}</span>
              <span><b className="text-slate-900">{e.nom}</b>{e.ok ? "" : ` : ${e.aide}`}</span>
            </li>
          ))}
        </ul>
      </section>

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
