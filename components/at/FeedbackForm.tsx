"use client";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

// « Ton avis » : une note facultative et un message, envoyés à l'équipe.
export default function FeedbackForm() {
  const t = useT();
  const [note, setNote] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"" | "envoi" | "ok">("");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("envoi");
    setError("");
    const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: note ?? undefined, message }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setState(""); return setError(t(d.error || "Envoi impossible pour le moment.")); }
    setState("ok");
    setMessage("");
    setNote(null);
  }

  if (state === "ok") return <p className="at-dim">{t("Merci, ton avis est bien arrivé. On lit chaque message.")}</p>;
  return (
    <form onSubmit={send}>
      <p className="at-dim" style={{ fontSize: 14 }}>{t("Une idée, un bug, une page pas claire ? Dis-le-nous, c'est comme ça que l'outil s'améliore.")}</p>
      <div style={{ display: "flex", gap: 8, margin: "14px 0" }} role="group" aria-label={t("Ta note sur 5")}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" className="at-cible" aria-pressed={note === n} onClick={() => setNote(note === n ? null : n)} style={{ width: 46, textAlign: "center", padding: "9px 0" }}>
            <b>{n}</b>
          </button>
        ))}
      </div>
      <textarea className="input min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("Ton message…")} maxLength={3000} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button className="at-btn" style={{ marginTop: 12 }} disabled={state === "envoi" || message.trim().length < 3}>{state === "envoi" ? t("Envoi…") : t("Envoyer mon avis")}</button>
    </form>
  );
}
