import { one, run } from "./db";

// Limite simple stockée en base (fonctionne aussi sur Vercel, où la mémoire n'est pas partagée)
export async function rateLimit(key: string, max: number, windowSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const row = await one<{ count: number; reset_at: number }>("SELECT count, reset_at FROM rate_limits WHERE key = ?", [key]);
  if (!row || row.reset_at <= now) {
    await run("INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)", [key, now + windowSec]);
    return true;
  }
  if (row.count >= max) return false;
  await run("UPDATE rate_limits SET count = count + 1 WHERE key = ?", [key]);
  return true;
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
