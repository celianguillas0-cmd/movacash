import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LANG_COOKIE } from "@/lib/i18n/locales";

// Référencement : ?lang=xx force la langue de la page (une adresse par langue pour Google)
// et la garde pour la suite de la visite. Le chemin est transmis pour les balises hreflang.
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-mc-path", req.nextUrl.pathname);
  const lang = req.nextUrl.searchParams.get("lang");
  if (isLocale(lang)) headers.set("x-mc-lang", lang);
  const res = NextResponse.next({ request: { headers } });
  if (isLocale(lang) && req.cookies.get(LANG_COOKIE)?.value !== lang) {
    res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
