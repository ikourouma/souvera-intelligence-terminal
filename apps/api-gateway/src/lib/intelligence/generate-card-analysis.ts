/**
 * AI-powered card analysis generation for PNG exports
 * Uses OpenAI with curated multi-paragraph fallbacks
 */

import {
  buildTradeTabCardAnalysis,
  buildUsTradeCardAnalysis,
} from '@/lib/intelligence/us-trade-card-analysis';
import type { CountryTrade } from '@/types/country-intelligence';

export type CardAnalysisType =
  | 'signal_strength'
  | 'economic_momentum'
  | 'news_pulse'
  | 'quick_stats'
  | 'agoa_flows'
  | 'agoa_tracker'
  | 'demand_matrix'
  | 'supply_demand'
  | 'afcfta_flows'
  | 'cbtpa_flows'
  | 'intra_regional'
  | 'trade_partners'
  | 'trade_composition'
  | 'trade_finance'
  | 'regional_agreements';

export interface CardAnalysisInput {
  cardType: CardAnalysisType;
  countryName: string;
  iso3: string;
  data: Record<string, number | string | null | undefined>;
  /** Optional trade snapshot for US trade relationship curated analysis */
  trade?: CountryTrade;
}

export interface CardAnalysis {
  analysis: string;
  aiGenerated: boolean;
}

function buildCuratedFallback(input: CardAnalysisInput): string | null {
  const { cardType, countryName, iso3, data, trade } = input;

  if (cardType === 'agoa_tracker' && trade) {
    return buildUsTradeCardAnalysis({ countryName, iso3, trade });
  }

  if (['intra_regional', 'trade_partners', 'trade_composition', 'trade_finance', 'regional_agreements'].includes(cardType)) {
    return buildTradeTabCardAnalysis({ cardType, countryName, iso3, data });
  }

  return null;
}

/**
 * Fallback analysis when AI is unavailable
 */
function fallbackAnalysis(input: CardAnalysisInput): CardAnalysis {
  const { cardType, countryName } = input;
  const curated = buildCuratedFallback(input);
  if (curated) {
    return { analysis: curated, aiGenerated: false };
  }

  const templates: Record<string, string> = {
    signal_strength: `${countryName} demonstrates measurable investment signals based on quantitative scoring. SOUVERA analysis aggregates macro fundamentals, policy stability, and market access to generate actionable intelligence for institutional investors.\n\nInvestment score trajectories reflect composite weighting across governance, macro stability, and market-access frameworks — the primary lens for sizing sovereign and private-market exposure.\n\nNear-term positioning should stress-test policy registry changes and FX convertibility before committing long-dated capital.`,
    economic_momentum: `${countryName}'s economic trajectory reflects real-time momentum indicators and investor readiness metrics. SOUVERA tracks leading indicators to identify inflection points ahead of consensus market views.\n\nMomentum bands translate GDP growth, reform cadence, and capital-flow signals into a single readiness clause for export and FDI operators.\n\nInstitutional allocators should align entry timing with momentum inflection rather than lagging headline GDP prints.`,
    news_pulse: `${countryName}'s news sentiment reflects market-moving developments across policy, trade, and investment themes. SOUVERA synthesizes multilingual sources to deliver edge on emerging opportunities and risks.\n\nRisk and opportunity intensity scores decompose headline noise into actionable themes — tariff policy, FX, security, and sector regulation.\n\nOperators should treat sentiment spikes as triggers for policy-registry verification, not standalone trade signals.`,
    quick_stats: `${countryName}'s macro fundamentals provide foundational context for investment decisions. SOUVERA curates verified data from multilateral institutions to ensure accuracy and comparability across 74 markets.\n\nPopulation scale, nominal GDP, and signal metrics together define addressable market depth and institutional liquidity constraints.\n\nCross-market comparability is the core SOUVERA value: size the opportunity only after normalising for policy access and data vintage.`,
    agoa_flows: `${countryName} AGOA trade flows combine MFN totals with preferential utilisation rates. SOUVERA distinguishes duty-free volumes from standard-tariff exports to size the true policy premium.\n\nCategory-level concentration flags rules-of-origin compliance risk and logistics dependencies that headline totals obscure.\n\nExport operators should prioritise categories with both high U.S. demand intensity and verified AGOA eligibility under current USTR guidance.`,
    agoa_tracker: `${countryName} U.S. trade relationship analysis requires bilateral flow context, preferential eligibility status, and reauthorisation watchpoints. SOUVERA integrates Evidence Vault policy status with Comtrade-derived flow metrics.\n\nPreferential export volumes exclude ineligible lines (notably crude petroleum under AGOA) and surface the diversification gap versus modeled potential.\n\nCorridor strategy should anchor on rules-of-origin compliance, trade-finance availability, and December 2026 reauthorisation timing.`,
    demand_matrix: `${countryName} demand signal matrix quantifies U.S. import pull by product category using census-derived volumes, growth trajectories, and diversification pressure. SOUVERA normalises demand intensity across 74 markets for cross-border comparability.\n\nCategory-level demand scores reflect five-year CAGR, incumbent supplier concentration, and policy incentive alignment — the primary lens for sizing export corridors.\n\nOperators should validate HS-line eligibility and logistics cost before scaling offtake against headline demand scores.`,
    supply_demand: `The Supply-Demand Matrix maps export capacity against U.S. import demand by sector across African and Caribbean markets. SOUVERA synthesises supply scores, demand scores, and opportunity tiers into investor-ready corridor signals.\n\nComposite opportunity scoring weights preferential eligibility, infrastructure readiness, and competitive landscape pressure from incumbent suppliers.\n\nInstitutional allocators should stress-test rules-of-origin compliance and trade-finance availability before committing capital to tier-1 corridors.`,
    afcfta_flows: `${countryName} intra-African trade flows under AfCFTA reflect tariff liberalisation progress, rules-of-origin harmonisation, and regional value-chain integration. SOUVERA tracks bilateral corridor volumes and growth trajectories for pan-African market entry planning.\n\nCategory concentration flags logistics dependencies and customs harmonisation gaps that headline totals obscure.\n\nExport operators should prioritise corridors with both high regional demand intensity and verified AfCFTA tariff schedules.`,
    cbtpa_flows: `${countryName} CBTPA trade flows combine Caribbean Basin preferential access with U.S. import demand signals. SOUVERA distinguishes duty-free utilisation from MFN volumes to size the true policy premium for apparel, agriculture, and manufacturing exports.\n\nCategory-level concentration flags rules-of-origin compliance risk and yarn-forward requirements specific to textile corridors.\n\nCorridor strategy should anchor on CBTPA eligibility verification, trade-finance availability, and U.S. buyer diversification pressure.`,
  };

  return {
    analysis:
      templates[cardType] ||
      `${countryName} market intelligence powered by SOUVERA's data-driven analysis framework.`,
    aiGenerated: false,
  };
}

/**
 * Generate AI-powered analysis using OpenAI
 */
async function generateAIAnalysis(input: CardAnalysisInput): Promise<CardAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackAnalysis(input);

  const { cardType, countryName, iso3, data } = input;
  
  // Build data context for AI
  const dataPoints: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (value != null) {
      dataPoints.push(`- ${key}: ${value}`);
    }
  });
  
  const dataContext = dataPoints.length > 0 
    ? dataPoints.join('\n') 
    : 'Limited data available';

  // Card-specific prompts
  const cardPrompts: Record<string, string> = {
    signal_strength: `You are SOUVERA's quantitative analyst. Generate a 1-paragraph (60-80 words) analysis for ${countryName}'s Signal Strength card.

Data:
${dataContext}

Requirements:
- Reference exact scores from data (e.g., "Investment Score: 72/100")
- Explain what these scores indicate about investor sentiment
- No speculation beyond provided data
- SOUVERA voice: authoritative, data-driven, concise
- End with actionable insight for institutional investors
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    economic_momentum: `You are SOUVERA's macroeconomic analyst. Generate a 1-paragraph (60-80 words) analysis for ${countryName}'s Economic Momentum card.

Data:
${dataContext}

Requirements:
- Reference exact momentum index and readiness scores
- Interpret what positive/negative momentum indicates
- No speculation beyond provided data
- SOUVERA voice: authoritative, data-driven, concise
- Connect momentum to investment implications
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    news_pulse: `You are SOUVERA's sentiment analyst. Generate a 1-paragraph (60-80 words) analysis for ${countryName}'s News Pulse card.

Data:
${dataContext}

Requirements:
- Reference sentiment score and risk/opportunity intensities
- Explain what current news sentiment reveals about market dynamics
- No speculation beyond provided data
- SOUVERA voice: authoritative, data-driven, concise
- Highlight key themes if intensity scores are high
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    quick_stats: `You are SOUVERA's market intelligence analyst. Generate a 1-paragraph (60-80 words) analysis for ${countryName}'s Quick Stats card.

Data:
${dataContext}

Requirements:
- Reference GDP, population, and signal metrics
- Contextualize ${countryName}'s market size and investment profile
- No speculation beyond provided data
- SOUVERA voice: authoritative, data-driven, concise
- Connect fundamentals to investment opportunity
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    agoa_flows: `You are SOUVERA's trade policy analyst. Generate a 1-paragraph (60-80 words) analysis for AGOA trade flows covering ${countryName}.

Data:
${dataContext}

Requirements:
- Reference export volumes, AGOA share, and eligibility status from data
- Distinguish MFN total exports from AGOA preferential volumes
- SOUVERA voice: authoritative, data-driven, concise
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    agoa_tracker: `You are SOUVERA's U.S. trade policy analyst. Generate a 3-paragraph executive analysis (180-220 words total) for ${countryName}'s U.S. Trade Relationship card.

Data:
${dataContext}

Requirements:
- Paragraph 1: Bilateral export/import volumes, YoY trends, and strategic importance of the U.S. corridor
- Paragraph 2: AGOA/CBI eligibility, current preferential exports vs potential, petroleum exclusion where relevant
- Paragraph 3: Reauthorisation watchpoint (Dec 2026), actionable guidance for exporters/investors, data source
- Reference exact figures from data only
- Separate paragraphs with a blank line
- Do not use markdown formatting

Output: Plain text, three paragraphs separated by blank lines.`,

    demand_matrix: `You are SOUVERA's U.S. import demand analyst. Generate a 1-paragraph (60-80 words) demand signal analysis for ${countryName}.

Data:
${dataContext}

Requirements:
- Reference demand intensity scores and top product categories
- Connect signals to export opportunity
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    supply_demand: `You are SOUVERA's trade balance analyst. Generate a 1-paragraph (60-80 words) supply-demand analysis for ${countryName}.

Data:
${dataContext}

Requirements:
- Reference supply capacity vs U.S. demand gaps
- Highlight actionable export categories
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    afcfta_flows: `You are SOUVERA's AfCFTA trade analyst. Generate a 1-paragraph (60-80 words) intra-African trade analysis for ${countryName}.

Data:
${dataContext}

Requirements:
- Reference regional export volumes and corridor trends
- Connect to AfCFTA integration opportunity
- Do not use markdown formatting

Output: Plain text paragraph only.`,

    cbtpa_flows: `You are SOUVERA's Caribbean Basin trade analyst. Generate a 1-paragraph (60-80 words) CBTPA/CBI trade analysis for ${countryName}.

Data:
${dataContext}

Requirements:
- Reference preferential export volumes and product categories
- Note CBI eligibility implications
- Do not use markdown formatting

Output: Plain text paragraph only.`,
  };

  const systemPrompt = `You are SOUVERA Intelligence's senior analyst covering African and Caribbean markets.
Write data-driven analysis in SOUVERA's voice — authoritative, precise, evidence-based.
CRITICAL: Only reference data explicitly provided. Never speculate or hallucinate metrics.
Output plain text only (no markdown, no formatting).`;

  const multiParagraphTypes = new Set<CardAnalysisType>([
    'agoa_tracker',
    'intra_regional',
    'trade_partners',
    'trade_composition',
    'trade_finance',
  ]);
  const maxTokens = multiParagraphTypes.has(cardType) ? 400 : 150;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: cardPrompts[cardType] || cardPrompts.quick_stats,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[generate-card-analysis] OpenAI API error:', response.statusText);
      return fallbackAnalysis(input);
    }

    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content?.trim();

    if (!analysis) {
      console.error('[generate-card-analysis] No analysis generated');
      return fallbackAnalysis(input);
    }

    return {
      analysis,
      aiGenerated: true,
    };
  } catch (error) {
    console.error('[generate-card-analysis] Error:', error);
    return fallbackAnalysis(input);
  }
}

/** Synchronous curated analysis for PNG exports (no AI API round-trip) */
export function buildCuratedCardAnalysisForExport(input: CardAnalysisInput): string {
  const curated = buildCuratedFallback(input);
  if (curated) return curated;
  return fallbackAnalysis(input).analysis;
}

/**
 * Main export: Generate card analysis with AI fallback (server-side)
 */
export async function generateCardAnalysis(
  input: CardAnalysisInput
): Promise<CardAnalysis> {
  return generateAIAnalysis(input);
}

/** Client-side helper — calls server API so OPENAI_API_KEY stays server-only */
export async function fetchCardAnalysisViaApi(
  input: CardAnalysisInput
): Promise<CardAnalysis> {
  try {
    const res = await fetch('/api/v1/intelligence/card-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) return fallbackAnalysis(input);
    return (await res.json()) as CardAnalysis;
  } catch {
    return fallbackAnalysis(input);
  }
}
