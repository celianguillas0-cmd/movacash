"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import GoogleButton from "./GoogleButton";

export default function AuthForm({ mode, google = false, googleError = "" }: { mode: "login" | "signup"; google?: boolean; googleError?: string }) {
  const router = useRouter();
  const t = useT();
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
    if (!res.ok) return setError(data.error || t("Une erreur est survenue, réessaie."));
    router.push(mode === "signup" ? (hasQuiz ? "/resultats" : "/tarifs") : "/app");
    router.refresh();
  }

  return (
    <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
      <p className="eyebrow">{mode === "signup" ? (hasQuiz ? t("Dernière étape") : t("Créer un compte")) : t("Connexion")}</p>
      <h1 className="q-title" style={{ marginTop: 12 }}>
        {mode === "signup" ? (
          hasQuiz ? <>{t("Tes 3 idées sont prêtes.")} <em className="serif">{t("Crée ton compte")}</em> {t("pour les voir.")}</> : <>{t("Crée ton")} <em className="serif">{t("atelier d'e-books.")}</em></>
        ) : (
          <>{t("Content de")} <em className="serif">{t("te revoir.")}</em></>
        )}
      </h1>
      {mode === "signup" && (
        <p className="q-help">{t("On te demande juste ton prénom, ton e-mail et un mot de passe, pour retrouver tes réponses, tes idées et tes e-books. Pas de revente de données.")}</p>
      )}
      {googleError && <p className="error" style={{ marginTop: 20 }}>{googleError}</p>}
      {google && (
        <div className="google-bloc">
          <GoogleButton next={mode === "signup" ? (hasQuiz ? "/resultats" : "/tarifs") : "/app"} label={t("Continuer avec Google")} />
          {mode === "signup" && <p className="dim google-note">{t("En continuant avec Google, tu acceptes les CGV et la politique de confidentialité, et tu comprends qu'aucun revenu n'est garanti.")}</p>}
          <p className="google-ou"><span>{t("ou")}</span></p>
        </div>
      )}
      <form className="form" onSubmit={submit}>
        {mode === "signup" && (
          <label htmlFor="f-name">{t("Prénom")}
            <input id="f-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        )}
        <label htmlFor="f-email">{t("E-mail")}
          <input id="f-email" type="email" required autoComplete="email" placeholder={t("toi@exemple.fr")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label htmlFor="f-pass">{t("Mot de passe")}
          <input id="f-pass" type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : 1} placeholder={mode === "signup" ? t("8 caractères minimum") : ""} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {mode === "signup" && (
          <label className="check" htmlFor="f-cgv">
            <input id="f-cgv" type="checkbox" checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} />
            <span>
              {t("J'accepte les")} <Link href="/cgv" target="_blank" style={{ textDecoration: "underline" }}>{t("CGV")}</Link> {t("et la")} <Link href="/confidentialite" target="_blank" style={{ textDecoration: "underline" }}>{t("politique de confidentialité")}</Link>{t(", et je comprends qu'aucun revenu n'est garanti.")}
            </span>
          </label>
        )}
        {mode === "login" && (
          <p className="dim" style={{ textAlign: "right", marginTop: -6 }}><Link href="/mot-de-passe" style={{ textDecoration: "underline" }}>{t("Mot de passe oublié ?")}</Link></p>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-accent btn-lg" disabled={loading || (mode === "signup" && !form.acceptTerms)}>
          {loading ? t("Un instant…") : mode === "signup" ? (hasQuiz ? t("Voir mes 3 idées") + " →" : t("Créer mon compte") + " →") : t("Se connecter")}
        </button>
        <p className="dim" style={{ textAlign: "center" }}>
          {mode === "signup" ? (
            <>{t("Déjà un compte ?")} <Link href="/connexion" style={{ textDecoration: "underline" }}>{t("Se connecter")}</Link></>
          ) : (
            <>{t("Pas encore de compte ?")} <Link href="/quiz" style={{ textDecoration: "underline" }}>{t("Trouver mes idées")}</Link></>
          )}
        </p>
      </form>
    </main>
  );
}
