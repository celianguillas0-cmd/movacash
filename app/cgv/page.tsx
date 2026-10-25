import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { APP_NAME, APP_URL, PLANS, eur } from "@/lib/config";
import { fill, legal } from "@/lib/legal";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export const dynamic = "force-dynamic";

export default function CGV() {
  const l = legal();
  return (
    <LegalPage title="Conditions générales de vente et d'utilisation">
      <h2>1. Objet</h2>
      <p>Les présentes conditions régissent l'accès et l'utilisation du service {APP_NAME} ({APP_URL}), édité par {fill(l.nom)}, entrepreneur individuel (micro-entreprise), SIRET {fill(l.siret)}, {fill(l.adresse)}, e-mail {fill(l.email)}, téléphone {fill(l.telephone)} (« l'Éditeur »). {APP_NAME} est un logiciel en ligne d'aide à la création d'e-books à l'aide de l'intelligence artificielle, accessible par abonnement. Le service est réservé aux personnes majeures. L'utilisateur accepte les présentes conditions en cochant la case prévue lors de la création de son compte.</p>

      <h2>2. Description du service</h2>
      <p>Le service permet notamment : la consultation d'une base d'idées de sujets, la génération de plans et de chapitres d'e-books à l'aide d'un modèle d'IA tiers (Google Gemini), l'édition des contenus, l'export au format PDF, et la génération d'aides à la rédaction de fiches produits et de miniatures. L'Éditeur ne vend pas d'e-books et n'intervient pas dans les ventes réalisées par l'utilisateur sur des plateformes tierces (Etsy ou autres). {APP_NAME} n'est affilié ni à Etsy ni à Google.</p>

      <h2>3. Absence de garantie de revenus</h2>
      <p>L'abonnement donne accès à un outil. L'Éditeur ne garantit aucun chiffre d'affaires, aucun nombre de ventes ni aucune rentabilité, et ne propose aucun remboursement lié aux résultats obtenus. Les résultats dépendent exclusivement de l'utilisateur (choix des sujets, relecture, qualité des fiches, promotion, concurrence, règles des plateformes). Les objectifs, calculs et estimations affichés (demande, concurrence, prix conseillé, nombre de ventes correspondant à un objectif) sont des indications et non des promesses ni des prévisions.</p>

      <h2>4. Offres et prix</h2>
      <ul>
        {PLANS.map((p) => <li key={p.id}>Formule {p.name.toLowerCase()} : {eur(p.priceEur)} € {p.id === "semaine" ? "par semaine" : p.id === "mois" ? "par mois" : "tous les 3 mois"}, {p.ebooks} e-books par période.</li>)}
      </ul>
      <p>Les prix sont indiqués en euros, toutes taxes comprises : TVA non applicable, art. 293 B du CGI. Chaque nouvel e-book est décompté du quota au moment de la création de son plan ; la régénération d'un chapitre n'est pas décomptée et la suppression d'un e-book ne restitue pas de crédit. Le quota est remis à zéro au début de chaque période payée (chaque semaine, chaque mois ou tous les trois mois selon la formule). Les quotas non utilisés ne sont pas reportés. Les prix peuvent évoluer ; tout changement est notifié par e-mail au moins 30 jours avant son application à un abonnement en cours, et l'utilisateur peut résilier avant cette date.</p>

      <h2>5. Souscription, paiement et renouvellement</h2>
      <p>Pour souscrire, l'utilisateur choisit une offre, demande l'accès immédiat au service en cochant la case prévue (article 6), puis paie sur la page sécurisée du prestataire Stripe. L'abonnement est hebdomadaire, mensuel ou trimestriel, payable d'avance par carte bancaire, et renouvelé automatiquement pour une période identique jusqu'à résiliation. Un e-mail de confirmation récapitulant l'offre, le prix, le renouvellement, les modalités de résiliation et la demande d'accès immédiat est envoyé après le paiement ; les factures sont disponibles dans l'espace « Abonnement ». En cas d'échec de paiement, de nouvelles tentatives sont effectuées pendant quelques jours ; à défaut de régularisation, l'accès est suspendu.</p>

      <h2>5 bis. Changement de durée</h2>
      <p>L'utilisateur peut changer de formule (hebdomadaire, mensuelle ou trimestrielle) à tout moment depuis son espace (« Abonnement »). Le changement prend effet immédiatement : une nouvelle période commence le jour du changement, avec le quota complet de la nouvelle formule. Le prix de la nouvelle formule est prélevé, déduction faite de la valeur du temps non utilisé de la période en cours ; si cette valeur dépasse le prix de la nouvelle formule, l'excédent est conservé en crédit et déduit des prochains paiements, sans remboursement. Le montant exact est affiché avant confirmation.</p>

      <h2>6. Droit de rétractation</h2>
      <p>Le consommateur dispose d'un délai de 14 jours à compter de la souscription pour se rétracter, sans avoir à se justifier. En souscrivant, il demande expressément que le service commence immédiatement.</p>
      <p>Tant qu'aucun e-book n'a été créé sur le compte, le consommateur peut exercer ce droit pendant ces 14 jours : il est alors remboursé de la totalité des sommes versées, par le même moyen de paiement, dans un délai de 14 jours à compter de sa demande, et l'abonnement prend fin.</p>
      <p>La création d'un premier e-book (plan et chapitres générés) constitue la fourniture d'un contenu numérique. Conformément à l'article L221-28 13° du Code de la consommation, le consommateur qui a donné son accord exprès à cette exécution immédiate et reconnu qu'il perdrait ainsi son droit de rétractation, par la case cochée avant le paiement, ne peut plus l'exercer à partir de ce moment.</p>
      <p>Pour se rétracter, le consommateur adresse une déclaration dénuée d'ambiguïté à {fill(l.email)}, par exemple au moyen du formulaire figurant en annexe.</p>

      <h2>7. Résiliation</h2>
      <p>L'utilisateur peut résilier à tout moment, sans frais ni justification, depuis son espace : rubrique « Abonnement », bouton « Résilier mon abonnement », puis « Confirmer la résiliation ». Cette fonctionnalité est aussi accessible par le lien « Résilier mon abonnement » en bas de chaque page du site. Un e-mail confirme la réception de la résiliation et indique la date à laquelle elle prend effet.</p>
      <p>La résiliation prend effet à la fin de la période en cours (semaine, mois ou trimestre), déjà payée ; l'accès est maintenu jusqu'à cette date et aucun prélèvement n'a lieu ensuite. L'utilisateur peut revenir sur sa résiliation jusqu'à cette date. Hors exercice du droit de rétractation (article 6) et hors application de la garantie légale de conformité (article 8), aucun remboursement, total ou au prorata, n'est effectué pour la période entamée.</p>
      <p>En formule trimestrielle, l'Éditeur informe l'utilisateur par e-mail, au plus tôt trois mois et au plus tard un mois avant la fin de chaque période, de la possibilité de ne pas reconduire l'abonnement, conformément à l'article L215-1 du Code de la consommation.</p>
      <p>L'utilisateur peut aussi supprimer son compte à tout moment depuis « Paramètres ». La suppression entraîne l'arrêt immédiat de l'abonnement, sans remboursement de la période en cours, et l'effacement définitif des contenus associés au compte ; l'utilisateur en est averti avant de confirmer.</p>

      <h2>8. Garantie légale de conformité</h2>
      <p>L'Éditeur est tenu de fournir un service conforme au contrat et répond des défauts de conformité qui apparaissent pendant toute la durée de l'abonnement, dans les conditions des articles L224-25-12 et suivants du Code de la consommation. En cas de défaut, le consommateur peut obtenir la mise en conformité du service ; à défaut dans un délai raisonnable, il peut obtenir une réduction du prix ou mettre fin au contrat avec remboursement de la période correspondante. Il suffit d'écrire au support ({fill(l.email)}). Le fait que les ventes réalisées sur une plateforme tierce ne soient pas celles espérées ne constitue pas un défaut de conformité (article 3).</p>

      <h2>9. Contenus générés et responsabilité de l'utilisateur</h2>
      <p>Sous réserve des conditions du fournisseur d'IA, l'utilisateur peut exploiter commercialement les contenus qu'il génère, y compris après la fin de son abonnement. Les contenus produits par l'IA peuvent contenir des erreurs ou des imprécisions : l'utilisateur s'engage à les relire, les vérifier et les corriger avant toute diffusion, et il est seul responsable de leur publication et de leur vente, notamment du respect des règles des plateformes (dont l'obligation de signaler l'usage de l'IA sur Etsy), du droit de la consommation et des droits des tiers. Sur les sujets de santé, de nutrition, de finances ou de droit, l'utilisateur s'interdit toute allégation trompeuse ou médicale.</p>

      <h2>10. Usages interdits</h2>
      <p>Il est interdit d'utiliser le service pour produire des contenus illicites, trompeurs, haineux, dangereux pour la santé, portant atteinte aux droits de tiers, ou pour contourner les quotas (partage de compte, automatisation abusive). En cas de manquement, l'Éditeur peut suspendre le compte après en avoir informé l'utilisateur, sauf urgence ou fraude.</p>

      <h2>11. Disponibilité</h2>
      <p>L'Éditeur s'efforce d'assurer l'accès au service en continu mais ne peut garantir une disponibilité sans interruption, notamment en cas de maintenance ou d'indisponibilité du fournisseur d'IA. Une indisponibilité prolongée imputable à l'Éditeur relève de l'article 8.</p>

      <h2>12. Données personnelles</h2>
      <p>Voir la politique de confidentialité.</p>

      <h2>13. Modification des conditions</h2>
      <p>L'Éditeur peut modifier les présentes conditions. Pour un abonnement en cours, toute modification substantielle est notifiée par e-mail au moins 30 jours avant son application ; l'utilisateur qui la refuse peut résilier avant cette date.</p>

      <h2>14. Réclamations, médiation et droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français, sans priver le consommateur résidant dans un autre pays de l'Union européenne de la protection que lui assurent les dispositions impératives de la loi de son pays. Toute réclamation peut être adressée à {fill(l.email)}. À défaut de solution, le consommateur peut recourir gratuitement au médiateur de la consommation : {fill(l.mediateurNom)}{l.mediateurSite ? `, ${l.mediateurSite}` : ""}{l.mediateurAdresse ? `, ${l.mediateurAdresse}` : ""}. Ces conditions sont rédigées en français, langue qui fait foi.</p>

      <h2>Annexe : formulaire de rétractation</h2>
      <p>(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)</p>
      <p>À l'attention de {fill(l.nom)}, {fill(l.adresse)}, {fill(l.email)} :<br />
        Je vous notifie par la présente ma rétractation du contrat portant sur l'abonnement {APP_NAME} ci-dessous :<br />
        Offre souscrite et date de souscription :<br />
        Nom du consommateur et adresse e-mail du compte :<br />
        Date :<br />
        Signature (uniquement en cas de notification sur papier) :</p>
    </LegalPage>
  );
}
