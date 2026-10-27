"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/client";
import { fmtEur, tk } from "@/lib/i18n/t";
import { LOCALES } from "@/lib/i18n/locales";

type Idea = { id: number; title: string; audience: string; sensitive: string | null; priceMin: number; priceMax: number };
type Choix = { id: string; titre: string; detail: string; pastille?: string };

const ICONES: Record<string, string> = {
  cible: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  lecteur: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  ton: "M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2",
  livre: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h12",
  langue: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0",
};

const LECTEURS: Choix[] = [
  { id: "debutant", titre: tk("Grand débutant"), detail: tk("il part de zéro") },
  { id: "bases", titre: tk("A déjà essayé"), detail: tk("il connaît les bases") },
  { id: "passionne", titre: tk("Passionné"), detail: tk("il veut progresser vite") },
  { id: "pro", titre: tk("Professionnel"), detail: tk("il s'en sert au travail") },
];
const TONS: Choix[] = [
  { id: "pedagogique", titre: tk("Pédagogique"), detail: tk("explique pas à pas") },
  { id: "motivant", titre: tk("Motivant"), detail: tk("donne envie d'agir") },
  { id: "expert", titre: tk("Expert"), detail: tk("va au fond des choses") },
  { id: "convivial", titre: tk("Convivial"), detail: tk("comme un ami qui conseille") },
];
const LONGUEURS: Choix[] = [
  { id: "7", titre: tk("Essentiel"), detail: tk("7 chapitres, environ 40 pages") },
  { id: "9", titre: tk("Complet"), detail: tk("9 chapitres, environ 50 pages") },
  { id: "12", titre: tk("Approfondi"), detail: tk("12 chapitres, environ 65 pages") },
];
// Marchés présentés en premier ; les autres langues du site restent proposées dans la liste.
const MARCHES: Record<string, string> = {
  fr: tk("Etsy France, Belgique, Suisse, Canada"),
  en: tk("le plus grand marché d'Etsy"),
  de: tk("Allemagne, Autriche, Suisse"),
  es: tk("Espagne"),
  it: tk("Italie"),
  nl: tk("Pays-Bas, Belgique"),
};
const MINIATURES: Choix[] = [
  { id: "affiche", titre: tk("Affiche"), detail: tk("gros titre, photo du sujet, bandeau d'atouts") },
  { id: "epure", titre: tk("Épurée"), detail: tk("typographie élégante, beaucoup d'espace") },
  { id: "magazine", titre: tk("Magazine"), detail: tk("photo pleine page, titre en surimpression") },
];
const APERCUS: Record<string, string> = {
  affiche: "linear-gradient(180deg,#f6f1e7 0 18%,#8a3b1f 18% 26%,#f6f1e7 26% 40%,#c9a98a 40% 86%,#2b1d16 86%)",
  epure: "linear-gradient(180deg,#f4f1ec 0 30%,#1f2937 30% 33%,#f4f1ec 33% 70%,#d6cfc4 70%)",
  magazine: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.55)),linear-gradient(135deg,#7c6f64,#c9b8a3)",
};

export default function CreateFunnel({ idea, author, defaults }: { idea: Idea; author: string; defaults: { tone?: string; language?: string } }) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const nomLangue = (code: string) => LOCALES.find((l) => l.code === code)?.nom || code;
  // La langue du client d'abord, puis les grands marchés d'Etsy
  const premieres = Array.from(new Set([locale, "en", "fr", "de", "es", "it"])).slice(0, 6);
  const LANGUES: Choix[] = premieres.map((code) => ({ id: code, titre: nomLangue(code), detail: MARCHES[code] || "", pastille: code.toUpperCase() }));
  const autres = LOCALES.filter((l) => !premieres.includes(l.code));
  const [step, setStep] = useState(0);
  const [objectif, setObjectif] = useState(0);
  const [r, setR] = useState<Record<string, string>>({ tone: defaults.tone || "", language: defaults.language || "", chapters: "", lecteur: "", thumb: "" });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const ETAPES = [
    { cle: "objectif", ic: "cible", kicker: t("Ton objectif"), t1: t("Combien veux-tu"), t2: t("gagner par mois ?") },
    { cle: "lecteur", ic: "lecteur", kicker: t("Ton lecteur"), t1: t("Pour qui tu"), t2: t("écris ce guide ?"), choix: LECTEURS },
    { cle: "tone", ic: "ton", kicker: t("Ta voix"), t1: t("Sur quel ton"), t2: t("tu veux lui parler ?"), choix: TONS },
    { cle: "chapters", ic: "livre", kicker: t("Ta longueur"), t1: t("Quelle taille"), t2: t("pour ton e-book ?"), choix: LONGUEURS },
    { cle: "language", ic: "langue", kicker: t("Ton marché"), t1: t("Dans quelle langue"), t2: t("tu veux le vendre ?"), choix: LANGUES },
    { cle: "thumb", ic: "image", kicker: t("Ta miniature"), t1: t("Quel style pour"), t2: t("ta miniature Etsy ?"), choix: MINIATURES },
  ];
  const e = ETAPES[step];

  const generer = useCallback(async (vals: Record<string, string>) => {
    setEnvoi(true);
    setErreur("");
    const lecteur = LECTEURS.find((l) => l.id === vals.lecteur);
    const res = await fetch("/api/ebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ideaId: idea.id,
        topic: idea.title,
        audience: `${idea.audience}${lecteur ? ` (${t(lecteur.titre).toLowerCase()} : ${t(lecteur.detail)})` : ""}`.slice(0, 200),
        tone: vals.tone || "pedagogique",
        language: vals.language || locale,
        chapters: Number(vals.chapters || 9),
        authorName: author,
        sensitive: idea.sensitive,
        thumb: vals.thumb || "affiche",
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEnvoi(false);
      return setErreur(t(d.error || "La génération n'a pas pu démarrer. Réessaie."));
    }
    router.push(`/app/ebooks/${d.id}?autostart=1`);
    router.refresh();
  }, [author, idea, router, t, locale]);

  const choisir = useCallback((id: string) => {
    const vals = { ...r, [e.cle]: id };
    setR(vals);
    if (step < ETAPES.length - 1) setTimeout(() => setStep((s) => s + 1), 220);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, e, step]);

  // Raccourcis clavier : 1 à 5 pour choisir, Entrée pour valider le curseur
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (envoi) return;
      const n = Number(ev.key);
      if (e.choix && n >= 1 && n <= e.choix.length) choisir(e.choix[n - 1].id);
      if (ev.key === "Enter" && step === 0 && objectif > 0) setStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [e, step, objectif, envoi, choisir]);

  return (
    <div className="mf">
      <header className="mf-head">
        <div className="at-wrap">
          <Link href="/app" className="at-brand">Mova<span>cash</span></Link>
          <Link href="/app/mon-idee" className="mf-quitter">← {t("Retour à l'atelier")}</Link>
        </div>
      </header>
      <div className="at-wrap">
        <div className="mf-barre">
          <div className="mf-retour">
            <button className="mf-rond" aria-label={t("Étape précédente")} onClick={() => (step ? setStep(step - 1) : router.push("/app/mon-idee"))}>←</button>
            <span className="mf-chip">{t("Pour")} <b>{idea.title}</b></span>
          </div>
          <span className="mf-compteur"><b>{String(step + 1).padStart(2, "0")}</b> / 06</span>
        </div>
        <div className="mf-segments" aria-hidden="true">{ETAPES.map((_, k) => <i key={k} className={k <= step ? "on" : ""} />)}</div>

        <section className="mf-scene" key={step}>
          <span className="mf-num" aria-hidden="true">{String(step + 1).padStart(2, "0")}</span>
          <div className="mf-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONES[e.ic]} /></svg></div>
          <p className="mf-kicker">{e.kicker}</p>
          <h1 className="mf-titre">{e.t1}<span>{e.t2}</span></h1>

          {step === 0 ? (
            <>
              <p className="mf-montant">{fmtEur(objectif, locale)}</p>
              <p className="mf-soit">
                <b>{t("soit {jour} par jour", { jour: fmtEur(Math.round((objectif * 12) / 365), locale) })}</b>
              </p>
              <input className="mf-rail" type="range" min={0} max={30000} step={10} value={objectif} onChange={(ev) => setObjectif(Number(ev.target.value))} aria-label={t("Objectif mensuel")} />
              <div className="mf-bornes"><span>{fmtEur(0, locale)}</span><span>{fmtEur(30000, locale)}</span></div>
              <button className="mf-btn" disabled={objectif === 0} onClick={() => setStep(1)}>{t("Lancer mon e-book")} <span aria-hidden="true">→</span></button>
              <p className="mf-soit" style={{ fontSize: 13, color: "#71717a", marginTop: 16 }}>{t("C'est ton objectif, pas une promesse : tes ventes dépendent de ton sujet, de ta fiche Etsy et de ta régularité.")}</p>
            </>
          ) : (
            <>
              <div className={`mf-cartes${e.cle === "thumb" ? " mf-cartes-3" : ""}`}>
                {e.choix!.map((c, k) => (
                  <button key={c.id} className="mf-carte" aria-pressed={r[e.cle] === c.id} onClick={() => (step === ETAPES.length - 1 ? setR({ ...r, thumb: c.id }) : choisir(c.id))}>
                    <span className="mf-touche">{k + 1}</span>
                    {c.pastille && <span className="mf-pastille" style={{ fontFamily: "'Spline Sans Mono', monospace", fontSize: 13, color: "#a1a1aa" }}>{c.pastille}</span>}
                    <b>{e.cle === "language" ? c.titre : t(c.titre)}</b>
                    {c.detail && <small>{t(c.detail)}</small>}
                    {e.cle === "thumb" && <div className="mf-apercu" style={{ background: APERCUS[c.id] }} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              {e.cle === "language" && (
                <label className="mf-autre">
                  <span>{t("Autre langue")}</span>
                  <select className="input" value={autres.some((l) => l.code === r.language) ? r.language : ""} onChange={(ev) => ev.target.value && choisir(ev.target.value)}>
                    <option value="">{t("Choisir…")}</option>
                    {autres.map((l) => <option key={l.code} value={l.code}>{l.nom}</option>)}
                  </select>
                </label>
              )}
              {step === ETAPES.length - 1 && (
                <>
                  <button className="mf-btn" disabled={!r.thumb || envoi} onClick={() => generer(r)}>
                    {envoi ? t("Préparation du plan…") : t("Générer mon e-book")} <span aria-hidden="true">→</span>
                  </button>
                  {erreur && <p className="mf-erreur">{erreur}</p>}
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
