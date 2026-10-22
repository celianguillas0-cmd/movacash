"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { QUESTIONS, SECTIONS } from "@/lib/quiz-questions";

type Cat = { slug: string; name: string };

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
    for (let i = 1; i <= 6; i++) {
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
    const steps = [`Lecture de tes ${QUESTIONS.length} réponses`, `Analyse des ${total} idées de la base`, "Filtrage selon ton temps, ton niveau et tes refus", "Rapprochement avec ton terrain et tes forces", "Comparaison potentiel / concurrence", "Sélection de tes 3 idées et de ton plan"];
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
        <span className="eyebrow">{q.s} · {step + 1} / {total_}</span>
        <span className="dim">Partie {SECTIONS.indexOf(q.s) + 1} / {SECTIONS.length} · environ {Math.max(1, Math.round(((total_ - step) * 8) / 60))} min</span>
      </div>
      <h1 className="q-title">{q.t}</h1>
      {q.h && <p className="q-help">{q.h}</p>}

      {q.type === "text" && (
        <input
          ref={textRef}
          id="q-text"
          className="textin"
          type="text"
          autoComplete={q.k === "name" ? "given-name" : "off"}
          placeholder={q.ph}
          value={String(value || "")}
          onChange={(e) => setAnswers({ ...answers, [q.k]: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (q.optional || String(value || "").trim()) next();
              else setHint("Indique ton prénom pour continuer.");
            }
          }}
        />
      )}

      {q.type === "themes" && (
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

      {q.type === "multi" && q.o && (
        <div className="options">
          {q.o.map(([v, l, sub]) => {
            const sel = (value as string[]) || [];
            const on = sel.includes(v);
            return (
              <button
                key={v}
                type="button"
                className={`opt ${on ? "on" : ""}`}
                onClick={() => setAnswers({ ...answers, [q.k]: on ? sel.filter((x) => x !== v) : sel.length < (q.max || 4) ? [...sel, v] : sel })}
              >
                <span>{l}{sub && <span className="sub">{sub}</span>}</span>
                <span className="tick">{on ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      )}

      {q.o && !q.type && (
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
        {q.type && (
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => {
              if (!q.optional && q.type === "text" && !String(value || "").trim()) return setHint("Indique ton prénom pour continuer.");
              if (!q.optional && q.type !== "text" && !((value as string[]) || []).length) return setHint(q.type === "themes" ? "Choisis au moins une thématique." : "Choisis au moins une réponse.");
              next();
            }}
          >
            {q.optional && !(Array.isArray(value) ? value.length : String(value || "").trim()) ? "Passer →" : "Continuer →"}
          </button>
        )}
      </div>
    </main>
  );
}
