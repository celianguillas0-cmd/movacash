"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/client";
import { LOCALES } from "@/lib/i18n/locales";

type IdeaLite = { id: number; title: string; audience: string; sensitive: string | null; format: string } | null;

export default function NewEbookForm({ idea, defaultAuthor, defaults = {} }: { idea: IdeaLite; defaultAuthor: string; defaults?: { tone?: string; language?: string } }) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [f, setF] = useState({
    topic: idea?.title || "",
    audience: idea?.audience || "",
    language: defaults.language || locale,
    tone: defaults.tone || "pedagogique",
    chapters: 9,
    extras: "",
    authorName: defaultAuthor,
    sensitive: idea?.sensitive || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/ebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, ideaId: idea?.id ?? null, sensitive: f.sensitive || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(t(data.error || "Erreur"));
    }
    router.push(`/app/ebooks/${data.id}?autostart=1`);
    router.refresh(); // met à jour le compteur du quota dans la barre latérale
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4">
      <div>
        <label className="label">{t("Sujet de l'e-book")}</label>
        <input className="input" required value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} placeholder={t("Ex. : Lancer son business d'achat-revente sur Vinted")} />
      </div>
      <div>
        <label className="label">{t("Public cible")}</label>
        <input className="input" value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} placeholder={t("Ex. : étudiants qui veulent un complément de revenus")} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">{t("Langue")}</label>
          <select className="input" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })}>
            {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t("Ton")}</label>
          <select className="input" value={f.tone} onChange={(e) => setF({ ...f, tone: e.target.value })}>
            <option value="pedagogique">{t("Pédagogique")}</option>
            <option value="motivant">{t("Motivant")}</option>
            <option value="expert">{t("Expert")}</option>
            <option value="convivial">{t("Convivial")}</option>
          </select>
        </div>
        <div>
          <label className="label">{t("Nombre de chapitres")}</label>
          <select className="input" value={f.chapters} onChange={(e) => setF({ ...f, chapters: Number(e.target.value) })}>
            {[6, 7, 8, 9, 10, 11, 12].map((n) => (
              <option key={n} value={n}>{t("{n} chapitres (~{p} pages A4)", { n, p: Math.round((n * 2100) / 380) })}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">{t("Nom d'auteur affiché")}</label>
          <input className="input" value={f.authorName} onChange={(e) => setF({ ...f, authorName: e.target.value })} />
        </div>
        <div>
          <label className="label">{t("Sujet sensible")}</label>
          <select className="input" value={f.sensitive} onChange={(e) => setF({ ...f, sensitive: e.target.value })}>
            <option value="">{t("Non")}</option>
            <option value="health">{t("Santé, nutrition, sport")}</option>
            <option value="finance">{t("Argent, investissement")}</option>
            <option value="legal">{t("Juridique, administratif")}</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">{t("Ajoute un avertissement dans le PDF et rend l'IA plus prudente.")}</p>
        </div>
      </div>
      <div>
        <label className="label">{t("Consignes supplémentaires (facultatif)")}</label>
        <textarea className="input min-h-24" value={f.extras} onChange={(e) => setF({ ...f, extras: e.target.value })} placeholder={t("Ex. : inclure un programme semaine par semaine, un budget de départ de 50 €, des exemples en France…")} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary" disabled={loading}>{loading ? t("Création du plan… (environ 20 secondes)") : t("Générer le plan et les chapitres")}</button>
    </form>
  );
}
