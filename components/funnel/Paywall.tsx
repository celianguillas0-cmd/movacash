"use client";
import { useState } from "react";
import Link from "next/link";
import { rich } from "@/lib/i18n/rich";
import { useLocale, useT } from "@/lib/i18n/client";
import { fmtEur } from "@/lib/i18n/t";

type P = { id: string; name: string; monthly: number; annual: number; ebooks: number; features: string[]; highlight: boolean };

export default function Paywall({ plans, loggedIn, currentPlan, annualAvailable = true }: { plans: P[]; loggedIn: boolean; currentPlan: string | null; annualAvailable?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const money = (n: number) => fmtEur(n, locale);
  // Mensuel par défaut ; l'annuel (−50 %) est mis en avant par le badge, l'astuce et le prix rappelé sur chaque offre
  const [annual, setAnnual] = useState(false);
  const [plan, setPlan] = useState(plans.find((p) => p.highlight)?.id || plans[0].id);
  const [waiver, setWaiver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sel = plans.find((p) => p.id === plan)!;
  const price = (p: P) => (annual ? p.annual : p.monthly);
  const save = Math.round((1 - plans[1].annual / plans[1].monthly) * 100);

  async function pay() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, annual, waiver }) });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error || t("Le paiement n'a pas pu démarrer. Réessaie."));
    }
    window.location.href = data.url;
  }

  return (
    <>
      {annualAvailable && <div style={{ textAlign: "center" }}>
        <div className="toggle" role="tablist">
          <button type="button" className={annual ? "" : "on"} onClick={() => setAnnual(false)}>{t("Mensuel")}</button>
          <button type="button" className={annual ? "on" : ""} onClick={() => setAnnual(true)}>{t("Annuel")}<span className="save">−{save} %</span></button>
        </div>
        {!annual && <div><button type="button" className="annual-nudge" onClick={() => setAnnual(true)}>{t("Passe à l'annuel et paie {n} % moins cher", { n: save })} →</button></div>}
      </div>}
      <div className="plans">
        {plans.map((p) => (
          <button type="button" key={p.id} className={`plan ${p.id === plan ? "selected" : ""}`} onClick={() => setPlan(p.id)}>
            {p.highlight && <span className="tag">{t("Recommandé")}</span>}
            <h3>{p.name}</h3>
            <div>
              <div className="price">{annual && <s className="price-old">{money(p.monthly)}</s>}{money(price(p))}<small> / {t("mois")}</small></div>
              <div className="per">{annual ? t("facturé {prix} par an", { prix: money(Math.round(price(p) * 1200) / 100) }) : t("facturé chaque mois, résiliable à tout moment")}</div>
              {!annual && annualAvailable && <div className="annual-hint">{t("ou {prix} / mois en annuel", { prix: money(p.annual) })} <b>−{save} %</b></div>}
              {annual && <div className="save-line">{t("tu économises {prix}", { prix: money(Math.round((p.monthly * 12 - Math.round(p.annual * 1200) / 100) * 100) / 100) })}</div>}
            </div>
            <div className="dim">{t("Soit {prix} par e-book", { prix: fmtEur(Math.round((price(p) / p.ebooks) * 100) / 100, locale) })}</div>
            <ul>{p.features.map((f) => <li key={f}>{t(f)}</li>)}</ul>
            {currentPlan === p.id && <span className="dim">{t("Ton offre actuelle")}</span>}
          </button>
        ))}
      </div>
      <div className="pay-box">
        <div className="pay-row">
          <span>{t("Offre")} <b>{sel.name}</b> · {annual ? t("annuelle") : t("mensuelle")}</span>
          <b style={{ fontSize: 20 }}>{money(annual ? Math.round(price(sel) * 1200) / 100 : price(sel))}</b>
        </div>
        {currentPlan ? (
          <>
            <p className="dim">{t("Tu es déjà abonné(e). Le changement d'offre se fait depuis ton espace : offre supérieure tout de suite (différence au prorata), offre inférieure au prochain renouvellement.")}</p>
            <Link className="btn btn-accent btn-lg" href={`/app/abonnement?plan=${plan}${annual ? "&annual=1" : ""}`}>
              {currentPlan === plan ? t("Gérer mon abonnement") + " →" : t("Passer à {offre}", { offre: sel.name }) + " →"}
            </Link>
          </>
        ) : loggedIn ? (
          <>
            <label className="check" htmlFor="waiver">
              <input id="waiver" type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
              <span>{rich(t("Je demande l'accès immédiat au service et je comprends que je perds mon droit de rétractation de 14 jours dès que je crée mon premier e-book. J'ai lu les <1>CGV</1>."), { 1: (s) => <Link href="/cgv" target="_blank" style={{ textDecoration: "underline" }}>{s}</Link> })}</span>
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" className="btn btn-accent btn-lg" disabled={!waiver || loading} onClick={pay}>
              {loading ? t("Redirection vers le paiement…") : t("Payer et accéder à mon atelier") + " →"}
            </button>
          </>
        ) : (
          <Link className="btn btn-accent btn-lg" href="/inscription">{t("Créer mon compte pour continuer")} →</Link>
        )}
        <p className="pay-legal">
          {t("Paiement sécurisé par Stripe. TVA non applicable, art. 293 B du CGI. Renouvellement automatique, résiliation en 1 clic depuis ton compte, effective à la fin de la période payée. Aucun remboursement d'une période entamée. Movacash est un outil : aucun revenu n'est garanti.")}
        </p>
      </div>
    </>
  );
}
