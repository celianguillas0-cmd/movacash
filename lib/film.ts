import { all, one } from "./db";
import type { ChapterRow, EbookRow } from "./ebooks";

// Mode tournage (admin) : rien n'est envoyé à l'API, mais l'écran doit être identique à celui des clients.
// Si l'admin a déjà généré un vrai e-book sur le même sujet, son contenu est rejoué ; sinon, contenu d'exemple.

export const pause = (min: number, max = min) => new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

// Durées d'attente du tournage (en millisecondes)
export const ATTENTE = {
  plan: [11000, 14000],
  chapitre: [4500, 7500],
  fiche: [5000, 7000],
  photo: [6000, 8000],
} as const;

// Dernier vrai e-book de l'admin sur ce sujet (compté dans le quota, donc généré par l'API), entièrement écrit
export async function filmSource(userId: number, topic: string) {
  const e = await one<EbookRow>(
    `SELECT e.* FROM ebooks e
      WHERE e.user_id = ? AND e.topic = ? AND e.is_demo = 0 AND e.film_source_id IS NULL
        AND EXISTS (SELECT 1 FROM generations g WHERE g.ebook_id = e.id)
        AND NOT EXISTS (SELECT 1 FROM chapters c WHERE c.ebook_id = e.id AND c.status != 'done')
      ORDER BY e.id DESC LIMIT 1`,
    [userId, topic]
  );
  if (!e) return null;
  const chapters = await all<ChapterRow>("SELECT * FROM chapters WHERE ebook_id = ? ORDER BY idx", [e.id]);
  return { ebook: e, chapters };
}
