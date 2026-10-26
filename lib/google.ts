// Connexion avec Google (OAuth 2.0). Active seulement si GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont dans Vercel.
export const GOOGLE_STATE_COOKIE = "mc_google";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export const googleRedirectUri = (req: Request) => `${new URL(req.url).origin}/api/auth/google/callback`;

// N'accepte qu'un chemin interne, pour ne jamais renvoyer vers un autre site
export function cheminSur(next: string | null | undefined, defaut = "/app") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : defaut;
}
