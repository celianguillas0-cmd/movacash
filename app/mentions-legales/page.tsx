import LegalPage from "@/components/LegalPage";
import { APP_NAME } from "@/lib/config";

export default function Mentions() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>{APP_NAME} est édité par [Prénom Nom], entrepreneur individuel (micro-entreprise), SIRET [numéro], adresse : [adresse]. TVA non applicable, art. 293 B du CGI. Directeur de la publication : [nom]. Contact : [email].</p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).</p>
      <h2>Marques</h2>
      <p>Etsy, TikTok, Vinted, Canva et les autres marques citées appartiennent à leurs propriétaires respectifs. {APP_NAME} n'est affilié à aucune d'entre elles.</p>
    </LegalPage>
  );
}
