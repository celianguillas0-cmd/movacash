import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SUPPORT_EMAIL } from "@/lib/config";
import AtHead from "@/components/ws/AtHead";
import { getT } from "@/lib/i18n/server";
import { rich } from "@/lib/i18n/rich";
import { tk, type T } from "@/lib/i18n/t";

export const dynamic = "force-dynamic";

const LIENS: [string, string, string][] = [
  ["/app/regles-etsy", tk("Guide Etsy"), tk("Les règles à respecter avant de publier")],
  ["/app/abonnement", tk("Gérer mon abonnement"), tk("Changer de formule, carte, factures, résiliation")],
  ["/cgv", tk("Conditions générales de vente"), tk("Abonnement, résiliation, absence de remboursement")],
  ["/mentions-legales", tk("Mentions légales"), tk("Éditeur et hébergeur du site")],
  ["/confidentialite", tk("Confidentialité"), tk("Ce qu'on fait (et ne fait pas) de tes données")],
];

function faq(t: T): [string, React.ReactNode][] {
  const lien = (href: string) => (s: string) => <Link className="text-brand-700 underline" href={href}>{s}</Link>;
  return [
    [t("Comment créer mon premier e-book ?"), rich(t("Va dans <1>Trouver mon idée</1>, lance une recherche et clique sur « Créer cet e-book ». Tu règles ton e-book en quelques questions, puis l'IA rédige le plan et chaque chapitre : garde la page ouverte pendant la génération (environ 30 à 60 secondes par chapitre)."), { 1: lien("/app") })],
    [t("La génération s'est arrêtée au milieu, j'ai perdu un e-book ?"), t("Non. Ouvre l'e-book depuis Mes e-books et clique sur « Générer les chapitres restants ». Les chapitres déjà rédigés sont conservés et l'e-book n'est compté qu'une seule fois dans ton quota.")],
    [t("Comment fonctionne le quota ?"), t("Chaque nouvel e-book compte pour 1, au moment où le plan est créé. Régénérer un chapitre ne compte pas. Le quota repart à zéro le 1er de chaque mois. Supprimer un e-book ne rend pas de crédit.")],
    [t("Je peux modifier le texte ?"), t("Oui, chaque chapitre est modifiable, et tu peux le régénérer en un clic. Relis toujours ton e-book avant de le vendre : c'est ce qui fait les bons avis.")],
    [t("Comment vendre sur Etsy ?"), rich(t("Télécharge le PDF (onglet Export), copie le titre, les tags et la description de l'onglet Fiche Etsy, et télécharge la miniature (onglet Miniature Etsy). Le <1>Guide Etsy</1> résume les règles à respecter, dont la mention de l'IA."), { 1: lien("/app/regles-etsy") })],
    [t("Comment changer d'offre ?"), rich(t("Dans <1>Abonnement</1>. Une offre supérieure s'applique tout de suite (tu paies la différence au prorata), une offre inférieure au prochain renouvellement."), { 1: lien("/app/abonnement") })],
    [t("Comment résilier ?"), rich(t("Dans <1>Abonnement</1>, bouton « Résilier mon abonnement ». Tu gardes l'accès jusqu'à la fin de la période payée et tu n'es plus prélevé ensuite. Pas de remboursement d'une période entamée."), { 1: lien("/app/abonnement") })],
    [t("Mes e-books m'appartiennent ?"), t("Oui. Tu peux les vendre au prix que tu veux, même après avoir arrêté ton abonnement. Ils restent téléchargeables depuis ton compte tant que celui-ci existe.")],
    [t("J'ai oublié mon mot de passe"), rich(t("Sur la page de connexion, clique sur <1>Mot de passe oublié</1> : tu reçois un lien par e-mail."), { 1: lien("/mot-de-passe") })],
  ];
}

export default async function Support() {
  const user = await requireUser();
  const { t } = await getT();
  return (
    <div>
      <AtHead name={user.name} title={t("Support.")} />
      <section className="at-carte">
        <p className="at-kicker">{t("Nous écrire")}</p>
        {SUPPORT_EMAIL ? (
          <>
            <p>{t("Une question, un souci avec un e-book ou ton abonnement ? Écris-nous, on répond en général sous 48 h ouvrées.")}</p>
            <a className="at-btn" style={{ marginTop: 16 }} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </>
        ) : (
          <p className="at-dim">{t("Le support répond par e-mail.")}</p>
        )}
      </section>

      <div style={{ marginTop: 22 }}>
        {LIENS.map(([href, titre, desc]) => (
          <Link key={href} href={href} className="at-ligne">
            <span className="at-ligne-ic" aria-hidden="true">→</span>
            <span><b>{t(titre)}</b><small>{t(desc)}</small></span>
          </Link>
        ))}
      </div>

      <h2 className="at-kicker" style={{ marginTop: 34 }}>{t("Questions fréquentes")}</h2>
      <div className="space-y-2" style={{ marginTop: 12 }}>
        {faq(t).map(([q, a]) => (
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
