import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getIdea } from "@/lib/ideas";
import { canCreateEbook } from "@/lib/subscription";
import AtHead from "@/components/ws/AtHead";
import CreateFunnel from "@/components/at/CreateFunnel";
import { getT } from "@/lib/i18n/server";
import { localizeIdeas } from "@/lib/ideas-i18n";

export const dynamic = "force-dynamic";

export default async function Creer({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getIdea(Number(id));
  if (!found) notFound();
  const { t, locale } = await getT();
  const [idea] = await localizeIdeas([found], locale);
  const allowed = await canCreateEbook(user, t);
  if (!allowed.ok)
    return (
      <div>
        <AtHead name={user.name} title={t("Créer ton e-book.")} />
        <div className="at-carte at-colonne">
          <p>{allowed.reason}</p>
          <Link href={user.plan ? "/app/abonnement" : "/tarifs"} className="at-btn" style={{ marginTop: 18 }}>{t("Voir les formules")} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    );
  let qa: Record<string, unknown> = {};
  try {
    qa = JSON.parse(user.quiz_json || "{}").answers || {};
  } catch {}
  return (
    <CreateFunnel
      idea={{ id: idea.id, title: idea.title, audience: idea.audience, sensitive: idea.sensitive, priceMin: idea.price_min, priceMax: idea.price_max }}
      author={user.author_name || user.name}
      defaults={{ tone: user.default_tone || (typeof qa.tone === "string" ? qa.tone : undefined), language: user.default_language || locale }}
    />
  );
}
