import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { one } from "./db";

export const SESSION_COOKIE = "mc_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    // Sans AUTH_SECRET : clé dérivée de l'adresse de la base (secrète elle aussi), sinon clé de développement
    // (en production, seulement en mode démo sans base, où rien n'est conservé).
    const db = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (db) return new TextEncoder().encode(sha256(`movacash-session:${db}`));
    return new TextEncoder().encode("dev-only-secret-change-me-please-123");
  }
  return new TextEncoder().encode(s);
}

export interface User {
  id: number;
  email: string;
  name: string;
  plan: string | null;
  sub_status: string;
  current_period_end: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  is_demo_sub: number;
  quiz_json: string | null;
  created_at: number;
  billing_interval: "month" | "year";
  cancel_at_period_end: number;
  quota_plan: string | null;
  quota_plan_until: number | null;
  session_version: number;
  author_name: string;
  default_language: string | null;
  default_tone: string | null;
  email_tips: number;
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId: number) {
  // La version de session invalide les anciennes connexions (changement de mot de passe, « déconnecter partout »)
  const u = await one<{ session_version: number }>("SELECT session_version FROM users WHERE id = ?", [userId]);
  const token = await new SignJWT({ uid: userId, sv: u?.session_version ?? 1 })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const user = await getUserById(Number(payload.uid));
    if (!user || Number(payload.sv ?? 1) !== user.session_version) return null;
    return user;
  } catch {
    return null;
  }
}

export function getUserById(id: number) {
  return one<User>("SELECT * FROM users WHERE id = ?", [id]);
}

export function getUserByEmail(email: string) {
  return one<User & { password_hash: string }>("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
}

// Pour les pages de l'espace client : renvoie vers la connexion si la session a expiré
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}
