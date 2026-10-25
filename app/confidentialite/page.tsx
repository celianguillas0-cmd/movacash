import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { APP_NAME } from "@/lib/config";
import { fill, legal } from "@/lib/legal";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export const dynamic = "force-dynamic";

export default function Privacy() {
  const l = legal();
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>{fill(l.nom)}, éditeur de {APP_NAME}, {fill(l.adresse)}, {fill(l.email)}.</p>

      <h2>Données collectées</h2>
      <ul>
        <li>Compte : adresse e-mail, prénom, mot de passe (stocké sous forme chiffrée, jamais lisible), nom d'auteur facultatif.</li>
        <li>Réponses au questionnaire d'orientation (tranche d'âge, situation, temps disponible, objectifs, thématiques).</li>
        <li>Contenus que vous créez : e-books, chapitres, fiches produits, miniatures, avis envoyés depuis « Paramètres ».</li>
        <li>Abonnement : formule, dates, statut, motif de résiliation facultatif. Le paiement est géré par Stripe ; nous ne voyons ni ne conservons vos données de carte.</li>
        <li>Données techniques : adresse IP et pays de connexion (sécurité, limitation des abus, choix de la langue), historique d'utilisation des générations (quota et coûts).</li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Fournir le service, gérer le compte, l'abonnement et la facturation, envoyer les e-mails liés au contrat (confirmation, résiliation, rappel de renouvellement, mot de passe oublié) : exécution du contrat.</li>
        <li>Conserver les factures : obligation légale.</li>
        <li>Sécurité, prévention des abus, amélioration du service à partir des avis et des motifs de résiliation : intérêt légitime.</li>
        <li>Conseils occasionnels pour vendre sur Etsy, seulement si vous avez coché la case prévue : consentement, retirable à tout moment depuis « Paramètres » (lien de désinscription dans chaque e-mail de conseils).</li>
      </ul>
      <p>Aucune donnée n'est vendue, louée ni utilisée pour de la publicité.</p>

      <h2>Destinataires et sous-traitants</h2>
      <p>Vercel Inc. (hébergement du site) ; Neon Inc. (base de données) ; Stripe (paiement et factures) ; Resend (envoi des e-mails) ; Google (API Gemini et Imagen), qui reçoit les sujets et consignes de génération que vous saisissez : n'y indiquez pas de données personnelles sensibles. Certains de ces prestataires sont établis aux États-Unis ; les transferts sont encadrés par le cadre de protection des données UE–États-Unis (Data Privacy Framework) auquel ils adhèrent, ou à défaut par les clauses contractuelles types de la Commission européenne.</p>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Compte et contenus : tant que le compte existe. Ils sont effacés immédiatement si vous supprimez votre compte. Un compte resté sans connexion ni abonnement pendant 3 ans pourra être supprimé, après un e-mail d'avertissement.</li>
        <li>Factures et données de paiement associées : 10 ans (obligation comptable), chez Stripe.</li>
        <li>Journaux techniques et adresses IP : 12 mois au plus.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition, ainsi que du droit de retirer votre consentement à tout moment. Depuis votre espace (« Paramètres »), vous pouvez modifier vos informations, télécharger toutes vos données (format JSON) et supprimer votre compte vous-même. Pour toute autre demande : {fill(l.email)}. Vous pouvez introduire une réclamation auprès de la CNIL (cnil.fr).</p>

      <h2>Cookies</h2>
      <p>Le site n'utilise que deux cookies techniques, strictement nécessaires et exemptés de consentement : le cookie de session qui vous garde connecté, et un cookie qui retient la langue choisie. Aucun cookie publicitaire ni de mesure d'audience n'est déposé.</p>
    </LegalPage>
  );
}
