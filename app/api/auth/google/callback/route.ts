import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { one } from "@/lib/db";
import { createSession, getUserByEmail, hashPassword } from "@/lib/auth";
import { GOOGLE_STATE_COOKIE, cheminSur, googleConfigured, googleRedirectUri } from "@/lib/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse(jar.get(GOOGLE_STATE_COOKIE)?.value || "{}");
  } catch {}
  jar.delete(GOOGLE_STATE_COOKIE);
  const echec = (raison: string) => NextResponse.redirect(new URL(`/connexion?google=${raison}`, url));

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!googleConfigured()) return echec("indisponible");
  if (!code || !state || !saved.state || state !== saved.state) return echec("erreur");

  // Échange du code contre un jeton, puis lecture du profil (e-mail vérifié obligatoire)
  const tok = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(req),
      grant_type: "authorization_code",
    }),
  }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!tok?.access_token) return echec("erreur");
  const profil = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tok.access_token}` } })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const email = typeof profil?.email === "string" ? profil.email.trim().toLowerCase() : "";
  if (!email || profil.email_verified !== true) return echec("erreur");

  let user = await getUserByEmail(email);
  let nouveau = false;
  if (!user) {
    // Compte créé sans mot de passe utilisable ; « Mot de passe oublié » permet d'en définir un plus tard
    const name = String(profil.given_name || profil.name || "").trim().slice(0, 100);
    const r = await one<{ id: number }>("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING id", [
      email,
      name,
      await hashPassword(crypto.randomBytes(32).toString("hex")),
    ]);
    user = await getUserByEmail(email);
    nouveau = Boolean(r);
  }
  if (!user) return echec("erreur");
  if (user.banned) return echec("suspendu");
  await createSession(user.id);
  const next = cheminSur(saved.next);
  // Nouveau compte sans passer par le questionnaire : on l'y envoie (pas de raccourci vers l'atelier ni les formules)
  return NextResponse.redirect(new URL(nouveau && next !== "/quiz" ? "/quiz" : next, url));
}
