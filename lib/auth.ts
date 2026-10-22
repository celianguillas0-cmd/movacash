import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "./db";

export const SESSION_COOKIE = "mc_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET manquant ou trop court");
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
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
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
    const uid = Number(payload.uid);
    const user = getDb().prepare("SELECT * FROM users WHERE id = ?").get(uid) as User | undefined;
    return user ?? null;
  } catch {
    return null;
  }
}

export function getUserById(id: number) {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}
