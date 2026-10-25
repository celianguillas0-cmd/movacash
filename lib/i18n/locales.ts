// Langues du site : celles des pays où Aurèle peut vendre sans TVA en micro-entreprise
// (Union européenne sous le seuil OSS de 10 000 €, plus États-Unis, Canada, Australie, Nouvelle-Zélande, Suisse, Norvège, Islande, Liechtenstein).
// L'irlandais et le maltais sont couverts par l'anglais.

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

// Pays où l'abonnement peut être payé. Ailleurs, l'inscription reste possible mais pas le paiement :
// soit il faudrait une immatriculation à la TVA dès la première vente (Royaume-Uni, Mexique, Inde, Turquie…),
// soit les règles n'ont pas été vérifiées.
export const SELLABLE_COUNTRIES = new Set(Object.keys(COUNTRY_LANGS));

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
