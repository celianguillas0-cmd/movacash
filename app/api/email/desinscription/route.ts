import { desinscrire } from "@/lib/relances";

// Désinscription en un clic depuis la messagerie (en-tête List-Unsubscribe-Post, exigé par Gmail et Yahoo).
export async function POST(req: Request) {
  const url = new URL(req.url);
  const fait = await desinscrire(Number(url.searchParams.get("u")), url.searchParams.get("s") || "");
  return new Response(null, { status: fait ? 200 : 400 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return Response.redirect(new URL(`/desinscription${url.search}`, url), 303);
}
