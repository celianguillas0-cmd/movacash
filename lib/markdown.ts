// Mini-parseur Markdown partagé entre l'aperçu web et l'export PDF.
export type Span = { text: string; bold?: boolean; italic?: boolean };
export type Block =
  | { type: "h2" | "h3" | "p" | "quote"; spans: Span[] }
  | { type: "ul" | "ol" | "check"; items: Span[][] };

export function parseInline(s: string): Span[] {
  const out: Span[] = [];
  const re = /(\*\*[^*]+\*\*|(?<![\w*])\*[^*\s][^*]*\*(?![\w*]))/g;
  let last = 0;
  for (const m of s.matchAll(re)) {
    if (m.index! > last) out.push({ text: s.slice(last, m.index) });
    const t = m[0];
    if (t.startsWith("**")) out.push({ text: t.slice(2, -2), bold: true });
    else out.push({ text: t.slice(1, -1), italic: true });
    last = m.index! + t.length;
  }
  if (last < s.length) out.push({ text: s.slice(last) });
  return out.map((sp) => ({ ...sp, text: sp.text.replace(/`/g, "") }));
}

export function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol" | "check"; items: Span[][] } | null = null;
  let quote: string[] = [];

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", spans: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ type: "quote", spans: parseInline(quote.join(" ")) });
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (!t) {
      flushAll();
      continue;
    }
    if (/^(---|\*\*\*)$/.test(t)) {
      flushAll();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = t.match(/^(#{1,6})\s+(.*)$/))) {
      flushAll();
      blocks.push({ type: m[1].length <= 2 ? "h2" : "h3", spans: parseInline(m[2].replace(/\*\*/g, "")) });
      continue;
    }
    if ((m = t.match(/^>\s?(.*)$/))) {
      flushPara();
      flushList();
      quote.push(m[1]);
      continue;
    }
    flushQuote();
    if ((m = t.match(/^[-*]\s+\[[ xX]?\]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== "check") {
        flushList();
        list = { type: "check", items: [] };
      }
      list.items.push(parseInline(m[1]));
      continue;
    }
    if ((m = t.match(/^[-*•]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(parseInline(m[1]));
      continue;
    }
    if ((m = t.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(parseInline(m[1]));
      continue;
    }
    if (list && /^\s{2,}/.test(line)) {
      // suite d'un élément de liste
      const items = (list as { items: Span[][] }).items;
      items[items.length - 1].push({ text: " " + t });
      continue;
    }
    flushList();
    if (t.startsWith("|")) continue; // tableaux ignorés
    para.push(t);
  }
  flushAll();
  return blocks;
}

export function wordCount(md: string) {
  return md.split(/\s+/).filter(Boolean).length;
}
