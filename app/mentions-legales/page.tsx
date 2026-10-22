import LegalPage from "@/components/LegalPage";
import { APP_NAME } from "@/lib/config";

export default function Mentions() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>{APP_NAME} est édité par [Raison sociale], [forme juridique] au capital de [montant], immatriculée au RCS de [ville] sous le numéro [SIREN], siège social : [adresse]. TVA intracommunautaire : [numéro]. Directeur de la publication : [nom]. Contact : [email].</p>
      <h2>Hébergement</h2>
      <p>[Nom de l'hébergeur], [adresse], [téléphone].</p>
      <h2>Marques</h2>
      <p>Etsy, TikTok, Vinted, Canva et les autres marques citées appartiennent à leurs propriétaires respectifs. {APP_NAME} n'est affilié à aucune d'entre elles.</p>
    </LegalPage>
  );
}
