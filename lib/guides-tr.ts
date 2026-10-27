import { GUIDES, type Guide, type GuideText } from "./guides";
import { UI, type GuideUI } from "@/app/guides/ui";
import { LOCALES, type Locale } from "./i18n/locales";
import { TRADUCTIONS } from "./guides-i18n";

// Langues dans lesquelles un guide (ou, sans slug, la liste des guides) existe vraiment : français, anglais,
// puis les traductions de lib/guides-i18n. Une autre langue affiche l'anglais : on ne déclare pas de fausse version à Google.
export function guideLocales(slug?: string): Locale[] {
  return LOCALES.map((l) => l.code).filter((c) => c === "fr" || c === "en" || (slug ? Boolean(TRADUCTIONS[c]?.guides[slug]) : c in TRADUCTIONS));
}

export const guideLang = (locale: string, slug?: string): Locale => (guideLocales(slug).includes(locale as Locale) ? (locale as Locale) : "en");

// Texte d'un guide dans une langue (l'anglais si ce guide n'y est pas encore traduit)
export function guideText(g: Guide, lang: Locale): GuideText {
  if (lang === "fr") return g.fr;
  return TRADUCTIONS[lang]?.guides[g.slug] || g.en;
}

export function guideUI(lang: Locale): GuideUI {
  if (lang === "fr") return UI.fr;
  return TRADUCTIONS[lang]?.ui || UI.en;
}

export { GUIDES };
