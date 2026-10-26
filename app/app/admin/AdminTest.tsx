"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Vue = "aucun" | "starter" | "pro" | "business";
interface Props { tournage: boolean; vue: Vue; payant: boolean; sujetsRejouables: string[] }

// Réglages de test de l'admin : mode tournage ou réel, abonnement simulé, parcours client à rejouer.
export default function AdminTest(p: Props) {
  const router = useRouter();
  const [tournage, setTournage] = useState(p.tournage);
  const [vue, setVue] = useState<Vue>(p.vue);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  async function post(url: string, body: object) {
    setBusy(true);
    setMsg(null);
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) setMsg({ ok: false, t: d.error || "Action impossible." });
    else router.refresh();
    return r.ok;
  }

  const seg = (on: boolean, label: string, onClick: () => void) => (
    <button type="button" disabled={busy} onClick={onClick} aria-pressed={on} className={`rounded-full px-4 py-1.5 text-sm ${on ? "bg-slate-300 font-semibold text-slate-900" : "text-slate-600 hover:text-slate-900"}`}>{label}</button>
  );

  function recommencer() {
    try {
      localStorage.removeItem("mc_funnel");
      localStorage.removeItem("mc_quiz");
    } catch {}
    window.location.href = "/quiz";
  }

  return (
    <section className="card space-y-7 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Mode de génération</h2>
        <div className="mt-3 flex w-fit gap-1 rounded-full border border-slate-300 bg-slate-100 p-1">
          {seg(tournage, "Tournage (gratuit)", () => !tournage && post("/api/admin/tournage", { on: true }).then((ok) => ok && setTournage(true)))}
          {seg(!tournage, "Réel (API payante)", () => tournage && post("/api/admin/tournage", { on: false }).then((ok) => ok && setTournage(false)))}
        </div>
        <p className="muted mt-3 max-w-2xl text-sm">
          {tournage ? (
            <>Les écrans sont exactement ceux de tes clients, avec de vraies attentes (environ 12 secondes pour le plan, 5 à 7 secondes par chapitre), mais rien n&apos;est envoyé à l&apos;API et ton quota ne bouge pas. Aucun bandeau ni mention « démo » n&apos;apparaît.</>
          ) : (
            <>Chaque génération appelle vraiment Gemini (environ 0,12 € par e-book) et compte dans le quota, comme pour un client.</>
          )}
        </p>
        <p className="muted mt-2 max-w-2xl text-sm">
          <b className="text-slate-900">Astuce pour tes vidéos :</b> génère une fois un e-book en mode réel sur un sujet. Ensuite, en mode tournage, ce même sujet rejoue ce vrai contenu (chapitres, fiche Etsy, photo) autant de fois que tu veux, gratuitement. Sinon, un texte d&apos;exemple est utilisé.
        </p>
        {p.sujetsRejouables.length > 0 && (
          <p className="mt-2 text-sm text-slate-700">Sujets prêts à rejouer : {p.sujetsRejouables.join(" · ")}</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Voir le site avec l&apos;abonnement</h2>
        {p.payant ? (
          <p className="muted mt-1 text-sm">Ton compte a un vrai abonnement Stripe, il s&apos;applique tel quel.</p>
        ) : (
          <>
            <p className="muted mt-1 text-sm">Sans payer : tu vois exactement ce que voit un client avec cette offre (quota, page Abonnement, accès à l&apos;atelier).</p>
            <div className="mt-3 flex w-fit flex-wrap gap-1 rounded-full border border-slate-300 bg-slate-100 p-1">
              {(["aucun", "starter", "pro", "business"] as Vue[]).map((v) =>
                seg(vue === v, v === "aucun" ? "Aucun abonnement" : v[0].toUpperCase() + v.slice(1), () => vue !== v && post("/api/admin/moi", { vue: v }).then((ok) => ok && setVue(v)))
              )}
            </div>
          </>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Parcours client</h2>
        <p className="muted mt-1 text-sm">Efface tes réponses dans ce navigateur et repart du début du questionnaire. Pour filmer aussi la création de compte, ouvre le site dans une fenêtre de navigation privée.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="at-btn" onClick={recommencer}>Recommencer le questionnaire</button>
          <a className="btn-secondary" href="/" target="_blank" rel="noopener">Voir l&apos;accueil</a>
          <a className="btn-secondary" href="/tarifs" target="_blank" rel="noopener">Voir les tarifs</a>
        </div>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-slate-900" : "text-red-600"}`} role="status">{msg.t}</p>}
    </section>
  );
}
