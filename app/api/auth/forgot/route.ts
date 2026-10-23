import crypto from "node:crypto";
import { run } from "@/lib/db";
import { getUserByEmail, sha256 } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { APP_NAME, APP_URL } from "@/lib/config";
import { isEmailConfigured, sendEmail, signature } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/ratelimit";

// Envoie un lien de réinitialisation valable 1 heure. Même réponse que le compte existe ou non.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) return fail("Indique ton adresse e-mail");
  if (!(await rateLimit(`forgot:${clientIp(req)}`, 5, 60 * 60)) || !(await rateLimit(`forgot:${email.toLowerCase()}`, 3, 60 * 60)))
    return fail("Trop de demandes. Réessaie dans une heure.", 429);
  const user = await getUserByEmail(email);
  let devLink: string | undefined;
  if (user) {
    const token = crypto.randomBytes(32).toString("base64url");
    await run("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, unixepoch() + 3600)", [sha256(token), user.id]);
    const link = `${APP_URL}/mot-de-passe/nouveau?token=${token}`;
    await sendEmail(
      user.email,
      `${APP_NAME} : réinitialise ton mot de passe`,
      `Bonjour${user.name ? ` ${user.name}` : ""},\n\nTu as demandé à changer ton mot de passe. Clique sur ce lien (valable 1 heure) :\n${link}\n\nSi tu n'es pas à l'origine de cette demande, ignore cet e-mail : ton mot de passe ne change pas.${signature}`
    );
    // Sans service d'e-mail en local, le lien est renvoyé pour pouvoir tester
    if (!isEmailConfigured() && process.env.NODE_ENV !== "production") devLink = link;
  }
  return ok({ ok: true, devLink });
}
