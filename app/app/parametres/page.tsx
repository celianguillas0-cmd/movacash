import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/config";
import AtHead from "@/components/ws/AtHead";
import FeedbackForm from "@/components/at/FeedbackForm";
import Settings from "./Settings";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const { t, locale } = await getT();
  let quizTone: string | null = null;
  try {
    quizTone = JSON.parse(user.quiz_json || "{}").answers?.tone ?? null;
  } catch {}
  const hasSub = ["active", "trialing", "past_due"].includes(user.sub_status);
  const plan = getPlan(user.plan);
  return (
    <div>
      <AtHead name={user.name} title={t("Paramètres.")} />
      <section className="at-table">
        <div><span>{t("Adresse e-mail")}</span><b>{user.email}</b></div>
        <div><span>{t("Formule")}</span><b>{hasSub && plan ? plan.name : t("Aucune")}</b></div>
        <div><span>{t("Compte créé le")}</span><b>{new Date(user.created_at * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</b></div>
        <Link href="/app/abonnement">{t("Gérer mon abonnement")}</Link>
      </section>

      <div style={{ marginTop: 14 }}>
        <Link href="/app/abonnement" className="at-ligne">
          <span className="at-ligne-ic" aria-hidden="true">€</span>
          <span><b>{t("Facturation")}</b><small>{t("Ta formule, ta carte, tes factures")}</small></span>
        </Link>
        <Link href="/app/support" className="at-ligne">
          <span className="at-ligne-ic" aria-hidden="true">?</span>
          <span><b>{t("Support")}</b><small>{t("Une question ? On te répond par e-mail")}</small></span>
        </Link>
      </div>

      <section className="at-carte" style={{ marginTop: 22 }}>
        <p className="at-kicker">{t("Ton avis")}</p>
        <FeedbackForm />
      </section>

      <div style={{ marginTop: 22 }} className="space-y-8">
        <Settings
          user={{
            email: user.email,
            name: user.name,
            author_name: user.author_name,
            default_language: user.default_language,
            default_tone: user.default_tone ?? quizTone,
            email_tips: Boolean(user.email_tips),
            created_at: user.created_at,
            hasSub,
          }}
        />
      </div>
    </div>
  );
}
