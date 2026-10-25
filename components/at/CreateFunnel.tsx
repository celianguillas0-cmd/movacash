"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  { id: "debutant", titre: "Grand débutant", detail: "il part de zéro" },
  { id: "bases", titre: "A déjà essayé", detail: "il connaît les bases" },
  { id: "passionne", titre: "Passionné", detail: "il veut progresser vite" },
  { id: "pro", titre: "Professionnel", detail: "il s'en sert au travail" },
];
const TONS: Choix[] = [
  { id: "pedagogique", titre: "Pédagogique", detail: "explique pas à pas" },
  { id: "motivant", titre: "Motivant", detail: "donne envie d'agir" },
  { id: "expert", titre: "Expert", detail: "va au fond des choses" },
  { id: "convivial", titre: "Convivial", detail: "comme un ami qui conseille" },
];
const LONGUEURS: Choix[] = [
  { id: "7", titre: "Essentiel", detail: "7 chapitres, environ 40 pages" },
  { id: "9", titre: "Complet", detail: "9 chapitres, environ 50 pages" },
  { id: "12", titre: "Approfondi", detail: "12 chapitres, environ 65 pages" },
];
const LANGUES: Choix[] = [
  { id: "fr", titre: "Français", detail: "Etsy France, Belgique, Suisse, Canada", pastille: "FR" },
  { id: "en", titre: "Anglais", detail: "le plus grand marché d'Etsy", pastille: "EN" },
  { id: "es", titre: "Espagnol", detail: "Espagne et Amérique latine", pastille: "ES" },
  { id: "de", titre: "Allemand", detail: "Allemagne, Autriche, Suisse", pastille: "DE" },
  { id: "it", titre: "Italien", detail: "Italie", pastille: "IT" },
];
const MINIATURES: Choix[] = [
  { id: "affiche", titre: "Affiche", detail: "gros titre, photo du sujet, bandeau d'atouts" },
  { id: "epure", titre: "Épurée", detail: "typographie élégante, beaucoup d'espace" },
  { id: "magazine", titre: "Magazine", detail: "photo pleine page, titre en surimpression" },
];
const APERCUS: Record<string, string> = {
  affiche: "linear-gradient(180deg,#f6f1e7 0 18%,#8a3b1f 18% 26%,#f6f1e7 26% 40%,#c9a98a 40% 86%,#2b1d16 86%)",
  epure: "linear-gradient(180deg,#f4f1ec 0 30%,#1f2937 30% 33%,#f4f1ec 33% 70%,#d6cfc4 70%)",
  magazine: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.55)),linear-gradient(135deg,#7c6f64,#c9b8a3)",
};

export default function CreateFunnel({ idea, author, defaults }: { idea: Idea; author: string; defaults: { tone?: string; language?: string } }) {
  const router = useRouter();
  const prix = Math.round((idea.priceMin + idea.priceMax) / 2);
  const [step, setStep] = useState(0);
  const [objectif, setObjectif] = useState(0);
  const [r, setR] = useState<Record<string, string>>({ tone: defaults.tone || "", language: defaults.language || "", chapters: "", lecteur: "", thumb: "" });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const ETAPES = [
    { cle: "objectif", ic: "cible", kicker: "Ton objectif", t1: "Combien veux-tu", t2: "gagner par mois ?" },
    { cle: "lecteur", ic: "lecteur", kicker: "Ton lecteur", t1: "Pour qui tu", t2: "écris ce guide ?", choix: LECTEURS },
    { cle: "tone", ic: "ton", kicker: "Ta voix", t1: "Sur quel ton", t2: "tu veux lui parler ?", choix: TONS },
    { cle: "chapters", ic: "livre", kicker: "Ta longueur", t1: "Quelle taille", t2: "pour ton e-book ?", choix: LONGUEURS },
    { cle: "language", ic: "langue", kicker: "Ton marché", t1: "Dans quelle langue", t2: "tu veux le vendre ?", choix: LANGUES },
    { cle: "thumb", ic: "image", kicker: "Ta miniature", t1: "Quel style pour", t2: "ta miniature Etsy ?", choix: MINIATURES },
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
        audience: `${idea.audience}${lecteur ? ` (${lecteur.titre.toLowerCase()} : ${lecteur.detail})` : ""}`.slice(0, 200),
        tone: vals.tone || "pedagogique",
        language: vals.language || "fr",
        chapters: Number(vals.chapters || 9),
        authorName: author,
        sensitive: idea.sensitive,
        thumb: vals.thumb || "affiche",
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEnvoi(false);
      return setErreur(d.error || "La génération n'a pas pu démarrer. Réessaie.");
    }
    router.push(`/app/ebooks/${d.id}?autostart=1`);
    router.refresh();
  }, [author, idea, router]);

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
          <Link href="/app/mon-idee" className="mf-quitter">← Retour à l&apos;atelier</Link>
        </div>
      </header>
      <div className="at-wrap">
        <div className="mf-barre">
          <div className="mf-retour">
            <button className="mf-rond" aria-label="Étape précédente" onClick={() => (step ? setStep(step - 1) : router.push("/app/mon-idee"))}>←</button>
            <span className="mf-chip">Pour <b>{idea.title}</b></span>
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
              <p className="mf-montant">{objectif.toLocaleString("fr-FR")} €</p>
              <p className="mf-soit">
                soit <b>{Math.ceil(objectif / prix)} vente{Math.ceil(objectif / prix) > 1 ? "s" : ""}</b> par mois à {prix} €, le prix conseillé pour ce sujet
              </p>
              <input className="mf-rail" type="range" min={0} max={3000} step={50} value={objectif} onChange={(ev) => setObjectif(Number(ev.target.value))} aria-label="Objectif mensuel" />
              <div className="mf-bornes"><span>0 €</span><span>3 000 €</span></div>
              <button className="mf-btn" disabled={objectif === 0} onClick={() => setStep(1)}>Lancer mon e-book <span aria-hidden="true">→</span></button>
              <p className="mf-soit" style={{ fontSize: 13, color: "#8a909b", marginTop: 16 }}>C&apos;est ton objectif, pas une promesse : tes ventes dépendent de ton sujet, de ta relecture et de ta régularité.</p>
            </>
          ) : (
            <>
              <div className="mf-cartes">
                {e.choix!.map((c, k) => (
                  <button key={c.id} className="mf-carte" aria-pressed={r[e.cle] === c.id} onClick={() => (step === ETAPES.length - 1 ? setR({ ...r, thumb: c.id }) : choisir(c.id))}>
                    <span className="mf-touche">{k + 1}</span>
                    {c.pastille && <span className="mf-pastille" style={{ fontFamily: "'Spline Sans Mono', monospace", fontSize: 13, color: "#6b7280" }}>{c.pastille}</span>}
                    <b>{c.titre}</b>
                    <small>{c.detail}</small>
                    {e.cle === "thumb" && <div className="mf-apercu" style={{ background: APERCUS[c.id] }} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              {step === ETAPES.length - 1 && (
                <>
                  <button className="mf-btn" disabled={!r.thumb || envoi} onClick={() => generer(r)}>
                    {envoi ? "Préparation du plan…" : "Générer mon e-book"} <span aria-hidden="true">→</span>
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
