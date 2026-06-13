/**
 * Server-only Gemini client for trade intelligence narratives.
 * Uses REST API — no client bundle exposure of GEMINI_API_KEY.
 */

import { env } from '@souvera/config';

export interface GeminiGenerateOptions {
  systemInstruction?: string;
  prompt: string;
  model?: string;
}

export interface GeminiGenerateResult {
  text: string;
  model: string;
  fromCache?: boolean;
}

export function isGeminiConfigured(): boolean {
  return Boolean(env.ai.geminiApiKey());
}

export async function generateGeminiContent(
  options: GeminiGenerateOptions
): Promise<GeminiGenerateResult> {
  const apiKey = env.ai.geminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = options.model ?? env.ai.geminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
  };
  if (options.systemInstruction) {
    body.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  if (!text) {
    throw new Error('Gemini returned empty content');
  }

  return { text, model };
}
