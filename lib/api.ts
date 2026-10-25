import { NextResponse } from "next/server";
import { getCurrentUser, type User } from "./auth";
import { usageContext } from "./usage-context";

export const ok = (data: unknown = { ok: true }, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function withUser<T>(fn: (user: User) => Promise<T> | T): Promise<T | NextResponse> {
  const user = await getCurrentUser();
  if (!user) return fail("Non connecté", 401);
  try {
    // Le compte est mémorisé pour rattacher les dépenses API à cet utilisateur
    return await usageContext.run({ userId: user.id }, () => fn(user));
  } catch (e) {
    console.error(e);
    return fail(e instanceof Error ? e.message : "Erreur serveur", 500);
  }
}
