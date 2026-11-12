import { tk } from "./i18n/t";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Movacash";
// Sans NEXT_PUBLIC_APP_URL, on prend l'adresse de production fournie par Vercel
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
// Adresse de contact affichée dans l'aide (ex. support@ton-domaine.fr)
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "movacash.contact@gmail.com";

export type PlanId = "mini" | "starter" | "pro" | "business";
// Offres proposées à la vente (pages Tarifs, questionnaire, Abonnement, CGV), pour la validation des formulaires
export const OFFER_IDS = ["mini", "starter", "pro"] as const;

export interface Plan {
  id: PlanId;
  name: string;
  priceEur: number;
  // Prix mensuel équivalent en facturation annuelle (payé en une fois : x 12)
  annualMonthlyEur: number;
  ebooksPerMonth: number;
  highlight?: boolean;
  features: string[];
  stripePriceEnv: string;
  stripeAnnualPriceEnv: string;
  // Ancienne offre retirée de la vente : plus proposée, mais les abonnés qui l'ont gardent leur quota et leur prix
  legacy?: boolean;
}

// Les prix et quotas sont modifiables ici. Les IDs de prix Stripe viennent des variables d'environnement.
// Toutes les offres, y compris les anciennes encore payées par des abonnés (legacy).
export const ALL_PLANS: Plan[] = [
  {
    id: "mini",
    name: "Mini",
    priceEur: 6.9,
    annualMonthlyEur: 3.45, // 41,40 € par an (−50 %) : Aurèle a essayé 29,90 € puis gardé 41,40 € le 12/11/2026
    ebooksPerMonth: 5,
    features: [tk("5 e-books par mois"), tk("Base complète d'idées"), tk("Export PDF A4, A5, US Letter"), tk("Fiche Etsy + vérification")],
    stripePriceEnv: "STRIPE_PRICE_MINI",
    stripeAnnualPriceEnv: "STRIPE_PRICE_MINI_ANNUAL",
  },
  {
    id: "starter",
    name: "Starter",
    priceEur: 19.9,
    annualMonthlyEur: 9.95,
    ebooksPerMonth: 20,
    features: [tk("20 e-books par mois"), tk("Base complète d'idées"), tk("Export PDF A4, A5, US Letter"), tk("Fiche Etsy + vérification")],
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    stripeAnnualPriceEnv: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  {
    id: "pro",
    name: "Pro",
    priceEur: 39.9,
    annualMonthlyEur: 19.95,
    ebooksPerMonth: 50,
    highlight: true,
    features: [tk("50 e-books par mois"), tk("Tout Starter"), tk("Miniature Etsy avec photo")],
    stripePriceEnv: "STRIPE_PRICE_PRO",
    stripeAnnualPriceEnv: "STRIPE_PRICE_PRO_ANNUAL",
  },
  // Retirée de la vente le 12/11/2026 (remplacée par Mini), gardée pour les abonnés Business existants
  {
    id: "business",
    name: "Business",
    legacy: true,
    priceEur: 79.9,
    annualMonthlyEur: 39.95,
    ebooksPerMonth: 120,
    features: [tk("120 e-books par mois"), tk("Tout Pro"), tk("Idéal pour plusieurs boutiques")],
    stripePriceEnv: "STRIPE_PRICE_BUSINESS",
    stripeAnnualPriceEnv: "STRIPE_PRICE_BUSINESS_ANNUAL",
  },
];

// Offres proposées à la vente (sans les anciennes)
export const PLANS: Plan[] = ALL_PLANS.filter((p) => !p.legacy);

// Prix affiché à la française : 19,90 €
export const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

export function getPlan(id: string | null | undefined): Plan | undefined {
  return ALL_PLANS.find((p) => p.id === id);
}

// Seuls ces comptes voient l'onglet Admin (thématiques proposées dans le sondage).
export const ADMIN_EMAILS = ["celianguillas0@gmail.com", "contact.asgs29200@gmail.com"];
export const isAdmin = (email?: string | null) => ADMIN_EMAILS.includes((email || "").trim().toLowerCase());

// Mode tournage, actif par défaut sur le compte admin : il filme l'outil sans consommer d'API ni de quota.
export const isFilmMode = (u: { email: string; mode_reel?: number }) => isAdmin(u.email) && !u.mode_reel;

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
