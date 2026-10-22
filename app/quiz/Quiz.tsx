"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Cat = { slug: string; name: string; emoji: string; count: number };
type Idea = { id: number; title: string; emoji: string; category_name: string; price_min: number; price_max: number; demand: number; competition: number };

const STEPS = [
  {
    key: "goal",
    q: "Quel est votre objectif ?",
    options: [
      ["side", "Un complément de revenus à côté de mon activité"],
      ["main", "Construire progressivement une activité à part entière"],
      ["test", "Tester la vente de produits numériques"],
    ],
  },
  {
    key: "experience",
    q: "Avez-vous déjà vendu sur Etsy ?",
    options: [
      ["none", "Jamais, je pars de zéro"],
      ["some", "Un peu, j'ai déjà une boutique"],
      ["advanced", "Oui, je vends régulièrement"],
    ],
  },
  {
    key: "time",
    q: "Combien de temps pouvez-vous y consacrer par semaine ?",
    options: [
      ["2h", "Moins de 2 heures"],
      ["5h", "2 à 5 heures"],
      ["10h", "Plus de 5 heures"],
    ],
  },
  {
    key: "language",
    q: "Dans quelle langue voulez-vous vendre ?",
    options: [
      ["fr", "Français"],
      ["en", "Anglais (marché plus large)"],
      ["both", "Les deux"],
    ],
  },
] as const;

export default function Quiz({ categories, total }: { categories: Cat[]; total: number }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cats, setCats] = useState<string[]>([]);
  const [phase, setPhase] = useState<"questions" | "analyse" | "result">("questions");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const totalSteps = STEPS.length + 1;

  async function finish() {
    setPhase("analyse");
    const quiz = { ...answers, categories: cats };
    try {
      localStorage.setItem("mc_quiz", JSON.stringify(quiz));
    } catch {}
    const [res] = await Promise.all([
      fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(quiz) }).then((r) => r.json()),
      new Promise((r) => setTimeout(r, 2200)),
    ]);
    setIdeas(res.ideas || []);
    setPhase("result");
  }

  if (phase === "analyse") return <Analyse total={total} />;

  if (phase === "result")
    return (
      <div>
        <h1 className="h1">Vos idées de départ</h1>
        <p className="mt-2 text-slate-600">
          Voici 6 sujets adaptés à vos réponses, tirés de notre base de {total} idées. Avec un abonnement, vous accédez à toute la base, à la génération des e-books et au kit de fiche Etsy.
        </p>
        <div className="mt-6 space-y-3">
          {ideas.map((i) => (
            <div key={i.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">{i.emoji} {i.category_name}</p>
                <p className="font-medium">{i.title}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-slate-500">
                <p>Potentiel {"●".repeat(i.demand)}{"○".repeat(5 - i.demand)}</p>
                <p>{i.price_min}–{i.price_max} €</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card mt-6 bg-brand-50">
          <p className="text-sm text-slate-700">
            <strong>Réaliste :</strong> {answers.time === "2h" ? "avec moins de 2 h par semaine, visez 1 e-book bien relu par semaine." : "avec ce temps disponible, vous pouvez publier 2 à 4 e-books relus par semaine."} Les premières ventes arrivent rarement tout de suite : la régularité et la qualité des fiches font la différence. Aucun revenu n'est garanti.
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/inscription" className="btn-primary px-6 py-3">Créer mon compte</Link>
          <Link href="/tarifs" className="btn-secondary px-6 py-3">Voir les offres</Link>
        </div>
      </div>
    );

  const current = STEPS[step];
  return (
    <div>
      <div className="mb-6 h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>
      <p className="muted">Question {step + 1} / {totalSteps}</p>
      {current ? (
        <>
          <h1 className="h1 mt-1">{current.q}</h1>
          <div className="mt-6 space-y-3">
            {current.options.map(([v, label]) => (
              <button
                key={v}
                className={`card w-full text-left hover:border-brand-500 ${answers[current.key] === v ? "border-brand-600 ring-2 ring-brand-100" : ""}`}
                onClick={() => {
                  setAnswers({ ...answers, [current.key]: v });
                  setStep(step + 1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="h1 mt-1">Quelles thématiques vous intéressent ?</h1>
          <p className="muted mt-1">Choisissez jusqu'à 5 catégories.</p>
          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
            {categories.map((c) => {
              const on = cats.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${on ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"}`}
                  onClick={() => setCats(on ? cats.filter((x) => x !== c.slug) : cats.length < 5 ? [...cats, c.slug] : cats)}
                >
                  {c.emoji} {c.name}
                </button>
              );
            })}
          </div>
          <button className="btn-primary mt-6 px-6 py-3" disabled={!cats.length} onClick={finish}>
            Voir mes idées
          </button>
        </>
      )}
      {step > 0 && (
        <button className="btn-ghost mt-4" onClick={() => setStep(step - 1)}>
          ← Retour
        </button>
      )}
    </div>
  );
}

function Analyse({ total }: { total: number }) {
  const msgs = [`Analyse de ${total} idées…`, "Filtrage selon votre niveau…", "Sélection des meilleures opportunités…"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, msgs.length - 1)), 700);
    return () => clearInterval(t);
  }, [msgs.length]);
  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <p className="text-lg font-medium">{msgs[i]}</p>
    </div>
  );
}
