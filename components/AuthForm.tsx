"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", acceptTerms: false });
  const [hasQuiz, setHasQuiz] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const q = JSON.parse(localStorage.getItem("mc_quiz") || "null");
      if (q) {
        setHasQuiz(true);
        if (q.answers?.name) setForm((f) => ({ ...f, name: f.name || q.answers.name }));
      }
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    let quiz: unknown = undefined;
    try {
      quiz = JSON.parse(localStorage.getItem("mc_quiz") || "null") || undefined;
    } catch {}
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quiz }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Une erreur est survenue, réessaie.");
    router.push(mode === "signup" ? (hasQuiz ? "/resultats" : "/tarifs") : "/app");
    router.refresh();
  }

  return (
    <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
      <p className="eyebrow">{mode === "signup" ? (hasQuiz ? "Dernière étape" : "Créer un compte") : "Connexion"}</p>
      <h1 className="q-title" style={{ marginTop: 12 }}>
        {mode === "signup" ? (
          hasQuiz ? <>Tes 3 idées sont prêtes. <em className="serif">Crée ton compte</em> pour les voir.</> : <>Crée ton <em className="serif">atelier d'e-books.</em></>
        ) : (
          <>Content de <em className="serif">te revoir.</em></>
        )}
      </h1>
      {mode === "signup" && (
        <p className="q-help">On te demande juste ton prénom, ton e-mail et un mot de passe, pour retrouver tes réponses, tes idées et tes e-books. Pas de revente de données.</p>
      )}
      <form className="form" onSubmit={submit}>
        {mode === "signup" && (
          <label htmlFor="f-name">Prénom
            <input id="f-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        )}
        <label htmlFor="f-email">E-mail
          <input id="f-email" type="email" required autoComplete="email" placeholder="toi@exemple.fr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label htmlFor="f-pass">Mot de passe
          <input id="f-pass" type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : 1} placeholder={mode === "signup" ? "8 caractères minimum" : ""} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {mode === "signup" && (
          <label className="check" htmlFor="f-cgv">
            <input id="f-cgv" type="checkbox" checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} />
            <span>
              J'accepte les <Link href="/cgv" target="_blank" style={{ textDecoration: "underline" }}>CGV</Link> et la <Link href="/confidentialite" target="_blank" style={{ textDecoration: "underline" }}>politique de confidentialité</Link>, et je comprends qu'aucun revenu n'est garanti.
            </span>
          </label>
        )}
        {mode === "login" && (
          <p className="dim" style={{ textAlign: "right", marginTop: -6 }}><Link href="/mot-de-passe" style={{ textDecoration: "underline" }}>Mot de passe oublié ?</Link></p>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-accent btn-lg" disabled={loading || (mode === "signup" && !form.acceptTerms)}>
          {loading ? "Un instant…" : mode === "signup" ? (hasQuiz ? "Voir mes 3 idées →" : "Créer mon compte →") : "Se connecter"}
        </button>
        <p className="dim" style={{ textAlign: "center" }}>
          {mode === "signup" ? (
            <>Déjà un compte ? <Link href="/connexion" style={{ textDecoration: "underline" }}>Se connecter</Link></>
          ) : (
            <>Pas encore de compte ? <Link href="/quiz" style={{ textDecoration: "underline" }}>Trouver mes idées</Link></>
          )}
        </p>
      </form>
    </main>
  );
}
