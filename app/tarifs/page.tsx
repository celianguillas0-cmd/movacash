import type { Metadata } from "next";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import Paywall from "@/components/funnel/Paywall";
import { PLANS, isStripeConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { annualAvailable } from "@/lib/stripe";
import { countIdeas } from "@/lib/ideas";
import { canPayFromHere, getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("Tarifs : crée tes e-books Etsy avec l'IA dès 19,90 € par mois"),
    description: t("Trois formules sans engagement : 20, 50 ou 120 e-books par mois, PDF prêt à vendre et fiche Etsy complète. −50 % en annuel."),
  };
}

export const dynamic = "force-dynamic";

export default async function Tarifs({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const user = await getCurrentUser();
  const { t } = await getT();
  const payable = await canPayFromHere();
  const { canceled } = await searchParams;
  return (
    <div className="mc dark has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <main className="wrap pw">
        <div className="pw-head">
          <p className="eyebrow">{t("Ton atelier d'e-books")}</p>
          <h1>{t("Débloque tes idées")} <em>{t("et crée ton premier e-book dès aujourd'hui.")}</em></h1>
          <p>{t("Accès immédiat à toute la base de {total} idées, au générateur, à l'export PDF et au kit Etsy. Sans engagement.", { total: await countIdeas() })}</p>
          {canceled && <p className="error" style={{ marginTop: 12 }}>{t("Paiement annulé : tu n'as pas été débité.")}</p>}
          {!payable && <p className="error" style={{ marginTop: 12 }}>{t("L'abonnement Movacash n'est pas encore disponible dans ton pays.")}</p>}
          {!isStripeConfigured() && <p className="dim" style={{ marginTop: 12 }}>{t("Mode démo : Stripe n'est pas encore branché, l'abonnement s'active sans paiement.")}</p>}
        </div>
        <Paywall
          plans={PLANS.map((p) => ({ id: p.id, name: p.name, monthly: p.priceEur, annual: p.annualMonthlyEur, ebooks: p.ebooksPerMonth, features: p.features, highlight: Boolean(p.highlight) }))}
          loggedIn={Boolean(user)}
          currentPlan={user && hasActiveSubscription(user) ? user.plan : null}
          annualAvailable={annualAvailable()}
        />
        <div className="trust"><span>{t("Accès immédiat")}</span><span>{t("Sans engagement")}</span><span>{t("Tes e-books t'appartiennent")}</span><span>{t("Paiement Stripe")}</span></div>
        <section className="narrow" style={{ margin: "56px auto 0" }}>
          <div className="faq">
            <details><summary>{t("Que se passe-t-il si je résilie ?")}</summary><p>{t("Tu gardes l'accès jusqu'à la fin de la période payée, puis tu n'es plus prélevé. Tes PDF déjà téléchargés restent à toi.")}</p></details>
            <details><summary>{t("Je peux vendre les e-books au prix que je veux ?")}</summary><p>{t("Oui, c'est toi qui fixes ton prix. Movacash te donne un prix conseillé (estimé) pour chaque sujet.")}</p></details>
            <details><summary>{t("Et si je ne fais aucune vente ?")}</summary><p>{t("C'est possible : l'abonnement paie l'outil, pas un résultat. C'est pour ça qu'on te conseille de commencer par l'offre Starter et de publier régulièrement.")}</p></details>
            <details><summary>{t("Le quota d'e-books se renouvelle quand ?")}</summary><p>{t("Le 1er de chaque mois, y compris en formule annuelle. Les e-books non utilisés ne sont pas reportés.")}</p></details>
          </div>
        </section>
      </main>
      <FunnelFooter />
    </div>
  );
}
