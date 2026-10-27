import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";
import { LOCALES } from "@/lib/i18n/locales";
import { FR_ONLY_PATHS, guideAlternates, langUrl } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";
import { guideLocales } from "@/lib/guides-tr";
import { CATEGORIES } from "@/data/ideas-catalog.mjs";

// Pages publiques seulement : l'espace connecté et l'API ne sont pas référencés.
// Chaque page traduite est déclarée dans ses 22 langues, avec les liens hreflang entre elles.
const PAGES: [string, number][] = [
  ["/", 1],
  ["/quiz", 0.9],
  ["/tarifs", 0.8],
  ["/inscription", 0.5],
  ["/connexion", 0.3],
  ["/avertissement-revenus", 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const traduites = PAGES.flatMap(([path, priority]) => {
    const languages = Object.fromEntries(LOCALES.map((l) => [l.code, langUrl(path, l.code)]));
    return LOCALES.map((l) => ({ url: langUrl(path, l.code), lastModified: now, changeFrequency: "weekly" as const, priority, alternates: { languages } }));
  });
  const legales = FR_ONLY_PATHS.map((path) => ({ url: `${APP_URL}${path}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.1 }));
  const guides = ["/guides", ...GUIDES.map((g) => `/guides/${g.slug}`)].flatMap((path) => {
    const { languages } = guideAlternates(path, "fr");
    const modif = GUIDES.find((g) => path.endsWith(g.slug))?.date;
    const { "x-default": _defaut, ...langues } = languages;
    return guideLocales(path.startsWith("/guides/") ? path.slice(8) : undefined).map((l) => ({ url: languages[l], lastModified: modif ? new Date(modif) : now, changeFrequency: "monthly" as const, priority: 0.7, alternates: { languages: langues } }));
  });
  // Idées par thème : en français seulement
  const idees = ["/idees", ...CATEGORIES.map((c: { slug: string }) => `/idees/${c.slug}`)].map((path) => ({ url: langUrl(path, "fr"), lastModified: now, changeFrequency: "weekly" as const, priority: path === "/idees" ? 0.8 : 0.6 }));
  return [...traduites, ...guides, ...idees, ...legales];
}
