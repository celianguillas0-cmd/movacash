"use client";
import { useEffect, useState } from "react";

// Sous-titre qui s'écrit lettre par lettre ; le texte complet reste lisible par les lecteurs d'écran.
export default function TypedLead({ plain, bold }: { plain: string; bold: string }) {
  const full = plain + bold;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(full.length); return; }
    const t = setInterval(() => setN((x) => (x >= full.length ? (clearInterval(t), x) : x + 1)), 28);
    return () => clearInterval(t);
  }, [full]);
  const a = full.slice(0, Math.min(n, plain.length));
  const b = n > plain.length ? full.slice(plain.length, n) : "";
  return (
    <p className="lead typed">
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">{a}<b>{b}</b><i className="caret" /></span>
    </p>
  );
}
