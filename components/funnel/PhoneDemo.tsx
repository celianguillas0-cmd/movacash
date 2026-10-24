"use client";
import { useEffect, useState } from "react";

const STEPS = ["Analyse du sujet", "Plan détaillé", "Rédaction des chapitres", "Exemples et exercices", "Couverture et mise en page", "Fiche Etsy et 13 tags"];
const TICKS = 260; // ~13 s pour aller de 0 à 100 %
const R = 70, C = 2 * Math.PI * R;

// Téléphone de la landing : un chargement qui tourne et la liste de ce que Movacash génère, sans sujet précis (pas de fausses ventes).
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
  const cur = done ? STEPS.length : Math.floor(p * STEPS.length);

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
          <ul className="gen-todo">
            {STEPS.map((label, k) => (
              <li key={label} className={k < cur ? "ok" : k === cur ? "now" : ""}>
                <span className="ic">{k < cur ? "✓" : ""}</span>{label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
