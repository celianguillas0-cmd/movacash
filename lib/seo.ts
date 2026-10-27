import { APP_URL } from "./config";
import { LOCALES, type Locale } from "./i18n/locales";
import { guideLang, guideLocales } from "./guides-tr";

// Pages publiques traduites : chacune existe en 22 versions (?lang=xx) que Google peut indexer séparément.
// Les pages légales restent en français (le français fait foi) : une seule version.
export const MULTI_PATHS = ["/", "/quiz", "/tarifs", "/inscription", "/connexion", "/avertissement-revenus"];
export const FR_ONLY_PATHS = ["/cgv", "/mentions-legales", "/confidentialite"];

export const langUrl = (path: string, locale: Locale) => `${APP_URL}${path === "/" ? "/" : path}?lang=${locale}`;

// Guides : seulement dans les langues où ils sont vraiment traduits (les autres affichent l'anglais, canonique ?lang=en).
export const isGuidePath = (path: string) => path === "/guides" || path.startsWith("/guides/");
export function guideAlternates(path: string, locale: Locale) {
  const slug = path.startsWith("/guides/") ? path.slice(8) : undefined;
  const languages: Record<string, string> = Object.fromEntries(guideLocales(slug).map((l) => [l, langUrl(path, l)]));
  languages["x-default"] = langUrl(path, "en");
  return { canonical: langUrl(path, guideLang(locale, slug)), languages };
}

// Idées d'e-books par thème : en français seulement (la base d'idées est rédigée en français).
export const isIdeesPath = (path: string) => path === "/idees" || path.startsWith("/idees/");

export function alternates(path: string, locale: Locale) {
  if (isGuidePath(path)) return guideAlternates(path, locale);
  if (isIdeesPath(path)) return { canonical: langUrl(path, "fr"), languages: { fr: langUrl(path, "fr") } };
  if (FR_ONLY_PATHS.includes(path)) return { canonical: `${APP_URL}${path}` };
  if (!MULTI_PATHS.includes(path)) return undefined;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l.code, langUrl(path, l.code)]));
  languages["x-default"] = `${APP_URL}${path}`;
  return { canonical: langUrl(path, locale), languages };
}
