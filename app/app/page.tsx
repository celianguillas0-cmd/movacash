import { requireUser } from "@/lib/auth";
import AtHead from "@/components/ws/AtHead";
import IdeaFinder from "@/components/at/IdeaFinder";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function TrouverMonIdee({ searchParams }: { searchParams: Promise<{ welcome?: string; q?: string }> }) {
  const user = await requireUser();
  const { welcome, q } = await searchParams;
  const { t } = await getT();
  return (
    <div>
      {welcome && <p className="notice-ok" style={{ marginBottom: 20 }}>{t("Abonnement activé. Bienvenue ! Commence par trouver ton idée.")}</p>}
      <AtHead name={user.name} title={t("Trouve ton idée.")} />
      <IdeaFinder initialQ={q || ""} />
    </div>
  );
}
