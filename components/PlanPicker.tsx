"use client";
import { useState } from "react";
import Link from "next/link";
import type { Plan } from "@/lib/config";

export default function PlanPicker({ plans, loggedIn, currentPlan }: { plans: Plan[]; loggedIn: boolean; currentPlan: string | null }) {
  const [waiver, setWaiver] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function subscribe(plan: string) {
    setError("");
    setLoading(plan);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, waiver }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) return setError(data.error || "Erreur");
    window.location.href = data.url;
  }

  return (
    <div className="mt-8">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`card flex flex-col ${p.highlight ? "border-brand-600 ring-2 ring-brand-100" : ""}`}>
            {p.highlight && <span className="badge mb-2 w-fit bg-brand-600 text-white">Le plus choisi</span>}
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-3xl font-bold">{p.priceEur} €<span className="text-sm font-normal text-slate-500"> / mois TTC</span></p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-700">
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            {!loggedIn ? (
              <Link href="/inscription" className="btn-primary mt-4">Créer un compte</Link>
            ) : currentPlan === p.id ? (
              <span className="btn-secondary mt-4">Offre actuelle</span>
            ) : (
              <button className="btn-primary mt-4" disabled={!waiver || loading !== null} onClick={() => subscribe(p.id)}>
                {loading === p.id ? "…" : "S'abonner"}
              </button>
            )}
          </div>
        ))}
      </div>
      {loggedIn && (
        <label className="mx-auto mt-6 flex max-w-2xl items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" className="mt-1" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
          <span>
            Je demande l'accès immédiat au service et je reconnais renoncer à mon droit de rétractation de 14 jours dès le début de l'exécution (art. L221-28 du Code de la consommation). J'ai lu les <Link href="/cgv" className="underline" target="_blank">CGV</Link>.
          </span>
        </label>
      )}
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
