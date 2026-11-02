"use client";
import { useEffect, useRef, useState } from "react";

// Graphique des nouvelles inscriptions par jour (heure de Paris), sur 7, 30 ou 90 jours.
export default function Inscriptions({ jours }: { jours: { d: string; n: number }[] }) {
  const [periode, setPeriode] = useState(30);
  const [survol, setSurvol] = useState<number | null>(null);
  // Le dessin suit la largeur réelle : textes lisibles sur téléphone comme sur ordinateur.
  const boite = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const el = boite.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(260, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const data = jours.slice(-periode);
  const max = Math.max(1, ...data.map((j) => j.n));
  const total = data.reduce((s, j) => s + j.n, 0);
  const pas = max <= 4 ? 1 : Math.ceil(max / 4);
  const graduations = Array.from({ length: Math.floor(max / pas) + 1 }, (_, i) => i * pas);
  const haut = Math.max(max, graduations[graduations.length - 1]);
  const H = 220, G = 30, B = 24, D = 4; // hauteur, marge gauche, marge basse, marge droite
  const larg = (W - G - D) / data.length;
  const barre = Math.max(2, larg - 2);
  const y = (n: number) => H - B - (n / haut) * (H - B - 10);
  const date = (d: string, long = false) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short" });
  const nbEtiq = W < 480 ? 4 : 6;
  const etiquettes = data.map((_, i) => i).filter((i) => i === data.length - 1 || (data.length - 1 - i) % Math.ceil(data.length / nbEtiq) === 0);
  const s = survol !== null ? data[survol] : null;

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Nouvelles inscriptions</h2>
          <p className="muted text-sm">{total} sur les {periode} derniers jours · par jour, heure de Paris</p>
        </div>
        <div className="flex gap-1" role="group" aria-label="Période">
          {[7, 30, 90].map((p) => (
            <button key={p} type="button" onClick={() => { setPeriode(p); setSurvol(null); }} aria-pressed={periode === p}
              className={`rounded-md px-3 py-1 text-sm ${periode === p ? "bg-slate-900 text-white" : "muted"}`}>{p} j</button>
          ))}
        </div>
      </div>
      <div className="relative mt-4" ref={boite}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label={`Inscriptions par jour : ${total} sur ${periode} jours`} onMouseLeave={() => setSurvol(null)}>
          {graduations.map((g) => (
            <g key={g}>
              <line x1={G} x2={W - D} y1={y(g)} y2={y(g)} stroke="currentColor" strokeOpacity={g === 0 ? 0.35 : 0.1} />
              <text x={G - 6} y={y(g) + 4} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity={0.55}>{g}</text>
            </g>
          ))}
          {data.map((j, i) => {
            const x = G + i * larg + (larg - barre) / 2;
            const h = H - B - y(j.n);
            return (
              <g key={j.d} onMouseEnter={() => setSurvol(i)} onClick={() => setSurvol(i)}>
                <rect x={G + i * larg} y={0} width={larg} height={H - B} fill="transparent" />
                {j.n > 0 && <rect x={x} y={y(j.n)} width={barre} height={h} rx={Math.min(4, barre / 2)} fill="currentColor" fillOpacity={survol === i ? 1 : 0.75} />}
              </g>
            );
          })}
          {etiquettes.map((i) => (
            <text key={i} x={i === data.length - 1 ? W - D : G + i * larg + larg / 2} y={H - 6} textAnchor={i === data.length - 1 ? "end" : "middle"} fontSize="11" fill="currentColor" fillOpacity={0.55}>{date(data[i].d)}</text>
          ))}
        </svg>
        {s && (
          <div className="pointer-events-none absolute top-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow"
            style={{ left: `clamp(0px, calc(${((G + survol! * larg + larg / 2) / W) * 100}% - 70px), calc(100% - 150px))` }}>
            <p className="muted text-xs">{date(s.d, true)}</p>
            <p className="font-semibold text-slate-900">{s.n} inscription{s.n > 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
      <details className="mt-3 text-sm">
        <summary className="muted cursor-pointer">Voir le tableau</summary>
        <ul className="mt-2 max-h-48 overflow-auto">
          {[...data].reverse().map((j) => (
            <li key={j.d} className="flex justify-between border-t border-slate-100 py-1"><span>{date(j.d)}</span><span className="font-semibold">{j.n}</span></li>
          ))}
        </ul>
      </details>
    </section>
  );
}
