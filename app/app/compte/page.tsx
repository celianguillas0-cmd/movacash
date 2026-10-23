import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { eur, getPlan, isStripeConfigured } from "@/lib/config";
import { getUsage, hasActiveSubscription } from "@/lib/subscription";
import BillingActions from "./BillingActions";

export default async function Account() {
  const user = (await getCurrentUser())!;
  const plan = getPlan(user.plan);
  const active = hasActiveSubscription(user);
  const usage = getUsage(user);
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="h1">Mon compte</h1>
      <div className="card text-sm">
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Nom :</strong> {user.name || "—"}</p>
      </div>
      <div className="card space-y-2 text-sm">
        <p className="font-semibold">Abonnement</p>
        {active ? (
          <>
            <p>Offre {plan?.name} — {plan ? eur(plan.priceEur) : ""} € / mois {user.is_demo_sub ? "(démo, sans paiement)" : ""}</p>
            <p>{usage.used} / {usage.limit} e-books utilisés ce mois-ci</p>
            {user.current_period_end && <p>Période en cours jusqu'au {new Date(user.current_period_end * 1000).toLocaleDateString("fr-FR")}</p>}
          </>
        ) : (
          <p>Aucun abonnement actif ({user.sub_status}).</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/tarifs" className="btn-secondary">{active ? "Changer d'offre" : "Voir les offres"}</Link>
          <BillingActions demo={Boolean(user.is_demo_sub)} hasStripe={isStripeConfigured() && Boolean(user.stripe_customer_id)} active={active} />
        </div>
        <p className="muted pt-2">La résiliation prend effet à la fin de la période déjà payée. Aucun remboursement au prorata (voir CGV).</p>
      </div>
    </div>
  );
}
