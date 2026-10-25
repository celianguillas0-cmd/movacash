import { tk } from "./i18n/t";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Movacash";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
// Adresse de contact affichée dans l'aide (ex. support@ton-domaine.fr)
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "";

export type PlanId = "starter" | "pro" | "business";

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
}

// Les prix et quotas sont modifiables ici. Les IDs de prix Stripe viennent des variables d'environnement.
export const PLANS: Plan[] = [
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
    features: [tk("50 e-books par mois"), tk("Tout Starter"), tk("Miniature Etsy avec photo"), tk("Régénération illimitée des chapitres")],
    stripePriceEnv: "STRIPE_PRICE_PRO",
    stripeAnnualPriceEnv: "STRIPE_PRICE_PRO_ANNUAL",
  },
  {
    id: "business",
    name: "Business",
    priceEur: 79.9,
    annualMonthlyEur: 39.95,
    ebooksPerMonth: 120,
    features: [tk("120 e-books par mois"), tk("Tout Pro"), tk("Idéal pour plusieurs boutiques")],
    stripePriceEnv: "STRIPE_PRICE_BUSINESS",
    stripeAnnualPriceEnv: "STRIPE_PRICE_BUSINESS_ANNUAL",
  },
];

// Prix affiché à la française : 19,90 €
export const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// Seul ce compte voit l'onglet Admin (thématiques proposées dans le sondage).
export const ADMIN_EMAIL = "celianguillas0@gmail.com";
export const isAdmin = (email?: string | null) => (email || "").trim().toLowerCase() === ADMIN_EMAIL;

// Mode tournage, actif par défaut sur le compte admin : il filme l'outil sans consommer d'API ni de quota.
export const isFilmMode = (u: { email: string; real_mode?: number }) => isAdmin(u.email) && !u.real_mode;

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
