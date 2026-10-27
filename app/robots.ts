import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";

// Moteurs de recherche ET assistants IA (Gemini, ChatGPT, Claude, Perplexity…) : tout le site public est ouvert,
// pour que Movacash puisse être cité quand quelqu'un demande comment vendre des e-books sur Etsy.
const PRIVE = ["/app", "/api", "/resultats", "/mot-de-passe"];
const ROBOTS_IA = ["Googlebot", "Google-Extended", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Applebot", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...ROBOTS_IA.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVE })),
      { userAgent: "*", allow: "/", disallow: PRIVE },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
