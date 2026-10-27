"use client";
import { useEffect, useRef, useState } from "react";
import type { T } from "@/lib/i18n/t";

export type GenStep = { label: string; state: "ok" | "now" | "" };

// Écran de génération : anneau et étapes cochées une à une.
// L'anneau avance en continu vers l'étape suivante (sans jamais l'atteindre avant qu'elle soit finie),
// puis rattrape d'un coup : pas d'arrêt sur place pendant qu'un chapitre s'écrit.
export default function GenerationScreen({ title, steps, note, className = "" }: { title: string; steps: GenStep[]; note: string; className?: string }) {
  const finished = steps.filter((s) => s.state === "ok").length;
  const base = (finished / steps.length) * 100;
  const plafond = Math.min(99, ((finished + 0.92) / steps.length) * 100);
  const [shown, setShown] = useState(base);
  const cible = useRef({ base, plafond });
  cible.current = { base, plafond };

  useEffect(() => {
    const id = window.setInterval(() => {
      setShown((v) => {
        const { base, plafond } = cible.current;
        if (v < base) return base;
        return Math.min(plafond, v + Math.max(0.04, (plafond - v) * 0.018));
      });
    }, 120);
    return () => window.clearInterval(id);
  }, []);

  const pct = Math.min(99, Math.floor(Math.max(shown, base)));
  const r = 84, len = 2 * Math.PI * r;
  const liste = useRef<HTMLDivElement>(null);
  // L'étape en cours reste visible dans la liste
  useEffect(() => {
    liste.current?.querySelector(".now")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [finished]);

  return (
    <div className={`at-gen ${className}`} role="status" aria-live="polite">
      <div className="at-anneau">
        <svg viewBox="0 0 190 190" aria-hidden="true">
          <circle className="fond" cx="95" cy="95" r={r} />
          <circle className="trait" cx="95" cy="95" r={r} strokeDasharray={len} strokeDashoffset={len * (1 - pct / 100)} />
        </svg>
        <p><span>{pct}<small>%</small></span></p>
      </div>
      <div>
        <h2>{title}…</h2>
        <div className="at-gen-etapes" ref={liste}>
          {steps.map((s, k) => (
            <div key={k} className={`at-gen-etape ${s.state}`}><i />{s.label}</div>
          ))}
        </div>
        <p className="at-gen-note">{note}</p>
      </div>
    </div>
  );
}

// Étapes affichées avant que le plan existe (titres des chapitres pas encore connus).
export function etapesProvisoires(t: T, planFini: boolean, chapitres = 9): GenStep[] {
  return [
    { label: t("Plan de l'e-book"), state: planFini ? "ok" : "now" },
    ...Array.from({ length: chapitres }, (_, k) => ({ label: t("Chapitre {n}", { n: k + 1 }), state: (planFini && k === 0 ? "now" : "") as GenStep["state"] })),
    { label: t("Fiche Etsy (titre, tags, description)"), state: "" },
    { label: t("Miniature Etsy"), state: "" },
  ];
}
