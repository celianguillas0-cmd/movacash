import PDFDocument from "pdfkit";
import path from "node:path";
import { parseMarkdown, type Block, type Span } from "./markdown";
import { aiDisclosure, disclaimerFor } from "./etsy";
import type { ChapterRow, CoverSettings, EbookRow } from "./ebooks";

const FONT_DIR = path.join(process.cwd(), "fonts");
const F = {
  regular: path.join(FONT_DIR, "Inter-Regular.otf"),
  semibold: path.join(FONT_DIR, "Inter-SemiBold.otf"),
  bold: path.join(FONT_DIR, "Inter-Bold.otf"),
  italic: path.join(FONT_DIR, "Inter-Italic.otf"),
  display: path.join(FONT_DIR, "InterDisplay-Black.otf"),
  displayBold: path.join(FONT_DIR, "InterDisplay-Bold.otf"),
  serif: path.join(FONT_DIR, "Caladea-Regular.ttf"),
  serifBold: path.join(FONT_DIR, "Caladea-Bold.ttf"),
  serifItalic: path.join(FONT_DIR, "Caladea-Italic.ttf"),
};

const LABELS: Record<string, { chapter: string; toc: string; rights: string; guide: string; by: string }> = {
  fr: { chapter: "Chapitre", toc: "Sommaire", rights: "Tous droits réservés. Ce document est destiné à un usage personnel : toute reproduction, revente ou diffusion sans autorisation de l'auteur est interdite.", guide: "GUIDE PRATIQUE", by: "par" },
  en: { chapter: "Chapter", toc: "Contents", rights: "All rights reserved. This document is for personal use only: any reproduction, resale or distribution without the author's permission is prohibited.", guide: "PRACTICAL GUIDE", by: "by" },
  es: { chapter: "Capítulo", toc: "Índice", rights: "Todos los derechos reservados. Documento para uso personal: prohibida su reproducción, reventa o difusión sin autorización del autor.", guide: "GUÍA PRÁCTICA", by: "por" },
  de: { chapter: "Kapitel", toc: "Inhalt", rights: "Alle Rechte vorbehalten. Nur für den persönlichen Gebrauch: Vervielfältigung, Weiterverkauf oder Verbreitung ohne Genehmigung des Autors ist untersagt.", guide: "PRAXISRATGEBER", by: "von" },
  it: { chapter: "Capitolo", toc: "Indice", rights: "Tutti i diritti riservati. Documento per uso personale: è vietata la riproduzione, rivendita o diffusione senza autorizzazione dell'autore.", guide: "GUIDA PRATICA", by: "di" },
  pt: { chapter: "Capítulo", toc: "Índice", rights: "Todos os direitos reservados. Documento para uso pessoal: é proibida a reprodução, revenda ou distribuição sem autorização do autor.", guide: "GUIA PRÁTICO", by: "por" },
  nl: { chapter: "Hoofdstuk", toc: "Inhoud", rights: "Alle rechten voorbehouden. Alleen voor persoonlijk gebruik: verveelvoudiging, doorverkoop of verspreiding zonder toestemming van de auteur is verboden.", guide: "PRAKTISCHE GIDS", by: "door" },
  pl: { chapter: "Rozdział", toc: "Spis treści", rights: "Wszelkie prawa zastrzeżone. Dokument do użytku osobistego: kopiowanie, odsprzedaż lub rozpowszechnianie bez zgody autora jest zabronione.", guide: "PRAKTYCZNY PORADNIK", by: "autor:" },
  ro: { chapter: "Capitolul", toc: "Cuprins", rights: "Toate drepturile rezervate. Document pentru uz personal: reproducerea, revânzarea sau distribuirea fără acordul autorului sunt interzise.", guide: "GHID PRACTIC", by: "de" },
  cs: { chapter: "Kapitola", toc: "Obsah", rights: "Všechna práva vyhrazena. Dokument je určen pro osobní potřebu: kopírování, další prodej nebo šíření bez souhlasu autora je zakázáno.", guide: "PRAKTICKÝ PRŮVODCE", by: "autor:" },
  sk: { chapter: "Kapitola", toc: "Obsah", rights: "Všetky práva vyhradené. Dokument je určený na osobné použitie: kopírovanie, ďalší predaj alebo šírenie bez súhlasu autora je zakázané.", guide: "PRAKTICKÝ SPRIEVODCA", by: "autor:" },
  hu: { chapter: "Fejezet", toc: "Tartalom", rights: "Minden jog fenntartva. Kizárólag személyes használatra: a szerző engedélye nélküli másolás, továbbértékesítés vagy terjesztés tilos.", guide: "GYAKORLATI ÚTMUTATÓ", by: "szerző:" },
  sv: { chapter: "Kapitel", toc: "Innehåll", rights: "Alla rättigheter förbehållna. Endast för personligt bruk: kopiering, vidareförsäljning eller spridning utan författarens tillstånd är förbjuden.", guide: "PRAKTISK GUIDE", by: "av" },
  da: { chapter: "Kapitel", toc: "Indhold", rights: "Alle rettigheder forbeholdes. Kun til personlig brug: kopiering, videresalg eller distribution uden forfatterens tilladelse er forbudt.", guide: "PRAKTISK GUIDE", by: "af" },
  fi: { chapter: "Luku", toc: "Sisällys", rights: "Kaikki oikeudet pidätetään. Vain henkilökohtaiseen käyttöön: kopiointi, jälleenmyynti tai levittäminen ilman kirjoittajan lupaa on kielletty.", guide: "KÄYTÄNNÖN OPAS", by: "kirjoittanut" },
  el: { chapter: "Κεφάλαιο", toc: "Περιεχόμενα", rights: "Με την επιφύλαξη παντός δικαιώματος. Για προσωπική χρήση μόνο: απαγορεύεται η αναπαραγωγή, μεταπώληση ή διανομή χωρίς άδεια του συγγραφέα.", guide: "ΠΡΑΚΤΙΚΟΣ ΟΔΗΓΟΣ", by: "από" },
  bg: { chapter: "Глава", toc: "Съдържание", rights: "Всички права запазени. Само за лична употреба: възпроизвеждането, препродажбата или разпространението без разрешение на автора са забранени.", guide: "ПРАКТИЧЕСКО РЪКОВОДСТВО", by: "от" },
  hr: { chapter: "Poglavlje", toc: "Sadržaj", rights: "Sva prava pridržana. Samo za osobnu upotrebu: umnožavanje, preprodaja ili distribucija bez dopuštenja autora su zabranjeni.", guide: "PRAKTIČNI VODIČ", by: "autor:" },
  sl: { chapter: "Poglavje", toc: "Kazalo", rights: "Vse pravice pridržane. Samo za osebno uporabo: razmnoževanje, nadaljnja prodaja ali razširjanje brez dovoljenja avtorja so prepovedani.", guide: "PRAKTIČNI VODNIK", by: "avtor:" },
  et: { chapter: "Peatükk", toc: "Sisukord", rights: "Kõik õigused kaitstud. Ainult isiklikuks kasutamiseks: paljundamine, edasimüük või levitamine ilma autori loata on keelatud.", guide: "PRAKTILINE JUHEND", by: "autor:" },
  lv: { chapter: "Nodaļa", toc: "Saturs", rights: "Visas tiesības aizsargātas. Tikai personiskai lietošanai: pavairošana, tālākpārdošana vai izplatīšana bez autora atļaujas ir aizliegta.", guide: "PRAKTISKS CEĻVEDIS", by: "autors:" },
  lt: { chapter: "Skyrius", toc: "Turinys", rights: "Visos teisės saugomos. Tik asmeniniam naudojimui: kopijuoti, perparduoti ar platinti be autoriaus leidimo draudžiama.", guide: "PRAKTINIS VADOVAS", by: "autorius:" },
};

const DISCLAIMER_TITLE: Record<string, string> = {
  fr: "Avertissement", en: "Disclaimer", de: "Hinweis", es: "Aviso", it: "Avvertenza", pt: "Aviso", nl: "Disclaimer", pl: "Zastrzeżenie",
  ro: "Avertisment", cs: "Upozornění", sk: "Upozornenie", hu: "Figyelmeztetés", sv: "Ansvarsfriskrivning", da: "Ansvarsfraskrivelse", fi: "Vastuuvapaus",
  el: "Αποποίηση ευθύνης", bg: "Отказ от отговорност", hr: "Napomena", sl: "Opozorilo", et: "Vastutuse välistamine", lv: "Atruna", lt: "Atsakomybės apribojimas",
};

const clean = (s: string) => s.replace(/\p{Extended_Pictographic}|️|‍/gu, "").replace(/[ \t]+/g, " ");

function isLight(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export type PageSize = "A4" | "A5" | "LETTER";

export async function renderEbookPdf(ebook: EbookRow, chapters: ChapterRow[], size: PageSize = "A4"): Promise<Buffer> {
  const cover: CoverSettings = JSON.parse(ebook.cover_json || "{}");
  const L = LABELS[ebook.language] || LABELS.en;
  const small = size === "A5";
  const margin = small ? 48 : 64;
  const doc = new PDFDocument({
    size,
    margins: { top: margin, bottom: margin + 10, left: margin, right: margin },
    bufferPages: true,
    autoFirstPage: false,
    info: { Title: clean(ebook.title), Author: ebook.author_name || "", Subject: clean(ebook.subtitle) },
  });
  // Caladea n'a pas de grec ni de cyrillique : ces langues prennent Inter à la place.
  const noSerif = ebook.language === "el" || ebook.language === "bg";
  const fonts = noSerif ? { ...F, serif: F.regular, serifBold: F.bold, serifItalic: F.italic } : F;
  for (const [k, v] of Object.entries(fonts)) doc.registerFont(k, v);

  const serifBody = cover.style === "elegant";
  const body = serifBody ? "serif" : "regular";
  const bodyBold = serifBody ? "serifBold" : "semibold";
  const bodyItalic = serifBody ? "serifItalic" : "italic";
  const headFont = cover.style === "elegant" ? "serifBold" : cover.style === "bold" ? "displayBold" : "bold";
  const fs = small ? 10.5 : 11.5;
  const accentDark = isLight(cover.color) ? cover.accent : cover.color;
  const text = "#1f2328";
  const muted = "#5b6270";

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  // ---------- Couverture ----------
  doc.addPage({ margin: 0 });
  drawCover(doc, ebook, cover, L);

  // ---------- Page légale ----------
  doc.addPage();
  const W = doc.page.width - margin * 2;
  doc.moveDown(small ? 6 : 10);
  doc.font(headFont).fontSize(16).fillColor(text).text(clean(ebook.title), { width: W });
  doc.moveDown(0.3).font(body).fontSize(11).fillColor(muted).text(clean(ebook.subtitle), { width: W });
  doc.moveDown(2);
  doc.font(body).fontSize(9.5).fillColor(muted);
  doc.text(`© ${new Date(ebook.created_at * 1000).getFullYear()} ${ebook.author_name || ""}`.trim(), { width: W });
  doc.moveDown(0.6).text(L.rights, { width: W, align: "justify" });
  doc.moveDown(0.6).text(aiDisclosure(ebook.language), { width: W, align: "justify" });
  const disc = disclaimerFor(ebook.sensitive, ebook.language);
  if (disc) {
    doc.moveDown(1.2).font(bodyBold).fontSize(10).fillColor(text).text(DISCLAIMER_TITLE[ebook.language] || "Disclaimer");
    doc.moveDown(0.3).font(body).fontSize(9.5).fillColor(muted).text(disc, { width: W, align: "justify" });
  }

  // ---------- Sommaire (rempli à la fin) ----------
  doc.addPage();
  const tocPage = doc.bufferedPageRange().count - 1;
  const chapterPages: number[] = [];

  // ---------- Chapitres ----------
  const bottom = () => doc.page.height - doc.page.margins.bottom;
  const ensure = (h: number) => {
    if (doc.y + h > bottom()) doc.addPage();
  };

  const writeSpans = (spans: Span[], opts: { x?: number; width: number; size?: number; color?: string; align?: "left" | "justify"; baseFont?: string }) => {
    const parts = spans.map((s) => ({ ...s, text: clean(s.text) })).filter((s) => s.text.length);
    // pdfkit supprime les espaces en début de segment « continued » : on les reporte sur le segment précédent
    for (let i = 1; i < parts.length; i++) {
      if (/^\s/.test(parts[i].text)) {
        parts[i].text = parts[i].text.trimStart();
        parts[i - 1].text = parts[i - 1].text.replace(/\s*$/, " ");
      }
    }
    if (!parts.length) return;
    doc.fillColor(opts.color || text).fontSize(opts.size || fs);
    parts.forEach((s, i) => {
      doc.font(s.bold ? bodyBold : s.italic ? bodyItalic : opts.baseFont || body);
      const o = { width: opts.width, continued: i < parts.length - 1, align: opts.align || "left", lineGap: 3 } as PDFKit.Mixins.TextOptions;
      if (i === 0 && opts.x !== undefined) doc.text(s.text, opts.x, doc.y, o);
      else doc.text(s.text, o);
    });
  };

  const renderBlock = (b: Block) => {
    const x0 = margin;
    if (b.type === "h2") {
      ensure(80);
      doc.moveDown(0.8);
      doc.font(headFont).fontSize(fs + 5).fillColor(accentDark).text(clean(b.spans.map((s) => s.text).join("")), x0, doc.y, { width: W });
      doc.moveDown(0.4);
    } else if (b.type === "h3") {
      ensure(60);
      doc.moveDown(0.5);
      doc.font(headFont).fontSize(fs + 2).fillColor(text).text(clean(b.spans.map((s) => s.text).join("")), x0, doc.y, { width: W });
      doc.moveDown(0.3);
    } else if (b.type === "p") {
      ensure(30);
      writeSpans(b.spans, { x: x0, width: W, align: b.spans.length === 1 ? "justify" : "left" });
      doc.moveDown(0.6);
    } else if (b.type === "quote") {
      const str = clean(b.spans.map((s) => s.text).join(""));
      doc.font(body).fontSize(fs);
      const h = doc.heightOfString(str, { width: W - 32, lineGap: 3 }) + 24;
      ensure(Math.min(h, 250));
      const y = doc.y;
      doc.save().roundedRect(x0, y, W, h, 6).fill(isLight(cover.color) ? "#faf6ef" : shade(cover.accent)).restore();
      doc.save().rect(x0, y, 4, h).fill(accentDark).restore();
      doc.y = y + 12;
      writeSpans(b.spans, { x: x0 + 18, width: W - 32 });
      doc.y = Math.max(doc.y, y + h) + 10;
      doc.x = x0;
    } else if (b.type === "ul" || b.type === "ol" || b.type === "check") {
      b.items.forEach((item, i) => {
        ensure(24);
        const y = doc.y;
        const marker = b.type === "ol" ? `${i + 1}.` : b.type === "check" ? "" : "•";
        if (b.type === "check") {
          doc.save().lineWidth(1).strokeColor(accentDark).rect(x0 + 2, y + 2, 9, 9).stroke().restore();
        } else {
          doc.font(bodyBold).fontSize(fs).fillColor(accentDark).text(marker, x0, y, { width: 18 });
        }
        doc.y = y;
        writeSpans(item, { x: x0 + 20, width: W - 20 });
        doc.moveDown(0.25);
      });
      doc.x = x0;
      doc.moveDown(0.4);
    }
  };

  chapters.forEach((ch, i) => {
    doc.addPage();
    chapterPages.push(doc.bufferedPageRange().count);
    doc.moveDown(small ? 2 : 4);
    doc.font("semibold").fontSize(10).fillColor(accentDark).text(`${L.chapter.toUpperCase()} ${i + 1}`, margin, doc.y, { characterSpacing: 2 });
    doc.moveDown(0.4);
    doc.font(headFont).fontSize(small ? 20 : 24).fillColor(text).text(clean(ch.title), { width: W });
    doc.moveDown(0.5);
    doc.save().rect(margin, doc.y, 48, 3).fill(accentDark).restore();
    doc.moveDown(1.5);
    for (const b of parseMarkdown(ch.content_md || "")) renderBlock(b);
  });

  // ---------- Remplissage du sommaire ----------
  doc.switchToPage(tocPage);
  doc.x = margin;
  doc.y = margin + (small ? 20 : 40);
  doc.font(headFont).fontSize(22).fillColor(text).text(L.toc, { width: W });
  doc.moveDown(1.2);
  chapters.forEach((ch, i) => {
    const y = doc.y;
    doc.font(body).fontSize(fs).fillColor(text).text(`${i + 1}.  ${clean(ch.title)}`, margin, y, { width: W - 40 });
    const yEnd = doc.y;
    doc.font(bodyBold).text(String(chapterPages[i] - 1), margin + W - 30, y, { width: 30, align: "right" });
    doc.y = yEnd + 6;
    doc.x = margin;
  });

  // ---------- Pieds de page ----------
  const range = doc.bufferedPageRange();
  for (let p = 1; p < range.count; p++) {
    doc.switchToPage(p);
    const y = doc.page.height - margin + 18;
    doc.font(body).fontSize(8.5).fillColor("#9aa1ad");
    doc.text(clean(ebook.title).slice(0, 70), margin, y, { width: W - 40, lineBreak: false, height: 12 });
    doc.text(String(p), margin + W - 40, y, { width: 40, align: "right", lineBreak: false, height: 12 });
  }

  doc.end();
  return done;
}

function shade(hex: string) {
  // version très claire de la couleur d'accent pour les encadrés
  const n = parseInt(hex.replace("#", ""), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.88);
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function drawCover(doc: PDFKit.PDFDocument, e: EbookRow, c: CoverSettings, L: (typeof LABELS)["fr"]) {
  const w = doc.page.width, h = doc.page.height;
  const light = isLight(c.color);
  const fg = light ? "#1f2328" : "#ffffff";
  const sub = light ? "#4b5260" : "#e5e7eb";
  const pad = w * 0.1;
  const title = clean(e.title);
  const subtitle = clean(e.subtitle);
  const author = e.author_name ? clean(e.author_name) : "";

  doc.rect(0, 0, w, h).fill(c.color);

  if (c.style === "moderne") {
    doc.save().opacity(0.25).circle(w * 0.95, h * 0.08, w * 0.45).fill(c.accent).restore();
    doc.save().opacity(0.15).circle(w * 0.05, h * 0.98, w * 0.35).fill(c.accent).restore();
    doc.font("semibold").fontSize(w * 0.022).fillColor(c.accent).text(L.guide, pad, h * 0.3, { characterSpacing: 3 });
    doc.moveDown(0.8);
    doc.font("bold").fontSize(fitSize(doc, title, "bold", w - pad * 2, w * 0.085, h * 0.3)).fillColor(fg).text(title, pad, doc.y, { width: w - pad * 2, lineGap: 2 });
    doc.moveDown(0.6);
    doc.save().rect(pad, doc.y, w * 0.12, 4).fill(c.accent).restore();
    doc.moveDown(1);
    doc.font("regular").fontSize(w * 0.03).fillColor(sub).text(subtitle, pad, doc.y, { width: w - pad * 2.5 });
    if (author) doc.font("semibold").fontSize(w * 0.026).fillColor(fg).text(author, pad, h * 0.88, { width: w - pad * 2 });
  } else if (c.style === "elegant") {
    const inset = w * 0.06;
    doc.save().lineWidth(1.2).strokeColor(c.accent).rect(inset, inset, w - inset * 2, h - inset * 2).stroke().restore();
    doc.save().lineWidth(0.5).strokeColor(c.accent).rect(inset + 6, inset + 6, w - inset * 2 - 12, h - inset * 2 - 12).stroke().restore();
    doc.font("serif").fontSize(w * 0.022).fillColor(c.accent).text(L.guide, pad, h * 0.24, { width: w - pad * 2, align: "center", characterSpacing: 4 });
    doc.moveDown(1.2);
    doc.font("serifBold").fontSize(fitSize(doc, title, "serifBold", w - pad * 2, w * 0.08, h * 0.3)).fillColor(fg).text(title, pad, doc.y, { width: w - pad * 2, align: "center" });
    doc.moveDown(0.8);
    const y = doc.y;
    doc.save().moveTo(w / 2 - 40, y).lineTo(w / 2 + 40, y).lineWidth(1).strokeColor(c.accent).stroke().restore();
    doc.save().circle(w / 2, y, 3).fill(c.accent).restore();
    doc.moveDown(1.2);
    doc.font("serifItalic").fontSize(w * 0.032).fillColor(sub).text(subtitle, pad * 1.3, doc.y, { width: w - pad * 2.6, align: "center" });
    if (author) doc.font("serif").fontSize(w * 0.026).fillColor(fg).text(author, pad, h * 0.85, { width: w - pad * 2, align: "center", characterSpacing: 1 });
  } else {
    doc.rect(0, h * 0.68, w, h * 0.32).fill(c.accent);
    const t = title.toUpperCase();
    doc.font("display").fontSize(fitSize(doc, t, "display", w - pad * 2, w * 0.1, h * 0.42)).fillColor(fg).text(t, pad, h * 0.14, { width: w - pad * 2, lineGap: -2 });
    const bandFg = isLight(c.accent) ? "#111111" : "#ffffff";
    doc.font("bold").fontSize(w * 0.034).fillColor(bandFg).text(subtitle, pad, h * 0.73, { width: w - pad * 2 });
    if (author) doc.font("semibold").fontSize(w * 0.024).fillColor(bandFg).text(`${L.by} ${author}`, pad, h * 0.92, { width: w - pad * 2 });
  }
}

function fitSize(doc: PDFKit.PDFDocument, s: string, font: string, width: number, start: number, maxH: number) {
  let size = start;
  doc.font(font);
  while (size > 14) {
    doc.fontSize(size);
    if (doc.heightOfString(s, { width }) <= maxH) break;
    size -= 2;
  }
  return size;
}
