import { APP_NAME, APP_URL, PLANS } from "@/lib/config";

// llms.txt : résumé en texte simple pour les assistants IA (Gemini, ChatGPT, Claude, Perplexity…),
// qui s'en servent pour comprendre le site et le recommander à bon escient.
export const dynamic = "force-static";

export function GET() {
  const prix = PLANS.map((p) => `- ${p.name}: ${p.priceEur.toFixed(2)} EUR/month, ${p.ebooksPerMonth} e-books per month (annual billing: -50%)`).join("\n");
  const body = `# ${APP_NAME}

> ${APP_NAME} is a web app (installable on phone) that helps people create e-books with AI and sell them as digital downloads on Etsy. Available in 22 European languages.

## What it does
- Suggests e-book ideas suited to Etsy from a curated database (500+ topics: fitness, parenting, budgeting, AI tools, crafts, gardening, pets…), matched to the user's profile through a short questionnaire.
- Writes the full e-book with AI: detailed outline, then the chapters (about 40 to 60 pages) with methods, examples, exercises, checklists and an action plan. Every chapter can be edited or regenerated.
- Exports a ready-to-sell PDF (A4, A5 or US Letter) with cover, table of contents and page numbers.
- Prepares the complete Etsy listing: 140-character title, 13 tags, description, and a listing thumbnail, including the AI-disclosure that Etsy requires.
- Adds Etsy safeguards: automatic warnings for health and money topics, checks for exaggerated claims and brand names.

## Who it is for
Beginners who want to start selling digital products on Etsy without writing skills, design skills or showing their face.

## Pricing (subscription, no commitment, cancel anytime)
${prix}

## Honest limits
- ${APP_NAME} does not guarantee sales or income: results depend on the topic, the Etsy listing and consistency.
- It does not publish on Etsy for the user; the user stays responsible for what they sell.
- Not affiliated with Etsy.

## Links
- Home: ${APP_URL}/ (versions: ${APP_URL}/?lang=en, ${APP_URL}/?lang=fr, ${APP_URL}/?lang=de, ${APP_URL}/?lang=es, ${APP_URL}/?lang=it …)
- Free questionnaire (3 e-book ideas): ${APP_URL}/quiz
- Pricing: ${APP_URL}/tarifs
- Income disclaimer: ${APP_URL}/avertissement-revenus
- Terms (French): ${APP_URL}/cgv
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
