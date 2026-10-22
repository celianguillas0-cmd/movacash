import LegalPage from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Données collectées</h2>
      <ul>
        <li>Compte : email, nom, mot de passe (stocké sous forme chiffrée).</li>
        <li>Réponses au questionnaire d'orientation.</li>
        <li>Contenus que vous créez (e-books, fiches produits).</li>
        <li>Facturation : gérée par Stripe ; nous ne conservons pas vos données de carte.</li>
      </ul>
      <h2>Finalités et bases légales</h2>
      <p>Exécution du contrat (fourniture du service, facturation), obligations légales (comptabilité), intérêt légitime (sécurité, amélioration du service).</p>
      <h2>Sous-traitants</h2>
      <p>Hébergeur [nom] ; Stripe (paiement) ; Google (API Gemini) qui reçoit les consignes de génération que vous saisissez. N'y indiquez pas de données personnelles sensibles.</p>
      <h2>Durée de conservation</h2>
      <p>Pendant la durée du compte, puis [durée] ; données de facturation : 10 ans.</p>
      <h2>Vos droits</h2>
      <p>Accès, rectification, effacement, portabilité, opposition : écrivez à [email]. Vous pouvez saisir la CNIL (cnil.fr).</p>
      <h2>Cookies</h2>
      <p>Un unique cookie technique de session est utilisé pour vous garder connecté. Aucun cookie publicitaire n'est déposé par défaut.</p>
    </LegalPage>
  );
}
