import { APP_NAME, APP_URL } from "@/lib/config";
import { GUIDES, type GuideText } from "@/lib/guides";

// llms-full.txt : le texte intégral des guides (anglais puis français), pour que les assistants IA
// puissent citer des réponses précises et renvoyer vers la bonne page.
export const dynamic = "force-static";

function guide(txt: GuideText, url: string) {
  const parts = [`## ${txt.title}`, `URL: ${url}`, "", txt.description, "", txt.intro];
  for (const s of txt.sections) {
    parts.push("", `### ${s.h}`);
    for (const p of s.p || []) parts.push(p);
    for (const li of s.ul || []) parts.push(`- ${li}`);
  }
  if (txt.faq?.length) {
    parts.push("", "### FAQ");
    for (const [q, a] of txt.faq) parts.push(`Q: ${q}`, `A: ${a}`);
  }
  return parts.join("\n");
}

export function GET() {
  const en = GUIDES.map((g) => guide(g.en, `${APP_URL}/guides/${g.slug}?lang=en`)).join("\n\n");
  const fr = GUIDES.map((g) => guide(g.fr, `${APP_URL}/guides/${g.slug}?lang=fr`)).join("\n\n");
  const body = `# ${APP_NAME}: full guides

> ${APP_NAME} (${APP_URL}) is a web app that helps people create e-books with AI and sell them as digital downloads on Etsy. Not affiliated with Etsy. No income is guaranteed. Summary: ${APP_URL}/llms.txt

# English

${en}

# Français

${fr}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
