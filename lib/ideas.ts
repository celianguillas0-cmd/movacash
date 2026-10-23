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
  time?: string;
  start?: string;
  tools?: string;
  job?: string;
  passion?: string;
  advice?: string;
  audience?: string[];
  refuse?: string[];
  format?: string;
  [k: string]: unknown;
}

const AUDIENCE_RE: Record<string, RegExp> = {
  parents: /parent|enfant|bébé|maman|famill|ado/i,
  students: /étudiant|lycéen|bac|examen|révis/i,
  sport: /sport|muscu|coureur|cycliste|fitness|athl/i,
  workers: /salarié|actif|pressé|bureau|télétrav/i,
  entrepreneurs: /entrepreneur|créateur|freelance|vendeur|commerçant|business/i,
  seniors: /senior|retrait|40\+|50 ans/i,
  pets: /chien|chat|chiot|animal|animaux|cheval/i,
  beginners: /débutant|zéro|nul/i,
};
const FORMAT_OF: Record<string, string> = { guide: "Guide complet", program: "Programme", printables: "Guide + printables", collection: "Recueil" };

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 120) : "");
const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 8) : []);

// Idées dont le texte correspond au métier, à la passion ou aux conseils donnés par l'utilisateur.
function terrainMatches(a: QuizAnswers) {
  const ids = new Set<number>();
  const db = getDb();
  for (const t of [(a.situation === "student" ? "" : str(a.job)), str(a.passion), str(a.advice)]) {
    const words = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
    for (const w of words.slice(0, 6)) {
      const rows = db.prepare("SELECT rowid AS id FROM ideas_fts WHERE ideas_fts MATCH ? LIMIT 60").all(`"${w}"*`) as { id: number }[];
      rows.forEach((r) => ids.add(r.id));
    }
  }
  return ids;
}

function scoreParts(i: Idea, a: QuizAnswers, terrain: Set<number>) {
  const hay = `${i.title} ${i.audience} ${i.keywords}`;
  const aud = arr(a.audience).filter((k) => AUDIENCE_RE[k]?.test(hay));
  const refuse = arr(a.refuse);
  const parts = {
    base: i.demand * 2 - i.competition,
    terrain: terrain.has(i.id) ? (refuse.includes("unknown") ? 5 : 3) : 0,
    audience: aud.length ? 1.5 : 0,
    format: FORMAT_OF[str(a.format)] === i.format ? 1 : 0,
    effort:
      -(a.writing === "hard" ? i.difficulty - 1 + (i.sensitive ? 2 : 0) : 0) -
      (a.time === "15" || a.start === "week" ? (i.difficulty - 1) * 0.8 : 0) -
      (refuse.includes("design") && i.format === "Guide + printables" ? 1.5 : 0) -
      (refuse.includes("trend") && /tiktok|tendance|viral/i.test(hay) ? 1.5 : 0),
  };
  return { parts, aud };
}

// Sélection des 3 idées du sondage : thèmes choisis, terrain, public, format et contraintes, une par catégorie si possible.
export function pickIdeasForQuiz(a: QuizAnswers, limit = 3): Idea[] {
  const db = getDb();
  const themes = arr(a.themes).slice(0, 6);
  const terrain = terrainMatches(a);
  const where = [themes.length || terrain.size ? `(${[themes.length ? `i.category_slug IN (${themes.map(() => "?").join(",")})` : "", terrain.size ? `i.id IN (${[...terrain].join(",")})` : ""].filter(Boolean).join(" OR ")})` : "1=1"];
  if (a.sensitive === "no") where.push("i.sensitive IS NULL");
  const pool = db
    .prepare(`SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug WHERE ${where.join(" AND ")}`)
    .all(...themes) as Idea[];
  const score = (i: Idea) => Object.values(scoreParts(i, a, terrain).parts).reduce((x, y) => x + y, 0) + Math.random() * 1.5;
  const ranked = pool.map((i) => ({ i, s: score(i) })).sort((x, y) => y.s - x.s).map((x) => x.i);
  const picks: Idea[] = [];
  const cats = new Set<string>();
  for (const i of ranked) if (picks.length < limit && !cats.has(i.category_slug)) { picks.push(i); cats.add(i.category_slug); }
  for (const i of ranked) if (picks.length < limit && !picks.includes(i)) picks.push(i);
  return picks;
}

const AUD_LABEL: Record<string, string> = { parents: "les parents", students: "les étudiants", sport: "les sportifs", workers: "les salariés pressés", entrepreneurs: "les entrepreneurs", seniors: "les seniors", pets: "les propriétaires d'animaux", beginners: "les débutants" };
const LEVEL = ["très faible", "faible", "moyenne", "bonne", "forte"];
const COMP = ["très faible", "faible", "moyenne", "élevée", "très élevée"];
const TIME: Record<string, string> = { "15": "15 minutes par jour", "30": "30 minutes par jour", "60": "1 heure par jour", "120": "plus de 2 heures par jour" };
const DAYS: Record<string, string> = { "15": "deux à trois semaines", "30": "une à deux semaines", "60": "quelques jours", "120": "deux ou trois jours" };

// Pourquoi cette idée correspond aux réponses (phrases courtes, sans promesse de résultat).
export function explainIdea(i: Idea, a: QuizAnswers): string[] {
  const terrain = terrainMatches(a);
  const { parts, aud } = scoreParts(i, a, terrain);
  const out: string[] = [];
  if (parts.terrain) out.push(`Proche de ce que tu connais déjà (${[(a.situation === "student" ? "" : str(a.job)), str(a.passion), str(a.advice)].filter(Boolean).join(", ")}) : ta relecture apportera une vraie valeur.`);
  else if (arr(a.themes).includes(i.category_slug)) out.push(`Dans la thématique « ${i.category_name} » que tu as choisie.`);
  if (aud.length) out.push(`Vise ${aud.map((k) => AUD_LABEL[k]).join(" et ")}, un public que tu dis bien connaître.`);
  if (parts.format) out.push(`Format « ${i.format.toLowerCase()} », celui que tu préfères.`);
  out.push(`Demande estimée ${LEVEL[i.demand - 1]}, concurrence ${COMP[i.competition - 1]}.`);
  out.push(`Avec ${TIME[str(a.time)] || "un peu de temps chaque jour"}, compte ${DAYS[str(a.time)] || "une à deux semaines"} pour relire et publier.`);
  if (i.sensitive) out.push("Sujet sensible : un avertissement est ajouté automatiquement au PDF et à la fiche.");
  return out;
}

export function getIdeasByIds(ids: number[]) {
  return ids.map((id) => getIdea(id)).filter(Boolean) as Idea[];
}
