// Client minimal pour l'API Gemini (REST, sans SDK).
import { recordImage, recordText } from "./usage";
const API = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiError extends Error {}

interface GenOptions {
  system?: string;
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}

export async function geminiGenerate(prompt: string, opts: GenOptions = {}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY non configurée");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
    generationConfig: {
      temperature: opts.temperature ?? 0.8,
      maxOutputTokens: opts.maxOutputTokens ?? 32000,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
      // La rédaction n'a pas besoin de « réflexion » : la couper divise le coût de sortie, sans changer le texte rendu.
      ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: Number(process.env.GEMINI_THINKING_BUDGET || 0) } } : {}),
    },
  };

  let lastErr = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${API}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });
    if (res.ok) {
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
    lastErr = `${res.status} ${await res.text().catch(() => "")}`.slice(0, 500);
    if (![429, 500, 502, 503, 504].includes(res.status)) break;
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
  }
  throw new GeminiError(`Erreur Gemini : ${lastErr}`);
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
