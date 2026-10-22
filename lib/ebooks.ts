import { getDb } from "./db";
import type { EbookBrief, Outline } from "./generator";
import type { EtsyKit } from "./etsy";
import { PALETTES } from "./covers";
export { PALETTES };

export interface CoverSettings {
  style: "moderne" | "elegant" | "bold";
  color: string;
  accent: string;
}

export interface EbookRow {
  id: number;
  user_id: number;
  idea_id: number | null;
  title: string;
  subtitle: string;
  topic: string;
  audience: string;
  language: string;
  tone: string;
  author_name: string;
  sensitive: string | null;
  status: string;
  promise: string;
  cover_json: string;
  etsy_json: string | null;
  is_demo: number;
  created_at: number;
  updated_at: number;
}

export interface ChapterRow {
  id: number;
  ebook_id: number;
  idx: number;
  title: string;
  summary: string;
  key_points: string;
  content_md: string;
  status: string;
}

export function defaultCover(seed: string): CoverSettings {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const p = PALETTES[h % PALETTES.length];
  return { style: (["moderne", "elegant", "bold"] as const)[h % 3], ...p };
}

export function createEbook(userId: number, ideaId: number | null, brief: EbookBrief, outline: Outline, authorName: string, isDemo: boolean) {
  const db = getDb();
  const tx = db.transaction(() => {
    const r = db
      .prepare(
        `INSERT INTO ebooks (user_id, idea_id, title, subtitle, topic, audience, language, tone, author_name, sensitive, status, promise, cover_json, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating', ?, ?, ?)`
      )
      .run(
        userId,
        ideaId,
        outline.title,
        outline.subtitle,
        brief.topic,
        brief.audience,
        brief.language,
        brief.tone,
        authorName,
        brief.sensitive,
        outline.promise,
        JSON.stringify(defaultCover(outline.title)),
        isDemo ? 1 : 0
      );
    const id = Number(r.lastInsertRowid);
    const ins = db.prepare("INSERT INTO chapters (ebook_id, idx, title, summary, key_points) VALUES (?, ?, ?, ?, ?)");
    outline.chapters.forEach((c, i) => ins.run(id, i, c.title, c.summary || "", JSON.stringify(c.keyPoints || [])));
    return id;
  });
  return tx();
}

export function getEbook(id: number, userId: number) {
  const db = getDb();
  const ebook = db.prepare("SELECT * FROM ebooks WHERE id = ? AND user_id = ?").get(id, userId) as EbookRow | undefined;
  if (!ebook) return null;
  const chapters = db.prepare("SELECT * FROM chapters WHERE ebook_id = ? ORDER BY idx").all(id) as ChapterRow[];
  return { ebook, chapters };
}

export function listEbooks(userId: number) {
  return getDb()
    .prepare(
      `SELECT e.id, e.title, e.subtitle, e.status, e.created_at, e.cover_json, e.is_demo,
        (SELECT COUNT(*) FROM chapters c WHERE c.ebook_id = e.id) AS chapters_total,
        (SELECT COUNT(*) FROM chapters c WHERE c.ebook_id = e.id AND c.status = 'done') AS chapters_done
       FROM ebooks e WHERE e.user_id = ? ORDER BY e.created_at DESC`
    )
    .all(userId) as (Pick<EbookRow, "id" | "title" | "subtitle" | "status" | "created_at" | "cover_json" | "is_demo"> & {
    chapters_total: number;
    chapters_done: number;
  })[];
}

export function briefFromEbook(e: EbookRow, chapterCount: number): EbookBrief {
  return {
    topic: e.topic,
    audience: e.audience,
    language: e.language,
    tone: e.tone,
    chapters: chapterCount,
    sensitive: e.sensitive,
    extras: "",
    format: "Guide complet",
  };
}

export function outlineFromRows(e: EbookRow, chapters: ChapterRow[]): Outline {
  return {
    title: e.title,
    subtitle: e.subtitle,
    promise: e.promise,
    chapters: chapters.map((c) => ({ title: c.title, summary: c.summary, keyPoints: JSON.parse(c.key_points || "[]") })),
  };
}

export function refreshStatus(ebookId: number) {
  const db = getDb();
  const { pending } = db
    .prepare("SELECT COUNT(*) AS pending FROM chapters WHERE ebook_id = ? AND status != 'done'")
    .get(ebookId) as { pending: number };
  db.prepare("UPDATE ebooks SET status = ?, updated_at = unixepoch() WHERE id = ?").run(pending ? "generating" : "ready", ebookId);
}

export function parseEtsy(e: EbookRow): EtsyKit | null {
  return e.etsy_json ? (JSON.parse(e.etsy_json) as EtsyKit) : null;
}
