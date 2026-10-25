import LegalPage from "@/components/LegalPage";
import { APP_NAME } from "@/lib/config";
import { fill, legal } from "@/lib/legal";

export const dynamic = "force-dynamic";

export default function Mentions() {
  const l = legal();
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>
        {APP_NAME} est édité par {fill(l.nom)}, entrepreneur individuel (micro-entreprise), SIRET {fill(l.siret)}, adresse : {fill(l.adresse)}. Téléphone : {fill(l.telephone)}. E-mail : {fill(l.email)}.
        TVA non applicable, art. 293 B du CGI. Directeur de la publication : {fill(l.nom)}.
      </p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis, contact : vercel.com/contact. Base de données : Neon Inc., via Vercel.</p>
      <h2>Médiation de la consommation</h2>
      <p>En cas de litige non résolu avec le support, le consommateur peut saisir gratuitement le médiateur de la consommation : {fill(l.mediateurNom)}{l.mediateurSite ? `, ${l.mediateurSite}` : ""}{l.mediateurAdresse ? `, ${l.mediateurAdresse}` : ""}.</p>
      <h2>Marques</h2>
      <p>Etsy, TikTok, Vinted, Canva et les autres marques citées appartiennent à leurs propriétaires respectifs. {APP_NAME} n'est affilié à aucune d'entre elles.</p>
    </LegalPage>
  );
}
