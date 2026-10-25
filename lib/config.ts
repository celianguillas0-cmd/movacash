import { tk } from "./i18n/t";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Movacash";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
// Adresse de contact affichée dans l'aide (ex. support@ton-domaine.fr)
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "";

export type PlanId = "semaine" | "mois" | "trimestre";

export interface Plan {
  id: PlanId;
  name: string; // clé de traduction
  priceEur: number; // prix payé à chaque période
  ebooks: number; // e-books inclus par période
  periodDays: number; // durée indicative de la période (la vraie date vient de Stripe)
  stripeInterval: { interval: "week" | "month"; count: number };
  priceLabel: string; // « {prix} / semaine »
  ebooksLabel: string; // « {n} e-books par semaine »
  renewLabel: string; // « renouvelé chaque semaine »
  highlight?: boolean;
  stripePriceEnv: string;
}

// Une seule offre, trois durées. Les prix et quotas sont modifiables ici ; les IDs de prix Stripe viennent des variables d'environnement.
export const PLANS: Plan[] = [
  {
    id: "semaine",
    name: tk("Hebdomadaire"),
    priceEur: 4.9,
    ebooks: 5,
    periodDays: 7,
    stripeInterval: { interval: "week", count: 1 },
    priceLabel: tk("{prix} / semaine"),
    ebooksLabel: tk("{n} e-books par semaine"),
    renewLabel: tk("renouvelé chaque semaine"),
    stripePriceEnv: "STRIPE_PRICE_SEMAINE",
  },
  {
    id: "mois",
    name: tk("Mensuel"),
    priceEur: 14.9,
    ebooks: 20,
    periodDays: 30,
    stripeInterval: { interval: "month", count: 1 },
    priceLabel: tk("{prix} / mois"),
    ebooksLabel: tk("{n} e-books par mois"),
    renewLabel: tk("renouvelé chaque mois"),
    highlight: true,
    stripePriceEnv: "STRIPE_PRICE_MOIS",
  },
  {
    id: "trimestre",
    name: tk("Trimestriel"),
    priceEur: 40,
    ebooks: 60,
    periodDays: 91,
    stripeInterval: { interval: "month", count: 3 },
    priceLabel: tk("{prix} / 3 mois"),
    ebooksLabel: tk("{n} e-books par trimestre"),
    renewLabel: tk("renouvelé tous les 3 mois"),
    stripePriceEnv: "STRIPE_PRICE_TRIMESTRE",
  },
];

// Ce que comprend l'abonnement, quelle que soit la durée
export const FEATURES = [tk("Base complète d'idées"), tk("Export PDF A4, A5, US Letter"), tk("Miniature Etsy"), tk("Fiche Etsy + vérification")];

export const PLAN_IDS = ["semaine", "mois", "trimestre"] as const;

// Prix affiché à la française : 19,90 €
export const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

// Anciennes offres (avant le 25/10) : traitées comme l'offre mensuelle
const LEGACY: Record<string, PlanId> = { starter: "mois", pro: "mois", business: "mois" };

export function getPlan(id: string | null | undefined): Plan | undefined {
  const real = id && LEGACY[id] ? LEGACY[id] : id;
  return PLANS.find((p) => p.id === real);
}

// Seul ce compte voit l'onglet Admin (thématiques proposées dans le sondage).
export const ADMIN_EMAIL = "celianguillas0@gmail.com";
export const isAdmin = (email?: string | null) => (email || "").trim().toLowerCase() === ADMIN_EMAIL;

// Mode tournage, actif par défaut sur le compte admin : il filme l'outil sans consommer d'API ni de quota.
export const isFilmMode = (u: { email: string; real_mode?: number }) => isAdmin(u.email) && !u.real_mode;

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
