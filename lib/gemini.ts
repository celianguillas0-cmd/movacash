// Client minimal pour l'API Gemini (REST, sans SDK).
import { recordImage, recordText } from "./usage";
import { tk } from "./i18n/t";
const API = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiError extends Error {}

interface GenOptions {
  system?: string;
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}

// Modèles essayés dans l'ordre. Google retire régulièrement des modèles (404 NOT_FOUND, ex. gemini-2.5-flash fermé
// aux nouveaux comptes le 01/11/2026) : on passe alors au suivant et on garde celui qui marche.
const MODELES = [...new Set([process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-3-flash", "gemini-flash-latest", "gemini-2.5-flash"].filter(Boolean) as string[])];
let modeleOk: string | null = null;
// Message montré au client quand le quota Gemini est épuisé (traduit dans lib/i18n/messages).
export const QUOTA = tk("La rédaction est momentanément indisponible. Réessaie un peu plus tard.");

// Coupe la « réflexion » (inutile pour la rédaction, elle multiplie le coût de sortie) avec le réglage de chaque génération.
function reflexion(model: string, sans: boolean) {
  if (sans) return {};
  if (model.startsWith("gemini-2.5")) return { thinkingConfig: { thinkingBudget: Number(process.env.GEMINI_THINKING_BUDGET || 0) } };
  return { thinkingConfig: { thinkingLevel: process.env.GEMINI_THINKING_LEVEL || "low" } };
}

export async function geminiGenerate(prompt: string, opts: GenOptions = {}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY non configurée");
  const liste = modeleOk ? [modeleOk, ...MODELES.filter((m) => m !== modeleOk)] : MODELES;
  let lastErr = "";
  let quota = false;
  for (const model of liste) {
    let sansReflexion = false;
    for (let attempt = 0; attempt < 4; attempt++) {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
        generationConfig: {
          temperature: opts.temperature ?? 0.8,
          maxOutputTokens: opts.maxOutputTokens ?? 32000,
          ...(opts.json ? { responseMimeType: "application/json" } : {}),
          ...reflexion(model, sansReflexion),
        },
      };
      const res = await fetch(`${API}/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        modeleOk = model;
        const data = await res.json();
        const cand = data.candidates?.[0];
        const text: string = (cand?.content?.parts || [])
          .filter((p: { thought?: boolean }) => !p.thought)
          .map((p: { text?: string }) => p.text || "")
          .join("");
        const u = data.usageMetadata || {};
        await recordText(model, Number(u.promptTokenCount || 0), Number(u.candidatesTokenCount || 0) + Number(u.thoughtsTokenCount || 0));
        if (!text) throw new GeminiError(`Réponse vide de Gemini (${cand?.finishReason || data.promptFeedback?.blockReason || "inconnu"})`);
        return text;
      }
      const txt = await res.text().catch(() => "");
      lastErr = `${res.status} ${txt}`.slice(0, 500);
      // Réglage de réflexion refusé par ce modèle : on réessaie sans.
      if (res.status === 400 && /thinking/i.test(txt) && !sansReflexion) { sansReflexion = true; attempt--; continue; }
      if (res.status === 404 || (res.status === 400 && /model/i.test(txt) && /not (found|supported)|no longer/i.test(txt))) break; // modèle retiré : suivant
      // Quota gratuit du jour épuisé pour ce modèle : réessayer ne sert à rien, on passe au modèle suivant (quotas séparés).
      if (res.status === 429 && /per ?day|PerDay|free_tier|quota/i.test(txt)) { quota = true; break; }
      if (![429, 500, 502, 503, 504].includes(res.status)) throw new GeminiError(`Erreur Gemini : ${lastErr}`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      if (attempt === 3) throw new GeminiError(`Erreur Gemini : ${lastErr}`);
    }
  }
  console.error(`Erreur Gemini : ${lastErr}`);
  throw new GeminiError(quota ? QUOTA : `Erreur Gemini : ${lastErr}`);
}

export function parseJsonLoose<T>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new GeminiError("Réponse JSON invalide de Gemini");
  }
}

// Photo réaliste pour la miniature Etsy (Imagen 4 Fast, environ 0,02 $ l'image). Le texte est posé ensuite par la mise en page.
export async function imagenPhoto(prompt: string): Promise<{ mime: string; b64: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY non configurée");
  const model = process.env.IMAGEN_MODEL || "imagen-4.0-fast-generate-001";
  const res = await fetch(`${API}/${model}:predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: "4:3", personGeneration: "allow_adult" } }),
  });
  if (!res.ok) throw new GeminiError(`Erreur Imagen : ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`);
  const data = await res.json();
  const p = data.predictions?.[0];
  if (p?.bytesBase64Encoded) await recordImage(model);
  if (!p?.bytesBase64Encoded) throw new GeminiError("Aucune image renvoyée (sujet refusé par le filtre ?)");
  return { mime: p.mimeType || "image/png", b64: p.bytesBase64Encoded };
}
