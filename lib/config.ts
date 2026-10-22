export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Movacash";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export type PlanId = "starter" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  priceEur: number;
  ebooksPerMonth: number;
  highlight?: boolean;
  features: string[];
  stripePriceEnv: string;
}

// Les prix et quotas sont modifiables ici. Les IDs de prix Stripe viennent des variables d'environnement.
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceEur: 19,
    ebooksPerMonth: 10,
    features: ["10 e-books par mois", "Catalogue complet d'idées", "Export PDF prêt à vendre", "Kit fiche Etsy (titre, tags, description)"],
    stripePriceEnv: "STRIPE_PRICE_STARTER",
  },
  {
    id: "pro",
    name: "Pro",
    priceEur: 39,
    ebooksPerMonth: 40,
    highlight: true,
    features: ["40 e-books par mois", "Tout Starter", "Régénération illimitée des chapitres", "Visuels de fiche Etsy"],
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  {
    id: "business",
    name: "Business",
    priceEur: 79,
    ebooksPerMonth: 150,
    features: ["150 e-books par mois", "Tout Pro", "Idéal pour plusieurs boutiques"],
    stripePriceEnv: "STRIPE_PRICE_BUSINESS",
  },
];

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
