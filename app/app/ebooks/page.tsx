import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listEbooks } from "@/lib/ebooks";
import EbookCard from "@/components/ws/EbookCard";
import AtHead from "@/components/ws/AtHead";
import { getT } from "@/lib/i18n/server";

export default async function MyEbooks() {
  const user = await requireUser();
  const ebooks = await listEbooks(user.id);
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <AtHead name={user.name} title={t("Tes e-books.")}>
        <p className="at-dim" style={{ marginTop: 10 }}>{ebooks.length > 1 ? t("{n} e-books.", { n: ebooks.length }) : t("{n} e-book.", { n: ebooks.length })} {t("Ils restent à toi, même si tu arrêtes ton abonnement.")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <Link href="/app" className="at-btn">+ {t("Nouvel e-book")}</Link>
          <Link href="/app/nouveau" className="at-btn at-btn-sec">{t("Sur un sujet libre")}</Link>
        </div>
      </AtHead>
      {ebooks.length === 0 ? (
        <div className="at-carte"><p>{t("Aucun e-book pour l'instant. Commence par trouver ton idée, ton premier e-book se crée en quelques questions.")}</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ebooks.map((e) => <EbookCard key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
}
