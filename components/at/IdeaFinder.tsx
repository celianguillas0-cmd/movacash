"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IdeaCard from "./IdeaCard";
import type { FoundIdea, PublicCible } from "@/lib/ideas";
import { useLocale, useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/t";
import { rich } from "@/lib/i18n/rich";

const CIBLES: [PublicCible, string, string][] = [
  ["tous", tk("Tous"), ""],
  ["particuliers", tk("Particuliers"), tk("le grand public")],
  ["pros", tk("Pros"), tk("indépendants, métiers")],
  ["parents", tk("Parents"), tk("familles, enfants")],
];

export default function IdeaFinder({ initialQ = "" }: { initialQ?: string }) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  // La dernière recherche est gardée par langue : changer de langue relance une recherche traduite
  const CLE = `mc_idees_${locale}`;
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
  }, [initialQ, CLE]);

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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Un sujet si tu en as un : couture, chiots, Excel… (facultatif)")} aria-label={t("Sujet (facultatif)")} maxLength={80} />
        <button className="at-btn" disabled={loading}>{loading ? t("Recherche…") : t("Générer")}</button>
      </form>
      <button type="button" className="at-cible-btn" onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert}>
        {t("Cibler un public en particulier (facultatif)")} <span aria-hidden="true">{ouvert ? "⌃" : "⌄"}</span>
      </button>
      {ouvert && (
        <div className="at-cibles">
          {CIBLES.map(([id, nom, s]) => (
            <button key={id} type="button" className="at-cible" aria-pressed={cible === id} onClick={() => setCible(id)}>
              <b>{t(nom)}</b>{s && <small>{t(s)}</small>}
            </button>
          ))}
        </div>
      )}

      {!res ? (
        <div className="at-carte at-colonne" style={{ marginTop: 24 }}>
          <p>{rich(t("Appuie sur <1>Générer</1> : on te propose des idées d'e-books à vendre sur Etsy, classées selon tes réponses au questionnaire. Un sujet dans le champ, c'est facultatif."), { 1: (s) => <b>{s}</b> })}</p>
        </div>
      ) : res.ideas.length === 0 ? (
        <div className="at-carte at-colonne" style={{ marginTop: 24 }}>
          <p>{t("Aucune idée ne correspond à « {q} » pour l'instant. Essaie un mot plus large, ou laisse le champ vide.", { q })}</p>
        </div>
      ) : (
        <>
          <p className="at-compte-idees">{rich(res.total > 1 ? t("<1>{n}</1> idées classées selon tes réponses", { n: res.total }) : t("<1>{n}</1> idée classée selon tes réponses", { n: res.total }), { 1: (s) => <b>{s}</b> })}{res.total > res.ideas.length ? ` · ${t("les {n} meilleures", { n: res.ideas.length })}` : ""}</p>
          {res.ideas.map((i, k) => (
            <IdeaCard key={i.id} idea={i} rank={k + 1} onKeep={garde === i.id ? undefined : () => garder(i.id)} />
          ))}
        </>
      )}
    </div>
  );
}
