import { z } from "zod";
import { batch } from "@/lib/db";
import { destroySession, getUserByEmail, verifyPassword } from "@/lib/auth";
import { fail, ok, withUser } from "@/lib/api";
import { stopSubscriptionNow } from "@/lib/stripe";

const schema = z.object({ password: z.string().min(1, "Mot de passe requis"), confirm: z.literal("SUPPRIMER", { errorMap: () => ({ message: "Tape SUPPRIMER pour confirmer" }) }) });

// Suppression définitive du compte, de ses e-books et de l'abonnement en cours
export async function DELETE(req: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Données invalides");
    const me = await getUserByEmail(user.email);
    if (!me || !(await verifyPassword(parsed.data.password, me.password_hash))) return fail("Mot de passe incorrect", 401);
    await stopSubscriptionNow(user);
    // Suppressions explicites : les clés étrangères ne sont pas forcément actives sur toutes les connexions Turso
    const id = [user.id];
    await batch([
      { sql: "DELETE FROM chapters WHERE ebook_id IN (SELECT id FROM ebooks WHERE user_id = ?)", args: id },
      { sql: "DELETE FROM ebooks WHERE user_id = ?", args: id },
      { sql: "DELETE FROM favorites WHERE user_id = ?", args: id },
      { sql: "DELETE FROM generations WHERE user_id = ?", args: id },
      { sql: "DELETE FROM password_resets WHERE user_id = ?", args: id },
      { sql: "UPDATE cancellations SET user_id = NULL WHERE user_id = ?", args: id },
      { sql: "DELETE FROM users WHERE id = ?", args: id },
    ]);
    await destroySession();
    return ok();
  });
}
