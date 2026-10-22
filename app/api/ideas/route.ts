import { getCurrentUser } from "@/lib/auth";
import { searchIdeas } from "@/lib/ideas";
import { ok } from "@/lib/api";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const sp = new URL(req.url).searchParams;
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  // Les visiteurs non connectés ne voient qu'un aperçu
  const res = searchIdeas({
    q: sp.get("q") || undefined,
    category: sp.get("category") || undefined,
    difficulty: num("difficulty"),
    sensitive: (sp.get("sensitive") as "all" | "none" | "only") || "all",
    minDemand: num("minDemand"),
    maxCompetition: num("maxCompetition"),
    sort: (sp.get("sort") as never) || "opportunity",
    favoritesOf: sp.get("favorites") === "1" && user ? user.id : undefined,
    userId: user?.id,
    page: user ? num("page") : 1,
    pageSize: user ? num("pageSize") || 24 : 12,
  });
  return ok(res);
}
