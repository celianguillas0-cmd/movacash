import { ETSY_CHECKLIST } from "@/lib/etsy";

export default function EtsyGuide() {
  return (
    <div className="prose-legal max-w-3xl">
      <h1 className="h1">Vendre ses e-books sur Etsy : les règles à respecter</h1>
      <p>Ce guide résume les points essentiels. Les règles d'Etsy évoluent : vérifiez toujours les pages officielles avant de publier (<a className="underline" href="https://www.etsy.com/legal/creativity" target="_blank" rel="noreferrer">normes de créativité</a>, <a className="underline" href="https://www.etsy.com/legal/prohibited" target="_blank" rel="noreferrer">articles interdits</a>).</p>

      <h2>1. Contenu créé avec l'IA : divulgation obligatoire</h2>
      <p>Etsy accepte les créations conçues par le vendeur à l'aide d'outils d'IA (catégorie « Designed by »), à condition de l'indiquer dans la description de l'annonce. Le kit Etsy généré ajoute cette mention automatiquement et le PDF la reprend sur la page de droits. Ne la supprimez pas.</p>

      <h2>2. Votre contenu, pas celui des autres</h2>
      <p>Revendre tels quels des fichiers achetés ou récupérés (PLR, packs « droits de revente ») n'est pas autorisé. Chaque e-book généré ici est créé à partir de vos choix (sujet, public, ton, consignes) et de vos modifications : relisez-le et personnalisez-le, c'est aussi ce qui fera la différence face aux autres vendeurs.</p>

      <h2>3. Sujets santé, nutrition, sport, argent</h2>
      <ul>
        <li>Aucune allégation médicale (guérir, traiter, soigner) : Etsy interdit les produits qui font des promesses médicales.</li>
        <li>Aucune promesse de résultat chiffré garanti (« perdez 10 kg », « gagnez 3000 €/mois »).</li>
        <li>Un avertissement clair : le guide est informatif et ne remplace pas un professionnel. Il est ajouté automatiquement au PDF pour les sujets marqués sensibles.</li>
      </ul>

      <h2>4. Marques et propriété intellectuelle</h2>
      <p>Vous pouvez parler de TikTok, Vinted ou Canva pour décrire le sujet, mais n'utilisez pas leurs logos et ne laissez pas croire à un partenariat. Ajoutez « non affilié à … » dans la description.</p>

      <h2>5. Une fiche honnête et complète</h2>
      <p>Indiquez le format (PDF numérique, nombre de pages), précisez qu'aucun envoi physique n'a lieu, montrez de vraies pages intérieures et fixez un prix cohérent avec la longueur réelle.</p>

      <h2>6. Réalisme sur les ventes</h2>
      <p>Publier ne suffit pas à vendre. Ce qui marche le mieux : des sujets précis plutôt que génériques, plusieurs e-books sur une même thématique, des visuels soignés, des mots-clés travaillés et de la régularité. Les frais Etsy (mise en vente, commission, paiement) sont à prendre en compte dans votre prix.</p>

      <h2>Check-list avant chaque publication</h2>
      <ul>{ETSY_CHECKLIST.map((c) => <li key={c}>{c}</li>)}</ul>
    </div>
  );
}
