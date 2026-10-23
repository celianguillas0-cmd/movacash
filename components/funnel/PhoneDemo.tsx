"use client";
import { useEffect, useState } from "react";

const CH = ["Introduction", "Trouver les bons articles", "Photos qui vendent", "Fixer ses prix", "Plan d'action 30 jours"];

// Téléphone animé de la landing : montre un e-book en cours de rédaction (pas de fausses ventes).
export default function PhoneDemo({ tilt = false }: { tilt?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x > CH.length ? 0 : x + 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={tilt ? "phone tilt" : "phone"} aria-hidden="true">
      <div className="phone-screen">
        <div className="phone-status"><span>9:41</span><span>5G ▮▮▮</span></div>
        <div className="p-card">
          <div className="t">Rédaction en cours</div>
          <div className="dim" style={{ fontSize: 12 }}>Vinted : de zéro à tes premières ventes</div>
          <div className="p-bar"><i style={{ width: `${(Math.min(i, CH.length) / CH.length) * 100}%` }} /></div>
        </div>
        <div className="p-card">
          {CH.map((t, k) => (
            <div key={t} className="p-ch"><span>{k + 1}. {t}</span><b>{k < i ? `${1800 + ((k * 137) % 700)} mots` : "…"}</b></div>
          ))}
        </div>
        <div className="p-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="mini-cover"><div className="k">GUIDE PRATIQUE</div><div className="h">Vinted : de zéro à tes premières ventes</div></div>
          <div>
            <div className="t">PDF prêt</div>
            <div className="dim" style={{ fontSize: 12 }}>48 pages · A4 · couverture incluse</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent)" }}>Fiche Etsy générée ✓</div>
          </div>
        </div>
      </div>
    </div>
  );
}
