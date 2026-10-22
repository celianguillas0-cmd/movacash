"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", name: "", acceptTerms: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!res.ok) return setError(data.error || "Erreur");
    router.push(mode === "signup" ? "/tarifs" : "/app");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-10 max-w-md space-y-4">
      <h1 className="text-xl font-bold">{mode === "signup" ? "Créer un compte" : "Connexion"}</h1>
      {mode === "signup" && (
        <div>
          <label className="label">Nom ou nom d'auteur</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
      )}
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className="label">Mot de passe</label>
        <input className="input" type="password" required minLength={mode === "signup" ? 8 : 1} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      {mode === "signup" && (
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" className="mt-1" checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} />
          <span>
            J'accepte les <Link href="/cgv" className="underline" target="_blank">CGV</Link> et la <Link href="/confidentialite" className="underline" target="_blank">politique de confidentialité</Link>, et je comprends qu'aucun revenu n'est garanti.
          </span>
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={loading || (mode === "signup" && !form.acceptTerms)}>
        {loading ? "…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-slate-500">
        {mode === "signup" ? (
          <>Déjà un compte ? <Link href="/connexion" className="underline">Connexion</Link></>
        ) : (
          <>Pas encore de compte ? <Link href="/quiz" className="underline">Commencer</Link></>
        )}
      </p>
    </form>
  );
}
