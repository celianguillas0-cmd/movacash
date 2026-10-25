import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import FunnelNav from "@/components/funnel/FunnelNav";
import AuthForm from "@/components/AuthForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Connexion") };
}

export default function Page() {
  return (
    <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <AuthForm mode="login" />
    </div>
  );
}
