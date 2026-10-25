import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { describeIdea, getIdea, terrainMatches, type QuizAnswers } from "@/lib/ideas";
import AtHead from "@/components/ws/AtHead";
import IdeaCard from "@/components/at/IdeaCard";
import { getT } from "@/lib/i18n/server";
import { localizeIdeas } from "@/lib/ideas-i18n";

export const dynamic = "force-dynamic";

export default async function MonIdee() {
  const user = await requireUser();
  const { t, locale } = await getT();
  const base = user.my_idea_id ? await getIdea(user.my_idea_id) : undefined;
  const [idea] = base ? await localizeIdeas([base], locale) : [];
  if (!idea)
    return (
      <div>
        <AtHead name={user.name} title={t("Ton idée.")} />
        <div className="at-carte at-colonne">
          <p>{t("Tu n'as pas encore d'idée. Lance une recherche : la première idée trouvée s'installe ici, et tu la retrouves à chaque visite, même après en avoir cherché d'autres.")}</p>
          <Link href="/app" className="at-btn" style={{ marginTop: 18 }}>{t("Chercher mon idée")} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    );
  let answers: QuizAnswers = {};
  try {
    answers = JSON.parse(user.quiz_json || "{}").answers || {};
  } catch {}
  const found = describeIdea(idea, answers, await terrainMatches(answers), 0, t);
  const ebooks = await all<{ id: number; title: string; status: string }>("SELECT id, title, status FROM ebooks WHERE user_id = ? AND idea_id = ? ORDER BY id DESC", [user.id, idea.id]);
  return (
    <div>
      <AtHead name={user.name} title={t("Ton idée.")} />
      <IdeaCardSansScore idea={found} />
      {ebooks.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <p className="at-kicker" style={{ marginBottom: 12 }}>{t("Tes e-books sur cette idée")}</p>
          {ebooks.map((e) => (
            <Link key={e.id} href={`/app/ebooks/${e.id}`} className="at-ligne">
              <span className="at-ligne-ic">{e.status === "ready" ? "✓" : "…"}</span>
              <span><b>{e.title}</b><small>{e.status === "ready" ? t("Prêt à vendre") : t("En cours de rédaction")}</small></span>
              <span className="at-fleche" aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
      )}
      <p style={{ marginTop: 22 }}><Link href="/app" className="at-btn at-btn-sec">← {t("Chercher une autre idée")}</Link></p>
    </div>
  );
}

// « Mon idée » montre le détail complet, sans le score qui n'a de sens que dans une liste.
function IdeaCardSansScore({ idea }: { idea: ReturnType<typeof describeIdea> }) {
  return <div className="sans-score"><IdeaCard idea={idea} detailed /></div>;
}
