import { z } from "zod";
import { one } from "@/lib/db";
import { createSession, getUserByEmail, hashPassword } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const schema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide").max(200),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum").max(200),
  name: z.string().trim().max(100).optional().default(""),
  quiz: z.unknown().optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Tu dois accepter les CGV" }) }),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
  if (!(await rateLimit(`signup:${clientIp(req)}`, 10, 60 * 60))) return fail("Trop d'inscriptions depuis cette connexion. Réessaie plus tard.", 429);
  const { email, password, name, quiz } = parsed.data;
  if (await getUserByEmail(email)) return fail("Un compte existe déjà avec cet e-mail. Connecte-toi ou utilise « Mot de passe oublié ».", 409);
  const quizJson = quiz ? JSON.stringify(quiz) : null;
  const r = await one<{ id: number }>("INSERT INTO users (email, name, password_hash, quiz_json) VALUES (?, ?, ?, ?) RETURNING id", [
    email.toLowerCase(),
    name,
    await hashPassword(password),
    quizJson && quizJson.length < 8000 ? quizJson : null,
  ]);
  await createSession(r!.id);
  return ok({ ok: true });
}
