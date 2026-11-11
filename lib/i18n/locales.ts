// Langues du site : les langues officielles des pays de l'Union européenne, seule zone où Movacash est vendu
// (micro-entreprise sans TVA sous le seuil OSS de 10 000 € de ventes vers les autres pays de l'UE ; vérification du 06/11/2026).
// L'irlandais et le maltais sont couverts par l'anglais (drapeau britannique dans le menu, choix d'Aurèle du 11/11 ; lib/i18n/flags.ts).

export const LOCALES = [
  { code: "fr", nom: "Français" },
  { code: "en", nom: "English" },
  { code: "de", nom: "Deutsch" },
  { code: "es", nom: "Español" },
  { code: "it", nom: "Italiano" },
  { code: "pt", nom: "Português" },
  { code: "nl", nom: "Nederlands" },
  { code: "pl", nom: "Polski" },
  { code: "ro", nom: "Română" },
  { code: "cs", nom: "Čeština" },
  { code: "sk", nom: "Slovenčina" },
  { code: "hu", nom: "Magyar" },
  { code: "sv", nom: "Svenska" },
  { code: "da", nom: "Dansk" },
  { code: "fi", nom: "Suomi" },
  { code: "el", nom: "Ελληνικά" },
  { code: "bg", nom: "Български" },
  { code: "hr", nom: "Hrvatski" },
  { code: "sl", nom: "Slovenščina" },
  { code: "et", nom: "Eesti" },
  { code: "lv", nom: "Latviešu" },
  { code: "lt", nom: "Lietuvių" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const SOURCE_LOCALE: Locale = "fr";
export const LANG_COOKIE = "mc_lang";

export const isLocale = (s: string | undefined | null): s is Locale => LOCALES.some((l) => l.code === s);

// Langues parlées dans chaque pays où la vente est possible (la première sert par défaut).
export const COUNTRY_LANGS: Record<string, Locale[]> = {
  FR: ["fr"], MC: ["fr"], BE: ["nl", "fr", "de"], LU: ["fr", "de"],
  DE: ["de"], AT: ["de"], LI: ["de"], CH: ["de", "fr", "it"],
  IT: ["it"], SM: ["it"], VA: ["it"], ES: ["es"], AD: ["es", "fr"], PT: ["pt"],
  NL: ["nl"], PL: ["pl"], RO: ["ro"], CZ: ["cs"], SK: ["sk"], HU: ["hu"],
  SE: ["sv"], DK: ["da"], FI: ["fi", "sv"], GR: ["el"], CY: ["el", "en"],
  BG: ["bg"], HR: ["hr"], SI: ["sl"], EE: ["et"], LV: ["lv"], LT: ["lt"],
  IE: ["en"], MT: ["en"], US: ["en", "es"], CA: ["en", "fr"], AU: ["en"], NZ: ["en"],
  NO: ["en"], IS: ["en"],
};

// Pays où l'abonnement peut être payé : les 27 pays de l'UE, comme la règle Stripe Radar (cartes hors UE refusées).
// Ailleurs, l'inscription reste possible mais pas le paiement : TVA dès la première vente (Royaume-Uni…) ou risque juridique
// trop fort (États-Unis : la FTC poursuit les outils « IA + boutique en ligne pour gagner de l'argent »). Vérifié le 06/11/2026.
// COUNTRY_LANGS garde quelques pays hors UE seulement pour choisir la langue d'affichage.
export const EU_COUNTRIES = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"] as const;
export const SELLABLE_COUNTRIES = new Set<string>(EU_COUNTRIES);

// Choix de la langue : préférence enregistrée, sinon langue du navigateur si elle est parlée dans le pays, sinon langue du pays.
export function detectLocale(opts: { cookie?: string | null; country?: string | null; acceptLanguage?: string | null }): Locale {
  if (isLocale(opts.cookie)) return opts.cookie;
  const browser = (opts.acceptLanguage || "")
    .split(",")
    .map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase())
    .filter(Boolean);
  const country = (opts.country || "").toUpperCase();
  const langs = COUNTRY_LANGS[country];
  if (langs) {
    const fromBrowser = browser.find((b) => (langs as string[]).includes(b));
    return (fromBrowser as Locale) || langs[0];
  }
  const any = browser.find((b) => isLocale(b));
  return (any as Locale) || DEFAULT_LOCALE;
}
