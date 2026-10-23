import { z } from "zod";
import { batch, one } from "@/lib/db";
import { createSession, hashPassword, sha256 } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

const schema = z.object({ token: z.string().min(20).max(200), password: z.string().min(8, "Mot de passe : 8 caractères minimum").max(200) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
  const hash = sha256(parsed.data.token);
  const row = await one<{ user_id: number }>("SELECT user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > unixepoch()", [hash]);
  if (!row) return fail("Ce lien a expiré ou a déjà servi. Refais une demande.", 400);
  await batch([
    { sql: "UPDATE password_resets SET used_at = unixepoch() WHERE user_id = ? AND used_at IS NULL", args: [row.user_id] },
    // Nouveau mot de passe : toutes les sessions ouvertes sont déconnectées
    { sql: "UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?", args: [await hashPassword(parsed.data.password), row.user_id] },
  ]);
  await createSession(row.user_id);
  return ok();
}
