// Client minimal pour l'API Gemini (REST, sans SDK).
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
