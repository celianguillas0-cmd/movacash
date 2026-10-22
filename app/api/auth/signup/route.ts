import { z } from "zod";
import { getDb } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum").max(200),
  name: z.string().max(100).optional().default(""),
  quiz: z.unknown().optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les CGV" }) }),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
  const { email, password, name, quiz } = parsed.data;
  const db = getDb();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (exists) return fail("Un compte existe déjà avec cet email", 409);
  const r = db
    .prepare("INSERT INTO users (email, name, password_hash, quiz_json) VALUES (?, ?, ?, ?)")
    .run(email.toLowerCase(), name, await hashPassword(password), quiz ? JSON.stringify(quiz) : null);
  await createSession(Number(r.lastInsertRowid));
  return ok({ ok: true });
}
