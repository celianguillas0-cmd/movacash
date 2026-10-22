// Génération côté navigateur des visuels de fiche Etsy (canvas → PNG).
type Cover = { style: string; color: string; accent: string };

interface Input {
  title: string;
  subtitle: string;
  author: string;
  cover: Cover;
  chapters: string[];
  pages: number;
  language: string;
}

const W = 2000, H = 1500;

function isLight(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 99) {
  const lines = wrap(ctx, text, maxW).slice(0, maxLines);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return y + lines.length * lh;
}

function drawBook(ctx: CanvasRenderingContext2D, inp: Input, x: number, y: number, w: number) {
  const h = w * 1.414;
  const { cover } = inp;
  const fg = isLight(cover.color) ? "#1f2328" : "#ffffff";
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = cover.color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const pad = w * 0.1;
  if (cover.style === "bold") {
    ctx.fillStyle = cover.accent;
    ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
    ctx.fillStyle = fg;
    ctx.font = `900 ${w * 0.1}px Inter, Arial, sans-serif`;
    drawText(ctx, inp.title.toUpperCase(), x + pad, y + h * 0.2, w - pad * 2, w * 0.11, 5);
    ctx.fillStyle = isLight(cover.accent) ? "#111" : "#fff";
    ctx.font = `600 ${w * 0.04}px Inter, Arial, sans-serif`;
    drawText(ctx, inp.subtitle, x + pad, y + h * 0.76, w - pad * 2, w * 0.05, 3);
  } else if (cover.style === "elegant") {
    ctx.strokeStyle = cover.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + w * 0.05, y + w * 0.05, w * 0.9, h - w * 0.1);
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.font = `bold ${w * 0.085}px Georgia, serif`;
    const end = drawText(ctx, inp.title, x + w / 2, y + h * 0.35, w - pad * 2, w * 0.1, 5);
    ctx.font = `italic ${w * 0.04}px Georgia, serif`;
    drawText(ctx, inp.subtitle, x + w / 2, end + w * 0.08, w - pad * 2.4, w * 0.05, 4);
    ctx.textAlign = "left";
  } else {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = cover.accent;
    ctx.beginPath();
    ctx.arc(x + w * 0.95, y + h * 0.08, w * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = fg;
    ctx.font = `bold ${w * 0.085}px Inter, Arial, sans-serif`;
    const end = drawText(ctx, inp.title, x + pad, y + h * 0.38, w - pad * 2, w * 0.1, 5);
    ctx.fillStyle = cover.accent;
    ctx.fillRect(x + pad, end, w * 0.12, 6);
    ctx.fillStyle = fg;
    ctx.font = `${w * 0.04}px Inter, Arial, sans-serif`;
    drawText(ctx, inp.subtitle, x + pad, end + w * 0.09, w - pad * 2.4, w * 0.05, 4);
  }
  if (inp.author) {
    ctx.fillStyle = cover.style === "bold" ? (isLight(cover.accent) ? "#111" : "#fff") : fg;
    ctx.font = `600 ${w * 0.035}px Inter, Arial, sans-serif`;
    ctx.fillText(inp.author, x + pad, y + h * 0.93);
  }
  ctx.restore();
}

function canvas() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return [c, c.getContext("2d")!] as const;
}

const T = (lang: string) =>
  lang === "fr"
    ? { pdf: "E-BOOK PDF", pagesL: "pages", inside: "Au sommaire", dl: "Téléchargement immédiat", incl: "Ce qui est inclus", items: ["Guide PDF complet", "Exercices et check-lists", "Plan d'action pas à pas", "Lisible sur mobile, tablette, ordinateur", "Imprimable"] }
    : { pdf: "PDF E-BOOK", pagesL: "pages", inside: "What's inside", dl: "Instant download", incl: "What's included", items: ["Complete PDF guide", "Exercises and checklists", "Step-by-step action plan", "Read on phone, tablet, computer", "Printable"] };

export async function renderListingImages(inp: Input): Promise<string[]> {
  const t = T(inp.language);
  const bgSoft = "#f4f1ec";
  const out: string[] = [];

  // 1. Couverture mise en scène
  {
    const [c, ctx] = canvas();
    ctx.fillStyle = bgSoft;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = inp.cover.accent;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.5, 650, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    drawBook(ctx, inp, W / 2 - 400, 110, 800);
    ctx.fillStyle = "#1f2328";
    ctx.font = "bold 54px Inter, Arial, sans-serif";
    ctx.fillText(`${t.pdf} · ${inp.pages} ${t.pagesL}`, 80, H - 80);
    ctx.textAlign = "right";
    ctx.fillText(t.dl, W - 80, H - 80);
    out.push(c.toDataURL("image/png"));
  }

  // 2. Sommaire
  {
    const [c, ctx] = canvas();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    drawBook(ctx, inp, 120, 220, 680);
    ctx.fillStyle = inp.cover.color === "#f5f0e8" ? inp.cover.accent : inp.cover.color;
    ctx.font = "bold 84px Inter, Arial, sans-serif";
    ctx.fillText(t.inside, 940, 260);
    ctx.fillStyle = "#1f2328";
    ctx.font = "42px Inter, Arial, sans-serif";
    let y = 380;
    const step = Math.min(90, 1000 / inp.chapters.length);
    inp.chapters.forEach((ch, i) => {
      ctx.fillStyle = inp.cover.accent;
      ctx.fillText(String(i + 1).padStart(2, "0"), 940, y);
      ctx.fillStyle = "#1f2328";
      const line = wrap(ctx, ch, 880)[0];
      ctx.fillText(line + (wrap(ctx, ch, 880).length > 1 ? "…" : ""), 1030, y);
      y += step;
    });
    out.push(c.toDataURL("image/png"));
  }

  // 3. Ce qui est inclus
  {
    const [c, ctx] = canvas();
    ctx.fillStyle = inp.cover.color;
    ctx.fillRect(0, 0, W, H);
    const fg = isLight(inp.cover.color) ? "#1f2328" : "#ffffff";
    ctx.fillStyle = fg;
    ctx.font = "bold 96px Inter, Arial, sans-serif";
    ctx.fillText(t.incl, 140, 260);
    ctx.font = "56px Inter, Arial, sans-serif";
    [...t.items, `${inp.pages} ${t.pagesL}`].forEach((it, i) => {
      ctx.fillStyle = inp.cover.accent;
      ctx.fillText("✓", 140, 430 + i * 130);
      ctx.fillStyle = fg;
      ctx.fillText(it, 230, 430 + i * 130);
    });
    drawBook(ctx, inp, 1300, 380, 560);
    out.push(c.toDataURL("image/png"));
  }
  return out;
}
