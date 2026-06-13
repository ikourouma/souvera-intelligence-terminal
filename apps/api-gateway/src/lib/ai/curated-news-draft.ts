/**
 * AI-assisted curated news drafting.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise builds a structured draft from sources.
 */

export interface DraftSourceInput {
  sourceName: string;
  sourceUrl: string;
  snippet?: string;
}

export interface CuratedNewsDraft {
  title: string;
  summary: string;
  bodyMd: string;
  themes: string[];
  aiGenerated: boolean;
}

function fallbackDraft(sources: DraftSourceInput[]): CuratedNewsDraft {
  const primary = sources[0];
  const refs = sources
    .map((s, i) => `[${i + 1}] ${s.sourceName}: ${s.snippet ?? s.sourceUrl}`)
    .join('\n');

  return {
    title: primary?.sourceName
      ? `Market update: ${primary.sourceName} signals shift across Africa & Caribbean`
      : 'Souvera market intelligence brief',
    summary:
      primary?.snippet?.slice(0, 280) ??
      'Cross-market developments with implications for African and Caribbean economies — Souvera editorial analysis with source attribution.',
    bodyMd: `## What happened

${sources.map((s) => `- **${s.sourceName}**: ${s.snippet ?? 'See reference link for full context.'}`).join('\n')}

## Souvera read

Souvera analysts synthesize these signals against macro, trade, and sector data in the intelligence terminal. This draft is for editorial review — refine voice and add country-specific context before publishing.

## References

${refs}`,
    themes: ['trade', 'policy'],
    aiGenerated: false,
  };
}

async function openAiDraft(sources: DraftSourceInput[]): Promise<CuratedNewsDraft> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackDraft(sources);

  const sourceBlock = sources
    .map(
      (s, i) =>
        `[${i + 1}] ${s.sourceName}\nURL: ${s.sourceUrl}\n${s.snippet ? `Excerpt: ${s.snippet}` : ''}`
    )
    .join('\n\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are Souvera's editorial intelligence writer covering African and Caribbean markets.
Write original analysis in Souvera's voice — authoritative, concise, source-attributed.
Return JSON: { "title": string (max 90 chars, captivating), "summary": string (max 280 chars), "bodyMd": string (markdown, 3-5 paragraphs with ## sections), "themes": string[] (from: trade, policy, fx, fdi, energy, sector) }
Do not plagiarize excerpts. Paraphrase and synthesize. Reference sources by name in body.`,
        },
        {
          role: 'user',
          content: `Draft a curated news article from these references:\n\n${sourceBlock}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error('OpenAI draft failed:', await response.text());
    return fallbackDraft(sources);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return fallbackDraft(sources);

  try {
    const parsed = JSON.parse(content) as CuratedNewsDraft;
    return {
      title: parsed.title?.slice(0, 90) ?? fallbackDraft(sources).title,
      summary: parsed.summary?.slice(0, 280) ?? fallbackDraft(sources).summary,
      bodyMd: parsed.bodyMd ?? fallbackDraft(sources).bodyMd,
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : ['trade'],
      aiGenerated: true,
    };
  } catch {
    return fallbackDraft(sources);
  }
}

export async function generateCuratedNewsDraft(
  sources: DraftSourceInput[]
): Promise<CuratedNewsDraft> {
  if (!sources.length) {
    throw new Error('At least one source reference is required');
  }
  return openAiDraft(sources);
}
