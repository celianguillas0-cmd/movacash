"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuotaMeter from "@/components/ws/QuotaMeter";
import Modal from "@/components/ws/Modal";
import { useLocale, useT } from "@/lib/i18n/client";
import { fmtEur, tk, type T } from "@/lib/i18n/t";

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

// Montants et dates au format de la langue du visiteur
function useFormats() {
  const locale = useLocale();
  return {
    eur: (n: number) => fmtEur(n, locale),
    date: (s: number | null) => (s ? new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "—"),
    locale,
  };
}
const yearly = (p: Plan) => Math.round(p.annual * 1200) / 100;

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

export default function SubscriptionManager({ plans, sub, usage, annualAvailable, preselect }: {
  plans: Plan[];
  sub: Sub;
  usage: { used: number; limit: number; resetsOn: string };
  annualAvailable: boolean;
  preselect: { plan: string; annual: boolean } | null;
}) {
  const router = useRouter();
  const t = useT();
  const { eur, date, locale } = useFormats();
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
      setPreview(await post(t, "/api/billing/preview", { plan: plan.id, annual: isAnnual }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function confirmChange() {
    if (!target) return;
    setBusy(true);
    setError("");
    try {
      const r = await post(t, "/api/billing/change", { plan: target.plan.id, annual: target.annual });
      if (r.payUrl) {
        window.location.href = r.payUrl;
        return;
      }
      setDone(r.kind === "upgrade" ? t("Tu es passé(e) à l'offre {plan}. Ton nouveau quota est disponible tout de suite.", { plan: target.plan.name }) : t("C'est noté : l'offre {plan} prendra effet au prochain renouvellement.", { plan: target.plan.name }));
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

  const price = sub.annual ? t("{prix} / an", { prix: eur(yearly(current)) }) : t("{prix} / mois", { prix: eur(current.monthly) });
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
            {price} · {t("{n} e-books par mois", { n: current.ebooks })}
          </p>
          <p className="text-sm text-slate-500">
            {sub.state === "canceling"
              ? t("Aucun nouveau prélèvement. Accès jusqu'au {date}.", { date: date(sub.periodEnd) })
              : t("Prochain renouvellement le {date}.", { date: date(sub.periodEnd) })}
          </p>
          {sub.heldPlan && <p className="text-sm text-slate-500">{t("Tu gardes le quota de l'offre {plan} jusqu'au {date}.", { plan: sub.heldPlan, date: date(sub.heldUntil) })}</p>}
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

      {/* Changer d'offre */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="h2">{t("Changer d'offre")}</h2>
            <p className="muted mt-1">{t("Offre supérieure : effet immédiat, tu paies seulement la différence au prorata. Offre inférieure : effet au prochain renouvellement.")}</p>
          </div>
          {annualAvailable && !sub.annual && (
            <div className="flex rounded-full border border-slate-300 bg-slate-100 p-1 text-sm" role="group" aria-label={t("Fréquence de facturation")}>
              <button className={`rounded-full px-4 py-1.5 ${!annual ? "bg-slate-300 font-semibold text-slate-900" : "text-slate-600"}`} onClick={() => setAnnual(false)}>{t("Mensuel")}</button>
              <button className={`rounded-full px-4 py-1.5 ${annual ? "bg-slate-300 font-semibold text-slate-900" : "text-slate-600"}`} onClick={() => setAnnual(true)}>{t("Annuel")} <span className="text-brand-700">−{Math.round((1 - plans[0].annual / plans[0].monthly) * 100)} %</span></button>
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
                  <p className="text-xl font-bold">{p.name}</p>
                  {isCurrent && <span className="badge bg-brand-50 text-brand-700">{t("Ton offre")}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="text-3xl font-extrabold text-slate-900">{eur(annual ? p.annual : p.monthly)}</span> {t("/ mois")}
                </p>
                <p className="text-xs text-slate-500">{annual ? t("soit {prix} par an", { prix: eur(yearly(p)) }) : t("sans engagement")}</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-600">
                  {p.features.map((f) => <li key={f}><span className="text-brand-600">✓</span> {t(f)}</li>)}
                </ul>
                <button
                  className={`mt-5 ${up ? "btn-primary" : "btn-secondary"}`}
                  disabled={isCurrent || busy || sub.state === "past_due"}
                  onClick={() => openChange(p, annual)}
                >
                  {isCurrent ? t("Offre actuelle") : t("Passer à {plan}", { plan: p.name })}
                </button>
              </div>
            );
          })}
        </div>
        {sub.annual && <p className="muted mt-3">{t("Tu es en facturation annuelle. Pour repasser au mensuel, résilie : à la fin de ta période, tu pourras reprendre l'offre mensuelle de ton choix.")}</p>}
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
        <Modal onClose={() => !busy && setTarget(null)} title={target.annual && !sub.annual ? t("Passer à {plan} (annuel)", { plan: target.plan.name }) : t("Passer à {plan}", { plan: target.plan.name })}>
          {!preview && !error && <p className="text-sm text-slate-500">{t("Calcul du montant…")}</p>}
          {preview?.kind === "invalid" && <p className="text-sm text-slate-700">{preview.message && t(preview.message)}</p>}
          {preview?.kind === "upgrade" && (
            <div className="space-y-2 text-sm text-slate-700">
              <p>{t("Effet immédiat :")} <strong>{t("{n} e-books par mois", { n: target.plan.ebooks })}</strong> {t("dès maintenant.")}</p>
              <p>{t("À payer aujourd'hui :")} <strong className="text-slate-900">{eur(preview.dueNow ?? 0)}</strong> {sub.demo ? t("(estimation, mode démo : rien n'est prélevé)") : t("(différence au prorata du temps restant)")}.</p>
              <p>{target.annual ? t("Ensuite : {prix} par an", { prix: eur(preview.nextAmount) }) : t("Ensuite : {prix} par mois", { prix: eur(preview.nextAmount) })}{preview.nextDate ? " " + t("à partir du {date}", { date: date(preview.nextDate) }) : ""}.</p>
            </div>
          )}
          {preview?.kind === "downgrade" && (
            <div className="space-y-2 text-sm text-slate-700">
              <p>{t("Rien à payer aujourd'hui, et pas de remboursement de la période en cours.")}</p>
              <p>{t("Tu gardes ton quota actuel ({n} e-books par mois) jusqu'au {date}.", { n: current.ebooks, date: date(sub.periodEnd) })}</p>
              <p>{target.annual ? t("Ensuite : {prix} par an pour {n} e-books par mois.", { prix: eur(preview.nextAmount), n: target.plan.ebooks }) : t("Ensuite : {prix} par mois pour {n} e-books par mois.", { prix: eur(preview.nextAmount), n: target.plan.ebooks })}</p>
            </div>
          )}
          {error && <p className="notice-error mt-3">{error}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button className="btn-ghost" disabled={busy} onClick={() => setTarget(null)}>{t("Annuler")}</button>
            {preview && preview.kind !== "invalid" && preview.kind !== "same" && (
              <button className="btn-primary" disabled={busy} onClick={confirmChange}>{busy ? t("Un instant…") : preview.kind === "upgrade" ? (preview.dueNow ? t("Confirmer et payer {prix}", { prix: eur(preview.dueNow) }) : t("Confirmer")) : t("Confirmer le changement")}</button>
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
          onDone={() => { setCancelOpen(false); setDone(t("Résiliation enregistrée. Tu gardes l'accès jusqu'au {date}, sans nouveau prélèvement.", { date: date(sub.periodEnd) })); router.refresh(); }}
        />
      )}
    </div>
  );
}

function CancelModal({ sub, lower, onClose, onDowngrade, onDone }: { sub: Sub; lower: Plan | null; onClose: () => void; onDowngrade: (p: Plan) => void; onDone: () => void }) {
  const t = useT();
  const { eur, date } = useFormats();
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
            <p>{t("Besoin de moins d'e-books ? Tu peux passer à {plan} ({n} e-books, {prix} par mois) au lieu d'arrêter.", { plan: lower.name, n: lower.ebooks, prix: eur(lower.monthly) })}</p>
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
