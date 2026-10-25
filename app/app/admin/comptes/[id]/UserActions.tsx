"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props { id: number; self: boolean; banned: boolean; quotaOverride: number | null; planLimit: number; offered: boolean; payingStripe: boolean }

// Actions de l'admin sur un compte : limite d'e-books, formule offerte, suspension.
export default function UserActions(p: Props) {
  const router = useRouter();
  const [quota, setQuota] = useState(p.quotaOverride != null ? String(p.quotaOverride) : "");
  const [plan, setPlan] = useState("starter");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  async function act(body: object, okText: string) {
    setBusy(true);
    setMsg(null);
    const r = await fetch(`/api/admin/users/${p.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    setMsg(r.ok ? { ok: true, t: okText } : { ok: false, t: d.error || "Action impossible." });
    if (r.ok) router.refresh();
  }

  return (
    <section className="card space-y-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Limite d&apos;e-books par mois</h2>
        <p className="muted mt-1 text-sm">Vide = la limite de sa formule ({p.planLimit}). Mets 0 pour bloquer ses générations sans le suspendre.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="input w-32" inputMode="numeric" value={quota} onChange={(e) => setQuota(e.target.value.replace(/\D/g, ""))} placeholder={String(p.planLimit)} aria-label="Limite d'e-books" />
          <button className="at-btn" disabled={busy} onClick={() => act({ action: "quota", value: quota === "" ? null : Number(quota) }, quota === "" ? "Limite de la formule rétablie." : `Limite fixée à ${quota} e-books par mois.`)}>Enregistrer</button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Formule offerte</h2>
        {p.payingStripe ? (
          <p className="muted mt-1 text-sm">Ce compte paie son abonnement par Stripe : la formule se gère de son côté (ou dans ton tableau Stripe).</p>
        ) : p.offered ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm">Ce compte a une formule offerte (sans paiement).</p>
            {!p.self && <button className="btn-secondary" disabled={busy} onClick={() => act({ action: "unoffer" }, "Formule offerte retirée.")}>Retirer la formule</button>}
          </div>
        ) : (
          <>
            <p className="muted mt-1 text-sm">Pour un testeur ou un partenaire : la formule s&apos;active sans paiement et se renouvelle tant que tu ne la retires pas.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <select className="input w-44" value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Formule">
                <option value="starter">Starter</option><option value="pro">Pro</option><option value="business">Business</option>
              </select>
              <button className="at-btn" disabled={busy} onClick={() => act({ action: "offer", plan }, "Formule offerte activée.")}>Offrir</button>
            </div>
          </>
        )}
      </div>

      {!p.self && (
        <div>
          <h2 className="text-lg font-bold text-slate-900">Suspension</h2>
          {p.banned ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-sm">Compte suspendu : il ne peut plus se connecter ni générer.</p>
              <button className="btn-secondary" disabled={busy} onClick={() => act({ action: "unban" }, "Compte réactivé.")}>Réactiver le compte</button>
            </div>
          ) : (
            <>
              <p className="muted mt-1 text-sm">Il est déconnecté tout de suite et ne peut plus se reconnecter. Ses e-books sont conservés, et tu peux le réactiver quand tu veux. Pense à résilier son abonnement Stripe s&apos;il en a un.</p>
              <button className="btn-danger mt-3" disabled={busy} onClick={() => window.confirm("Suspendre ce compte ?") && act({ action: "ban" }, "Compte suspendu.")}>Suspendre le compte</button>
            </>
          )}
        </div>
      )}
      {msg && <p className={`text-sm ${msg.ok ? "text-slate-900" : "text-red-600"}`} role="status">{msg.t}</p>}
    </section>
  );
}
