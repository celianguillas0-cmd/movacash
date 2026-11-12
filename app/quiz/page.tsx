import Link from "next/link";
import LogoM from "@/components/LogoM";
import Funnel from "./Funnel";
import { listCategories } from "@/lib/ideas";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/config";
import { annualAvailable, offeredPlans } from "@/lib/stripe";
import { googleConfigured } from "@/lib/google";
import "../tunnel.css";
import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("Trouve ton idée d'e-book à vendre sur Etsy : questionnaire gratuit"),
    description: t("Réponds à quelques questions sur ton temps, ton niveau et tes centres d'intérêt : on te propose 3 idées d'e-books adaptées à Etsy, avec un plan de 30 jours."),
  };
}

export default async function QuizPage() {
  const [user, categories, { t }] = await Promise.all([getCurrentUser(), listCategories(), getT()]);
  return (
    <div className="tf">
      <header className="head-bande">
        <div className="wrap site-head">
          <Link href="/" className="brand"><LogoM /><span>Mova<span className="brand-tld">cash</span></span></Link>
          <span style={{ display: "flex", gap: 18 }}>
            {/* Compte, données et suppression, accessibles sans abonnement */}
            {user && <Link href="/app/parametres" className="head-lien">{t("Mon compte")}</Link>}
            <Link href="/" className="head-lien">← {t("Retour à l'accueil")}</Link>
          </span>
        </div>
      </header>
      <main className="wrap">
        <Funnel
          categories={categories.map((c) => ({ slug: c.slug, name: t(c.name) }))}
          plans={offeredPlans().map((p) => ({ id: p.id, name: p.name, price: p.priceEur, annual: p.annualMonthlyEur, ebooks: p.ebooksPerMonth, features: p.features, highlight: p.highlight }))}
          annualAvailable={annualAvailable()}
          user={user ? { name: user.name || "" } : null}
          demo={!isStripeConfigured()}
          google={googleConfigured()}
        />
      </main>
    </div>
  );
}
