import { ETSY_CHECKLIST } from "@/lib/etsy";
import { getT } from "@/lib/i18n/server";
import { rich } from "@/lib/i18n/rich";

export default async function EtsyGuide() {
  const { t } = await getT();
  const lien = (href: string) => (s: string) => <a className="underline" href={href} target="_blank" rel="noreferrer">{s}</a>;
  return (
    <div className="prose-legal max-w-3xl">
      <p className="eyebrow-ws">{t("Guide")}</p>
      <h1 className="h1 mb-4 mt-2">{t("Vendre ses e-books sur Etsy : les règles à respecter")}</h1>
      <p>{rich(t("Ce guide résume les points essentiels. Les règles d'Etsy évoluent : vérifie toujours les pages officielles avant de publier (<1>normes de créativité</1>, <2>articles interdits</2>)."), { 1: lien("https://www.etsy.com/legal/creativity"), 2: lien("https://www.etsy.com/legal/prohibited") })}</p>

      <h2>{t("1. Contenu créé avec l'IA : divulgation obligatoire")}</h2>
      <p>{t("Etsy accepte les créations conçues par le vendeur à l'aide d'outils d'IA (catégorie « Designed by »), à condition de l'indiquer dans la description de l'annonce. Le kit Etsy généré ajoute cette mention automatiquement et le PDF la reprend sur la page de droits. Ne la supprime pas.")}</p>

      <h2>{t("2. Ton contenu, pas celui des autres")}</h2>
      <p>{t("Revendre tels quels des fichiers achetés ou récupérés (PLR, packs « droits de revente ») n'est pas autorisé. Chaque e-book généré ici est créé à partir de tes choix (sujet, public, ton, consignes) et de tes modifications : relis-le et personnalise-le, c'est aussi ce qui fera la différence face aux autres vendeurs.")}</p>

      <h2>{t("3. Sujets santé, nutrition, sport, argent")}</h2>
      <ul>
        <li>{t("Aucune allégation médicale (guérir, traiter, soigner) : Etsy interdit les produits qui font des promesses médicales.")}</li>
        <li>{t("Aucune promesse de résultat chiffré garanti (« perdez 10 kg », « gagnez 3000 €/mois »).")}</li>
        <li>{t("Un avertissement clair : le guide est informatif et ne remplace pas un professionnel. Il est ajouté automatiquement au PDF pour les sujets marqués sensibles.")}</li>
      </ul>

      <h2>{t("4. Marques et propriété intellectuelle")}</h2>
      <p>{t("Tu peux parler de TikTok, Vinted ou Canva pour décrire le sujet, mais n'utilise pas leurs logos et ne laisse pas croire à un partenariat. Ajoute « non affilié à … » dans la description.")}</p>

      <h2>{t("5. Une fiche honnête et complète")}</h2>
      <p>{t("Indique le format (PDF numérique, nombre de pages), précise qu'aucun envoi physique n'a lieu, montre de vraies pages intérieures et fixe un prix cohérent avec la longueur réelle.")}</p>

      <h2>{t("6. Réalisme sur les ventes")}</h2>
      <p>{t("Publier ne suffit pas à vendre. Ce qui marche le mieux : des sujets précis plutôt que génériques, plusieurs e-books sur une même thématique, des visuels soignés, des mots-clés travaillés et de la régularité. Les frais Etsy (mise en vente, commission, paiement) sont à prendre en compte dans ton prix.")}</p>

      <h2>{t("Check-list avant chaque publication")}</h2>
      <ul>{ETSY_CHECKLIST.map((c) => <li key={c}>{t(c)}</li>)}</ul>
    </div>
  );
}
