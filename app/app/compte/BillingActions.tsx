"use client";
export default function BillingActions({ demo, hasStripe, active }: { demo: boolean; hasStripe: boolean; active: boolean }) {
  if (hasStripe)
    return (
      <button
        className="btn-secondary"
        onClick={async () => {
          const r = await fetch("/api/billing/portal", { method: "POST" });
          const d = await r.json();
          if (d.url) window.location.href = d.url;
          else alert(d.error);
        }}
      >
        Gérer la facturation / résilier
      </button>
    );
  if (demo && active)
    return (
      <button
        className="btn-danger"
        onClick={async () => {
          await fetch("/api/billing/cancel", { method: "POST" });
          window.location.reload();
        }}
      >
        Résilier (démo)
      </button>
    );
  return null;
}
