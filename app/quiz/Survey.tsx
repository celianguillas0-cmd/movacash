"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Cat = { slug: string; name: string };
type Opt = [string, string, string?];
type Q = { k: string; t: string; h?: string; type?: "text" | "multi"; ph?: string; max?: number; o?: Opt[] };

const QUESTIONS: Q[] = [
  { k: "name", type: "text", t: "Comment tu t'appelles ?", h: "On s'en sert pour personnaliser ton plan.", ph: "Ton prénom" },
  { k: "situation", t: "Quelle est ta situation aujourd'hui ?", o: [["employed", "Salarié(e)", "Je cherche une activité à côté"], ["student", "Étudiant(e)"], ["parent", "Parent au foyer"], ["freelance", "Indépendant(e) ou freelance"], ["searching", "En recherche d'emploi"]] },
  { k: "goal", t: "Qu'est-ce que tu veux construire ?", o: [["side", "Un revenu d'appoint", "Quelques ventes par mois pour arrondir les fins de mois"], ["build", "Une vraie boutique", "Une activité qui grandit sur plusieurs mois"], ["test", "Juste tester", "Voir si la vente de produits numériques me plaît"]] },
  { k: "time", t: "Combien de temps peux-tu y consacrer par semaine ?", o: [["2", "Moins de 2 heures"], ["5", "2 à 5 heures"], ["10", "5 à 10 heures"], ["15", "Plus de 10 heures"]] },
  { k: "etsy", t: "Où en es-tu avec Etsy ?", o: [["none", "Je n'ai jamais vendu en ligne"], ["online", "J'ai déjà vendu ailleurs", "Vinted, Leboncoin, eBay…"], ["shop", "J'ai une boutique Etsy"]] },
  { k: "writing", t: "Relire et corriger un texte, pour toi c'est…", h: "L'IA rédige, mais la relecture fait la qualité de ton e-book.", o: [["easy", "Facile, j'aime ça"], ["ok", "Faisable, sans plus"], ["hard", "Difficile", "On te proposera des sujets plus simples à relire"]] },
  { k: "expertise", t: "As-tu une passion ou un domaine que tu connais bien ?", h: "Un sujet que tu maîtrises se relit mieux et se vend souvent mieux.", o: [["yes", "Oui, je m'y connais vraiment"], ["some", "Un peu, je suis curieux(se)"], ["no", "Pas vraiment"]] },
  { k: "themes", type: "multi", t: "Quelles thématiques t'attirent ?", h: "Jusqu'à 4 choix.", max: 4 },
  { k: "sensitive", t: "Les sujets santé, minceur ou argent, ça te va ?", h: "Ils se vendent bien, mais demandent plus de prudence et d'avertissements.", o: [["yes", "Oui, avec les bons avertissements"], ["no", "Je préfère les éviter"]] },
  { k: "lang", t: "Dans quelle langue veux-tu vendre ?", o: [["fr", "Français"], ["en", "Anglais", "Marché plus large, plus de concurrence"], ["both", "Les deux"]] },
];

type Answers = Record<string, string | string[]>;

export default function Survey({ categories, total, loggedIn }: { categories: Cat[]; total: number; loggedIn: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<"q" | "analyse">("q");
  const [done, setDone] = useState(0);
  const [hint, setHint] = useState("");
  const textRef = useRef<HTMLInputElement>(null);
  const q = QUESTIONS[step];

  useEffect(() => {
    if (q?.type === "text") textRef.current?.focus();
  }, [q]);

  function next(a: Answers = answers) {
    setHint("");
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else analyse(a);
  }

  async function analyse(a: Answers) {
    setPhase("analyse");
    window.scrollTo({ top: 0 });
    const req = fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: a }) }).then((r) => r.json());
    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 650));
      setDone(i);
    }
    const { quiz } = await req;
    try {
      localStorage.setItem("mc_quiz", JSON.stringify(quiz));
    } catch {}
    router.push(loggedIn ? "/resultats" : "/inscription");
  }

  if (phase === "analyse") {
    const steps = [`Lecture de tes ${QUESTIONS.length} réponses`, `Analyse des ${total} idées de la base`, "Filtrage selon ton temps et ton niveau", "Comparaison potentiel / concurrence", "Sélection de tes 3 idées"];
    return (
      <main className="wrap narrow analyse" style={{ marginInline: "auto" }}>
        <p className="eyebrow">Analyse</p>
        <h1 className="q-title" style={{ marginTop: 12 }}>{String(answers.name || "")}, on prépare <em className="serif">tes idées.</em></h1>
        <ol>
          {steps.map((s, i) => (
            <li key={s} className={i < done ? "done" : i === done ? "doing" : ""}>
              <span className="dot">{i < done ? "✓" : ""}</span>{s}
            </li>
          ))}
        </ol>
      </main>
    );
  }

  const total_ = QUESTIONS.length;
  const value = answers[q.k];
  return (
    <main className="wrap narrow survey" style={{ marginInline: "auto" }}>
      <div className="progress"><i style={{ width: `${((step + 1) / total_) * 100}%` }} /></div>
      <div className="q-meta">
        <span className="eyebrow">Question {step + 1} / {total_}</span>
        <span className="dim">environ {Math.max(1, Math.round(((total_ - step) * 12) / 60))} min restante{total_ - step > 5 ? "s" : ""}</span>
      </div>
      <h1 className="q-title">{q.t}</h1>
      {q.h && <p className="q-help">{q.h}</p>}

      {q.type === "text" && (
        <input
          ref={textRef}
          id="q-text"
          className="textin"
          type="text"
          autoComplete="given-name"
          placeholder={q.ph}
          value={String(value || "")}
          onChange={(e) => setAnswers({ ...answers, [q.k]: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (String(value || "").trim()) next();
              else setHint("Indique ton prénom pour continuer.");
            }
          }}
        />
      )}

      {q.type === "multi" && (
        <div className="options grid-opts">
          {categories.map((c) => {
            const sel = (value as string[]) || [];
            const on = sel.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                className={`opt ${on ? "on" : ""}`}
                onClick={() => setAnswers({ ...answers, [q.k]: on ? sel.filter((x) => x !== c.slug) : sel.length < (q.max || 4) ? [...sel, c.slug] : sel })}
              >
                <span>{c.name}</span>
                <span className="tick">{on ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      )}

      {q.o && (
        <div className="options">
          {q.o.map(([v, l, s]) => (
            <button
              key={v}
              type="button"
              className={`opt ${value === v ? "on" : ""}`}
              onClick={() => {
                const a = { ...answers, [q.k]: v };
                setAnswers(a);
                setTimeout(() => next(a), 220);
              }}
            >
              <span>{l}{s && <span className="sub">{s}</span>}</span>
              <span className="tick">{value === v ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      )}

      {hint && <p className="error" style={{ marginTop: 12 }}>{hint}</p>}
      <div className="q-actions">
        <button type="button" className="btn btn-ghost btn-sm" disabled={step === 0} onClick={() => setStep(step - 1)}>← Retour</button>
        {(q.type === "text" || q.type === "multi") && (
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => {
              if (q.type === "text" && !String(value || "").trim()) return setHint("Indique ton prénom pour continuer.");
              if (q.type === "multi" && !((value as string[]) || []).length) return setHint("Choisis au moins une thématique.");
              next();
            }}
          >
            Continuer →
          </button>
        )}
      </div>
    </main>
  );
}
