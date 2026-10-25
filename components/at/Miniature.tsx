"use client";
import { useEffect, useRef, useState } from "react";
import { drawThumb, loadThumbFonts, THUMB_PALETTES, type ThumbStyle } from "@/lib/miniature";

const STYLES: { id: ThumbStyle; nom: string; desc: string }[] = [
  { id: "affiche", nom: "Affiche", desc: "Couverture posée comme un vrai livre" },
  { id: "epure", nom: "Épurée", desc: "Titre élégant, photo sur le côté" },
  { id: "magazine", nom: "Magazine", desc: "Photo pleine page, titre dessus" },
];

interface Props {
  ebookId: number;
  title: string;
  subtitle: string;
  language: string;
  chapters: number;
  pages: number;
  initialStyle?: ThumbStyle;
  initialPalette?: number;
  photoTries: number;
  toc: string[];
}

export default function Miniature(p: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [style, setStyle] = useState<ThumbStyle>(p.initialStyle || "affiche");
  const [palette, setPalette] = useState(p.initialPalette ?? p.ebookId % THUMB_PALETTES.length);
  const [tries, setTries] = useState(p.photoTries);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fonts, setFonts] = useState(false);

  useEffect(() => { loadThumbFonts().then(() => setFonts(true)); }, []);

  useEffect(() => {
    if (!tries) return setPhoto(null);
    const img = new Image();
    img.onload = () => setPhoto(img);
    img.onerror = () => setPhoto(null);
    img.src = `/api/ebooks/${p.ebookId}/photo?v=${tries}`;
  }, [p.ebookId, tries]);

  useEffect(() => {
    if (!canvas.current || !fonts) return;
    drawThumb(canvas.current, {
      title: p.title, subtitle: p.subtitle, language: p.language, chapters: p.chapters, pages: p.pages,
      style, palette: THUMB_PALETTES[palette % THUMB_PALETTES.length], photo, toc: p.toc,
    });
  }, [fonts, style, palette, photo, p.title, p.subtitle, p.language, p.chapters, p.pages, p.toc]);

  function choose(next: { style?: ThumbStyle; palette?: number }) {
    const s = next.style ?? style, pal = next.palette ?? palette;
    setStyle(s);
    setPalette(pal);
    fetch(`/api/ebooks/${p.ebookId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ thumb: { style: s, palette: pal } }) });
  }

  async function newPhoto() {
    setLoading(true);
    setError("");
    const r = await fetch(`/api/ebooks/${p.ebookId}/photo`, { method: "POST" });
    const d = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) return setError(d.error || "La photo n'a pas pu être générée. Réessaie dans un instant.");
    if (d.photo) setTries(d.tries);
  }

  function download() {
    if (!canvas.current) return;
    const a = document.createElement("a");
    a.href = canvas.current.toDataURL("image/png");
    a.download = `miniature-etsy-${p.ebookId}.png`;
    a.click();
  }

  const left = Math.max(0, 3 - tries);

  return (
    <div className="at-mini">
      <div>
        <canvas ref={canvas} width={2000} height={1500} aria-label="Aperçu de la miniature Etsy" />
        <p className="at-gen-note">2000 × 1500 px, le format conseillé par Etsy pour la première image de l'annonce.</p>
      </div>
      <div className="at-styles">
        <p className="at-kicker">Mise en page</p>
        {STYLES.map((s) => (
          <button key={s.id} type="button" className="at-cible" aria-pressed={style === s.id} onClick={() => choose({ style: s.id })}>
            <b>{s.nom}</b>
            <small>{s.desc}</small>
          </button>
        ))}
        <p className="at-kicker" style={{ marginTop: 10 }}>Couleurs</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {THUMB_PALETTES.map((c, k) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={palette === k}
              onClick={() => choose({ palette: k })}
              style={{ width: 34, height: 34, borderRadius: 10, border: palette === k ? "2px solid #fff" : "1px solid rgba(255,255,255,.18)", background: `linear-gradient(135deg, ${c.ink} 50%, ${c.band} 50%)`, cursor: "pointer" }}
            />
          ))}
        </div>
        <button type="button" className="at-btn" style={{ marginTop: 12 }} onClick={download}>Télécharger la miniature</button>
        <button type="button" className="at-btn-sec" disabled={loading || left === 0} onClick={newPhoto}>
          {loading ? "Photo en cours…" : tries ? `Nouvelle photo (${left} restante${left > 1 ? "s" : ""})` : "Générer la photo"}
        </button>
        {error && <p className="at-gen-note" style={{ color: "#f0a3a3" }}>{error}</p>}
        {!photo && !loading && <p className="at-gen-note">Sans photo, la miniature utilise un fond aux couleurs choisies.</p>}
      </div>
    </div>
  );
}
