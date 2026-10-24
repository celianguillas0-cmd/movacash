"use client";
import { useEffect, useState } from "react";

const TYPE = 32, ERASE = 18, HOLD = 2200; // ms par lettre tapée, par lettre effacée, pause sur une fin de phrase

// Sous-titre façon clavier : le début s'écrit une fois, puis la fin en gras s'efface lettre par lettre et une autre la remplace.
// Le texte complet (première version) reste lisible par les lecteurs d'écran.
export default function TypedLead({ plain, endings }: { plain: string; endings: string[] }) {
  const [n, setN] = useState(0); // lettres du début déjà tapées
  const [k, setK] = useState(0); // fin affichée
  const [m, setM] = useState(0); // lettres de la fin affichées
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(plain.length); setM(endings[0].length); return; }
    const end = endings[k];
    let delay = TYPE;
    let step: () => void;
    if (n < plain.length) step = () => setN(n + 1);
    else if (!erasing && m < end.length) step = () => setM(m + 1);
    else if (!erasing) { delay = HOLD; step = () => setErasing(true); }
    else if (m > 0) { delay = ERASE; step = () => setM(m - 1); }
    else { delay = 350; step = () => { setErasing(false); setK((k + 1) % endings.length); }; }
    const t = setTimeout(step, delay);
    return () => clearTimeout(t);
  }, [n, m, k, erasing, plain, endings]);

  return (
    <p className="lead typed">
      <span className="sr-only">{plain + endings[0]}</span>
      <span aria-hidden="true">{plain.slice(0, n)}<b>{endings[k].slice(0, m)}</b><i className="caret" /></span>
    </p>
  );
}
