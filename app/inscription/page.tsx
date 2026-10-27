import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import FunnelNav from "@/components/funnel/FunnelNav";
import AuthForm from "@/components/AuthForm";
import { googleConfigured } from "@/lib/google";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Créer un compte") };
}

export default function Page() {
  return (
    <div className="mc dark has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <AuthForm mode="signup" google={googleConfigured()} />
    </div>
  );
}
