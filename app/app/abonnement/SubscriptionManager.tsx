"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuotaMeter from "@/components/ws/QuotaMeter";
import Modal from "@/components/ws/Modal";

type Plan = { id: string; name: string; monthly: number; annual: number; ebooks: number; features: string[] };
type Sub = {
  plan: string;
  annual: boolean;
  state: "active" | "canceling" | "past_due";
  periodEnd: number | null;
  demo: boolean;
  heldPlan: string | null;
  heldUntil: number | null;
  card: string | null;
  hasPortal: boolean;
};
type Preview = { kind: "same" | "upgrade" | "downgrade" | "invalid"; dueNow: number | null; nextAmount: number; nextDate: number | null; message?: string };

const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));
const date = (t: number | null) => (t ? new Date(t * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—");
const yearly = (p: Plan) => Math.round(p.annual * 1200) / 100;

const REASONS: [string, string][] = [
  ["price", "C'est trop cher pour moi"],
  ["unused", "Je ne l'utilise pas assez"],
  ["quality", "La qualité des e-books ne me convient pas"],
  ["missing", "Il manque une fonctionnalité"],
  ["complex", "C'est trop compliqué"],
  ["switch", "J'utilise un autre outil"],
  ["other", "Autre raison"],
];

async function post(url: string, body?: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Une erreur est survenue, réessaie.");
  return d;
}

export default function SubscriptionManager({ plans, sub, usage, annualAvailable, preselect }: {
  plans: Plan[];
  sub: Sub;
  usage: { used: number; limit: number; resetsOn: string };
  annualAvailable: boolean;
  preselect: { plan: string; annual: boolean } | null;
}) {
  const router = useRouter();
  const current = plans.find((p) => p.id === sub.plan)!;
  const [annual, setAnnual] = useState(sub.annual);
  const [target, setTarget] = useState<{ plan: Plan; annual: boolean } | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    const p = preselect && plans.find((x) => x.id === preselect.plan);
    if (p && (p.id !== sub.plan || preselect!.annual !== sub.annual)) openChange(p, preselect!.annual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openChange(plan: Plan, isAnnual: boolean) {
    setTarget({ plan, annual: isAnnual });
    setPreview(null);
    setError("");
    try {
      setPreview(await post("/api/billing/preview", { plan: plan.id, annual: isAnnual }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function confirmChange() {
    if (!target) return;
    setBusy(true);
    setError("");
    try {
      const r = await post("/api/billing/change", { plan: target.plan.id, annual: target.annual });
      if (r.payUrl) {
        window.location.href = r.payUrl;
        return;
      }
      setDone(r.kind === "upgrade" ? `Tu es passé(e) à l'offre ${target.plan.name}. Ton nouveau quota est disponible tout de suite.` : `C'est noté : l'offre ${target.plan.name} prendra effet au prochain renouvellement.`);
      setTarget(null);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function portal(flow?: string) {
    setBusy(true);
    try {
      const r = await post("/api/billing/portal", { flow });
      window.location.href = r.url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function resume() {
    setBusy(true);
    setError("");
    try {
      await post("/api/billing/resume");
      setDone("Ton abonnement est réactivé. Il se renouvellera normalement.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const price = sub.annual ? `${eur(yearly(current))} € / an` : `${eur(current.monthly)} € / mois`;
  const statusBadge = {
    active: <span className="badge bg-green-100 text-green-800">Actif</span>,
    canceling: <span className="badge bg-amber-100 text-amber-800">Résilié, actif jusqu'au {date(sub.periodEnd)}</span>,
    past_due: <span className="badge bg-red-100 text-red-700">Paiement en échec</span>,
  }[sub.state];

  return (
    <div className="space-y-8">
      {done && <p className="notice-ok">{done}</p>}
      {error && !target && !cancelOpen && <p className="notice-error">{error}</p>}

      {/* Offre actuelle */}
      <section className="card grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow-ws">Offre actuelle</p>
            {statusBadge}
            {sub.demo && <span className="badge bg-slate-100 text-slate-500">mode démo, sans paiement</span>}
          </div>
          <p className="font-display text-4xl uppercase text-slate-900">{current.name}</p>
          <p className="text-sm text-slate-700">
            {price} · {current.ebooks} e-books par mois
          </p>
          <p className="text-sm text-slate-500">
            {sub.state === "canceling"
              ? `Aucun nouveau prélèvement. Accès jusqu'au ${date(sub.periodEnd)}.`
              : `Prochain renouvellement le ${date(sub.periodEnd)}.`}
          </p>
          {sub.heldPlan && <p className="text-sm text-slate-500">Tu gardes le quota de l'offre {sub.heldPlan} jusqu'au {date(sub.heldUntil)}.</p>}
          {sub.state === "canceling" && (
            <button className="btn-primary" disabled={busy} onClick={resume}>Réactiver mon abonnement</button>
          )}
          {sub.state === "past_due" && sub.hasPortal && (
            <button className="btn-primary" disabled={busy} onClick={() => portal("payment_method_update")}>Mettre à jour ma carte</button>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/[0.02] p-4">
          <QuotaMeter used={usage.used} limit={usage.limit} />
          <p className="mt-3 text-xs text-slate-500">Le quota repart à zéro le {new Date(usage.resetsOn).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}. Les e-books non utilisés ne sont pas reportés.</p>
        </div>
      </section>

      {/* Changer d'offre */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="h2">Changer d'offre</h2>
            <p className="muted mt-1">Offre supérieure : effet immédiat, tu paies seulement la différence au prorata. Offre inférieure : effet au prochain renouvellement.</p>
          </div>
          {annualAvailable && !sub.annual && (
            <div className="flex rounded-full border border-slate-300 bg-slate-100 p-1 text-sm" role="group" aria-label="Fréquence de facturation">
              <button className={`rounded-full px-4 py-1.5 ${!annual ? "bg-slate-300 font-semibold text-slate-900" : "text-slate-600"}`} onClick={() => setAnnual(false)}>Mensuel</button>
              <button className={`rounded-full px-4 py-1.5 ${annual ? "bg-slate-300 font-semibold text-slate-900" : "text-slate-600"}`} onClick={() => setAnnual(true)}>Annuel <span className="text-brand-700">−20 %</span></button>
            </div>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.id === sub.plan && annual === sub.annual;
            const up = p.ebooks > current.ebooks || (p.id === sub.plan && annual && !sub.annual);
            return (
              <div key={p.id} className={`card flex flex-col ${isCurrent ? "border-brand-600 ring-1 ring-brand-600" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-2xl uppercase">{p.name}</p>
                  {isCurrent && <span className="badge bg-brand-50 text-brand-700">Ton offre</span>}
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-display text-3xl text-slate-900">{eur(annual ? p.annual : p.monthly)} €</span> / mois
                </p>
                <p className="text-xs text-slate-500">{annual ? `soit ${eur(yearly(p))} € par an` : "sans engagement"}</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-600">
                  {p.features.map((f) => <li key={f}><span className="text-brand-600">✓</span> {f}</li>)}
                </ul>
                <button
                  className={`mt-5 ${up ? "btn-primary" : "btn-secondary"}`}
                  disabled={isCurrent || busy || sub.state === "past_due"}
                  onClick={() => openChange(p, annual)}
                >
                  {isCurrent ? "Offre actuelle" : up ? `Passer à ${p.name}` : `Passer à ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
        {sub.annual && <p className="muted mt-3">Tu es en facturation annuelle. Pour repasser au mensuel, résilie : à la fin de ta période, tu pourras reprendre l'offre mensuelle de ton choix.</p>}
      </section>

      {/* Paiement */}
      <section className="card space-y-3">
        <h2 className="h2">Paiement et factures</h2>
        {sub.hasPortal ? (
          <>
            <p className="text-sm text-slate-700">{sub.card ? `Moyen de paiement : ${sub.card}` : "Aucun moyen de paiement enregistré."}</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" disabled={busy} onClick={() => portal("payment_method_update")}>Changer de carte</button>
              <button className="btn-ghost" disabled={busy} onClick={() => portal()}>Adresse de facturation et historique (Stripe) ↗</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Mode démo : aucun paiement réel, donc ni carte ni facture. Une fois Stripe branché, tes factures apparaîtront ici.</p>
        )}
      </section>

      {/* Résiliation */}
      {sub.state !== "canceling" && (
        <section className="card flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="h2">Résilier</h2>
            <p className="muted mt-1">Tu gardes l'accès jusqu'au {date(sub.periodEnd)}. Aucun nouveau prélèvement ensuite. Tes e-books restent à toi.</p>
          </div>
          <button className="btn-danger" onClick={() => { setCancelOpen(true); setError(""); }}>Résilier mon abonnement</button>
        </section>
      )}

      {target && (
        <Modal onClose={() => !busy && setTarget(null)} title={`Passer à ${target.plan.name}${target.annual && !sub.annual ? " (annuel)" : ""}`}>
          {!preview && !error && <p className="text-sm text-slate-500">Calcul du montant…</p>}
          {preview?.kind === "invalid" && <p className="text-sm text-slate-700">{preview.message}</p>}
          {preview?.kind === "upgrade" && (
            <div className="space-y-2 text-sm text-slate-700">
              <p>Effet immédiat : <strong>{target.plan.ebooks} e-books par mois</strong> dès maintenant.</p>
              <p>À payer aujourd'hui : <strong className="text-slate-900">{eur(preview.dueNow ?? 0)} €</strong> {sub.demo ? "(estimation, mode démo : rien n'est prélevé)" : "(différence au prorata du temps restant)"}.</p>
              <p>Ensuite : {eur(preview.nextAmount)} € {target.annual ? "par an" : "par mois"}{preview.nextDate ? ` à partir du ${date(preview.nextDate)}` : ""}.</p>
            </div>
          )}
          {preview?.kind === "downgrade" && (
            <div className="space-y-2 text-sm text-slate-700">
              <p>Rien à payer aujourd'hui, et pas de remboursement de la période en cours.</p>
              <p>Tu gardes ton quota actuel ({current.ebooks} e-books par mois) jusqu'au {date(sub.periodEnd)}.</p>
              <p>Ensuite : {eur(preview.nextAmount)} € {target.annual ? "par an" : "par mois"} pour {target.plan.ebooks} e-books par mois.</p>
            </div>
          )}
          {error && <p className="notice-error mt-3">{error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button className="btn-ghost" disabled={busy} onClick={() => setTarget(null)}>Annuler</button>
            {preview && preview.kind !== "invalid" && preview.kind !== "same" && (
              <button className="btn-primary" disabled={busy} onClick={confirmChange}>{busy ? "Un instant…" : preview.kind === "upgrade" ? `Confirmer${preview.dueNow ? ` et payer ${eur(preview.dueNow)} €` : ""}` : "Confirmer le changement"}</button>
            )}
          </div>
        </Modal>
      )}

      {cancelOpen && (
        <CancelModal
          sub={sub}
          lower={plans.filter((p) => p.ebooks < current.ebooks)[0] ?? null}
          onClose={() => setCancelOpen(false)}
          onDowngrade={(p) => { setCancelOpen(false); openChange(p, sub.annual); }}
          onDone={() => { setCancelOpen(false); setDone(`Résiliation enregistrée. Tu gardes l'accès jusqu'au ${date(sub.periodEnd)}, sans nouveau prélèvement.`); router.refresh(); }}
        />
      )}
    </div>
  );
}

function CancelModal({ sub, lower, onClose, onDowngrade, onDone }: { sub: Sub; lower: Plan | null; onClose: () => void; onDowngrade: (p: Plan) => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal onClose={() => !busy && onClose()} title="Résilier mon abonnement">
      <div className="space-y-4 text-sm text-slate-700">
        <ul className="space-y-1.5">
          <li>• Accès complet jusqu'au <strong>{date(sub.periodEnd)}</strong>.</li>
          <li>• Aucun nouveau prélèvement après cette date.</li>
          <li>• La période en cours n'est pas remboursée (voir CGV).</li>
          <li>• Tes e-books et PDF restent consultables et téléchargeables.</li>
          <li>• Tu peux changer d'avis et réactiver jusqu'au dernier jour.</li>
        </ul>
        {lower && (
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3">
            <p>Besoin de moins d'e-books ? Tu peux passer à <strong>{lower.name}</strong> ({lower.ebooks} e-books, {eur(lower.monthly)} € par mois) au lieu d'arrêter.</p>
            <button className="btn-secondary mt-2" onClick={() => onDowngrade(lower)}>Passer à {lower.name}</button>
          </div>
        )}
        <fieldset>
          <legend className="label">Pourquoi pars-tu ? (facultatif, ça nous aide à améliorer l'outil)</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {REASONS.map(([k, l]) => (
              <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${reason === k ? "border-brand-600 bg-brand-50" : "border-slate-200"}`}>
                <input type="radio" name="reason" value={k} checked={reason === k} onChange={() => setReason(k)} className="accent-[#a5d8ff]" /> {l}
              </label>
            ))}
          </div>
        </fieldset>
        <textarea className="input min-h-20" placeholder="Un commentaire ? (facultatif)" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
        {error && <p className="notice-error">{error}</p>}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button className="btn-secondary" disabled={busy} onClick={onClose}>Garder mon abonnement</button>
        <button
          className="btn-danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await post("/api/billing/cancel", { reason: reason || "other", comment });
              onDone();
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          {busy ? "Un instant…" : "Confirmer la résiliation"}
        </button>
      </div>
    </Modal>
  );
}
