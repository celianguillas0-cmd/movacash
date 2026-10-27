import { fail, ok, withUser } from "@/lib/api";
import { APP_URL, isAdmin } from "@/lib/config";
import sitemap from "@/app/sitemap";

// Signale toutes les pages du sitemap à IndexNow (Bing, Yandex, Seznam, Naver… et donc la recherche de ChatGPT et Copilot,
// qui s'appuient sur Bing). À lancer depuis l'onglet Admin après l'ajout de pages. Clé publiée dans public/<clé>.txt.
const KEY = "d931adc6c2fd2bb10dd1e8dd8fcf3d42";

export async function POST() {
  return withUser(async (user) => {
    if (!isAdmin(user.email)) return fail("Introuvable", 404);
    const urlList = [...new Set(sitemap().map((u) => u.url))];
    const host = new URL(APP_URL).host;
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: KEY, keyLocation: `${APP_URL}/${KEY}.txt`, urlList }),
    }).catch(() => null);
    if (!r) return fail("IndexNow injoignable, réessaie plus tard.", 502);
    // 200 ou 202 : reçu. 422 : adresses refusées (domaine différent de la clé).
    if (r.status !== 200 && r.status !== 202) return fail(`IndexNow a répondu ${r.status}.`, 502);
    return ok({ envoyees: urlList.length });
  });
}
