"use client";
import { useState } from "react";

export default function FilmModeToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/admin/tournage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !on }) });
    if (res.ok) setOn(!on);
    setBusy(false);
  }
  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
      <div className="max-w-xl">
        <h2 className="text-lg font-bold text-slate-900">Mode tournage {on ? <span className="badge ml-2 bg-slate-900 text-white">activé</span> : null}</h2>
        <p className="muted mt-1 text-sm">
          Pour filmer tes vidéos : l'écran de génération se déroule normalement, mais rien n'est envoyé à l'API et ton quota n'est pas touché. Le contenu affiché est un texte d'exemple. Coupe-le pour générer un vrai e-book.
        </p>
      </div>
      <button className={on ? "btn-primary" : "btn-secondary"} onClick={toggle} disabled={busy}>
        {on ? "Couper le mode tournage" : "Activer le mode tournage"}
      </button>
    </section>
  );
}
