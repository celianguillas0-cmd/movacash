import { getDb } from "./db";

export interface Idea {
  id: number;
  slug: string;
  title: string;
  category_slug: string;
  category_name: string;
  emoji: string;
  audience: string;
  keywords: string;
  format: string;
  difficulty: number;
  demand: number;
  competition: number;
  price_min: number;
  price_max: number;
  sensitive: string | null;
  is_favorite?: number;
}

export interface IdeaQuery {
  q?: string;
  category?: string;
  difficulty?: number;
  sensitive?: "all" | "none" | "only";
  minDemand?: number;
  maxCompetition?: number;
  sort?: "opportunity" | "demand" | "competition" | "price" | "title" | "random";
  favoritesOf?: number;
  userId?: number;
  page?: number;
  pageSize?: number;
}

// Transforme une saisie libre en requête FTS5 sûre (préfixe sur chaque mot).
function ftsQuery(q: string) {
  const words = q
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
  if (!words.length) return null;
  return words.map((w) => `"${w}"*`).join(" ");
}

export function searchIdeas(o: IdeaQuery) {
  const db = getDb();
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  const page = Math.max(1, o.page || 1);
  const pageSize = Math.min(100, Math.max(1, o.pageSize || 24));

  if (o.q) {
    const fq = ftsQuery(o.q);
    if (fq) {
      where.push("i.id IN (SELECT rowid FROM ideas_fts WHERE ideas_fts MATCH @fq)");
      params.fq = fq;
    }
  }
  if (o.category) {
    where.push("i.category_slug = @category");
    params.category = o.category;
  }
  if (o.difficulty) {
    where.push("i.difficulty = @difficulty");
    params.difficulty = o.difficulty;
  }
  if (o.sensitive === "none") where.push("i.sensitive IS NULL");
  if (o.sensitive === "only") where.push("i.sensitive IS NOT NULL");
  if (o.minDemand) {
    where.push("i.demand >= @minDemand");
    params.minDemand = o.minDemand;
  }
  if (o.maxCompetition) {
    where.push("i.competition <= @maxCompetition");
    params.maxCompetition = o.maxCompetition;
  }
  if (o.favoritesOf) {
    where.push("i.id IN (SELECT idea_id FROM favorites WHERE user_id = @favUser)");
    params.favUser = o.favoritesOf;
  }
  params.uid = o.userId ?? 0;

  const orderBy =
    {
      opportunity: "(i.demand - i.competition) DESC, i.demand DESC, i.title",
      demand: "i.demand DESC, i.competition ASC, i.title",
      competition: "i.competition ASC, i.demand DESC, i.title",
      price: "i.price_max DESC, i.title",
      title: "i.title COLLATE NOCASE",
      random: "random()",
    }[o.sort || "opportunity"] || "i.title";

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM ideas i ${whereSql}`).get(params) as { n: number }).n;
  const items = db
    .prepare(
      `SELECT i.*, c.name AS category_name, c.emoji,
        EXISTS(SELECT 1 FROM favorites f WHERE f.user_id = @uid AND f.idea_id = i.id) AS is_favorite
       FROM ideas i JOIN categories c ON c.slug = i.category_slug
       ${whereSql} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset: (page - 1) * pageSize }) as Idea[];
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export function getIdea(id: number) {
  return getDb()
    .prepare("SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug WHERE i.id = ?")
    .get(id) as Idea | undefined;
}

export function listCategories() {
  return getDb()
    .prepare(
      "SELECT c.slug, c.name, c.emoji, COUNT(i.id) AS count FROM categories c LEFT JOIN ideas i ON i.category_slug = c.slug GROUP BY c.slug ORDER BY c.name"
    )
    .all() as { slug: string; name: string; emoji: string; count: number }[];
}

export function countIdeas() {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM ideas").get() as { n: number }).n;
}

export interface QuizAnswers {
  name?: string;
  themes?: string[];
  sensitive?: "yes" | "no";
  writing?: "easy" | "ok" | "hard";
  etsy?: string;
  time?: string;
  [k: string]: unknown;
}

// Sélection des 3 idées du sondage : meilleures opportunités dans les thèmes choisis, une par catégorie si possible.
export function pickIdeasForQuiz(a: QuizAnswers, limit = 3): Idea[] {
  const db = getDb();
  const themes = (a.themes || []).filter((t) => typeof t === "string").slice(0, 6);
  const where = [themes.length ? `i.category_slug IN (${themes.map(() => "?").join(",")})` : "1=1"];
  if (a.sensitive === "no") where.push("i.sensitive IS NULL");
  const pool = db
    .prepare(`SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug WHERE ${where.join(" AND ")}`)
    .all(...themes) as Idea[];
  const score = (i: Idea) => i.demand * 2 - i.competition - (a.writing === "hard" && i.sensitive ? 2 : 0) - (a.writing === "hard" ? i.difficulty - 1 : 0) + Math.random() * 1.5;
  const ranked = pool.map((i) => ({ i, s: score(i) })).sort((x, y) => y.s - x.s).map((x) => x.i);
  const picks: Idea[] = [];
  const cats = new Set<string>();
  for (const i of ranked) if (picks.length < limit && !cats.has(i.category_slug)) { picks.push(i); cats.add(i.category_slug); }
  for (const i of ranked) if (picks.length < limit && !picks.includes(i)) picks.push(i);
  return picks;
}

export function getIdeasByIds(ids: number[]) {
  return ids.map((id) => getIdea(id)).filter(Boolean) as Idea[];
}
