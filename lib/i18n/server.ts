import { cookies, headers } from "next/headers";
import { detectLocale, LANG_COOKIE, SELLABLE_COUNTRIES, SOURCE_LOCALE, type Locale } from "./locales";
import { makeT, type Dict } from "./t";
import { MESSAGES } from "./messages";

// Pays du visiteur, donné par Vercel (absent en local).
export async function getCountry(): Promise<string | null> {
  const h = await headers();
  return (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").toUpperCase() || null;
}

export async function getLocale(): Promise<Locale> {
  const [jar, h] = await Promise.all([cookies(), headers()]);
  return detectLocale({ cookie: jar.get(LANG_COOKIE)?.value, country: await getCountry(), acceptLanguage: h.get("accept-language") });
}

export function getDict(locale: Locale): Dict {
  return locale === SOURCE_LOCALE ? {} : MESSAGES[locale] || {};
}

export async function getT() {
  const locale = await getLocale();
  return { t: makeT(getDict(locale)), locale };
}

// Paiement autorisé ? Sans pays connu (local, autre hébergeur), on laisse passer.
export async function canPayFromHere() {
  const c = await getCountry();
  return !c || SELLABLE_COUNTRIES.has(c);
}
