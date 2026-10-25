import { NextResponse } from "next/server";
import { isLocale, LANG_COOKIE } from "@/lib/i18n/locales";

// Langue choisie à la main dans le sélecteur : gardée un an.
export async function POST(req: Request) {
  const { locale } = await req.json().catch(() => ({}));
  if (!isLocale(locale)) return NextResponse.json({ error: "Langue inconnue" }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LANG_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
