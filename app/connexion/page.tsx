import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import FunnelNav from "@/components/funnel/FunnelNav";
import AuthForm from "@/components/AuthForm";
import { googleConfigured } from "@/lib/google";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Connexion") };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const [{ google }, { t }] = await Promise.all([searchParams, getT()]);
  const erreurs: Record<string, string> = {
    erreur: t("La connexion avec Google n'a pas abouti. Réessaie ou utilise ton e-mail."),
    suspendu: t("Ce compte a été suspendu. Écris au support si tu penses qu'il s'agit d'une erreur."),
    indisponible: t("La connexion avec Google n'est pas encore disponible. Utilise ton e-mail."),
  };
  return (
    <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <AuthForm mode="login" google={googleConfigured()} googleError={(google && erreurs[google]) || ""} />
    </div>
  );
}
