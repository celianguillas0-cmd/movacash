"use client";
import { useState } from "react";
import Link from "next/link";
import { eur } from "@/lib/config";

type P = { id: string; name: string; monthly: number; annual: number; ebooks: number; features: string[]; highlight: boolean };

export default function Paywall({ plans, loggedIn, currentPlan }: { plans: P[]; loggedIn: boolean; currentPlan: string | null }) {
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
      return setError(data.error || "Le paiement n'a pas pu démarrer. Réessaie.");
    }
    window.location.href = data.url;
  }

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <div className="toggle" role="tablist">
          <button type="button" className={annual ? "" : "on"} onClick={() => setAnnual(false)}>Mensuel</button>
          <button type="button" className={annual ? "on" : ""} onClick={() => setAnnual(true)}>Annuel<span className="save">−{save} %</span></button>
        </div>
      </div>
      <div className="plans">
        {plans.map((p) => (
          <button type="button" key={p.id} className={`plan ${p.id === plan ? "selected" : ""}`} onClick={() => setPlan(p.id)}>
            {p.highlight && <span className="tag">Le plus choisi</span>}
            <h3>{p.name}</h3>
            <div>
              <div className="price">{eur(price(p))} €<small> / mois</small></div>
              <div className="per">{annual ? `facturé ${eur(Math.round(price(p) * 1200) / 100)} € par an` : "facturé chaque mois, résiliable à tout moment"}</div>
            </div>
            <div className="dim">Soit {(price(p) / p.ebooks).toFixed(2).replace(".", ",")} € par e-book</div>
            <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            {currentPlan === p.id && <span className="dim">Ton offre actuelle</span>}
          </button>
        ))}
      </div>
      <div className="pay-box">
        <div className="pay-row">
          <span>Offre <b>{sel.name}</b> · {annual ? "annuelle" : "mensuelle"}</span>
          <b style={{ fontSize: 20 }}>{eur(annual ? Math.round(price(sel) * 1200) / 100 : price(sel))} €</b>
        </div>
        {loggedIn ? (
          <>
            <label className="check" htmlFor="waiver">
              <input id="waiver" type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
              <span>Je demande l'accès immédiat au service et je renonce à mon droit de rétractation de 14 jours dès le début de l'exécution. J'ai lu les <Link href="/cgv" target="_blank" style={{ textDecoration: "underline" }}>CGV</Link>.</span>
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" className="btn btn-accent btn-lg" disabled={!waiver || loading} onClick={pay}>
              {loading ? "Redirection vers le paiement…" : "Payer et accéder à mon atelier →"}
            </button>
          </>
        ) : (
          <Link className="btn btn-accent btn-lg" href="/inscription">Créer mon compte pour continuer →</Link>
        )}
        <p className="pay-legal">
          Paiement sécurisé par Stripe. TVA non applicable, art. 293 B du CGI. Renouvellement automatique, résiliation en 1 clic depuis ton compte, effective à la fin de la période payée. Aucun remboursement d'une période entamée. Movacash est un outil : aucun revenu n'est garanti.
        </p>
      </div>
    </>
  );
}
