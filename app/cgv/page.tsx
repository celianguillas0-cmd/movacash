import LegalPage from "@/components/LegalPage";
import { APP_NAME, PLANS, eur } from "@/lib/config";

export default function CGV() {
  return (
    <LegalPage title="Conditions générales de vente et d'utilisation">
      <h2>1. Objet</h2>
      <p>Les présentes conditions régissent l'accès et l'utilisation du service {APP_NAME}, édité par [Raison sociale], [forme juridique], immatriculée sous le numéro [SIREN], dont le siège est situé [adresse] (« l'Éditeur »). {APP_NAME} est un logiciel en ligne d'aide à la création d'e-books à l'aide de l'intelligence artificielle, accessible par abonnement.</p>

      <h2>2. Description du service</h2>
      <p>Le service permet notamment : la consultation d'une base d'idées de sujets, la génération de plans et de chapitres d'e-books à l'aide d'un modèle d'IA tiers (Google Gemini), l'édition des contenus, l'export au format PDF, et la génération d'aides à la rédaction de fiches produits. L'Éditeur ne vend pas d'e-books et n'intervient pas dans les ventes réalisées par l'utilisateur sur des plateformes tierces (Etsy ou autres).</p>

      <h2>3. Absence de garantie de revenus</h2>
      <p>L'abonnement donne accès à un outil. L'Éditeur ne garantit aucun chiffre d'affaires, aucun nombre de ventes ni aucune rentabilité. Les résultats dépendent exclusivement de l'utilisateur (choix des sujets, relecture, qualité des fiches, promotion, concurrence, règles des plateformes). Les éventuels exemples ou témoignages présentés ne constituent pas une promesse de résultat.</p>

      <h2>4. Offres et prix</h2>
      <ul>
        {PLANS.map((p) => <li key={p.id}>{p.name} : {eur(p.priceEur)} € TTC par mois, {p.ebooksPerMonth} e-books par mois civil.</li>)}
      </ul>
      <p>Les quotas non utilisés ne sont pas reportés. Les prix peuvent évoluer ; tout changement est notifié au moins 30 jours avant son application à un abonnement en cours.</p>

      <h2>5. Souscription, paiement et renouvellement</h2>
      <p>L'abonnement est mensuel, payable d'avance par carte bancaire via le prestataire Stripe, et renouvelé automatiquement chaque mois jusqu'à résiliation.</p>

      <h2>6. Droit de rétractation</h2>
      <p>Le service et les contenus numériques générés sont fournis immédiatement après la souscription. Conformément à l'article L221-28 du Code de la consommation, l'utilisateur consommateur qui demande expressément l'exécution immédiate du service et reconnaît perdre son droit de rétractation ne peut plus l'exercer. Cet accord est recueilli par une case à cocher avant le paiement.</p>

      <h2>7. Résiliation et absence de remboursement</h2>
      <p>L'utilisateur peut résilier à tout moment depuis son espace (« Mon compte »). La résiliation prend effet à la fin de la période mensuelle en cours, déjà payée ; l'accès est maintenu jusqu'à cette date. Aucun remboursement, total ou au prorata, n'est effectué pour la période entamée, y compris lorsque l'utilisateur n'a pas utilisé le service ou n'a pas rentabilisé son abonnement, sauf disposition légale impérative contraire ou défaillance du service imputable à l'Éditeur.</p>

      <h2>8. Contenus générés et responsabilité de l'utilisateur</h2>
      <p>Sous réserve des conditions du fournisseur d'IA, l'utilisateur peut exploiter commercialement les contenus qu'il génère. Les contenus produits par l'IA peuvent contenir des erreurs ou des imprécisions : l'utilisateur s'engage à les relire, les vérifier et les corriger avant toute diffusion, et il est seul responsable de leur publication et de leur vente, notamment du respect des règles des plateformes (dont l'obligation de signaler l'usage de l'IA sur Etsy), du droit de la consommation et des droits des tiers. Sur les sujets de santé, de nutrition, de finances ou de droit, l'utilisateur s'interdit toute allégation trompeuse ou médicale.</p>

      <h2>9. Usages interdits</h2>
      <p>Il est interdit d'utiliser le service pour produire des contenus illicites, trompeurs, haineux, dangereux pour la santé, portant atteinte aux droits de tiers, ou pour contourner les quotas (partage de compte, automatisation abusive). L'Éditeur peut suspendre un compte en cas de manquement.</p>

      <h2>10. Disponibilité</h2>
      <p>L'Éditeur s'efforce d'assurer l'accès au service en continu mais ne peut garantir une disponibilité sans interruption, notamment en cas de maintenance ou d'indisponibilité du fournisseur d'IA.</p>

      <h2>11. Données personnelles</h2>
      <p>Voir la politique de confidentialité.</p>

      <h2>12. Médiation et droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français. En cas de litige, le consommateur peut recourir gratuitement au médiateur de la consommation : [nom et coordonnées du médiateur].</p>
    </LegalPage>
  );
}
