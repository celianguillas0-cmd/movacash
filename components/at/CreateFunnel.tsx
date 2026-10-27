"use client";
import { useCallback, useEffect, useState } from "react";
import Marque from "@/components/at/Marque";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/client";
import { fmtEur, tk } from "@/lib/i18n/t";
import GenerationScreen, { etapesProvisoires } from "./GenerationScreen";
import { LOGO_BOURSOBANK, LOGO_CREDIT_AGRICOLE, LOGO_CREDIT_MUTUEL, type Logo } from "./banques";

type Idea = { id: number; title: string; audience: string; sensitive: string | null; priceMin: number; priceMax: number };
type Choix = { id: string; titre: string; detail: string; logo?: Logo };

const ICONES: Record<string, string> = {
  cible: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  carte: "M2 7.5A2.5 2.5 0 0 1 4.5 5h15A2.5 2.5 0 0 1 22 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16.5zM2 10h20",
  horloge: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  telephone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2",
  fiche: "M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM14 2v6h6M8 13h8M8 17h5",
  eclair: "M13 2 4 14h7l-1 8 9-12h-7z",
  courbe: "M3 17l6-6 4 4 8-8M15 7h6v6",
};

const REVOLUT = "M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z";
const N26 = "M0 3.803v1.195h7.436V3.803H0zM12.69 7.29c-2.034 0-3.038 1.252-3.038 2.684 0 .234.027.468.092.728l1.393.135a3.697 3.697 0 0 1-.09-.793c0-1.072.71-1.586 1.598-1.586.866 0 1.507.485 1.507 1.652 0 1.186-.58 1.995-1.464 2.88-.925.923-2.4 2.027-3.112 2.534v1.092h6.135v-1.195h-4.168c.695-.48 1.69-1.279 2.133-1.72.502-.503 1.931-1.794 1.931-3.636 0-1.903-1.24-2.775-2.918-2.775zm8.34 0c-1.976 0-3.454 1.517-3.454 4.916 0 3.017 1.233 4.508 3.356 4.508 1.754 0 3.068-1.198 3.068-3.172 0-1.542-.823-3.066-2.793-3.066-1.1 0-1.884.51-2.281 1.263 0-1.78.62-3.33 2.094-3.33.937 0 1.309.538 1.507 1.422l1.366-.271c-.321-1.527-1.292-2.27-2.864-2.27zM.075 7.389v9.228h1.33v-6.312c0-.56-.013-.898-.039-1.223h.026c.136.372.298.699.539 1.123l3.732 6.412h1.69V7.39H6.04v6.31c0 .56.013.898.04 1.223h-.028a7.252 7.252 0 0 0-.537-1.123L1.783 7.389H.076zm20.817 4.185c1.114 0 1.744.822 1.744 1.992 0 1.256-.717 2.034-1.701 2.034-1.09 0-1.843-1.001-1.973-2.329.33-1.133 1.063-1.697 1.93-1.697zM0 19.008v1.19h7.436v-1.19H0z";
const BANQUE = "M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M12 3l9 5H3z";
const LOGO_REVOLUT: Logo = { vb: "0 0 24 24", paths: [{ d: REVOLUT }] };
const LOGO_N26: Logo = { vb: "0 0 24 24", paths: [{ d: N26 }] };
const LOGO_BANQUE: Logo = { vb: "0 0 24 24", paths: [{ d: BANQUE }] };

// Etsy verse les ventes sur un compte bancaire (IBAN) : pas de PayPal ici.
const PAIEMENTS: Choix[] = [
  { id: "credit-agricole", titre: "Crédit Agricole", detail: tk("sur ton compte Crédit Agricole"), logo: LOGO_CREDIT_AGRICOLE },
  { id: "revolut", titre: "Revolut", detail: tk("encaissement rapide, frais bas"), logo: LOGO_REVOLUT },
  { id: "boursobank", titre: "BoursoBank", detail: tk("virement direct sur ton compte"), logo: LOGO_BOURSOBANK },
  { id: "credit-mutuel", titre: "Crédit Mutuel", detail: tk("sur ton compte Crédit Mutuel"), logo: LOGO_CREDIT_MUTUEL },
  { id: "n26", titre: "N26", detail: tk("compte en ligne, sans frais"), logo: LOGO_N26 },
  { id: "autre", titre: tk("Une autre banque"), detail: tk("n'importe quel compte avec un IBAN"), logo: LOGO_BANQUE },
];
const ECHEANCES: Choix[] = [
  { id: "aujourdhui", titre: tk("Aujourd'hui"), detail: tk("je veux mon e-book en vente aujourd'hui") },
  { id: "semaine", titre: tk("Cette semaine"), detail: tk("je veux mon e-book en vente cette semaine") },
  { id: "mois", titre: tk("Dans le mois"), detail: tk("je veux mon e-book en vente dans le mois") },
];
const DISCRETION: Choix[] = [
  { id: "oui", titre: tk("Oui"), detail: tk("pas de caméra, pas de visage, juste ton téléphone") },
  { id: "non", titre: tk("Non"), detail: tk("me montrer ne me gêne pas") },
];
const FICHE: Choix[] = [
  { id: "oui", titre: tk("Oui"), detail: tk("on écrit ton e-book, ta fiche Etsy et ta miniature à ta place") },
  { id: "non", titre: tk("Non"), detail: tk("je préfère l'écrire moi-même") },
];
const JOURS: Record<string, number> = { aujourdhui: 0, semaine: 7, mois: 30 };

export default function CreateFunnel({ idea, author, defaults }: { idea: Idea; author: string; defaults: { tone?: string; language?: string } }) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [objectif, setObjectif] = useState(0);
  const [r, setR] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const ETAPES = [
    { cle: "objectif", ic: "cible", kicker: t("Ton objectif"), t1: t("Quel revenu"), t2: t("veux-tu atteindre ?") },
    { cle: "paiement", ic: "carte", kicker: t("Tes paiements"), t1: t("Sur quoi tu veux"), t2: t("recevoir tes ventes Etsy ?"), choix: PAIEMENTS },
    { cle: "echeance", ic: "horloge", kicker: t("Ton échéance"), t1: t("En combien de temps tu veux"), t2: t("ton e-book en vente ?"), choix: ECHEANCES },
    { cle: "discretion", ic: "telephone", kicker: t("Ta façon de faire"), t1: t("Tu veux tout faire derrière ton téléphone"), t2: t("sans te montrer ?"), choix: DISCRETION },
    { cle: "fiche", ic: "fiche", kicker: t("Ta boutique Etsy"), t1: t("Tu veux qu'on le fasse à ta place ?"), t2: t("(automatisé)"), choix: FICHE },
    { cle: "plan", ic: "courbe", kicker: t("Dernière étape"), t1: t("On chiffre ton scénario."), t2: "" },
  ];
  const e = ETAPES[step];
  // Verdict : le montant défile de 0 à l'objectif choisi (aucun chiffre inventé).
  const [compte, setCompte] = useState(0);
  useEffect(() => {
    if (e.cle !== "plan") return;
    let raf = 0;
    const debut = performance.now();
    const duree = 1600;
    const tick = (now: number) => {
      const x = Math.min(1, (now - debut) / duree);
      setCompte(Math.round(objectif * (1 - Math.pow(1 - x, 3))));
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [e.cle, objectif]);
  const prix = Math.max(1, (idea.priceMin + idea.priceMax) / 2);
  const vj = (objectif * 12) / 365 / prix;
  const ventesJour = Math.max(1, vj >= 10 ? Math.round(vj) : Math.round(vj * 10) / 10);
  const parJour = (v: number) => fmtEur(Math.round((v * 12) / 365), locale);

  // Réglages de l'e-book : ceux du profil, sinon des valeurs sûres (modifiables ensuite dans l'éditeur).
  const generer = useCallback(async () => {
    setEnvoi(true);
    setErreur("");
    const res = await fetch("/api/ebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ideaId: idea.id,
        topic: idea.title,
        audience: idea.audience.slice(0, 200),
        tone: defaults.tone || "pedagogique",
        language: defaults.language || locale,
        chapters: 9,
        authorName: author,
        sensitive: idea.sensitive,
        thumb: "affiche",
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEnvoi(false);
      return setErreur(t(d.error || "La génération n'a pas pu démarrer. Réessaie."));
    }
    router.push(`/app/ebooks/${d.id}?autostart=1`);
    router.refresh();
  }, [author, idea, router, t, locale, defaults]);

  const choisir = useCallback((id: string) => {
    setR((v) => ({ ...v, [e.cle]: id }));
    setTimeout(() => setStep((s) => Math.min(s + 1, ETAPES.length - 1)), 220);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e]);

  // Raccourcis clavier : 1 à 6 pour choisir, Entrée pour valider le curseur
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

  // Date visée : elle découle de l'échéance choisie, ce n'est pas une prédiction de ventes.
  const dateVisee = () => {
    const j = JOURS[r.echeance];
    if (j === undefined) return null;
    if (j === 0) return t("Tu as dit « aujourd'hui ». En t'y mettant maintenant, ton e-book peut être en vente sur Etsy ce soir.");
    const d = new Date();
    d.setDate(d.getDate() + j);
    return t("En t'y mettant ce soir, ton e-book peut être en vente sur Etsy avant le {date}.", { date: d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }) });
  };

  // Dès le clic : écran de génération (le plan s'écrit côté serveur pendant ce temps), sans temps mort.
  if (envoi && !erreur)
    return (
      <div className="mf">
        <header className="mf-head">
          <div className="at-wrap"><span className="at-brand mc-marque"><Marque /></span></div>
        </header>
        <div className="at-wrap mf-gen">
          <GenerationScreen title={t("Préparation du plan de ton e-book")} steps={etapesProvisoires(t, false)} note={t("Garde cette page ouverte. Compte 30 à 60 secondes par chapitre.")} />
        </div>
      </div>
    );

  return (
    <div className="mf">
      <header className="mf-head">
        <div className="at-wrap">
          <Link href="/app" className="at-brand mc-marque"><Marque /></Link>
          <Link href="/app/mon-idee" className="mf-quitter">← {t("Retour à l'atelier")}</Link>
        </div>
      </header>
      <div className="at-wrap">
        <div className="mf-barre">
          <div className="mf-retour">
            <button className="mf-rond" aria-label={t("Étape précédente")} onClick={() => (step ? setStep(step - 1) : router.push("/app/mon-idee"))}>←</button>
            <span className="mf-chip">{t("Pour")} <b>{idea.title}</b></span>
          </div>
          <span className="mf-compteur"><b>{String(step + 1).padStart(2, "0")}</b> / {String(ETAPES.length).padStart(2, "0")}</span>
        </div>
        <div className="mf-segments" aria-hidden="true">{ETAPES.map((_, k) => <i key={k} className={k <= step ? "on" : ""} />)}</div>

        {step > 0 && (
          <aside className="mf-scenario" aria-live="polite">
            <b>{fmtEur(objectif, locale)}</b>
            <span>{t("Ton scénario par mois")}</span>
            <i><em style={{ width: `${Math.round((step / (ETAPES.length - 1)) * 100)}%` }} /></i>
            <small>{step < ETAPES.length - 1 ? (ETAPES.length - 1 - step > 1 ? t("encore {n} réponses", { n: ETAPES.length - 1 - step }) : t("plus qu'une réponse")) : t("verdict prêt")}</small>
          </aside>
        )}
        <section className="mf-scene" key={step}>
          <span className="mf-num" aria-hidden="true">{String(step + 1).padStart(2, "0")}</span>
          <div className="mf-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONES[e.ic]} /></svg></div>
          <p className="mf-kicker">{e.kicker}</p>
          <h1 className="mf-titre">{e.t1}{e.t2 && <span>{e.t2}</span>}</h1>

          {e.cle === "objectif" && (
            <>
              <p className="mf-montant">{fmtEur(objectif, locale)}</p>
              <p className="mf-soit"><b>{t("soit {jour} par jour", { jour: parJour(objectif) })}</b></p>
              <input className="mf-rail" type="range" min={0} max={30000} step={10} value={objectif} onChange={(ev) => setObjectif(Number(ev.target.value))} aria-label={t("Objectif mensuel")} />
              <div className="mf-bornes"><span>{fmtEur(0, locale)}</span><span>{fmtEur(30000, locale)}</span></div>
              <button className="mf-btn" disabled={objectif === 0} onClick={() => setStep(1)}>{t("Lancer mon business")} <span aria-hidden="true">→</span></button>
            </>
          )}

          {e.choix && (
            <>
              <div className={`mf-cartes mf-cartes-n${e.choix.length}`}>
                {e.choix.map((c, k) => (
                  <button key={c.id} className="mf-carte" aria-pressed={r[e.cle] === c.id} onClick={() => choisir(c.id)} style={{ animationDelay: `${120 + k * 70}ms` }}>
                    <span className="mf-touche">{k + 1}</span>
                    {c.logo && (
                      <span className="mf-logo" style={c.logo.couleur ? { color: c.logo.couleur } : undefined}>
                        <svg viewBox={c.logo.vb} aria-hidden="true" {...(c.logo === LOGO_BANQUE ? { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round" as const } : { fill: "currentColor" })}>
                          {c.logo.paths.map((p, j) => <path key={j} d={p.d} fill={p.fill} />)}
                        </svg>
                      </span>
                    )}
                    <b>{t(c.titre)}</b>
                    <small>{t(c.detail)}</small>
                  </button>
                ))}
              </div>
              <p className="mf-astuce">{t("Astuce : tape 1 à {n} pour répondre.", { n: e.choix.length })}</p>
            </>
          )}

          {e.cle === "plan" && (
            <>
              <p className="mf-montant">{fmtEur(compte, locale)}</p>
              <p className="mf-soit">{t("par mois : ton scénario, calculé sur tes réponses.")}</p>
              <div className="mf-verdict">
                <div><b>{parJour(objectif)}</b><small>{t("par jour")}</small></div>
                <div><b>{ventesJour.toLocaleString(locale)}</b><small>{t("ventes par jour à {prix}", { prix: fmtEur(Math.round(prix), locale) })}</small></div>
                <div><b>{t(({ aujourdhui: tk("Ce soir"), semaine: tk("7 jours"), mois: tk("30 jours") } as Record<string, string>)[r.echeance] || tk("30 jours"))}</b><small>{t("pour la mise en vente")}</small></div>
              </div>
              {dateVisee() && <p className="mf-date">{dateVisee()}</p>}
              <button className="mf-btn" disabled={envoi} onClick={generer}>
                {envoi ? t("Préparation du plan…") : t("Lancer mon business")} <span aria-hidden="true">→</span>
              </button>
              {erreur && <p className="mf-erreur">{erreur}</p>}
              <p className="mf-mention">{t("Un scénario calculé sur tes réponses, pas une promesse : tes ventes dépendent de ton sujet, de ta fiche Etsy et de ta régularité.")}</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
