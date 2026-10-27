import { APP_URL } from "./config";
import { LOCALES, type Locale } from "./i18n/locales";

// Pages publiques traduites : chacune existe en 22 versions (?lang=xx) que Google peut indexer séparément.
// Les pages légales restent en français (le français fait foi) : une seule version.
export const MULTI_PATHS = ["/", "/quiz", "/tarifs", "/inscription", "/connexion", "/avertissement-revenus"];
export const FR_ONLY_PATHS = ["/cgv", "/mentions-legales", "/confidentialite"];

export const langUrl = (path: string, locale: Locale) => `${APP_URL}${path === "/" ? "/" : path}?lang=${locale}`;

export function alternates(path: string, locale: Locale) {
  if (FR_ONLY_PATHS.includes(path)) return { canonical: `${APP_URL}${path}` };
  if (!MULTI_PATHS.includes(path)) return undefined;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l.code, langUrl(path, l.code)]));
  languages["x-default"] = `${APP_URL}${path}`;
  return { canonical: langUrl(path, locale), languages };
}
