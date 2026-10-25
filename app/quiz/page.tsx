import Link from "next/link";
import Funnel from "./Funnel";
import { listCategories } from "@/lib/ideas";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/config";
import { planViews } from "@/lib/planView";
import "../tunnel.css";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const [user, categories, { t, locale }] = await Promise.all([getCurrentUser(), listCategories(), getT()]);
  return (
    <div className="tf">
      <header className="head-bande">
        <div className="wrap site-head">
          <Link href="/" className="brand">Mova<span className="brand-tld">cash</span></Link>
          <Link href="/" className="head-lien">← {t("Retour à l'accueil")}</Link>
        </div>
      </header>
      <main className="wrap">
        <Funnel
          categories={categories.map((c) => ({ slug: c.slug, name: t(c.name) }))}
          plans={planViews(t, locale)}
          user={user ? { name: user.name || "" } : null}
          demo={!isStripeConfigured()}
        />
      </main>
    </div>
  );
}
