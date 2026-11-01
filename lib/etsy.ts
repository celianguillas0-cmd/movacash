// Règles Etsy et garde-fous de conformité appliqués aux e-books et aux fiches produits.
// À revérifier régulièrement : https://www.etsy.com/legal/creativity et https://www.etsy.com/legal/prohibited
import { tk, makeT, type T } from "./i18n/t";
import { CONTENT_LANGS, contentLang } from "./content-langs";

export const LANGUAGES: Record<string, string> = Object.fromEntries(Object.entries(CONTENT_LANGS).map(([k, v]) => [k, v.fr]));

export const TONES: Record<string, string> = {
  pedagogique: "pédagogique, clair et bienveillant",
  motivant: "motivant et énergique, orienté action",
  expert: "expert, précis et structuré",
  convivial: "convivial et accessible, comme un ami qui conseille",
};

export const SENSITIVE_LABELS: Record<string, string> = {
  health: "Santé / nutrition / forme",
  finance: "Argent / investissement",
  legal: "Juridique / administratif",
};

export function disclaimerFor(sensitive: string | null, lang: string) {
  if (sensitive !== "health" && sensitive !== "finance" && sensitive !== "legal") return null;
  return contentLang(lang)[sensitive];
}

export const aiDisclosure = (lang: string) => contentLang(lang).ai;

// Marques fréquemment citées dans les sujets : pas de logo, pas de suggestion d'affiliation.
const BRANDS = ["tiktok", "instagram", "youtube", "vinted", "canva", "notion", "chatgpt", "midjourney", "shopify", "amazon", "kdp", "leboncoin", "ebay", "linkedin", "pinterest", "excel", "wordpress", "capcut", "procreate", "lightroom", "thermomix", "pokémon", "pokemon", "twitch", "snapchat", "fiverr", "malt", "davinci", "rubik", "toeic", "parcoursup"];

export interface EtsyKit {
  title: string;
  tags: string[];
  description: string;
  priceSuggestion: string;
  imageIdeas: string[];
  category: string;
}

export interface ComplianceIssue {
  level: "error" | "warning" | "ok";
  message: string;
}

// Mots entiers seulement (« aguerri », « sécure », « manucure » ou « 100 % poids du corps » ne doivent pas déclencher l'alerte).
const HYPE = /(?<![\p{L}\d])(garanti(e|es|s)?|guaranteed|miracles?|miraculeu(x|se)|guéri(r|son|t)?|cures?|cure your|perdez \d+ ?kg|lose \d+ ?(lbs|kg)|devenez riche|get rich|revenus? passifs? garantis?|sans (aucun )?effort|effortless|100 ?% (efficace|garanti|effective|guaranteed|des résultats|results))(?![\p{L}])/iu;

// Texte à vérifier, sans nos propres mentions légales (« les résultats ne sont pas garantis » n'est pas une promesse).
function sansMentions(text: string, lang: string) {
  const c = contentLang(lang);
  let s = text;
  for (const m of [c.ai, c.health, c.finance, c.legal]) s = s.split(m).join(" ");
  return s.toLowerCase();
}

// Première promesse excessive trouvée, en ignorant les formulations négatives (« aucun résultat garanti », « not guaranteed »).
export function findHype(text: string, lang: string): string | null {
  const s = sansMentions(text, lang);
  const re = new RegExp(HYPE.source, "giu");
  for (const m of s.matchAll(re)) {
    const avant = s.slice(Math.max(0, m.index! - 40), m.index);
    if (/(\bpas|\bni|\bnon|\bno|\bnot|\bnever|jamais|aucun|aucune|\bsans|nicht|kein|\bniet|\bgeen|\bnada|\bnessun)\b[^.!?\n]{0,30}$/i.test(avant)) continue;
    return m[0];
  }
  return null;
}

export const brandsIn = (text: string) => BRANDS.filter((b) => new RegExp(`(?<![\\p{L}])${b}(?![\\p{L}])`, "iu").test(text));
const AFFILIATION = /(non affilié|not affiliated|no afiliad|nicht verbunden|nicht mit [^.]{1,60} verbunden|non affiliat|sem afiliação|niet verbonden|niepowiązany|neafiliat|není spojen|nie je prepojený|nem kapcsolódik|inte ansluten|ikke tilknyttet|ei yhteydessä|χωρίς σχέση|несвързано|nije povezan|ni povezan|pole seotud|nav saistīts|nesusijęs)/i;

// Mise en conformité automatique de la fiche, avant que le client la voie : ce que le contrôle signalerait est corrigé ici.
export function conformerKit(kit: EtsyKit, opts: { sensitive: string | null; language: string }): EtsyKit {
  const c = contentLang(opts.language);
  let title = (kit.title || "").replace(/\s+/g, " ").trim();
  if (title.length > 140) title = title.slice(0, 141).replace(/\s+\S*$/, "").replace(/[\s,;:|–-]+$/, "");
  const vus = new Set<string>();
  const tags = (kit.tags || []).map((x) => x.trim().replace(/\s+/g, " ")).map((x) => (x.length > 20 ? x.slice(0, 21).replace(/\s+\S*$/, "").trim() || x.slice(0, 20) : x))
    .filter((x) => x && !vus.has(x.toLowerCase()) && vus.add(x.toLowerCase())).slice(0, 13);
  // Moins de 13 tags : complétés avec des groupes de mots du titre (20 caractères max).
  const mots = title.toLowerCase().split(/[^\p{L}\d'-]+/u).filter((m) => m.length > 2);
  for (let n = 2; n >= 1 && tags.length < 13; n--)
    for (let i = 0; i + n <= mots.length && tags.length < 13; i++) {
      const g = mots.slice(i, i + n).join(" ");
      if (g.length <= 20 && !vus.has(g)) { vus.add(g); tags.push(g); }
    }
  // Phrases contenant une promesse excessive : retirées, ligne par ligne (le titre perd seulement l'expression).
  const description0 = (kit.description || "").trim();
  let description = findHype(description0, opts.language)
    ? description0.split("\n").map((ligne) => ligne.split(/(?<=[.!?])\s+/).filter((ph) => !findHype(ph, opts.language)).join(" ")).join("\n").replace(/\n{3,}/g, "\n\n").trim()
    : description0;
  const h = findHype(title, opts.language);
  if (h) title = title.replace(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "").replace(/\s{2,}/g, " ").replace(/^[\s,;:|–-]+|[\s,;:|–-]+$/g, "");
  const ajouts: string[] = [];
  if (!/(pdf|téléchargement|download|numérique|digital|digitale|cyfrow|digitál|ψηφιακ|дигитал)/i.test(description)) ajouts.push(c.thumb.pdf);
  const marques = brandsIn(title + " " + description);
  if (marques.length && !AFFILIATION.test(description)) ajouts.push(c.aff.replace("{b}", marques.map((b) => b[0].toUpperCase() + b.slice(1)).join(", ")));
  const avert = disclaimerFor(opts.sensitive, opts.language);
  if (avert && !description.includes(avert) && !/(ne remplace|not replace|ne constitue pas|is not|informati)/i.test(description)) ajouts.push(avert);
  if (!description.includes(c.ai) && !/(intelligence artificielle|artificial intelligence|ia\b|\bai\b|inteligencia artificial|ki-)/i.test(description)) ajouts.push(c.ai);
  if (ajouts.length) description = `${description}\n\n${ajouts.join("\n\n")}`.trim();
  return { ...kit, title, tags, description };
}

export function checkEtsyCompliance(kit: EtsyKit, opts: { sensitive: string | null; language: string }, t: T = makeT({})): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  if (kit.title.length > 140) issues.push({ level: "error", message: t("Titre trop long ({n}/140 caractères).", { n: kit.title.length }) });
  if (kit.tags.length !== 13) issues.push({ level: "warning", message: t("Etsy autorise 13 tags : tu en as {n}.", { n: kit.tags.length }) });
  const longTags = kit.tags.filter((t) => t.length > 20);
  if (longTags.length) issues.push({ level: "error", message: t("Tags de plus de 20 caractères : {tags}", { tags: longTags.join(", ") }) });
  const lower = (kit.title + " " + kit.description).toLowerCase();
  const disclosure = aiDisclosure(opts.language).toLowerCase().slice(0, 30);
  if (!/(intelligence artificielle|artificial intelligence|ia\b|\bai\b|inteligencia artificial|ki-)/i.test(kit.description) && !lower.includes(disclosure))
    issues.push({ level: "error", message: t("La description doit indiquer que le contenu a été créé avec l'aide de l'IA (règles de créativité Etsy).") });
  const hype = findHype(kit.title + "\n" + kit.description, opts.language);
  if (hype) issues.push({ level: "error", message: `${t("Promesse excessive détectée (résultat garanti, guérison, gain d'argent…). Etsy interdit les allégations trompeuses ou médicales.")} « ${hype} »` });
  const brands = brandsIn(lower);
  if (brands.length && !AFFILIATION.test(kit.description))
    issues.push({ level: "warning", message: t("Marques citées ({brands}) : n'utilise pas leurs logos et précise que le guide n'est pas affilié à ces marques.", { brands: brands.join(", ") }) });
  if (opts.sensitive && !/(ne remplace|not replace|ne constitue pas|is not|informati)/i.test(kit.description))
    issues.push({ level: "warning", message: t("Sujet sensible : ajoute dans la description que le guide est informatif et ne remplace pas un professionnel.") });
  if (!/(pdf|téléchargement|download|numérique|digital|digitale|cyfrow|digitál|ψηφιακ|дигитал)/i.test(kit.description))
    issues.push({ level: "warning", message: t("Précise qu'il s'agit d'un produit numérique (PDF à télécharger, aucun envoi physique).") });
  if (!issues.length) issues.push({ level: "ok", message: t("Aucun problème détecté. Relis quand même la fiche avant publication.") });
  return issues;
}

export const ETSY_CHECKLIST = [
  tk("Relis et personnalise l'e-book (exemples, anecdotes, ta touche) : c'est ce qui fait sa valeur et ce qui le distingue des autres."),
  tk("Indique dans la description que le contenu a été créé avec l'aide de l'IA (règles de créativité Etsy, catégorie « Designed by »)."),
  tk("Ne revends pas un fichier tel quel venu d'ailleurs (PLR, packs revendus) : seul ton contenu, créé avec tes choix, est autorisé."),
  tk("Sur les sujets santé, nutrition, argent : aucune promesse de résultat, aucune allégation médicale, et un avertissement visible."),
  tk("N'utilise pas les logos des marques citées (TikTok, Vinted, Canva…) et ne laisse pas croire à un partenariat."),
  tk("Précise le format : PDF numérique, nombre de pages, aucun envoi physique."),
  tk("Propose un prix cohérent avec la longueur et la qualité réelle du guide."),
];
