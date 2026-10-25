"use client";
import { useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import type { PlanView as P } from "@/lib/planView";

export default function Paywall({ plans, features, loggedIn, currentPlan }: { plans: P[]; features: string[]; loggedIn: boolean; currentPlan: string | null }) {
  const t = useT();
  const [plan, setPlan] = useState(plans.find((p) => p.highlight)?.id || plans[0].id);
  const [waiver, setWaiver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sel = plans.find((p) => p.id === plan)!;

  async function pay() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, waiver }) });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error || t("Le paiement n'a pas pu démarrer. Réessaie."));
    }
    window.location.href = data.url;
  }

  return (
    <>
      <div className="plans">
        {plans.map((p) => (
          <button type="button" key={p.id} className={`plan ${p.id === plan ? "selected" : ""}`} onClick={() => setPlan(p.id)}>
            {p.highlight && <span className="tag">{t("Recommandé")}</span>}
            <h3>{p.name}</h3>
            <div>
              <div className="price">{p.priceText}</div>
              <div className="per">{p.ebooksText}</div>
            </div>
            <div className="dim">{t("Soit {prix} par e-book", { prix: p.perEbook })}</div>
            <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
            {currentPlan === p.id && <span className="dim">{t("Ton offre actuelle")}</span>}
          </button>
        ))}
      </div>
      <div className="pay-box">
        <div className="pay-row">
          <span>{t("Offre")} <b>{sel.name}</b> · {sel.renewText}</span>
          <b style={{ fontSize: 20 }}>{sel.priceText}</b>
        </div>
        {currentPlan ? (
          <>
            <p className="dim">{t("Tu es déjà abonné(e). Tu peux changer de durée depuis ton espace, rubrique Abonnement.")}</p>
            <Link className="btn btn-accent btn-lg" href={`/app/abonnement?plan=${plan}`}>
              {currentPlan === plan ? t("Gérer mon abonnement") + " →" : t("Passer à {offre}", { offre: sel.name }) + " →"}
            </Link>
          </>
        ) : loggedIn ? (
          <>
            <label className="check" htmlFor="waiver">
              <input id="waiver" type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
              <span>{t("Je demande l'accès immédiat au service et je comprends que je perds mon droit de rétractation de 14 jours dès que je crée mon premier e-book. J'ai lu les")} <Link href="/cgv" target="_blank" style={{ textDecoration: "underline" }}>{t("CGV")}</Link>.</span>
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
