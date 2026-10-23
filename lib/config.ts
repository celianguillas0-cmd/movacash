export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Movacash";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
    annualMonthlyEur: 15.9,
    ebooksPerMonth: 5,
    features: ["5 e-books par mois", "Base complète d'idées", "Export PDF A4, A5, US Letter", "Fiche Etsy + vérification"],
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    stripeAnnualPriceEnv: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  {
    id: "pro",
    name: "Pro",
    priceEur: 39.9,
    annualMonthlyEur: 31.9,
    ebooksPerMonth: 20,
    highlight: true,
    features: ["20 e-books par mois", "Tout Starter", "Visuels de fiche Etsy", "Régénération illimitée des chapitres"],
    stripePriceEnv: "STRIPE_PRICE_PRO",
    stripeAnnualPriceEnv: "STRIPE_PRICE_PRO_ANNUAL",
  },
  {
    id: "business",
    name: "Business",
    priceEur: 79.9,
    annualMonthlyEur: 63.9,
    ebooksPerMonth: 50,
    features: ["50 e-books par mois", "Tout Pro", "Idéal pour plusieurs boutiques"],
    stripePriceEnv: "STRIPE_PRICE_BUSINESS",
    stripeAnnualPriceEnv: "STRIPE_PRICE_BUSINESS_ANNUAL",
  },
];

// Prix affiché à la française : 19,90 €
export const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
