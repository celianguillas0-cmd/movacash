import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { describeIdea, getIdea, terrainMatches, type QuizAnswers } from "@/lib/ideas";
import AtHead from "@/components/ws/AtHead";
import IdeaCard from "@/components/at/IdeaCard";

export const dynamic = "force-dynamic";

export default async function MonIdee() {
  const user = await requireUser();
  const idea = user.my_idea_id ? await getIdea(user.my_idea_id) : undefined;
  if (!idea)
    return (
      <div>
        <AtHead name={user.name} title="Ton idée." />
        <div className="at-carte at-colonne">
          <p>Tu n&apos;as pas encore d&apos;idée. Lance une recherche : la première idée trouvée s&apos;installe ici, et tu la retrouves à chaque visite, même après en avoir cherché d&apos;autres.</p>
          <Link href="/app" className="at-btn" style={{ marginTop: 18 }}>Chercher mon idée <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    );
  let answers: QuizAnswers = {};
  try {
    answers = JSON.parse(user.quiz_json || "{}").answers || {};
  } catch {}
  const found = describeIdea(idea, answers, await terrainMatches(answers), 0);
  const ebooks = await all<{ id: number; title: string; status: string }>("SELECT id, title, status FROM ebooks WHERE user_id = ? AND idea_id = ? ORDER BY id DESC", [user.id, idea.id]);
  return (
    <div>
      <AtHead name={user.name} title="Ton idée." />
      <IdeaCardSansScore idea={found} />
      {ebooks.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <p className="at-kicker" style={{ marginBottom: 12 }}>Tes e-books sur cette idée</p>
          {ebooks.map((e) => (
            <Link key={e.id} href={`/app/ebooks/${e.id}`} className="at-ligne">
              <span className="at-ligne-ic">{e.status === "ready" ? "✓" : "…"}</span>
              <span><b>{e.title}</b><small>{e.status === "ready" ? "Prêt à vendre" : "En cours de rédaction"}</small></span>
              <span className="at-fleche" aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
      )}
      <p style={{ marginTop: 22 }}><Link href="/app" className="at-btn at-btn-sec">← Chercher une autre idée</Link></p>
    </div>
  );
}

// « Mon idée » montre le détail complet, sans le score qui n'a de sens que dans une liste.
function IdeaCardSansScore({ idea }: { idea: ReturnType<typeof describeIdea> }) {
  return <div className="sans-score"><IdeaCard idea={idea} detailed /></div>;
}
