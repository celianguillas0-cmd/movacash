import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SUPPORT_EMAIL } from "@/lib/config";
import AtHead from "@/components/ws/AtHead";

export const dynamic = "force-dynamic";

const FAQ: [string, React.ReactNode][] = [
  ["Comment créer mon premier e-book ?", <>Va dans <Link className="text-brand-700 underline" href="/app">Trouver mon idée</Link>, lance une recherche et clique sur « Créer cet e-book ». Tu règles ton e-book en quelques questions, puis l'IA rédige le plan et chaque chapitre : garde la page ouverte pendant la génération (environ 30 à 60 secondes par chapitre).</>],
  ["La génération s'est arrêtée au milieu, j'ai perdu un e-book ?", "Non. Ouvre l'e-book depuis Mes e-books et clique sur « Générer les chapitres restants ». Les chapitres déjà rédigés sont conservés et l'e-book n'est compté qu'une seule fois dans ton quota."],
  ["Comment fonctionne le quota ?", "Chaque nouvel e-book compte pour 1, au moment où le plan est créé. Régénérer un chapitre ne compte pas. Le quota repart à zéro le 1er de chaque mois. Supprimer un e-book ne rend pas de crédit."],
  ["Je peux modifier le texte ?", "Oui, chaque chapitre est modifiable, et tu peux le régénérer en un clic. Relis toujours ton e-book avant de le vendre : c'est ce qui fait les bons avis."],
  ["Comment vendre sur Etsy ?", <>Télécharge le PDF (onglet Export), copie le titre, les tags et la description de l'onglet Fiche Etsy, et télécharge la miniature (onglet Miniature Etsy). Le <Link className="text-brand-700 underline" href="/app/regles-etsy">Guide Etsy</Link> résume les règles à respecter, dont la mention de l'IA.</>],
  ["Comment changer d'offre ?", <>Dans <Link className="text-brand-700 underline" href="/app/abonnement">Abonnement</Link>. Une offre supérieure s'applique tout de suite (tu paies la différence au prorata), une offre inférieure au prochain renouvellement.</>],
  ["Comment résilier ?", <>Dans <Link className="text-brand-700 underline" href="/app/abonnement">Abonnement</Link>, bouton « Résilier mon abonnement ». Tu gardes l'accès jusqu'à la fin de la période payée et tu n'es plus prélevé ensuite. Pas de remboursement d'une période entamée.</>],
  ["Mes e-books m'appartiennent ?", "Oui. Tu peux les vendre au prix que tu veux, même après avoir arrêté ton abonnement. Ils restent téléchargeables depuis ton compte tant que celui-ci existe."],
  ["J'ai oublié mon mot de passe", <>Sur la page de connexion, clique sur <Link className="text-brand-700 underline" href="/mot-de-passe">Mot de passe oublié</Link> : tu reçois un lien par e-mail.</>],
];

const LIENS: [string, string, string][] = [
  ["/app/regles-etsy", "Guide Etsy", "Les règles à respecter avant de publier"],
  ["/app/abonnement", "Gérer mon abonnement", "Changer de formule, carte, factures, résiliation"],
  ["/cgv", "Conditions générales de vente", "Abonnement, résiliation, absence de remboursement"],
  ["/mentions-legales", "Mentions légales", "Éditeur et hébergeur du site"],
  ["/confidentialite", "Confidentialité", "Ce qu'on fait (et ne fait pas) de tes données"],
];

export default async function Support() {
  const user = await requireUser();
  return (
    <div>
      <AtHead name={user.name} title="Support." />
      <section className="at-carte">
        <p className="at-kicker">Nous écrire</p>
        {SUPPORT_EMAIL ? (
          <>
            <p>Une question, un souci avec un e-book ou ton abonnement ? Écris-nous, on répond en général sous 48 h ouvrées.</p>
            <a className="at-btn" style={{ marginTop: 16 }} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </>
        ) : (
          <p className="at-dim">Le support répond par e-mail (adresse à configurer : variable SUPPORT_EMAIL).</p>
        )}
      </section>

      <div style={{ marginTop: 22 }}>
        {LIENS.map(([href, titre, desc]) => (
          <Link key={href} href={href} className="at-ligne">
            <span className="at-ligne-ic" aria-hidden="true">→</span>
            <span><b>{titre}</b><small>{desc}</small></span>
          </Link>
        ))}
      </div>

      <h2 className="at-kicker" style={{ marginTop: 34 }}>Questions fréquentes</h2>
      <div className="space-y-2" style={{ marginTop: 12 }}>
        {FAQ.map(([q, a]) => (
          <details key={q} className="card group p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-900">
              {q}<span className="font-mono transition group-open:rotate-45">+</span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
