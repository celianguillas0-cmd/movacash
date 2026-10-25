import Link from "next/link";
import type { FoundIdea } from "@/lib/ideas";

const Jauge = ({ n, max }: { n: number; max: number }) => (
  <span className="at-jauge" aria-hidden="true">
    {Array.from({ length: max }).map((_, k) => <i key={k} className={k < n ? "on" : ""} />)}
  </span>
);

// Carte d'une idée, au format des idées de l'atelier TrendSaaS : rang, score de compatibilité, quatre repères, « pourquoi toi ».
export default function IdeaCard({ idea, rank, detailed = false, onKeep }: { idea: FoundIdea; rank?: number; detailed?: boolean; onKeep?: () => void }) {
  return (
    <article className="at-idee">
      <div className="at-idee-tete">
        <div>
          <p className="at-kicker">{rank ? `Idée n°${rank}${rank === 1 ? " — la plus adaptée" : ""}` : `${idea.emoji} ${idea.category}`}</p>
          <h2>{idea.title}</h2>
          <p className="at-idee-sous">Pour {idea.audience.charAt(0).toLowerCase() + idea.audience.slice(1)} · {idea.format.toLowerCase()}</p>
        </div>
        <div className="at-score" title="Correspondance avec tes réponses au questionnaire">
          <b>{idea.compat}<small>%</small></b>
          <span>COMPATIBLE</span>
        </div>
      </div>
      <div className="at-stats">
        <div className="at-stat"><span>Prix conseillé</span><b className="at-fort">{idea.price}</b><small>estimation Etsy</small></div>
        <div className="at-stat"><span>Demande</span><b>{idea.demandLabel.charAt(0).toUpperCase() + idea.demandLabel.slice(1)}</b><Jauge n={idea.demand} max={5} /></div>
        <div className="at-stat"><span>Concurrence</span><b>{idea.competitionLabel.charAt(0).toUpperCase() + idea.competitionLabel.slice(1)}</b><Jauge n={idea.competition} max={5} /></div>
        <div className="at-stat"><span>Difficulté</span><b>{idea.difficultyLabel}</b><Jauge n={idea.difficulty} max={3} /><small>{idea.difficultyNote}</small></div>
      </div>
      {detailed ? (
        <ul className="at-raisons">{idea.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
      ) : (
        <p className="at-pourquoi"><b>Pourquoi toi :</b> {idea.why}</p>
      )}
      <div className="at-idee-actions">
        <Link href={`/app/creer/${idea.id}`} className="at-btn">Créer cet e-book <span aria-hidden="true">→</span></Link>
        {onKeep && <button className="at-btn at-btn-sec" onClick={onKeep}>Garder dans Mon idée</button>}
      </div>
    </article>
  );
}
