import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import Paywall from "@/components/funnel/Paywall";
import { PLANS, isStripeConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { countIdeas } from "@/lib/ideas";

export const dynamic = "force-dynamic";

export default async function Tarifs({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const user = await getCurrentUser();
  const { canceled } = await searchParams;
  return (
    <div className="mc">
      <FunnelNav />
      <main className="wrap pw">
        <div className="pw-head">
          <p className="eyebrow">Ton atelier d'e-books</p>
          <h1>Débloque tes idées <em>et crée ton premier e-book ce soir.</em></h1>
          <p>Accès immédiat à toute la base de {countIdeas()} idées, au générateur, à l'export PDF et au kit Etsy. Sans engagement.</p>
          {canceled && <p className="error" style={{ marginTop: 12 }}>Paiement annulé : tu n'as pas été débité.</p>}
          {!isStripeConfigured() && <p className="dim" style={{ marginTop: 12 }}>Mode démo : Stripe n'est pas encore branché, l'abonnement s'active sans paiement.</p>}
        </div>
        <Paywall
          plans={PLANS.map((p) => ({ id: p.id, name: p.name, monthly: p.priceEur, annual: p.annualMonthlyEur, ebooks: p.ebooksPerMonth, features: p.features, highlight: Boolean(p.highlight) }))}
          loggedIn={Boolean(user)}
          currentPlan={user && hasActiveSubscription(user) ? user.plan : null}
        />
        <div className="trust"><span>Accès immédiat</span><span>Sans engagement</span><span>Tes e-books t'appartiennent</span><span>Paiement Stripe</span></div>
        <section className="narrow" style={{ margin: "56px auto 0" }}>
          <div className="faq">
            <details><summary>Que se passe-t-il si je résilie ?</summary><p>Tu gardes l'accès jusqu'à la fin de la période payée, puis tu n'es plus prélevé. Tes PDF déjà téléchargés restent à toi.</p></details>
            <details><summary>Je peux vendre les e-books au prix que je veux ?</summary><p>Oui. Les e-books de ce type se vendent souvent entre 5 et 10 € sur Etsy, mais c'est toi qui décides.</p></details>
            <details><summary>Et si je ne fais aucune vente ?</summary><p>C'est possible : l'abonnement paie l'outil, pas un résultat. C'est pour ça qu'on te conseille de commencer par l'offre Starter, de bien relire et de publier régulièrement.</p></details>
            <details><summary>Le quota d'e-books se renouvelle quand ?</summary><p>Le 1er de chaque mois, y compris en formule annuelle. Les e-books non utilisés ne sont pas reportés.</p></details>
          </div>
        </section>
      </main>
      <FunnelFooter />
    </div>
  );
}
