import { all, batch, one, run } from "./db";
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
  film_source_id: number | null;
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

export async function createEbook(userId: number, ideaId: number | null, brief: EbookBrief, outline: Outline, authorName: string, isDemo: boolean, horsQuota = false) {
  // Tout dans une transaction : l'e-book, ses chapitres et la génération comptée dans le quota
  const latest = "(SELECT MAX(id) FROM ebooks WHERE user_id = ?)";
  const res = await batch([
    {
      sql: `INSERT INTO ebooks (user_id, idea_id, title, subtitle, topic, audience, language, tone, author_name, sensitive, status, promise, cover_json, is_demo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating', ?, ?, ?)`,
      args: [userId, ideaId, outline.title, outline.subtitle, brief.topic, brief.audience, brief.language, brief.tone, authorName, brief.sensitive,
        outline.promise, JSON.stringify(defaultCover(outline.title)), isDemo ? 1 : 0],
    },
    ...outline.chapters.map((c, i) => ({
      sql: `INSERT INTO chapters (ebook_id, idx, title, summary, key_points) VALUES (${latest}, ?, ?, ?, ?)`,
      args: [userId, i, c.title, c.summary || "", JSON.stringify(c.keyPoints || [])],
    })),
    ...(horsQuota ? [] : [{ sql: `INSERT INTO generations (user_id, ebook_id) VALUES (?, ${latest})`, args: [userId, userId] }]),
    { sql: `SELECT ${latest} AS id`, args: [userId] },
  ]);
  return Number(res[res.length - 1].rows[0].id);
}

export async function getEbook(id: number, userId: number) {
  const ebook = await one<EbookRow>("SELECT * FROM ebooks WHERE id = ? AND user_id = ?", [id, userId]);
  if (!ebook) return null;
  const chapters = await all<ChapterRow>("SELECT * FROM chapters WHERE ebook_id = ? ORDER BY idx", [id]);
  const photo = await one<{ tries: number }>("SELECT tries FROM ebook_photos WHERE ebook_id = ?", [id]);
  return { ebook, chapters, photoTries: Number(photo?.tries ?? 0) };
}

export type EbookListItem = Pick<EbookRow, "id" | "title" | "subtitle" | "status" | "created_at" | "cover_json" | "is_demo"> & {
  chapters_total: number;
  chapters_done: number;
};

export function listEbooks(userId: number) {
  return all<EbookListItem>(
    `SELECT e.id, e.title, e.subtitle, e.status, e.created_at, e.cover_json, e.is_demo,
      (SELECT COUNT(*) FROM chapters c WHERE c.ebook_id = e.id) AS chapters_total,
      (SELECT COUNT(*) FROM chapters c WHERE c.ebook_id = e.id AND c.status = 'done') AS chapters_done
     FROM ebooks e WHERE e.user_id = ? ORDER BY e.created_at DESC, e.id DESC`,
    [userId]
  );
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

export async function refreshStatus(ebookId: number) {
  await run(
    `UPDATE ebooks SET updated_at = unixepoch(),
       status = CASE WHEN EXISTS (SELECT 1 FROM chapters WHERE ebook_id = ? AND status != 'done') THEN 'generating' ELSE 'ready' END
     WHERE id = ?`,
    [ebookId, ebookId]
  );
}

export function parseEtsy(e: EbookRow): EtsyKit | null {
  return e.etsy_json ? (JSON.parse(e.etsy_json) as EtsyKit) : null;
}
