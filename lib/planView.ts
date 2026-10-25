import { PLANS, type Plan } from "./config";
import { fmtEur, type T } from "./i18n/t";

// Offre prête à afficher (textes traduits, prix au format de la langue)
export type PlanView = { id: string; name: string; price: number; ebooks: number; priceText: string; ebooksText: string; renewText: string; perEbook: string; highlight: boolean };

export function planView(p: Plan, t: T, locale: string): PlanView {
  return {
    id: p.id,
    name: t(p.name),
    price: p.priceEur,
    ebooks: p.ebooks,
    priceText: t(p.priceLabel, { prix: fmtEur(p.priceEur, locale) }),
    ebooksText: t(p.ebooksLabel, { n: p.ebooks }),
    renewText: t(p.renewLabel),
    perEbook: fmtEur(Math.round((p.priceEur / p.ebooks) * 100) / 100, locale),
    highlight: Boolean(p.highlight),
  };
}

export const planViews = (t: T, locale: string) => PLANS.map((p) => planView(p, t, locale));
