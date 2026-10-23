"use client";
import { useState } from "react";
import Link from "next/link";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ loading: boolean; sent: boolean; error: string; devLink?: string }>({ loading: false, sent: false, error: "" });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ loading: true, sent: false, error: "" });
    const r = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const d = await r.json().catch(() => ({}));
    setState(r.ok ? { loading: false, sent: true, error: "", devLink: d.devLink } : { loading: false, sent: false, error: d.error || "Une erreur est survenue." });
  }
  return (
    <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
      <p className="eyebrow">Mot de passe oublié</p>
      <h1 className="q-title" style={{ marginTop: 12 }}>On t'envoie <em className="serif">un lien.</em></h1>
      {state.sent ? (
        <div className="form">
          <p className="q-help">Si un compte existe avec l'adresse {email}, tu vas recevoir un e-mail avec un lien valable 1 heure. Pense à regarder dans les spams.</p>
          {state.devLink && (
            <p className="dim">Mode test (aucun service d'e-mail configuré) : <a href={state.devLink} style={{ textDecoration: "underline" }}>ouvrir le lien de réinitialisation</a></p>
          )}
          <Link className="btn btn-ghost" href="/connexion">Retour à la connexion</Link>
        </div>
      ) : (
        <form className="form" onSubmit={submit}>
          <label htmlFor="f-email">E-mail du compte
            <input id="f-email" type="email" required placeholder="toi@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {state.error && <p className="error">{state.error}</p>}
          <button className="btn btn-accent btn-lg" disabled={state.loading}>{state.loading ? "Envoi…" : "Recevoir le lien"}</button>
          <p className="dim" style={{ textAlign: "center" }}><Link href="/connexion" style={{ textDecoration: "underline" }}>Retour à la connexion</Link></p>
        </form>
      )}
    </main>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [state, setState] = useState({ loading: false, error: "" });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return setState({ loading: false, error: "Les deux mots de passe ne sont pas identiques." });
    setState({ loading: true, error: "" });
    const r = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: pw.next }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setState({ loading: false, error: d.error || "Une erreur est survenue." });
    window.location.href = "/app";
  }
  return (
    <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
      <p className="eyebrow">Nouveau mot de passe</p>
      <h1 className="q-title" style={{ marginTop: 12 }}>Choisis ton <em className="serif">nouveau mot de passe.</em></h1>
      {!token ? (
        <p className="q-help">Lien incomplet. <Link href="/mot-de-passe" style={{ textDecoration: "underline" }}>Refais une demande</Link>.</p>
      ) : (
        <form className="form" onSubmit={submit}>
          <label htmlFor="f-new">Nouveau mot de passe
            <input id="f-new" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </label>
          <label htmlFor="f-conf">Confirmation
            <input id="f-conf" type="password" required minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </label>
          {state.error && <p className="error">{state.error} {state.error.includes("expiré") && <Link href="/mot-de-passe" style={{ textDecoration: "underline" }}>Nouvelle demande</Link>}</p>}
          <button className="btn btn-accent btn-lg" disabled={state.loading}>{state.loading ? "Un instant…" : "Enregistrer et me connecter"}</button>
        </form>
      )}
    </main>
  );
}
