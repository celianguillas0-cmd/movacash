import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";

// Pages publiques seulement : l'espace connecté et l'API ne sont pas référencés
const PAGES: [string, number][] = [
  ["", 1],
  ["/quiz", 0.9],
  ["/tarifs", 0.8],
  ["/inscription", 0.5],
  ["/connexion", 0.3],
  ["/avertissement-revenus", 0.2],
  ["/cgv", 0.2],
  ["/mentions-legales", 0.1],
  ["/confidentialite", 0.1],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(([path, priority]) => ({ url: `${APP_URL}${path}`, changeFrequency: "monthly", priority }));
}
