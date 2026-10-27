"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownView from "@/components/MarkdownView";
import CoverThumb from "@/components/CoverThumb";
import { PALETTES } from "@/lib/covers";
import { checkEtsyCompliance, ETSY_CHECKLIST, type EtsyKit } from "@/lib/etsy";
import { wordCount } from "@/lib/markdown";
import { renderListingImages } from "@/lib/listing-images";
import Miniature from "@/components/at/Miniature";
import GenerationScreen, { etapesProvisoires, type GenStep } from "@/components/at/GenerationScreen";
import type { ThumbStyle } from "@/lib/miniature";
import { useLocale, useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/t";

type Chapter = { id: number; idx: number; title: string; summary: string; content_md: string; status: string };
type Ebook = {
  id: number; title: string; subtitle: string; topic: string; audience: string; language: string; author_name: string;
  sensitive: string | null; status: string; promise: string; cover_json: string; etsy_json: string | null; is_demo: number;
};
type Cover = { style: "moderne" | "elegant" | "bold"; color: string; accent: string; thumb?: ThumbStyle; thumbPalette?: number };
type Phase = "chapitres" | "etsy" | "photo" | null;

export default function EbookEditor({ id, autostart }: { id: number; autostart: boolean }) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tab, setTab] = useState<"contenu" | "miniature" | "couverture" | "etsy" | "export">("contenu");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>(null);
  const [photoTries, setPhotoTries] = useState(0);
  const [current, setCurrent] = useState<number | null>(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/ebooks/${id}`);
    if (!r.ok) return setError(t("E-book introuvable"));
    const d = await r.json();
    setEbook(d.ebook);
    setChapters(d.chapters);
    setPhotoTries(d.photoTries || 0);
    return d as { ebook: Ebook; chapters: Chapter[]; photoTries: number };
  }, [id]);

  const generateChapter = useCallback(
    async (idx: number) => {
      setCurrent(idx);
      setChapters((cs) => cs.map((c) => (c.idx === idx ? { ...c, status: "generating" } : c)));
      const r = await fetch(`/api/ebooks/${id}/chapters/${idx}`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        setChapters((cs) => cs.map((c) => (c.idx === idx ? { ...c, status: "error" } : c)));
        throw new Error(t(d.error || "Erreur de génération"));
      }
      setChapters((cs) => cs.map((c) => (c.idx === idx ? d.chapter : c)));
    },
    [id, t]
  );

  const generateAll = useCallback(
    async (list: Chapter[]) => {
      setRunning(true);
      setError("");
      try {
        setPhase("chapitres");
        for (const c of list.filter((c) => c.status !== "done")) await generateChapter(c.idx);
        // Fiche Etsy puis photo de la miniature, générées automatiquement à la fin
        setPhase("etsy");
        await fetch(`/api/ebooks/${id}/etsy`, { method: "POST" });
        setPhase("photo");
        const d = await load();
        if (d && !d.photoTries) await fetch(`/api/ebooks/${id}/photo`, { method: "POST" }).catch(() => null);
        await load();
        setTab("miniature");
      } catch (e) {
        setError((e as Error).message + " " + t("Tu peux relancer la génération, les chapitres déjà rédigés sont conservés."));
      } finally {
        setRunning(false);
        setCurrent(null);
        setPhase(null);
      }
    },
    [generateChapter, id, load, t]
  );

  useEffect(() => {
    load().then((d) => {
      if (d && autostart && !started.current && d.chapters.some((c) => c.status !== "done")) {
        started.current = true;
        generateAll(d.chapters);
      }
    });
  }, [load, autostart, generateAll]);

  if (error && !ebook) return <p className="text-red-600">{error}</p>;
  // Arrivée depuis le mini-funnel : l'écran de génération s'affiche tout de suite, sans page vide.
  if (!ebook)
    return autostart ? (
      <GenerationScreen className="mt-4" title={t("Rédaction de ton e-book")} note={t("Garde cette page ouverte. Compte 30 à 60 secondes par chapitre.")}
        steps={etapesProvisoires(t, true)} />
    ) : <p className="muted">{t("Chargement…")}</p>;

  const cover: Cover = JSON.parse(ebook.cover_json);
  const done = chapters.filter((c) => c.status === "done").length;
  const words = chapters.reduce((n, c) => n + wordCount(c.content_md), 0);
  const ready = done === chapters.length;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">{ebook.title}</h1>
          <p className="mt-2 text-slate-600">{ebook.subtitle}</p>
          <p className="muted mt-1">
            {t("{done}/{total} chapitres · {mots} mots · ~{pages} pages A4", { done, total: chapters.length, mots: words.toLocaleString(locale), pages: Math.max(1, Math.round(words / 380) + 3) })}
            {ebook.is_demo ? " · " + t("contenu de démo") : ""}
          </p>
        </div>
        <button
          className="btn-danger"
          onClick={async () => {
            if (!window.confirm(t("Supprimer définitivement cet e-book ?"))) return;
            await fetch(`/api/ebooks/${id}`, { method: "DELETE" });
            router.push("/app");
          }}
        >
          {t("Supprimer")}
        </button>
      </div>

      {running && phase && (
        <Generation chapters={chapters} current={current} phase={phase} />
      )}
      {!running && !ready && (
        <div className="card mt-4">
          <p className="text-sm">{t("{n} chapitre(s) restant(s) à générer.", { n: chapters.length - done })}</p>
          <button className="btn-primary mt-3" onClick={() => generateAll(chapters)}>{t("Générer les chapitres restants")}</button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
      {!running && ready && error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {([["contenu", tk("Contenu")], ["miniature", tk("Miniature Etsy")], ["etsy", tk("Fiche Etsy")], ["couverture", tk("Couverture du PDF")], ["export", tk("Export PDF")]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t(l)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "contenu" && (
          <ContentTab ebook={ebook} chapters={chapters} running={running} onRegenerate={async (idx) => {
            setRunning(true);
            setError("");
            try { await generateChapter(idx); } catch (e) { setError((e as Error).message); } finally { setRunning(false); setCurrent(null); }
          }} onSaved={load} />
        )}
        {tab === "miniature" && (
          ready ? (
            <Miniature
              ebookId={ebook.id} title={ebook.title} subtitle={ebook.subtitle} language={ebook.language} chapters={chapters.length}
              pages={ebook.is_demo || words < 2000 ? Math.max(10, chapters.length * 5) : Math.max(10, Math.round(words / 380) + 3)}
              initialStyle={cover.thumb} initialPalette={cover.thumbPalette} photoTries={photoTries}
              toc={chapters.map((c) => c.title.replace(/^(introduction|conclusion)\s*:\s*/i, ""))}
            />
          ) : <div className="card"><p className="text-sm">{t("La miniature se prépare une fois l'e-book rédigé.")}</p></div>
        )}
        {tab === "couverture" && <CoverTab ebook={ebook} cover={cover} onSaved={load} />}
        {tab === "etsy" && <EtsyTab ebook={ebook} chapters={chapters} cover={cover} ready={ready} onSaved={load} />}
        {tab === "export" && <ExportTab ebook={ebook} ready={ready} />}
      </div>
    </div>
  );
}

const PHRASES: Record<Exclude<Phase, null>, string> = {
  chapitres: tk("Rédaction de ton e-book"),
  etsy: tk("Préparation de ta fiche Etsy"),
  photo: tk("Création de ta miniature"),
};

// Écran de génération : étapes du plan, des chapitres, de la fiche et de la miniature.
function Generation({ chapters, current, phase }: { chapters: Chapter[]; current: number | null; phase: Exclude<Phase, null> }) {
  const t = useT();
  const steps: GenStep[] = [
    { label: t("Plan de l'e-book"), state: "ok" },
    ...chapters.map((c) => ({
      label: `${t("Chapitre {n}", { n: c.idx + 1 })} · ${c.title}`,
      state: (c.status === "done" ? "ok" : c.idx === current || (current === null && phase === "chapitres" && c.idx === chapters.find((x) => x.status !== "done")?.idx) ? "now" : "") as GenStep["state"],
    })),
    { label: t("Fiche Etsy (titre, tags, description)"), state: phase === "etsy" ? "now" : phase === "photo" ? "ok" : "" },
    { label: t("Miniature Etsy"), state: phase === "photo" ? "now" : "" },
  ];
  return <GenerationScreen className="mt-4" title={t(PHRASES[phase])} steps={steps} note={t("Garde cette page ouverte. Compte 30 à 60 secondes par chapitre.")} />;
}

function ContentTab({ ebook, chapters, running, onRegenerate, onSaved }: { ebook: Ebook; chapters: Chapter[]; running: boolean; onRegenerate: (idx: number) => void; onSaved: () => void }) {
  const t = useT();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ title: "", content_md: "" });
  const [meta, setMeta] = useState({ title: ebook.title, subtitle: ebook.subtitle });

  async function save(idx: number) {
    await fetch(`/api/ebooks/${ebook.id}/chapters/${idx}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    setEditing(null);
    onSaved();
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <p className="text-sm font-semibold">{t("Titre et sous-titre")}</p>
        <input className="input" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
        <input className="input" value={meta.subtitle} onChange={(e) => setMeta({ ...meta, subtitle: e.target.value })} />
        <button
          className="btn-secondary"
          onClick={async () => {
            await fetch(`/api/ebooks/${ebook.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(meta) });
            onSaved();
          }}
        >
          {t("Enregistrer")}
        </button>
      </div>
      <p className="notice-info">
        {t("Relis chaque chapitre et ajoute ta touche (exemples, expérience, conseils). Un guide relu et personnalisé obtient de meilleurs avis, et tu restes responsable de ce que tu vends.")}
      </p>
      {chapters.map((c) => (
        <div key={c.id} className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{c.idx + 1}. {c.title}</h2>
            <div className="flex gap-2">
              <span className={`badge ${c.status === "done" ? "bg-green-100 text-green-800" : c.status === "error" ? "bg-red-100 text-red-700" : c.status === "generating" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                {{ done: t("{n} mots", { n: wordCount(c.content_md) }), error: t("Erreur"), generating: t("En cours…"), pending: t("En attente") }[c.status] || c.status}
              </span>
              {c.status === "done" && editing !== c.idx && (
                <button className="btn-ghost" onClick={() => { setEditing(c.idx); setDraft({ title: c.title, content_md: c.content_md }); }}>{t("Modifier")}</button>
              )}
              <button className="btn-ghost" disabled={running} onClick={() => onRegenerate(c.idx)}>{c.status === "done" ? t("Régénérer") : t("Générer")}</button>
            </div>
          </div>
          {editing === c.idx ? (
            <div className="mt-3 space-y-2">
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <textarea className="input min-h-[400px] font-mono text-xs" value={draft.content_md} onChange={(e) => setDraft({ ...draft, content_md: e.target.value })} />
              <p className="muted">{t("Markdown : ## sous-titre, - liste, 1. liste numérotée, - [ ] case à cocher, **gras**, > encadré.")}</p>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={() => save(c.idx)}>{t("Enregistrer")}</button>
                <button className="btn-ghost" onClick={() => setEditing(null)}>{t("Annuler")}</button>
              </div>
            </div>
          ) : c.content_md ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-brand-700">{t("Lire le chapitre")}</summary>
              <div className="mt-3"><MarkdownView md={c.content_md} /></div>
            </details>
          ) : (
            <p className="muted mt-2">{c.summary}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function CoverTab({ ebook, cover, onSaved }: { ebook: Ebook; cover: Cover; onSaved: () => void }) {
  const t = useT();
  const [c, setC] = useState<Cover>(cover);
  const [author, setAuthor] = useState(ebook.author_name);
  const [saved, setSaved] = useState(false);
  async function save() {
    await fetch(`/api/ebooks/${ebook.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cover: c, author_name: author }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onSaved();
  }
  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <CoverThumb title={ebook.title} subtitle={ebook.subtitle} author={author} cover={c} large />
      <div className="card space-y-4">
        <div>
          <p className="label">{t("Style")}</p>
          <div className="flex gap-2">
            {(["moderne", "elegant", "bold"] as const).map((s) => (
              <button key={s} className={c.style === s ? "btn-primary" : "btn-secondary"} onClick={() => setC({ ...c, style: s })}>
                {{ moderne: t("Moderne"), elegant: t("Élégant"), bold: t("Impact") }[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">{t("Palette")}</p>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => (
              <button key={p.color} onClick={() => setC({ ...c, ...p })} className={`h-10 w-10 rounded-full border-4 ${c.color === p.color ? "border-brand-600" : "border-slate-200"} shadow`} style={{ background: `linear-gradient(135deg, ${p.color} 60%, ${p.accent} 60%)` }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">{t("Couleur de fond")} <input type="color" className="ml-2 align-middle" value={c.color} onChange={(e) => setC({ ...c, color: e.target.value })} /></label>
          <label className="text-sm">{t("Couleur d'accent")} <input type="color" className="ml-2 align-middle" value={c.accent} onChange={(e) => setC({ ...c, accent: e.target.value })} /></label>
        </div>
        <div>
          <label className="label">{t("Nom d'auteur")}</label>
          <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={save}>{saved ? t("Enregistré ✓") : t("Enregistrer la couverture")}</button>
        <p className="muted">{t("L'aperçu est indicatif : la couverture finale est dessinée dans le PDF.")}</p>
      </div>
    </div>
  );
}

function EtsyTab({ ebook, chapters, cover, ready, onSaved }: { ebook: Ebook; chapters: Chapter[]; cover: Cover; ready: boolean; onSaved: () => void }) {
  const t = useT();
  const [kit, setKit] = useState<EtsyKit | null>(ebook.etsy_json ? JSON.parse(ebook.etsy_json) : null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [images, setImages] = useState<string[]>([]);

  async function generate() {
    setLoading(true);
    const r = await fetch(`/api/ebooks/${ebook.id}/etsy`, { method: "POST" });
    const d = await r.json();
    setLoading(false);
    if (r.ok) setKit(d.kit);
  }
  async function save() {
    await fetch(`/api/ebooks/${ebook.id}/etsy`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(kit) });
    onSaved();
  }
  const copy = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  };

  if (!kit)
    return (
      <div className="card">
        <p className="text-sm">{ready ? t("Génère la fiche produit Etsy de cet e-book.") : t("La fiche Etsy sera générée automatiquement une fois tous les chapitres rédigés.")}</p>
        <button className="btn-primary mt-3" disabled={loading || !ready} onClick={generate}>{loading ? t("Génération…") : t("Générer la fiche Etsy")}</button>
      </div>
    );

  const issues = checkEtsyCompliance(kit, { sensitive: ebook.sensitive, language: ebook.language }, t);
  const words = chapters.reduce((n, c) => n + wordCount(c.content_md), 0);
  const pages = Math.max(10, Math.round(words / 380) + 3);

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <p className="text-sm font-semibold">{t("Vérification de conformité")}</p>
        {issues.map((i, k) => (
          <p key={k} className={`text-sm ${i.level === "error" ? "text-red-600" : i.level === "warning" ? "text-amber-700" : "text-green-700"}`}>
            {i.level === "error" ? "✗" : i.level === "warning" ? "!" : "✓"} {i.message}
          </p>
        ))}
      </div>

      <div className="card space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className="label">{t("Titre ({n}/140)", { n: kit.title.length })}</label>
            <button className="btn-ghost" onClick={() => copy("title", kit.title)}>{copied === "title" ? t("Copié ✓") : t("Copier")}</button>
          </div>
          <input className="input" value={kit.title} onChange={(e) => setKit({ ...kit, title: e.target.value })} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">{t("Tags ({n}/13, 20 caractères max chacun)", { n: kit.tags.length })}</label>
            <button className="btn-ghost" onClick={() => copy("tags", kit.tags.join(", "))}>{copied === "tags" ? t("Copié ✓") : t("Copier")}</button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {Array.from({ length: 13 }).map((_, i) => (
              <input
                key={i}
                className={`input ${(kit.tags[i] || "").length > 20 ? "border-red-400" : ""}`}
                value={kit.tags[i] || ""}
                onChange={(e) => {
                  const tags = [...kit.tags];
                  tags[i] = e.target.value;
                  setKit({ ...kit, tags: tags.filter((x, j) => x || j < tags.length - 1) });
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">{t("Description")}</label>
            <button className="btn-ghost" onClick={() => copy("desc", kit.description)}>{copied === "desc" ? t("Copié ✓") : t("Copier")}</button>
          </div>
          <textarea className="input min-h-[320px]" value={kit.description} onChange={(e) => setKit({ ...kit, description: e.target.value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <p><strong>{t("Prix conseillé :")}</strong> {kit.priceSuggestion}</p>
          <p><strong>{t("Catégorie Etsy :")}</strong> {kit.category}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={save}>{t("Enregistrer la fiche")}</button>
          <button className="btn-secondary" disabled={loading} onClick={generate}>{loading ? "…" : t("Régénérer")}</button>
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-semibold">{t("Images de la fiche (2000 × 1500 px)")}</p>
        <p className="muted mt-1">{t("Etsy autorise jusqu'à 10 images. Voici 3 visuels prêts à télécharger.")}</p>
        <button
          className="btn-secondary mt-3"
          onClick={async () =>
            setImages(await renderListingImages({ title: ebook.title, subtitle: ebook.subtitle, author: ebook.author_name, cover, chapters: chapters.map((c) => c.title), pages, language: ebook.language }))
          }
        >
          {t("Générer les visuels")}
        </button>
        {images.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {images.map((src, i) => (
              <a key={i} href={src} download={`etsy-${ebook.id}-${i + 1}.png`} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={t("Visuel {n}", { n: i + 1 })} className="rounded border border-slate-200" />
                <span className="text-xs text-brand-700">{t("Télécharger")}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <p className="text-sm font-semibold">{t("Avant de publier")}</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {ETSY_CHECKLIST.map((c) => <li key={c}>☐ {t(c)}</li>)}
        </ul>
      </div>
    </div>
  );
}

function ExportTab({ ebook, ready }: { ebook: Ebook; ready: boolean }) {
  const t = useT();
  return (
    <div className="card space-y-3">
      <p className="text-sm">
        {ebook.sensitive
          ? t("Le PDF contient la couverture, une page de droits avec la mention IA et l'avertissement adapté au sujet, le sommaire, tous les chapitres et la pagination.")
          : t("Le PDF contient la couverture, une page de droits avec la mention IA, le sommaire, tous les chapitres et la pagination.")}
      </p>
      {!ready && <p className="text-sm text-amber-700">{t("Génère tous les chapitres avant d'exporter.")}</p>}
      <div className="flex flex-wrap gap-2">
        {[["A4", tk("A4 (Europe, impression)")], ["A5", tk("A5 (lecture sur mobile)")], ["LETTER", tk("US Letter (clients US)")]].map(([s, l]) => (
          <a key={s} className={`btn-primary ${ready ? "" : "pointer-events-none opacity-50"}`} href={`/api/ebooks/${ebook.id}/pdf?size=${s}`}>
            {t("Télécharger")} {t(l)}
          </a>
        ))}
      </div>
      <p className="muted">{t("Sur Etsy, ajoute le PDF comme fichier numérique de l'annonce (20 Mo max par fichier).")}</p>
    </div>
  );
}
