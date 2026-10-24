"use client";
import { useEffect, useState } from "react";

const STEPS = ["Analyse du sujet", "Plan détaillé", "Chapitre 1 · Introduction", "Chapitre 2 · Trouver les bons articles", "Chapitre 3 · Photos qui vendent", "Chapitre 4 · Fixer ses prix", "Chapitre 5 · Plan d'action 30 jours", "Mise en page du PDF", "Fiche Etsy"];
const TICKS = 260; // ~13 s pour aller de 0 à 100 %
const R = 70, C = 2 * Math.PI * R;

// Téléphone de la landing : tout l'écran montre un e-book en cours de génération (cercle qui tourne, pas de fausses ventes).
export default function PhoneDemo() {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(Math.round(TICKS * 0.62)); return; }
    const id = setInterval(() => setT((x) => (x >= TICKS + 60 ? 0 : x + 1)), 50); // pause sur « prêt », puis on recommence
    return () => clearInterval(id);
  }, []);
  const p = Math.min(t / TICKS, 1);
  const pct = Math.round(p * 100);
  const done = p >= 1;
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))];

  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-screen gen-screen">
        <div className="phone-status"><span>9:41</span><span>5G ▮▮▮</span></div>
        <div className="gen-body">
          <div className={done ? "gen-ring done" : "gen-ring"}>
            <svg viewBox="0 0 160 160">
              <circle className="track" cx="80" cy="80" r={R} />
              <circle className="arc" cx="80" cy="80" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
            </svg>
            {!done && <svg className="spinner" viewBox="0 0 160 160"><circle cx="80" cy="80" r={R + 12} strokeDasharray={`${C * 0.18} ${C}`} /></svg>}
            <div className="gen-center">{done ? <span className="gen-check">✓</span> : <><b>{pct}</b><small>%</small></>}</div>
          </div>
          <div className="gen-title">{done ? "Ton e-book est prêt" : "Génération en cours…"}</div>
          <div className="gen-book">Vinted : de zéro à tes premières ventes</div>
          <div className="gen-step">{done ? "PDF 48 pages · fiche Etsy incluse" : step}</div>
        </div>
      </div>
    </div>
  );
}
