import { all } from "@/lib/db";
import { withUser } from "@/lib/api";

// Export RGPD : toutes les données du compte au format JSON
export async function GET() {
  return withUser(async (user) => {
    const ebooks = await all<{ id: number }>("SELECT * FROM ebooks WHERE user_id = ? ORDER BY id", [user.id]);
    const chapters = await all<{ ebook_id: number }>("SELECT c.* FROM chapters c JOIN ebooks e ON e.id = c.ebook_id WHERE e.user_id = ? ORDER BY c.ebook_id, c.idx", [user.id]);
    const favorites = await all("SELECT i.title, f.created_at FROM favorites f JOIN ideas i ON i.id = f.idea_id WHERE f.user_id = ?", [user.id]);
    const data = {
      exported_at: new Date().toISOString(),
      account: {
        email: user.email, name: user.name, author_name: user.author_name, created_at: new Date(user.created_at * 1000).toISOString(),
        plan: user.plan, subscription_status: user.sub_status, billing_interval: user.billing_interval,
        current_period_end: user.current_period_end ? new Date(user.current_period_end * 1000).toISOString() : null,
        questionnaire: user.quiz_json ? JSON.parse(user.quiz_json) : null,
      },
      favorites,
      ebooks: ebooks.map((e) => ({ ...e, chapters: chapters.filter((c) => c.ebook_id === e.id) })),
    };
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="movacash-mes-donnees.json"` },
    });
  });
}
