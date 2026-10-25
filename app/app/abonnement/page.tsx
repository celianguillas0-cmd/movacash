import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PLANS, getPlan, isStripeConfigured } from "@/lib/config";
import { annualAvailable, listInvoices, paymentMethod, type InvoiceView } from "@/lib/stripe";
import { getUsage, quotaPlan, subState } from "@/lib/subscription";
import SubscriptionManager from "./SubscriptionManager";
import AtHead from "@/components/ws/AtHead";
import { getT } from "@/lib/i18n/server";
import { fmtEur, type T } from "@/lib/i18n/t";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ plan?: string; annual?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const { t, locale } = await getT();
  const state = subState(user);
  const usage = await getUsage(user);
  let invoices: InvoiceView[] = [];
  let card: string | null = null;
  let stripeError = "";
  if (!user.is_demo_sub && user.stripe_customer_id) {
    try {
      [invoices, card] = await Promise.all([listInvoices(user), paymentMethod(user)]);
    } catch (e) {
      stripeError = (e as Error).message;
    }
  }
  const held = quotaPlan(user);
  const plan = getPlan(user.plan);

  if (state === "none" || state === "ended")
    return (
      <div className="space-y-6">
        <AtHead name={user.name} title={t("Ta formule.")} />
        <div className="card space-y-3">
          <p className="text-sm text-slate-700">
            {state === "ended" ? t("Ton abonnement {plan} est terminé.", { plan: plan?.name ?? "" }) : t("Tu n'as pas encore d'abonnement.")} {t("Tes e-books déjà créés restent consultables et téléchargeables.")}
          </p>
          <Link href="/tarifs" className="btn-primary">{state === "ended" ? t("Reprendre un abonnement") : t("Voir les offres")}</Link>
        </div>
        {invoices.length > 0 && <InvoiceTable invoices={invoices} t={t} locale={locale} />}
      </div>
    );

  return (
    <div className="space-y-8">
      <AtHead name={user.name} title={t("Ta formule.")}>
        <p className="at-dim" style={{ marginTop: 10 }}>{t("Change de formule, mets à jour ta carte ou résilie quand tu veux. Sans engagement.")}</p>
      </AtHead>
      <SubscriptionManager
        plans={PLANS.map((p) => ({ id: p.id, name: p.name, monthly: p.priceEur, annual: p.annualMonthlyEur, ebooks: p.ebooksPerMonth, features: p.features }))}
        sub={{
          plan: user.plan as string,
          annual: user.billing_interval === "year",
          state,
          periodEnd: user.current_period_end,
          demo: Boolean(user.is_demo_sub) || !isStripeConfigured(),
          heldPlan: held && held.id !== user.plan ? held.name : null,
          heldUntil: user.quota_plan_until,
          card,
          hasPortal: isStripeConfigured() && Boolean(user.stripe_customer_id) && !user.is_demo_sub,
        }}
        usage={{ used: usage.used, limit: usage.limit, resetsOn: usage.resetsOn.toISOString() }}
        annualAvailable={annualAvailable()}
        preselect={sp.plan ? { plan: sp.plan, annual: sp.annual === "1" } : null}
      />
      {stripeError && <p className="notice-warn">{t("Impossible de charger les factures pour le moment ({erreur}).", { erreur: stripeError })}</p>}
      {invoices.length > 0 && <InvoiceTable invoices={invoices} t={t} locale={locale} />}
    </div>
  );
}

function InvoiceTable({ invoices, t, locale }: { invoices: InvoiceView[]; t: T; locale: string }) {
  const STATUS: Record<string, string> = { paid: t("Payée"), open: t("À régler"), void: t("Annulée"), uncollectible: t("Impayée") };
  return (
    <section className="card overflow-x-auto p-0">
      <h2 className="h2 px-5 pt-5">{t("Factures")}</h2>
      <table className="mt-4 w-full min-w-[520px] text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
          <tr className="border-b border-slate-200"><th className="px-5 py-2 font-medium">{t("Date")}</th><th className="py-2 font-medium">{t("Numéro")}</th><th className="py-2 font-medium">{t("Montant")}</th><th className="py-2 font-medium">{t("Statut")}</th><th className="px-5 py-2" /></tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id} className="border-b border-slate-200 last:border-0">
              <td className="px-5 py-3">{new Date(i.date * 1000).toLocaleDateString(locale)}</td>
              <td className="py-3 text-slate-600">{i.number ?? "—"}</td>
              <td className="py-3">{fmtEur(i.amount, locale)}</td>
              <td className="py-3"><span className={`badge ${i.status === "paid" ? "bg-green-100 text-green-800" : i.status === "open" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{STATUS[i.status ?? ""] ?? i.status}</span></td>
              <td className="px-5 py-3 text-right">
                {i.status === "open" && i.url ? <a className="text-brand-700 underline" href={i.url}>{t("Régler")}</a> : i.pdf ? <a className="text-brand-700 underline" href={i.pdf}>PDF</a> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
