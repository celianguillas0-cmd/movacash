"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuotaMeter from "@/components/ws/QuotaMeter";
import Modal from "@/components/ws/Modal";
import { useLocale, useT } from "@/lib/i18n/client";
import { fmtEur, tk, type T } from "@/lib/i18n/t";
import type { PlanView as Plan } from "@/lib/planView";

type Sub = {
  plan: string;
  state: "active" | "canceling" | "past_due";
  periodEnd: number | null;
  demo: boolean;
  card: string | null;
  hasPortal: boolean;
};
type Preview = { kind: "same" | "change" | "invalid"; dueNow: number | null; nextAmount: number; nextDate: number | null; message?: string };

// Montants et dates au format de la langue du visiteur
function useFormats() {
  const locale = useLocale();
  return {
    eur: (n: number) => fmtEur(n, locale),
    date: (s: number | null) => (s ? new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "—"),
    locale,
  };
}

const REASONS: [string, string][] = [
  ["price", tk("C'est trop cher pour moi")],
  ["unused", tk("Je ne l'utilise pas assez")],
  ["quality", tk("La qualité des e-books ne me convient pas")],
  ["missing", tk("Il manque une fonctionnalité")],
  ["complex", tk("C'est trop compliqué")],
  ["switch", tk("J'utilise un autre outil")],
  ["other", tk("Autre raison")],
];

async function post(t: T, url: string, body?: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(t(d.error || "Une erreur est survenue, réessaie."));
  return d;
}

export default function SubscriptionManager({ plans, features, sub, usage, preselect }: {
  plans: Plan[];
  features: string[];
  sub: Sub;
  usage: { used: number; limit: number; resetsOn: string };
  preselect: string | null;
}) {
  const router = useRouter();
  const t = useT();
  const { eur, date, locale } = useFormats();
  const current = plans.find((p) => p.id === sub.plan)!;
  const [target, setTarget] = useState<Plan | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    const p = preselect && plans.find((x) => x.id === preselect);
    if (p && p.id !== sub.plan) openChange(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openChange(plan: Plan) {
    setTarget(plan);
    setPreview(null);
    setError("");
    try {
      setPreview(await post(t, "/api/billing/preview", { plan: plan.id }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function confirmChange() {
    if (!target) return;
    setBusy(true);
    setError("");
    try {
      const r = await post(t, "/api/billing/change", { plan: target.id });
      if (r.payUrl) {
        window.location.href = r.payUrl;
        return;
      }
      setDone(t("Tu es passé(e) à l'offre {plan}. Ton nouveau quota est disponible tout de suite.", { plan: target.name }));
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
      const r = await post(t, "/api/billing/portal", { flow });
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
      await post(t, "/api/billing/resume");
      setDone(t("Ton abonnement est réactivé. Il se renouvellera normalement."));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const statusBadge = {
    active: <span className="badge bg-green-100 text-green-800">{t("Actif")}</span>,
    canceling: <span className="badge bg-amber-100 text-amber-800">{t("Résilié, actif jusqu'au {date}", { date: date(sub.periodEnd) })}</span>,
    past_due: <span className="badge bg-red-100 text-red-700">{t("Paiement en échec")}</span>,
  }[sub.state];

  return (
    <div className="space-y-8">
      {done && <p className="notice-ok">{done}</p>}
      {error && !target && !cancelOpen && <p className="notice-error">{error}</p>}

      {/* Offre actuelle */}
      <section className="card grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow-ws">{t("Offre actuelle")}</p>
            {statusBadge}
            {sub.demo && <span className="badge bg-slate-100 text-slate-500">{t("mode démo, sans paiement")}</span>}
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{current.name}</p>
          <p className="text-sm text-slate-700">
            {current.priceText} · {current.ebooksText}
          </p>
          <p className="text-sm text-slate-500">
            {sub.state === "canceling"
              ? t("Aucun nouveau prélèvement. Accès jusqu'au {date}.", { date: date(sub.periodEnd) })
              : t("Prochain renouvellement le {date}.", { date: date(sub.periodEnd) })}
          </p>
          {sub.state === "canceling" && (
            <button className="btn-primary" disabled={busy} onClick={resume}>{t("Réactiver mon abonnement")}</button>
          )}
          {sub.state === "past_due" && sub.hasPortal && (
            <button className="btn-primary" disabled={busy} onClick={() => portal("payment_method_update")}>{t("Mettre à jour ma carte")}</button>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <QuotaMeter used={usage.used} limit={usage.limit} />
          <p className="mt-3 text-xs text-slate-500">{t("Le quota repart à zéro le {date}. Les e-books non utilisés ne sont pas reportés.", { date: new Date(usage.resetsOn).toLocaleDateString(locale, { day: "numeric", month: "long" }) })}</p>
        </div>
      </section>

      {/* Changer de durée */}
      <section>
        <div className="mb-4">
          <h2 className="h2">{t("Changer de durée")}</h2>
          <p className="muted mt-1">{t("Le changement prend effet tout de suite : une nouvelle période commence avec son quota complet, et le temps non utilisé de ta période actuelle est déduit du prix.")}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.id === sub.plan;
            return (
              <div key={p.id} className={`card flex flex-col ${isCurrent ? "border-brand-600 ring-1 ring-brand-600" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold">{p.name}</p>
                  {isCurrent && <span className="badge bg-brand-50 text-brand-700">{t("Ton offre")}</span>}
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{p.priceText}</p>
                <p className="text-sm text-slate-600">{p.ebooksText}</p>
                <p className="text-xs text-slate-500">{t("Soit {prix} par e-book", { prix: p.perEbook })}</p>
                <button className={`mt-5 ${isCurrent ? "btn-secondary" : "btn-primary"}`} disabled={isCurrent || busy || sub.state === "past_due"} onClick={() => openChange(p)}>
                  {isCurrent ? t("Offre actuelle") : t("Passer à {plan}", { plan: p.name })}
                </button>
              </div>
            );
          })}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          {features.map((f) => <li key={f}><span className="text-brand-600">✓</span> {f}</li>)}
        </ul>
      </section>

      {/* Paiement */}
      <section className="card space-y-3">
        <h2 className="h2">{t("Paiement et factures")}</h2>
        {sub.hasPortal ? (
          <>
            <p className="text-sm text-slate-700">{sub.card ? t("Moyen de paiement : {carte}", { carte: sub.card }) : t("Aucun moyen de paiement enregistré.")}</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" disabled={busy} onClick={() => portal("payment_method_update")}>{t("Changer de carte")}</button>
              <button className="btn-ghost" disabled={busy} onClick={() => portal()}>{t("Adresse de facturation et historique (Stripe)")} ↗</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">{t("Mode démo : aucun paiement réel, donc ni carte ni facture. Une fois Stripe branché, tes factures apparaîtront ici.")}</p>
        )}
      </section>

      {/* Résiliation */}
      {sub.state !== "canceling" && (
        <section className="card flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="h2">{t("Résilier")}</h2>
            <p className="muted mt-1">{t("Tu gardes l'accès jusqu'au {date}. Aucun nouveau prélèvement ensuite. Tes e-books restent à toi.", { date: date(sub.periodEnd) })}</p>
          </div>
          <button className="btn-danger" onClick={() => { setCancelOpen(true); setError(""); }}>{t("Résilier mon abonnement")}</button>
        </section>
      )}

      {target && (
        <Modal onClose={() => !busy && setTarget(null)} title={t("Passer à {plan}", { plan: target.name })}>
          {!preview && !error && <p className="text-sm text-slate-500">{t("Calcul du montant…")}</p>}
          {preview?.kind === "invalid" && <p className="text-sm text-slate-700">{preview.message && t(preview.message)}</p>}
          {preview?.kind === "change" && (
            <div className="space-y-2 text-sm text-slate-700">
              <p>{t("Effet immédiat :")} <strong>{target.ebooksText}</strong>, {t("avec un quota neuf dès aujourd'hui.")}</p>
              <p>{t("À payer aujourd'hui :")} <strong className="text-slate-900">{eur(preview.dueNow ?? 0)}</strong> {sub.demo ? t("(estimation, mode démo : rien n'est prélevé)") : t("(nouveau prix, moins le temps non utilisé de ta période actuelle)")}.</p>
              <p>{t("Ensuite : {prix}, {renouvellement}", { prix: target.priceText, renouvellement: target.renewText })}{preview.nextDate ? ", " + t("à partir du {date}", { date: date(preview.nextDate) }) : ""}.</p>
            </div>
          )}
          {error && <p className="notice-error mt-3">{error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button className="btn-ghost" disabled={busy} onClick={() => setTarget(null)}>{t("Annuler")}</button>
            {preview?.kind === "change" && (
              <button className="btn-primary" disabled={busy} onClick={confirmChange}>{busy ? t("Un instant…") : preview.dueNow ? t("Confirmer et payer {prix}", { prix: eur(preview.dueNow) }) : t("Confirmer")}</button>
            )}
          </div>
        </Modal>
      )}

      {cancelOpen && (
        <CancelModal
          sub={sub}
          lower={plans.filter((p) => p.price < current.price)[0] ?? null}
          onClose={() => setCancelOpen(false)}
          onDowngrade={(p) => { setCancelOpen(false); openChange(p); }}
          onDone={() => { setCancelOpen(false); setDone(t("Résiliation enregistrée. Tu gardes l'accès jusqu'au {date}, sans nouveau prélèvement.", { date: date(sub.periodEnd) })); router.refresh(); }}
        />
      )}
    </div>
  );
}

function CancelModal({ sub, lower, onClose, onDowngrade, onDone }: { sub: Sub; lower: Plan | null; onClose: () => void; onDowngrade: (p: Plan) => void; onDone: () => void }) {
  const t = useT();
  const { date } = useFormats();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal onClose={() => !busy && onClose()} title={t("Résilier mon abonnement")}>
      <div className="space-y-4 text-sm text-slate-700">
        <ul className="space-y-1.5">
          <li>• {t("Accès complet jusqu'au {date}.", { date: date(sub.periodEnd) })}</li>
          <li>• {t("Aucun nouveau prélèvement après cette date.")}</li>
          <li>• {t("La période en cours n'est pas remboursée (voir CGV).")}</li>
          <li>• {t("Tes e-books et PDF restent consultables et téléchargeables.")}</li>
          <li>• {t("Tu peux changer d'avis et réactiver jusqu'au dernier jour.")}</li>
        </ul>
        {lower && (
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3">
            <p>{t("Besoin de moins d'e-books ? Tu peux passer à l'offre {plan} ({quota}, {prix}) au lieu d'arrêter.", { plan: lower.name, quota: lower.ebooksText, prix: lower.priceText })}</p>
            <button className="btn-secondary mt-2" onClick={() => onDowngrade(lower)}>{t("Passer à {plan}", { plan: lower.name })}</button>
          </div>
        )}
        <fieldset>
          <legend className="label">{t("Pourquoi pars-tu ? (facultatif, ça nous aide à améliorer l'outil)")}</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {REASONS.map(([k, l]) => (
              <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${reason === k ? "border-brand-600 bg-brand-50" : "border-slate-200"}`}>
                <input type="radio" name="reason" value={k} checked={reason === k} onChange={() => setReason(k)} className="accent-white" /> {t(l)}
              </label>
            ))}
          </div>
        </fieldset>
        <textarea className="input min-h-20" placeholder={t("Un commentaire ? (facultatif)")} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
        {error && <p className="notice-error">{error}</p>}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button className="btn-secondary" disabled={busy} onClick={onClose}>{t("Garder mon abonnement")}</button>
        <button
          className="btn-danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await post(t, "/api/billing/cancel", { reason: reason || "other", comment });
              onDone();
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          {busy ? t("Un instant…") : t("Confirmer la résiliation")}
        </button>
      </div>
    </Modal>
  );
}
