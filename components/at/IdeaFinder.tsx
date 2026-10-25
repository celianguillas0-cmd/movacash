"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IdeaCard from "./IdeaCard";
import type { FoundIdea, PublicCible } from "@/lib/ideas";

const CIBLES: [PublicCible, string, string][] = [
  ["tous", "Tous", ""],
  ["particuliers", "Particuliers", "le grand public"],
  ["pros", "Pros", "indépendants, métiers"],
  ["parents", "Parents", "familles, enfants"],
];
const CLE = "mc_idees";

export default function IdeaFinder({ initialQ = "" }: { initialQ?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [cible, setCible] = useState<PublicCible>("tous");
  const [ouvert, setOuvert] = useState(false);
  const [res, setRes] = useState<{ total: number; ideas: FoundIdea[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [garde, setGarde] = useState<number | null>(null);

  // On retrouve la dernière recherche en revenant sur la page
  useEffect(() => {
    if (initialQ) return;
    try {
      const s = JSON.parse(sessionStorage.getItem(CLE) || "null");
      if (s?.res) { setRes(s.res); setQ(s.q || ""); setCible(s.cible || "tous"); }
    } catch {}
  }, [initialQ]);

  async function chercher(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    const r = await fetch("/api/ideas/find", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, cible }) });
    const d = await r.json().catch(() => null);
    setLoading(false);
    if (!r.ok || !d) return;
    setRes(d);
    try { sessionStorage.setItem(CLE, JSON.stringify({ q, cible, res: d })); } catch {}
    router.refresh();
  }
  useEffect(() => {
    if (initialQ) chercher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function garder(id: number) {
    await fetch("/api/ideas/mine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideaId: id }) });
    setGarde(id);
    router.refresh();
  }

  return (
    <div>
      <form className="at-recherche" onSubmit={chercher}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un sujet si tu en as un : couture, chiots, Excel… (facultatif)" aria-label="Sujet (facultatif)" maxLength={80} />
        <button className="at-btn" disabled={loading}>{loading ? "Recherche…" : "Générer"}</button>
      </form>
      <button type="button" className="at-cible-btn" onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert}>
        Cibler un public en particulier (facultatif) <span aria-hidden="true">{ouvert ? "⌃" : "⌄"}</span>
      </button>
      {ouvert && (
        <div className="at-cibles">
          {CIBLES.map(([id, t, s]) => (
            <button key={id} type="button" className="at-cible" aria-pressed={cible === id} onClick={() => setCible(id)}>
              <b>{t}</b>{s && <small>{s}</small>}
            </button>
          ))}
        </div>
      )}

      {!res ? (
        <div className="at-carte at-colonne" style={{ marginTop: 24 }}>
          <p>Appuie sur <b>Générer</b> : on te propose des idées d&apos;e-books à vendre sur Etsy, classées selon tes réponses au questionnaire. Un sujet dans le champ, c&apos;est facultatif.</p>
        </div>
      ) : res.ideas.length === 0 ? (
        <div className="at-carte at-colonne" style={{ marginTop: 24 }}>
          <p>Aucune idée ne correspond à « {q} » pour l&apos;instant. Essaie un mot plus large, ou laisse le champ vide.</p>
        </div>
      ) : (
        <>
          <p className="at-compte-idees"><b>{res.total}</b> idée{res.total > 1 ? "s" : ""} classée{res.total > 1 ? "s" : ""} selon tes réponses{res.total > res.ideas.length ? ` · les ${res.ideas.length} meilleures` : ""}</p>
          {res.ideas.map((i, k) => (
            <IdeaCard key={i.id} idea={i} rank={k + 1} onKeep={garde === i.id ? undefined : () => garder(i.id)} />
          ))}
        </>
      )}
    </div>
  );
}
