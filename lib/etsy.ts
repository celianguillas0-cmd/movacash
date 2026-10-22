// Règles Etsy et garde-fous de conformité appliqués aux e-books et aux fiches produits.
// À revérifier régulièrement : https://www.etsy.com/legal/creativity et https://www.etsy.com/legal/prohibited

export const LANGUAGES: Record<string, string> = {
  fr: "français",
  en: "anglais",
  es: "espagnol",
  de: "allemand",
  it: "italien",
};

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

export const DISCLAIMERS: Record<string, Record<string, string>> = {
  health: {
    fr: "Ce guide a une vocation informative et éducative. Il ne remplace en aucun cas l'avis, le diagnostic ou le traitement d'un médecin, d'un diététicien ou de tout autre professionnel de santé. Consultez un professionnel avant de commencer un programme d'exercice ou de modifier votre alimentation, en particulier si vous êtes enceinte, si vous avez des problèmes de santé ou si vous prenez un traitement. Les résultats varient d'une personne à l'autre et ne sont pas garantis.",
    en: "This guide is for informational and educational purposes only. It does not replace the advice, diagnosis or treatment of a doctor, dietitian or other health professional. Consult a professional before starting an exercise program or changing your diet, especially if you are pregnant, have a health condition or take medication. Results vary and are not guaranteed.",
  },
  finance: {
    fr: "Ce guide a une vocation informative et éducative et ne constitue pas un conseil financier, fiscal ou en investissement personnalisé. Tout investissement comporte un risque de perte en capital. Les performances passées ne préjugent pas des performances futures. Aucun revenu ni gain n'est garanti. Renseignez-vous et, si besoin, consultez un professionnel agréé avant toute décision.",
    en: "This guide is for informational and educational purposes only and is not personalised financial, tax or investment advice. All investments carry a risk of capital loss. Past performance does not guarantee future results. No income or gain is guaranteed. Do your own research and consult a licensed professional before making decisions.",
  },
  legal: {
    fr: "Ce guide a une vocation informative et ne constitue pas un conseil juridique. Les règles évoluent et dépendent de votre situation et de votre pays : vérifiez les informations auprès des sources officielles ou d'un professionnel du droit.",
    en: "This guide is for informational purposes only and is not legal advice. Rules change and depend on your situation and country: check official sources or consult a legal professional.",
  },
};

export function disclaimerFor(sensitive: string | null, lang: string) {
  if (!sensitive || !DISCLAIMERS[sensitive]) return null;
  return DISCLAIMERS[sensitive][lang] || DISCLAIMERS[sensitive].en;
}

export const AI_DISCLOSURE: Record<string, string> = {
  fr: "Ce guide a été rédigé avec l'aide d'outils d'intelligence artificielle, puis relu et édité par l'auteur.",
  en: "This guide was written with the help of artificial intelligence tools, then reviewed and edited by the author.",
  es: "Esta guía fue redactada con la ayuda de herramientas de inteligencia artificial y luego revisada y editada por el autor.",
  de: "Dieser Ratgeber wurde mit Hilfe von KI-Werkzeugen verfasst und anschließend vom Autor überprüft und bearbeitet.",
  it: "Questa guida è stata scritta con l'aiuto di strumenti di intelligenza artificiale, poi rivista e modificata dall'autore.",
};

export const aiDisclosure = (lang: string) => AI_DISCLOSURE[lang] || AI_DISCLOSURE.en;

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

export function checkEtsyCompliance(kit: EtsyKit, opts: { sensitive: string | null; language: string }): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  if (kit.title.length > 140) issues.push({ level: "error", message: `Titre trop long (${kit.title.length}/140 caractères).` });
  if (kit.tags.length !== 13) issues.push({ level: "warning", message: `Etsy autorise 13 tags : vous en avez ${kit.tags.length}.` });
  const longTags = kit.tags.filter((t) => t.length > 20);
  if (longTags.length) issues.push({ level: "error", message: `Tags de plus de 20 caractères : ${longTags.join(", ")}` });
  const lower = (kit.title + " " + kit.description).toLowerCase();
  const disclosure = aiDisclosure(opts.language).toLowerCase().slice(0, 30);
  if (!/(intelligence artificielle|artificial intelligence|ia\b|\bai\b|inteligencia artificial|ki-)/i.test(kit.description) && !lower.includes(disclosure))
    issues.push({ level: "error", message: "La description doit indiquer que le contenu a été créé avec l'aide de l'IA (règles de créativité Etsy)." });
  if (HYPE.test(lower)) issues.push({ level: "error", message: "Promesse excessive détectée (résultat garanti, guérison, gain d'argent…). Etsy interdit les allégations trompeuses ou médicales." });
  const brands = BRANDS.filter((b) => new RegExp(`\\b${b}\\b`, "i").test(lower));
  if (brands.length && !/(non affilié|not affiliated|no afiliad|nicht verbunden|non affiliat)/i.test(kit.description))
    issues.push({ level: "warning", message: `Marques citées (${brands.join(", ")}) : n'utilisez pas leurs logos et précisez que le guide n'est pas affilié à ces marques.` });
  if (opts.sensitive && !/(ne remplace|not replace|ne constitue pas|is not|informati)/i.test(kit.description))
    issues.push({ level: "warning", message: "Sujet sensible : ajoutez dans la description que le guide est informatif et ne remplace pas un professionnel." });
  if (!/(pdf|téléchargement|download|numérique|digital)/i.test(kit.description))
    issues.push({ level: "warning", message: "Précisez qu'il s'agit d'un produit numérique (PDF à télécharger, aucun envoi physique)." });
  if (!issues.length) issues.push({ level: "ok", message: "Aucun problème détecté. Relisez quand même la fiche avant publication." });
  return issues;
}

export const ETSY_CHECKLIST = [
  "Relisez et personnalisez l'e-book (exemples, anecdotes, votre touche) : c'est ce qui fait sa valeur et ce qui le distingue des autres.",
  "Indiquez dans la description que le contenu a été créé avec l'aide de l'IA (règles de créativité Etsy, catégorie « Designed by »).",
  "Ne revendez pas un fichier tel quel venu d'ailleurs (PLR, packs revendus) : seul votre contenu créé avec vos choix est autorisé.",
  "Sur les sujets santé, nutrition, argent : aucune promesse de résultat, aucune allégation médicale, et un avertissement visible.",
  "N'utilisez pas les logos des marques citées (TikTok, Vinted, Canva…) et ne laissez pas croire à un partenariat.",
  "Précisez le format : PDF numérique, nombre de pages, aucun envoi physique.",
  "Proposez un prix cohérent avec la longueur et la qualité réelle du guide.",
];
