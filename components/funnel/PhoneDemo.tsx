"use client";
import { useEffect, useState } from "react";

const BOOK = "Vinted : de zéro à tes premières ventes";
const CH: [string, string][] = [
  ["Introduction", "Vendre sur Vinted ne demande ni stock ni gros budget. Dans ce guide, tu apprends à trier, photographier et publier tes articles pas à pas."],
  ["Trouver les bons articles", "Commence par ton dressing : les marques connues, les pièces en bon état et les vêtements de saison partent le plus vite."],
  ["Photos qui vendent", "Place-toi près d'une fenêtre, sur un fond clair. Prends cinq angles par article et montre toujours l'étiquette."],
  ["Fixer ses prix", "Regarde les annonces vendues pour le même article, puis place-toi légèrement en dessous pour vendre dans la semaine."],
  ["Plan d'action 30 jours", "Semaine 1 : trier. Semaine 2 : photographier. Semaine 3 : publier quinze annonces. Semaine 4 : ajuster tes prix."],
];
const STEP = 26; // ms par caractère

// Téléphone animé de la landing : un e-book en cours de génération, chapitre par chapitre (pas de fausses ventes).
export default function PhoneDemo() {
  const [ch, setCh] = useState(0);
  const [n, setN] = useState(0);
  const done = ch >= CH.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCh(2); setN(CH[2][1].length); return; }
    const t = setInterval(() => {
      setN((x) => x + 1);
    }, STEP);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (done) {
      if (n > 90) { setCh(0); setN(0); } // pause sur « PDF prêt », puis on recommence
    } else if (n > CH[ch][1].length + 25) {
      setCh(ch + 1); setN(0);
    }
  }, [n, ch, done]);

  const total = CH.reduce((s, c) => s + c[1].length, 0);
  const written = done ? total : CH.slice(0, ch).reduce((s, c) => s + c[1].length, 0) + Math.min(n, CH[ch][1].length);
  const pct = Math.round((written / total) * 100);

  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-screen">
        <div className="phone-status"><span>9:41</span><span>5G ▮▮▮</span></div>
        <div className="p-card">
          <div className="p-head">
            <span className={done ? "p-dot ok" : "p-dot spin"} />
            <div className="t">{done ? "E-book prêt" : "Génération en cours"}</div>
            <b className="p-pct">{pct} %</b>
          </div>
          <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>{BOOK}</div>
          <div className="p-bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="p-card">
          {CH.map(([t], k) => (
            <div key={t} className={`p-ch${k === ch ? " now" : ""}`}>
              <span>{k + 1}. {t}</span>
              <b>{k < ch ? "✓" : k === ch ? "en cours" : ""}</b>
            </div>
          ))}
        </div>
        <div className="p-card p-write">
          {done ? (
            <>
              <div className="k">PDF PRÊT</div>
              <div className="t">48 pages · A4 · couverture incluse</div>
              <div className="ok-green" style={{ marginTop: 6, fontSize: 12 }}>Fiche Etsy générée ✓</div>
            </>
          ) : (
            <>
              <div className="k">CHAPITRE {ch + 1} · RÉDACTION</div>
              <p>{CH[ch][1].slice(0, n)}<i className="caret" /></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
