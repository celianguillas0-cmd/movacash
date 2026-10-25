// Miniature Etsy dessinée côté navigateur (canvas → PNG 2000 × 1500, le format conseillé par Etsy).
// Principe : une vraie mise en page de graphiste (typo, filets, bandeaux, photo réelle), jamais d'effets « IA »
// (pas de doré, pas de 3D, pas de chiffres géants, pas de badges).

export type ThumbStyle = "affiche" | "epure" | "magazine";

export interface ThumbPalette { name: string; paper: string; ink: string; band: string; dark: string }

export const THUMB_PALETTES: ThumbPalette[] = [
  { name: "Encre marine", paper: "#f3efe6", ink: "#1d2c4c", band: "#d39b3a", dark: "#141c30" },
  { name: "Terre cuite", paper: "#f6efe6", ink: "#8a3b1f", band: "#c8643b", dark: "#2b1d16" },
  { name: "Forêt", paper: "#f2ecdd", ink: "#23432f", band: "#4f7a4a", dark: "#17241b" },
  { name: "Prune", paper: "#f7f0ea", ink: "#4a2340", band: "#c2577a", dark: "#241221" },
  { name: "Océan", paper: "#eef2f1", ink: "#0f4c5c", band: "#e07a5f", dark: "#0b2a33" },
  { name: "Encre noire", paper: "#f4f1ea", ink: "#1b1b1b", band: "#d1462f", dark: "#111111" },
];

export interface ThumbInput {
  title: string;
  subtitle: string;
  language: string;
  chapters: number;
  pages: number;
  style: ThumbStyle;
  palette: ThumbPalette;
  photo: HTMLImageElement | null;
  // Titres des chapitres : sans photo, la miniature montre un extrait du sommaire à la place
  toc: string[];
}

const W = 2000, H = 1500;

const WORDS: Record<string, { kicker: string; chap: string; pages: string; pdf: string; toc: string }> = {
  fr: { kicker: "Le guide complet", chap: "chapitres", pages: "pages", pdf: "PDF à télécharger", toc: "Au sommaire" },
  en: { kicker: "The complete guide", chap: "chapters", pages: "pages", pdf: "Instant PDF download", toc: "Inside" },
  es: { kicker: "La guía completa", chap: "capítulos", pages: "páginas", pdf: "PDF descargable", toc: "Contenido" },
  de: { kicker: "Der komplette Leitfaden", chap: "Kapitel", pages: "Seiten", pdf: "PDF zum Download", toc: "Inhalt" },
  it: { kicker: "La guida completa", chap: "capitoli", pages: "pagine", pdf: "PDF scaricabile", toc: "Contenuti" },
};

const words = (lang: string) => WORDS[(lang || "fr").slice(0, 2).toLowerCase()] || WORDS.fr;
const features = (i: ThumbInput) => {
  const w = words(i.language);
  return [`${i.chapters} ${w.chap}`, `${i.pages} ${w.pages}`, w.pdf];
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
  }
  if (line) out.push(line);
  return out;
}

// Plus grande taille de police (entre min et max) qui tient en maxLines lignes.
function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, maxW: number, maxLines: number, max: number, min: number) {
  for (let px = max; px >= min; px -= 4) {
    ctx.font = font(px);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) return { px, lines };
  }
  ctx.font = font(min);
  return { px: min, lines: wrap(ctx, text, maxW).slice(0, maxLines) };
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "center" = "left") {
  const chars = [...text];
  const total = chars.reduce((n, c) => n + ctx.measureText(c).width + spacing, -spacing);
  let cx = align === "center" ? x - total / 2 : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + spacing; }
  ctx.textAlign = prev;
  return total;
}

// Photo recadrée pour remplir le rectangle (object-fit: cover). Sans photo : aplat texturé aux couleurs de la palette.
function drawPhoto(ctx: CanvasRenderingContext2D, i: ThumbInput, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (i.photo) {
    const s = Math.max(w / i.photo.width, h / i.photo.height);
    const pw = i.photo.width * s, ph = i.photo.height * s;
    ctx.drawImage(i.photo, x + (w - pw) / 2, y + (h - ph) / 2, pw, ph);
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, i.palette.band);
    g.addColorStop(1, i.palette.ink);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    grain(ctx, x, y, w, h, 0.07);
  }
  ctx.restore();
}

// Extrait du sommaire, dessiné à la place de la photo quand il n'y en a pas.
function drawToc(ctx: CanvasRenderingContext2D, i: ThumbInput, x: number, y: number, w: number, h: number, onDark: boolean) {
  const p = i.palette;
  ctx.save();
  ctx.fillStyle = onDark ? p.ink : "rgba(0,0,0,0.035)";
  ctx.fillRect(x, y, w, h);
  if (!onDark) { ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3); }
  const pad = onDark ? 90 : Math.min(70, w * 0.08);
  ctx.textAlign = "left";
  const items = i.toc.slice(0, onDark ? 6 : 5);
  const avail = h - pad * 2 - 70;
  const lh = Math.min(onDark ? 130 : 92, avail / Math.max(1, items.length));
  const size = Math.round(Math.min(onDark ? 44 : 40, lh * 0.46));
  // Bloc centré verticalement quand il reste de la place (panneau pleine hauteur)
  const block = 70 + items.length * lh;
  const top = y + pad + Math.max(0, (h - pad * 2 - block) / 2);
  ctx.fillStyle = p.band;
  ctx.font = "600 30px Oswald, sans-serif";
  spaced(ctx, words(i.language).toc.toUpperCase(), x + pad, top + 22, 7);
  let ty = top + 70 + lh * 0.55;
  items.forEach((t, k) => {
    ctx.fillStyle = onDark ? "rgba(255,255,255,0.55)" : p.band;
    ctx.font = `600 ${size}px "Playfair Display", serif`;
    const num = String(k + 1).padStart(2, "0");
    ctx.fillText(num, x + pad, ty);
    ctx.fillStyle = onDark ? "#ffffff" : p.ink;
    ctx.font = `500 ${size}px "Instrument Sans", sans-serif`;
    const maxW = w - pad * 2 - size * 2.2;
    let line = t;
    while (ctx.measureText(line).width > maxW && line.length > 4) line = line.slice(0, -2);
    if (line !== t) line = line.trimEnd().replace(/[\s,:;·.-]+$/, "") + "…";
    ctx.fillText(line, x + pad + size * 2.2, ty);
    if (k < items.length - 1) {
      ctx.fillStyle = onDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
      ctx.fillRect(x + pad, ty + lh * 0.42, w - pad * 2, 2);
    }
    ty += lh;
  });
  ctx.restore();
}

function grain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.save();
  for (let k = 0; k < (w * h) / 900; k++) {
    ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x + rnd() * w, y + rnd() * h, 2, 2);
  }
  ctx.restore();
}

function ornament(ctx: CanvasRenderingContext2D, cx: number, y: number, half: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - half, y); ctx.lineTo(cx - 26, y);
  ctx.moveTo(cx + 26, y); ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, y - 12); ctx.lineTo(cx + 12, y); ctx.lineTo(cx, y + 12); ctx.lineTo(cx - 12, y); ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Pages intérieures en éventail derrière la couverture : on comprend tout de suite que c'est un vrai livre.
function innerPage(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, p: ThumbPalette) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = p.ink;
  ctx.fillRect(-w / 2 + 70, -h / 2 + 90, w * 0.45, 22);
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  for (let k = 0; k < 22; k++) ctx.fillRect(-w / 2 + 70, -h / 2 + 160 + k * 44, (w - 140) * (k % 6 === 5 ? 0.55 : 1), 12);
  ctx.restore();
}

function affiche(ctx: CanvasRenderingContext2D, i: ThumbInput) {
  const p = i.palette;
  ctx.fillStyle = p.dark;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, W * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.10)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  grain(ctx, 0, 0, W, H, 0.035);

  const cw = 900, ch = 1290, cx = (W - cw) / 2 - 90, cy = (H - ch) / 2;
  innerPage(ctx, cx + 360, cy + 30, cw * 0.92, ch * 0.95, 0.07, p);
  innerPage(ctx, cx + 200, cy + 14, cw * 0.95, ch * 0.97, 0.035, p);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 70;
  ctx.shadowOffsetX = 18;
  ctx.shadowOffsetY = 34;
  ctx.fillStyle = p.paper;
  ctx.fillRect(cx, cy, cw, ch);
  ctx.restore();

  const mid = cx + cw / 2, inner = cw - 130;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.ink;
  ctx.font = "600 30px Oswald, sans-serif";
  spaced(ctx, words(i.language).kicker.toUpperCase(), mid, cy + 100, 9, "center");
  ornament(ctx, mid, cy + 138, inner / 2, p.ink);

  const t = fit(ctx, i.title.toUpperCase(), (px) => `700 ${px}px Oswald, sans-serif`, inner, 3, 136, 64);
  let y = cy + 178 + t.px * 0.86;
  ctx.fillStyle = p.ink;
  t.lines.forEach((l, k) => { ctx.fillText(l, mid, y); if (k < t.lines.length - 1) y += t.px * 1.0; });

  y += 44;
  const sub = fit(ctx, (i.subtitle || "").toUpperCase(), (px) => `500 ${px}px Oswald, sans-serif`, inner - 70, 2, 34, 22);
  const bandH = sub.lines.length * sub.px * 1.3 + 34;
  ctx.fillStyle = p.band;
  ctx.fillRect(cx + 65, y, inner, bandH);
  ctx.fillStyle = "#ffffff";
  ctx.font = `500 ${sub.px}px Oswald, sans-serif`;
  sub.lines.forEach((l, k) => ctx.fillText(l, mid, y + 17 + sub.px * 1.05 + k * sub.px * 1.3));
  y += bandH + 28;

  const footH = 118;
  if (i.photo) drawPhoto(ctx, i, cx + 65, y, inner, cy + ch - footH - 50 - y);
  else drawToc(ctx, i, cx + 65, y, inner, cy + ch - footH - 50 - y, false);
  ctx.fillStyle = p.dark;
  ctx.fillRect(cx, cy + ch - footH, cw, footH);
  ctx.fillStyle = p.paper;
  ctx.font = "500 30px Oswald, sans-serif";
  ctx.fillText(features(i).map((f) => f.toUpperCase()).join("   •   "), mid, cy + ch - footH / 2 + 11);
  ctx.textAlign = "left";
}

function epure(ctx: CanvasRenderingContext2D, i: ThumbInput) {
  const p = i.palette;
  ctx.fillStyle = p.paper;
  ctx.fillRect(0, 0, W, H);
  grain(ctx, 0, 0, W, H, 0.025);
  const px0 = 1060;
  if (i.photo) drawPhoto(ctx, i, px0, 0, W - px0, H);
  else drawToc(ctx, i, px0, 0, W - px0, H, true);
  ctx.fillStyle = p.band;
  ctx.fillRect(px0 - 14, 0, 14, H);

  const x = 120, maxW = px0 - 240;
  ctx.textAlign = "left";
  ctx.fillStyle = p.band;
  ctx.font = "600 30px Oswald, sans-serif";
  spaced(ctx, words(i.language).kicker.toUpperCase(), x, 250, 8);
  const t = fit(ctx, i.title, (px) => `700 ${px}px "Playfair Display", serif`, maxW, 4, 132, 70);
  let y = 290 + t.px;
  ctx.fillStyle = p.ink;
  for (const l of t.lines) { ctx.fillText(l, x, y); y += t.px * 1.08; }
  y += 10;
  ctx.fillStyle = p.ink;
  ctx.fillRect(x, y, 120, 5);
  y += 80;
  const s = fit(ctx, i.subtitle || "", (px) => `400 ${px}px "Instrument Sans", sans-serif`, maxW, 3, 42, 30);
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  for (const l of s.lines) { ctx.fillText(l, x, y); y += s.px * 1.35; }

  ctx.font = "600 34px \"Instrument Sans\", sans-serif";
  let fy = H - 300;
  for (const f of features(i)) {
    ctx.fillStyle = p.band;
    ctx.fillRect(x, fy - 13, 26, 4);
    ctx.fillStyle = p.ink;
    ctx.fillText(f, x + 48, fy);
    fy += 68;
  }
}

function magazine(ctx: CanvasRenderingContext2D, i: ThumbInput) {
  const p = i.palette;
  drawPhoto(ctx, i, 0, 0, W, H);
  const g = ctx.createLinearGradient(0, H * 0.25, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.78)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const top = ctx.createLinearGradient(0, 0, 0, 360);
  top.addColorStop(0, "rgba(0,0,0,0.45)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 360);

  const x = 110, maxW = W * 0.72;
  ctx.textAlign = "left";
  ctx.fillStyle = p.band;
  ctx.fillRect(x, 110, 22, 70);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 34px Oswald, sans-serif";
  spaced(ctx, words(i.language).kicker.toUpperCase(), x + 50, 158, 8);

  const bandH = 128;
  const s = fit(ctx, i.subtitle || "", (px) => `400 ${px}px "Instrument Sans", sans-serif`, maxW, 2, 44, 32);
  const t = fit(ctx, i.title, (px) => `700 ${px}px "Playfair Display", serif`, maxW, 3, 150, 80);
  // Mise en page du bas vers le haut : dernière ligne du sous-titre à 80 px du bandeau
  const sLh = s.px * 1.35, tLh = t.px * 1.05;
  const sFirst = H - bandH - 80 - (s.lines.length - 1) * sLh;
  const tLast = sFirst - sLh - 46;
  let y = tLast - (t.lines.length - 1) * tLh;
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${t.px}px "Playfair Display", serif`;
  for (const l of t.lines) { ctx.fillText(l, x, y); y += tLh; }
  y = sFirst;
  ctx.font = `400 ${s.px}px "Instrument Sans", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  for (const l of s.lines) { ctx.fillText(l, x, y); y += sLh; }

  ctx.fillStyle = p.band;
  ctx.fillRect(0, H - bandH, W, bandH);
  ctx.fillStyle = "#ffffff";
  ctx.font = "500 38px Oswald, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(features(i).map((f) => f.toUpperCase()).join("     •     "), W / 2, H - bandH / 2 + 14);
  ctx.textAlign = "left";
}

export async function loadThumbFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    ['700 100px Oswald', '600 30px Oswald', '500 30px Oswald', '700 100px "Playfair Display"', '400 40px "Instrument Sans"', '600 34px "Instrument Sans"'].map((f) => document.fonts.load(f).catch(() => null))
  );
}

export function drawThumb(canvas: HTMLCanvasElement, i: ThumbInput) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  if (i.style === "affiche") affiche(ctx, i);
  else if (i.style === "epure") epure(ctx, i);
  else magazine(ctx, i);
}
