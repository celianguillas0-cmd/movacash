import { all, one } from "./db";

// Pages publiques « idées d'e-books par thème » (référencement, en français : les idées de la base sont écrites en français).
// On montre une partie des idées de chaque thème ; le reste se découvre avec le questionnaire.
export const IDEES_MONTREES = 6;

// Une phrase d'introduction propre à chaque thème (contenu unique pour Google et les assistants IA).
export const INTROS: Record<string, string> = {
  "sport-musculation": "Programmes d'entraînement, routines à la maison, préparation d'une course : le sport fait partie des sujets les plus recherchés en produits numériques, à condition de rester prudent sur les promesses de résultats.",
  "nutrition-perte-de-poids": "Menus, listes de courses, meal prep : les guides pratiques autour de l'alimentation intéressent beaucoup d'acheteurs. Ce sont des sujets de santé : pas de promesse de kilos perdus, et un avertissement clair dans le livre.",
  "bien-etre-mental": "Stress, sommeil, méditation : des guides simples et bienveillants, présentés comme des aides du quotidien et jamais comme un traitement.",
  "yoga-pilates": "Séances guidées, routines courtes, mobilité : des programmes faciles à suivre chez soi, qui se présentent bien sous forme de PDF avec un planning.",
  "cuisine-recettes": "Recettes faciles, batch cooking, cuisine étudiante : des livres pratiques qu'on garde sous la main, et un thème qui se décline à l'infini selon le public.",
  "ia-creation-contenu": "Prompts, vidéos, images, outils d'IA : un thème très actuel, recherché par des débutants qui veulent un mode d'emploi concret.",
  "reseaux-sociaux": "Lancer un compte, trouver ses premiers abonnés, devenir créateur UGC : des guides pas à pas pour un public qui veut apprendre vite.",
  "ecommerce-revente": "Achat-revente, Vinted, vide-greniers, boutiques en ligne : des méthodes concrètes pour débuter dans le commerce, sans promesse de gains.",
  "freelance-side-business": "Démarrer en freelance, créer sa micro-entreprise, trouver ses premiers clients : des guides utiles pour ceux qui se lancent à côté de leur emploi.",
  "finances-personnelles": "Budget, épargne, méthode des enveloppes : des outils pratiques pour mieux gérer son argent au quotidien, avec un avertissement : ce n'est pas un conseil financier personnalisé.",
  "investissement": "Bourse, ETF, PEA expliqués simplement : des guides pédagogiques pour comprendre les bases, avec un rappel clair des risques de perte en capital.",
  "productivite": "Procrastination, organisation, Notion, méthodes de travail : des guides courts et actionnables qui se vendent bien sous forme de programmes sur quelques semaines.",
  "developpement-personnel": "Confiance en soi, prise de parole, habitudes : des programmes progressifs avec exercices, pour un public qui veut avancer pas à pas.",
  "parentalite": "Routines, activités Montessori, préparation de l'arrivée de bébé : des guides et checklists très recherchés par les jeunes parents.",
  "animaux": "Éduquer un chiot, comprendre son chat, apprendre des tours : des guides pratiques pour des propriétaires qui veulent bien faire.",
  "maison-deco-diy": "Déco petit budget, relooking de meubles, home staging : des idées concrètes et visuelles, faciles à illustrer dans un e-book.",
  "jardinage": "Potager, balcon, permaculture : des guides de saison pour débutants, avec calendriers et listes à cocher.",
  "beaute-mode": "Routines beauté, maquillage, style vestimentaire : des guides personnels et pratiques, sans promesse miracle.",
  "voyage": "Road trip, voyage en solo, tour du monde, expatriation : des guides de préparation avec itinéraires, budgets et checklists.",
  "langues-etudes": "Apprendre une langue, réviser, réussir ses études : des méthodes structurées sur quelques semaines, avec exercices.",
  "carriere-emploi": "CV, entretien d'embauche, négociation de salaire : des guides très concrets pour un public motivé à passer à l'action.",
  "creativite-arts": "Dessin, aquarelle, Procreate, écriture : des cours progressifs pour débutants, qui se prêtent bien au format « 30 jours ».",
  "tech-outils": "Canva, Excel, WordPress, outils numériques : des modes d'emploi pas à pas pour ceux qui veulent gagner du temps.",
  "relations-couple": "Communication, idées de sorties, vie à deux : des guides bienveillants et pratiques, à offrir ou à s'offrir.",
  "evenements-fetes": "Mariage, anniversaire, discours, organisation : des plannings et checklists recherchés au moment où l'on en a besoin.",
  "ecologie-zero-dechet": "Zéro déchet, économies d'énergie, salle de bain écologique : des défis progressifs et des recettes maison.",
  "auto-mobilite": "Code de la route, permis, entretien de la voiture : des guides de préparation clairs, avec fiches de révision.",
  "gaming-loisirs": "Échecs, jeux de société, chaîne gaming : des loisirs expliqués simplement, des bases jusqu'aux premières tactiques.",
  "spiritualite": "Tarot, thème astral, lithothérapie : des guides d'initiation présentés comme une approche culturelle, sans promesse ni prédiction.",
  "seniors": "Préparer sa retraite, rester en forme, utiliser son smartphone : des guides accessibles, écrits gros et clairs.",
  "droit-demarches": "Déménagement, location, dossiers : des checklists de démarches pratiques, à vérifier auprès des sources officielles.",
};

export type Categorie = { slug: string; name: string; emoji: string; n: number };
export type IdeePublique = { id: number; title: string; audience: string; format: string; demand: number; competition: number; price_min: number; price_max: number };

export async function categoriesPubliques() {
  const rows = await all<Categorie>(
    "SELECT c.slug, c.name, c.emoji, COUNT(i.id) AS n FROM categories c JOIN ideas i ON i.category_slug = c.slug GROUP BY c.slug, c.name, c.emoji ORDER BY n DESC, c.name"
  );
  return rows.map((r) => ({ ...r, n: Number(r.n) }));
}

export async function categoriePublique(slug: string) {
  const c = await one<Categorie>(
    "SELECT c.slug, c.name, c.emoji, COUNT(i.id) AS n FROM categories c JOIN ideas i ON i.category_slug = c.slug WHERE c.slug = ? GROUP BY c.slug, c.name, c.emoji",
    [slug]
  );
  if (!c) return null;
  const idees = await all<IdeePublique>(
    "SELECT id, title, audience, format, demand, competition, price_min, price_max FROM ideas WHERE category_slug = ? ORDER BY demand DESC, competition ASC, id LIMIT ?",
    [slug, IDEES_MONTREES]
  );
  const prix = await one<{ min: number; max: number }>("SELECT MIN(price_min) AS min, MAX(price_max) AS max FROM ideas WHERE category_slug = ?", [slug]);
  return { ...c, n: Number(c.n), idees, prixMin: Number(prix?.min || 0), prixMax: Number(prix?.max || 0) };
}
