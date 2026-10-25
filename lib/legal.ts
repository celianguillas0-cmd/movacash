import { SUPPORT_EMAIL } from "./config";

// Informations légales de l'éditeur, renseignées dans Vercel (Settings → Environment Variables).
// Tant qu'une variable manque, la page affiche [à compléter] et l'onglet Admin la signale.
const v = (k: string) => (process.env[k] || "").trim();

export function legal() {
  return {
    nom: v("LEGAL_NOM"), // ex. « Aurèle Dupont EI »
    siret: v("LEGAL_SIRET"),
    adresse: v("LEGAL_ADRESSE"), // adresse postale complète (domiciliation acceptée)
    email: v("LEGAL_EMAIL") || SUPPORT_EMAIL,
    telephone: v("LEGAL_TELEPHONE"),
    mediateurNom: v("MEDIATEUR_NOM"),
    mediateurSite: v("MEDIATEUR_SITE"),
    mediateurAdresse: v("MEDIATEUR_ADRESSE"),
  };
}

export const LEGAL_VARS: [key: keyof ReturnType<typeof legal>, env: string, label: string][] = [
  ["nom", "LEGAL_NOM", "Ton prénom, ton nom et la mention EI"],
  ["siret", "LEGAL_SIRET", "Ton numéro SIRET"],
  ["adresse", "LEGAL_ADRESSE", "Ton adresse postale (ou celle d'une domiciliation)"],
  ["email", "LEGAL_EMAIL", "L'e-mail de contact"],
  ["telephone", "LEGAL_TELEPHONE", "Un numéro de téléphone"],
  ["mediateurNom", "MEDIATEUR_NOM", "Le nom de ton médiateur de la consommation"],
  ["mediateurSite", "MEDIATEUR_SITE", "Le site internet du médiateur"],
];

export function missingLegal() {
  const l = legal();
  return LEGAL_VARS.filter(([k]) => !l[k]);
}

export const fill = (s: string) => s || "[à compléter]";
