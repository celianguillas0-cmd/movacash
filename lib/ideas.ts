import { all, one } from "./db";
import { tk, type T } from "./i18n/t";

const ID: T = (s, v) => (v ? Object.entries(v).reduce((acc, [k, x]) => acc.split(`{${k}}`).join(String(x)), s) : s);

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
  // Langue du visiteur : la recherche porte aussi sur les traductions des idées
  locale?: string;
}

// Mots d'une saisie libre, en minuscules et sans accents (comparés au champ search_text des idées).
export function searchWords(q: string, max = 8) {
  const words = q
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 2);
  return words.slice(0, max);
}

export async function searchIdeas(o: IdeaQuery) {
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  const page = Math.max(1, o.page || 1);
  const pageSize = Math.min(100, Math.max(1, o.pageSize || 24));

  if (o.q) {
    searchWords(o.q).forEach((w, k) => {
      where.push(
        o.locale && o.locale !== "fr"
          ? `(i.search_text LIKE @w${k} OR EXISTS (SELECT 1 FROM idea_i18n x WHERE x.idea_id = i.id AND x.locale = @locale AND x.search_text LIKE @w${k}))`
          : `i.search_text LIKE @w${k}`
      );
      params[`w${k}`] = `%${w}%`;
    });
  }
  if (o.q && o.locale) params.locale = o.locale;
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
      title: "lower(i.title)",
      random: "random()",
    }[o.sort || "opportunity"] || "i.title";

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (await one<{ n: number }>(`SELECT COUNT(*) AS n FROM ideas i ${whereSql}`, params as never))?.n ?? 0;
  const items = await all<Idea>(
      `SELECT i.*, c.name AS category_name, c.emoji,
        CASE WHEN EXISTS(SELECT 1 FROM favorites f WHERE f.user_id = @uid AND f.idea_id = i.id) THEN 1 ELSE 0 END AS is_favorite
       FROM ideas i JOIN categories c ON c.slug = i.category_slug
       ${whereSql} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`,
      { ...params, limit: pageSize, offset: (page - 1) * pageSize } as never
    );
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export function getIdea(id: number) {
  return one<Idea>("SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug WHERE i.id = ?", [id]);
}

export function listCategories() {
  return all<{ slug: string; name: string; emoji: string; count: number }>(
    "SELECT c.slug, c.name, c.emoji, COUNT(i.id) AS count FROM categories c LEFT JOIN ideas i ON i.category_slug = c.slug GROUP BY c.slug ORDER BY c.name"
  );
}

export async function countIdeas() {
  return (await one<{ n: number }>("SELECT COUNT(*) AS n FROM ideas"))?.n ?? 0;
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
export async function terrainMatches(a: QuizAnswers) {
  const ids = new Set<number>();
  for (const t of [(a.situation === "student" ? "" : str(a.job)), str(a.passion), str(a.advice)]) {
    const words = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
    for (const w of words.slice(0, 6)) {
      const rows = await all<{ id: number }>("SELECT id FROM ideas WHERE search_text LIKE ? LIMIT 60", [`%${w}%`]);
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
// exclude : idées déjà montrées (bouton « D'autres idées ») ; si tout a été vu, on repart de toute la sélection.
export async function pickIdeasForQuiz(a: QuizAnswers, limit = 3, exclude: number[] = []): Promise<Idea[]> {
  const themes = arr(a.themes).slice(0, 6);
  const terrain = await terrainMatches(a);
  const where = [themes.length || terrain.size ? `(${[themes.length ? `i.category_slug IN (${themes.map(() => "?").join(",")})` : "", terrain.size ? `i.id IN (${[...terrain].join(",")})` : ""].filter(Boolean).join(" OR ")})` : "1=1"];
  if (a.sensitive === "no") where.push("i.sensitive IS NULL");
  let pool = await all<Idea>(`SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug WHERE ${where.join(" AND ")}`, themes);
  if (exclude.length || pool.length < limit) {
    const vus = new Set(exclude);
    let reste = pool.filter((i) => !vus.has(i.id));
    // Sélection épuisée : on élargit à toute la base avant de reproposer des idées déjà vues
    if (reste.length < limit) {
      const tout = await all<Idea>(`SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug${a.sensitive === "no" ? " WHERE i.sensitive IS NULL" : ""}`);
      reste = tout.filter((i) => !vus.has(i.id));
    }
    const derniers = new Set(exclude.slice(-limit));
    pool = reste.length >= limit ? reste : pool.filter((i) => !derniers.has(i.id));
  }
  const score = (i: Idea) => Object.values(scoreParts(i, a, terrain).parts).reduce((x, y) => x + y, 0) + Math.random() * 1.5;
  const ranked = pool.map((i) => ({ i, s: score(i) })).sort((x, y) => y.s - x.s).map((x) => x.i);
  const picks: Idea[] = [];
  const cats = new Set<string>();
  for (const i of ranked) if (picks.length < limit && !cats.has(i.category_slug)) { picks.push(i); cats.add(i.category_slug); }
  for (const i of ranked) if (picks.length < limit && !picks.includes(i)) picks.push(i);
  return picks;
}

const AUD_LABEL: Record<string, string> = { parents: tk("les parents"), students: tk("les étudiants"), sport: tk("les sportifs"), workers: tk("les salariés pressés"), entrepreneurs: tk("les entrepreneurs"), seniors: tk("les seniors"), pets: tk("les propriétaires d'animaux"), beginners: tk("les débutants") };
const LEVEL = [tk("très faible"), tk("faible"), tk("moyenne"), tk("bonne"), tk("forte")];
const COMP = [tk("très faible"), tk("faible"), tk("moyenne"), tk("élevée"), tk("très élevée")];
const TIME: Record<string, string> = { "15": tk("15 minutes par jour"), "30": tk("30 minutes par jour"), "60": tk("1 heure par jour"), "120": tk("plus de 2 heures par jour") };
const DAYS: Record<string, string> = { "15": tk("deux à trois semaines"), "30": tk("une à deux semaines"), "60": tk("quelques jours"), "120": tk("deux ou trois jours") };

// Pourquoi cette idée correspond aux réponses (phrases courtes, sans promesse de résultat).
export function explainIdea(i: Idea, a: QuizAnswers, terrain: Set<number>, t: T = ID): string[] {
  const { parts, aud } = scoreParts(i, a, terrain);
  const out: string[] = [];
  if (parts.terrain) out.push(t("Proche de ce que tu connais déjà ({sujets}) : ta relecture apportera une vraie valeur.", { sujets: [(a.situation === "student" ? "" : str(a.job)), str(a.passion), str(a.advice)].filter(Boolean).join(", ") }));
  else if (arr(a.themes).includes(i.category_slug)) out.push(t("Dans la thématique « {theme} » que tu as choisie.", { theme: t(i.category_name) }));
  if (aud.length) out.push(t("Vise {public}, un public que tu dis bien connaître.", { public: aud.map((k) => t(AUD_LABEL[k])).join(t(" et ")) }));
  if (parts.format) out.push(t("Format « {format} », celui que tu préfères.", { format: i.format.toLowerCase() }));
  out.push(t("Demande estimée {demande}, concurrence {concurrence}.", { demande: t(LEVEL[i.demand - 1]), concurrence: t(COMP[i.competition - 1]) }));
  out.push(t("Avec {temps}, compte {duree} pour mettre ton e-book en vente.", { temps: t(TIME[str(a.time)] || "un peu de temps chaque jour"), duree: t(DAYS[str(a.time)] || "une à deux semaines") }));
  if (i.sensitive) out.push(t("Sujet sensible : un avertissement est ajouté automatiquement au PDF et à la fiche."));
  return out;
}

export async function getIdeasByIds(ids: number[]) {
  return (await Promise.all(ids.map((id) => getIdea(id)))).filter(Boolean) as Idea[];
}

// ---------- Atelier « Trouver mon idée » ----------

export type PublicCible = "tous" | "particuliers" | "pros" | "parents";
const PRO_RE = /pro\b|pros\b|professionn|entrepreneur|entreprise|freelance|indépendant|auto-entrepreneur|commerçant|manager|salarié|recruteur|artisan|coach|thérapeute|vendeur/i;
const DIFF = [tk("Simple"), tk("Moyenne"), tk("Exigeante")];
const DIFF_NOTE = [tk("peu de recherche"), tk("un peu de recherche"), tk("relecture soignée")];

export interface FoundIdea {
  id: number;
  title: string;
  audience: string;
  format: string;
  category: string;
  emoji: string;
  compat: number;
  price: string;
  demand: number;
  competition: number;
  difficulty: number;
  demandLabel: string;
  competitionLabel: string;
  difficultyLabel: string;
  difficultyNote: string;
  why: string;
  reasons: string[];
  sensitive: string | null;
}

export function describeIdea(i: Idea, a: QuizAnswers, terrain: Set<number>, compat: number, t: T = ID): FoundIdea {
  const reasons = explainIdea(i, a, terrain, t).filter((_, k, all) => k !== all.length - (i.sensitive ? 2 : 1));
  const generic = new Set([t("Demande estimée {demande}, concurrence {concurrence}.", { demande: t(LEVEL[i.demand - 1]), concurrence: t(COMP[i.competition - 1]) })]);
  const personnel = reasons.find((r) => !generic.has(r) && !(i.sensitive && r === reasons[reasons.length - 1]));
  const why = personnel || t("{public} : un public précis, {suite}.", { public: i.audience, suite: i.competition <= 2 ? t("avec peu de concurrence sur Etsy") : t("qui cherche des guides concrets") });
  return {
    id: i.id,
    title: i.title,
    audience: i.audience,
    format: i.format,
    category: t(i.category_name),
    emoji: i.emoji,
    compat,
    price: t("{min} à {max} €", { min: i.price_min, max: i.price_max }),
    demand: i.demand,
    competition: i.competition,
    difficulty: i.difficulty,
    demandLabel: t(LEVEL[i.demand - 1] || "moyenne"),
    competitionLabel: t(COMP[i.competition - 1] || "moyenne"),
    difficultyLabel: t(DIFF[i.difficulty - 1] || "Moyenne"),
    difficultyNote: t(DIFF_NOTE[i.difficulty - 1] || ""),
    why: why.replace(/^./, (c) => c.toLowerCase()),
    reasons,
    sensitive: i.sensitive,
  };
}

// Idées classées selon les réponses au sondage, un sujet facultatif et un public facultatif. Aucune API : tout vient de la base.
export async function findIdeasForUser(a: QuizAnswers, q: string, cible: PublicCible, limit = 12, opts: { t?: T; locale?: string } = {}) {
  const terrain = await terrainMatches(a);
  let pool: Idea[];
  if (q.trim()) {
    pool = (await searchIdeas({ q, pageSize: 100, sensitive: a.sensitive === "no" ? "none" : "all", locale: opts.locale })).items as Idea[];
  } else {
    const themes = arr(a.themes).filter((t) => t !== "autre").slice(0, 6);
    const where = [themes.length ? `i.category_slug IN (${themes.map(() => "?").join(",")})` : "1=1"];
    if (a.sensitive === "no") where.push("i.sensitive IS NULL");
    pool = await all<Idea>(`SELECT i.*, c.name AS category_name, c.emoji FROM ideas i JOIN categories c ON c.slug = i.category_slug WHERE ${where.join(" AND ")}`, themes);
  }
  const hay = (i: Idea) => `${i.title} ${i.audience} ${i.keywords}`;
  if (cible === "pros") pool = pool.filter((i) => PRO_RE.test(hay(i)));
  if (cible === "particuliers") pool = pool.filter((i) => !PRO_RE.test(hay(i)));
  if (cible === "parents") pool = pool.filter((i) => AUDIENCE_RE.parents.test(hay(i)));
  const scored = pool
    .map((i) => ({ i, s: Object.values(scoreParts(i, a, terrain).parts).reduce((x, y) => x + y, 0) }))
    .sort((x, y) => y.s - x.s || x.i.title.localeCompare(y.i.title));
  // Une idée par catégorie d'abord, pour varier, puis le reste
  const picks: typeof scored = [];
  const cats = new Set<string>();
  for (const x of scored) if (picks.length < limit && !cats.has(x.i.category_slug)) { picks.push(x); cats.add(x.i.category_slug); }
  for (const x of scored) if (picks.length < limit && !picks.includes(x)) picks.push(x);
  picks.sort((x, y) => y.s - x.s);
  const max = picks[0]?.s ?? 0;
  const min = picks[picks.length - 1]?.s ?? 0;
  return {
    total: scored.length,
    picks: picks.map((x, k) => ({ idea: x.i, compat: Math.round(72 + (24 * (x.s - min)) / (max - min || 1)) - (k === 0 ? 0 : Math.min(k, 1)) })),
    describe: (i: Idea, compat: number) => describeIdea(i, a, terrain, compat, opts.t),
  };
}
