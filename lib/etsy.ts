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
const BRANDS = ["tiktok", "instagram", "youtube", "vinted", "etsy", "canva", "notion", "chatgpt", "midjourney", "shopify", "amazon", "kdp", "leboncoin", "ebay", "linkedin", "pinterest", "excel", "wordpress", "capcut", "procreate", "lightroom", "thermomix", "pokémon", "pokemon", "twitch", "snapchat", "fiverr", "malt", "davinci", "rubik", "toeic", "parcoursup", "kettlebell"];

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

const HYPE = /(garanti|guaranteed|100 ?%|miracle|guéri|guérir|cure|perdez \d+ ?kg|lose \d+ ?(lbs|kg)|devenez riche|get rich|revenu passif garanti|sans effort)/i;

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
  if (HYPE.test(lower)) issues.push({ level: "error", message: t("Promesse excessive détectée (résultat garanti, guérison, gain d'argent…). Etsy interdit les allégations trompeuses ou médicales.") });
  const brands = BRANDS.filter((b) => new RegExp(`\\b${b}\\b`, "i").test(lower));
  if (brands.length && !/(non affilié|not affiliated|no afiliad|nicht verbunden|non affiliat)/i.test(kit.description))
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
