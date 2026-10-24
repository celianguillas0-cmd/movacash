import Link from "next/link";
import Funnel from "./Funnel";
import { listCategories } from "@/lib/ideas";
import { getCurrentUser } from "@/lib/auth";
import { PLANS, isStripeConfigured } from "@/lib/config";
import "../tunnel.css";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const [user, categories] = await Promise.all([getCurrentUser(), listCategories()]);
  return (
    <div className="tf">
      <header className="head-bande">
        <div className="wrap site-head">
          <Link href="/" className="brand">Mova<span className="brand-tld">cash</span></Link>
          <Link href="/" className="head-lien">← Retour à l&apos;accueil</Link>
        </div>
      </header>
      <main className="wrap">
        <Funnel
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          plans={PLANS.map((p) => ({ id: p.id, name: p.name, price: p.priceEur, ebooks: p.ebooksPerMonth, features: p.features, highlight: p.highlight }))}
          user={user ? { name: user.name || "" } : null}
          demo={!isStripeConfigured()}
        />
      </main>
    </div>
  );
}
