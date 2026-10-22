import { CATEGORIES } from "@/data/ideas-catalog.mjs";

export interface SeedIdea {
  slug: string;
  title: string;
  categorySlug: string;
  audience: string;
  keywords: string;
  format: string;
  difficulty: number;
  demand: number;
  competition: number;
  priceMin: number;
  priceMax: number;
  sensitive: string | null;
}

export interface SeedCategory {
  slug: string;
  name: string;
  emoji: string;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function guessFormat(title: string) {
  const t = title.toLowerCase();
  if (/(à imprimer|planner|carnet|journal|tableau|calendrier)/.test(t)) return "Guide + printables";
  if (/(\d+ (jours|semaines|mois)|programme|défi|plan )/.test(t)) return "Programme";
  if (/(\d+ (idées|recettes|prompts|activités|défis)|recettes)/.test(t)) return "Recueil";
  if (/(checklist|itinéraire)/.test(t)) return "Guide pratique";
  return "Guide complet";
}

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function buildSeed(): { categories: SeedCategory[]; ideas: SeedIdea[] } {
  const categories: SeedCategory[] = [];
  const ideas: SeedIdea[] = [];
  const seen = new Set<string>();
  for (const c of CATEGORIES) {
    categories.push({ slug: c.slug, name: c.name, emoji: c.emoji });
    for (const line of c.ideas.trim().split("\n")) {
      const [title, audience = "", keywords = ""] = line.split("|").map((s: string) => s.trim());
      if (!title) continue;
      let slug = slugify(title);
      while (seen.has(slug)) slug += "-2";
      seen.add(slug);
      const h = hash(title);
      // Indicateurs indicatifs (estimation éditoriale, pas des données de marché temps réel)
      const demand = clamp(c.baseDemand - (h % 3 === 0 ? 1 : 0), 1, 5);
      const competition = clamp(c.baseCompetition - ((h >> 3) % 3 === 0 ? 1 : 0) + ((h >> 5) % 4 === 0 ? 1 : 0), 1, 5);
      // Difficulté de rédaction : les sujets sensibles demandent plus de vérification
      const difficulty = c.sensitive ? 2 + ((h >> 7) % 2) : 1 + ((h >> 7) % 2);
      ideas.push({
        slug,
        title,
        categorySlug: c.slug,
        audience,
        keywords,
        format: guessFormat(title),
        difficulty,
        demand,
        competition,
        priceMin: c.price[0],
        priceMax: c.price[1],
        sensitive: c.sensitive,
      });
    }
  }
  return { categories, ideas };
}
