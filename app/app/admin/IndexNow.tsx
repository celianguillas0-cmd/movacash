"use client";
import { useState } from "react";

// Bouton « Signaler les pages aux moteurs » (IndexNow : Bing, et donc ChatGPT et Copilot ; Google lit le sitemap).
export default function IndexNow() {
  const [etat, setEtat] = useState<{ busy?: boolean; msg?: string; ok?: boolean }>({});
  async function envoyer() {
    setEtat({ busy: true });
    const r = await fetch("/api/admin/indexnow", { method: "POST" });
    const d = await r.json().catch(() => ({}));
    setEtat(r.ok ? { ok: true, msg: `${d.envoyees} pages signalées.` } : { ok: false, msg: d.error || "Envoi impossible." });
  }
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold text-slate-900">Référencement</h2>
      <p className="mt-1 text-sm text-slate-600">Après l'ajout de pages ou de guides, signale-les à Bing (qui alimente la recherche de ChatGPT et Copilot). Google, lui, lit le sitemap tout seul.</p>
      <button type="button" className="btn-primary mt-4" disabled={etat.busy} onClick={envoyer}>{etat.busy ? "Envoi…" : "Signaler toutes les pages"}</button>
      {etat.msg && <p className={`mt-3 text-sm ${etat.ok ? "text-slate-900" : "text-red-600"}`}>{etat.msg}</p>}
    </section>
  );
}
