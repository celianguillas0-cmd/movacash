import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, cheminSur, googleConfigured, googleRedirectUri } from "@/lib/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = cheminSur(url.searchParams.get("next"));
  if (!googleConfigured()) return NextResponse.redirect(new URL("/connexion?google=indisponible", url));
  const state = crypto.randomBytes(24).toString("hex");
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();
  const res = NextResponse.redirect(google);
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, next, tips: url.searchParams.get("tips") === "1" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
