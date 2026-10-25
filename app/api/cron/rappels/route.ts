import { all, run } from "@/lib/db";
import type { User } from "@/lib/auth";
import { emailRenewalReminder } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lancé chaque matin par Vercel (vercel.json). Abonnements annuels : rappel par e-mail entre 60 et 30 jours avant
// la reconduction, une seule fois par période (art. L215-1 du Code de la consommation : au plus tôt 3 mois, au plus tard 1 mois avant).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  const allowed = secret ? auth === `Bearer ${secret}` : (req.headers.get("user-agent") || "").startsWith("vercel-cron");
  if (!allowed) return new Response("Non autorisé", { status: 401 });

  const now = Math.floor(Date.now() / 1000);
  const users = await all<User>(
    `SELECT * FROM users WHERE billing_interval = 'year' AND is_demo_sub = 0 AND cancel_at_period_end = 0
       AND sub_status IN ('active', 'trialing') AND current_period_end > ? AND current_period_end <= ?
       AND (renewal_reminded_for IS NULL OR renewal_reminded_for <> current_period_end)`,
    [now + 30 * 86400, now + 60 * 86400]
  );
  let envoyes = 0;
  for (const u of users) {
    // Sans service d'e-mail, rien n'est marqué : le rappel partira dès que Resend sera branché
    if (!(await emailRenewalReminder(u))) continue;
    await run("UPDATE users SET renewal_reminded_for = ? WHERE id = ?", [u.current_period_end, u.id]);
    envoyes++;
  }
  return Response.json({ ok: true, rappels: envoyes });
}
