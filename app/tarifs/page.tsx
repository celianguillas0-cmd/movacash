import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import PlanPicker from "@/components/PlanPicker";
import { PLANS, isStripeConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Paywall minimal et fonctionnel (le design final sera refait).
export default async function Tarifs() {
  const user = await getCurrentUser();
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="h1 text-center">Choisissez votre offre</h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Abonnement mensuel sans engagement, résiliable à tout moment depuis votre compte. Les e-books que vous créez vous appartiennent et vous les vendez au prix que vous choisissez.
        </p>
        {!isStripeConfigured() && (
          <p className="mx-auto mt-4 max-w-2xl rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-800">
            Mode démo : Stripe n'est pas encore configuré, l'abonnement s'active sans paiement pour tester.
          </p>
        )}
        <PlanPicker plans={PLANS} loggedIn={Boolean(user)} currentPlan={user?.sub_status === "active" ? user.plan : null} />
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-slate-500">
          Aucun revenu n'est garanti. Le service étant fourni immédiatement après la souscription, vous renoncez à votre droit de rétractation et aucun remboursement n'est effectué pour la période en cours (voir CGV). La résiliation prend effet à la fin de la période payée.
        </p>
      </main>
      <Footer />
    </>
  );
}
