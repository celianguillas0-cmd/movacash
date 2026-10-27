import type { Metadata } from "next";
import Link from "next/link";
import FunnelNav from "@/components/funnel/FunnelNav";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import { getT } from "@/lib/i18n/server";
import { desinscrire } from "@/lib/relances";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

// Lien « Tu ne veux plus recevoir ces e-mails ? » : désinscription immédiate, sans connexion.
export default async function Desinscription({ searchParams }: { searchParams: Promise<{ u?: string; s?: string }> }) {
  const { t } = await getT();
  const { u, s } = await searchParams;
  const fait = await desinscrire(Number(u), String(s || ""));
  return (
    <div className="mc dark">
      <FunnelNav />
      <main className="wrap narrow" style={{ marginInline: "auto", paddingBlock: "14vh", textAlign: "center" }}>
        <h1 className="q-title">{fait ? t("C'est noté, tu ne recevras plus nos e-mails.") : t("Ce lien de désinscription n'est pas valide.")}</h1>
        <p className="q-help" style={{ marginTop: 10 }}>
          {fait ? t("Les e-mails liés à ton abonnement (paiement, résiliation) restent envoyés, car la loi les impose.") : t("Tu peux aussi décocher les e-mails dans ton espace, rubrique Paramètres.")}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
          <Link className="btn btn-ghost btn-lg" href="/">{t("Retour à l'accueil")}</Link>
        </div>
      </main>
      <FunnelFooter />
    </div>
  );
}
