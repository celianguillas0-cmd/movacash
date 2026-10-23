"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Cat = { slug: string; name: string; emoji: string; count: number };
type Idea = {
  id: number; title: string; emoji: string; category_name: string; audience: string; keywords: string; format: string;
  difficulty: number; demand: number; competition: number; price_min: number; price_max: number; sensitive: string | null; is_favorite: number;
};

const dots = (n: number) => "●".repeat(n) + "○".repeat(5 - n);
const SENS: Record<string, string> = { health: "Santé", finance: "Argent", legal: "Juridique" };

export default function IdeasBrowser({ categories }: { categories: Cat[] }) {
  const [f, setF] = useState({ q: "", category: "", difficulty: "", sensitive: "all", minDemand: "", maxCompetition: "", sort: "opportunity", favorites: "", page: 1 });
  const [data, setData] = useState<{ items: Idea[]; total: number; pages: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const sp = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => v !== "" && sp.set(k, String(v)));
      const r = await fetch(`/api/ideas?${sp}`);
      setData(await r.json());
    }, 200);
    return () => clearTimeout(t);
  }, [f]);

  const set = (k: string, v: string | number) => setF({ ...f, [k]: v, page: k === "page" ? Number(v) : 1 });

  async function toggleFav(id: number) {
    const r = await fetch(`/api/ideas/${id}/favorite`, { method: "POST" });
    const { favorite } = await r.json();
    setData((d) => d && { ...d, items: d.items.map((i) => (i.id === id ? { ...i, is_favorite: favorite ? 1 : 0 } : i)) });
  }

  return (
    <div className="mt-6">
      <div className="card grid gap-3 md:grid-cols-6">
        <input className="input md:col-span-2" placeholder="Rechercher : vinted, muscu, chien, budget…" value={f.q} onChange={(e) => set("q", e.target.value)} />
        <select className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.name} ({c.count})</option>)}
        </select>
        <select className="input" value={f.sort} onChange={(e) => set("sort", e.target.value)}>
          <option value="opportunity">Meilleure opportunité</option>
          <option value="demand">Plus forte demande</option>
          <option value="competition">Moins de concurrence</option>
          <option value="price">Prix le plus élevé</option>
          <option value="title">Ordre alphabétique</option>
          <option value="random">Aléatoire</option>
        </select>
        <select className="input" value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
          <option value="">Toute difficulté</option>
          <option value="1">Facile à rédiger</option>
          <option value="2">Moyen</option>
          <option value="3">Expertise conseillée</option>
        </select>
        <select className="input" value={f.sensitive} onChange={(e) => set("sensitive", e.target.value)}>
          <option value="all">Tous sujets</option>
          <option value="none">Sans sujet sensible</option>
          <option value="only">Sujets sensibles seulement</option>
        </select>
        <select className="input" value={f.minDemand} onChange={(e) => set("minDemand", e.target.value)}>
          <option value="">Potentiel : tous</option>
          <option value="4">Potentiel ≥ 4</option>
          <option value="5">Potentiel 5</option>
        </select>
        <select className="input" value={f.maxCompetition} onChange={(e) => set("maxCompetition", e.target.value)}>
          <option value="">Concurrence : toute</option>
          <option value="2">Concurrence ≤ 2</option>
          <option value="3">Concurrence ≤ 3</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="accent-[#a5d8ff]" checked={f.favorites === "1"} onChange={(e) => set("favorites", e.target.checked ? "1" : "")} /> Mes favoris
        </label>
        <p className="muted self-center md:col-span-3">{data ? `${data.total} idée(s)` : "Chargement…"}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((i) => (
          <div key={i.id} className="card flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">{i.emoji} {i.category_name}</p>
              <button onClick={() => toggleFav(i.id)} className={`text-lg leading-none ${i.is_favorite ? "text-brand-600" : "text-slate-400 hover:text-slate-700"}`} title="Favori" aria-label={i.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}>{i.is_favorite ? "★" : "☆"}</button>
            </div>
            <p className="mt-1 font-semibold text-slate-900">{i.title}</p>
            <p className="muted mt-1">Pour : {i.audience}</p>
            <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-slate-600">
              <span>Potentiel <span className="text-brand-600">{dots(i.demand)}</span></span>
              <span>Concurrence <span className="text-slate-400">{dots(i.competition)}</span></span>
              <span>Format : {i.format}</span>
              <span>Prix conseillé : {i.price_min}–{i.price_max} €</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {i.sensitive && <span className="badge bg-amber-100 text-amber-800">⚠ {SENS[i.sensitive]} : avertissement ajouté</span>}
              {i.keywords.split(",").slice(0, 3).map((k) => <span key={k} className="badge bg-slate-100 text-slate-600">{k.trim()}</span>)}
            </div>
            <div className="mt-4 flex flex-1 items-end gap-2">
              <Link href={`/app/nouveau?idea=${i.id}`} className="btn-primary">Créer cet e-book</Link>
              <a className="btn-ghost" target="_blank" rel="noreferrer" href={`https://www.etsy.com/search?q=${encodeURIComponent(i.title)}`}>Vérifier sur Etsy ↗</a>
            </div>
          </div>
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="btn-secondary" disabled={f.page <= 1} onClick={() => set("page", f.page - 1)}>←</button>
          <span className="text-sm text-slate-600">Page {f.page} / {data.pages}</span>
          <button className="btn-secondary" disabled={f.page >= data.pages} onClick={() => set("page", f.page + 1)}>→</button>
        </div>
      )}
    </div>
  );
}
