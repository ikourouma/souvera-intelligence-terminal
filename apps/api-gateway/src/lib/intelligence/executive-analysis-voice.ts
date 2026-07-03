/**
 * Executive Souvera Analysis voice guide — shared contract for all curated narratives.
 *
 * Structure (3 paragraphs):
 * P1 — Strategic framing: scale, regional positioning, SOUVERA comparability
 * P2 — Trajectory: quantified growth, FDI, inflation, named structural drivers
 * P3 — Investor read: actionable levers, data vintage, disclaimer
 *
 * Gold standard reference: buildUsTradeCardAnalysis in us-trade-card-analysis.ts
 */

/** Phrases that indicate thin/generic copy — used by QA gates. */
export const BANNED_GENERIC_PHRASES = [
  'regional trade and services activity',
  'monitor FX convertibility, fiscal balance, and trade openness before sizing exposure',
] as const;

export function formatUsdCompact(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatPct(value?: number | null, signed = false): string {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  const prefix = signed && value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function countQuantifiedValues(text: string): number {
  const currency = text.match(/\$[\d,.]+[BMK]?/g) ?? [];
  const pct = text.match(/\d+\.?\d*%/g) ?? [];
  return currency.length + pct.length;
}

export function hasBannedGenericPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_GENERIC_PHRASES.some((p) => lower.includes(p.toLowerCase()));
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Bloomberg-style safeguard for curated intelligence surfaces.
 * Informational only — aids decision-making, not a substitute for final analysis.
 */
export const SOUVERA_INTELLIGENCE_DISCLAIMER =
  'The data, scores, and analysis presented herein are compiled from third-party and modeled sources for informational purposes only to assist research and decision-making. They do not constitute investment, legal, tax, or trade advice, nor a recommendation or solicitation. Souvera and Afronovation, Inc. do not guarantee the accuracy, completeness, or timeliness of this information. Users should conduct independent due diligence before acting on any insight. Modeled estimates and indices are not substitutes for final investment, policy, or contractual decisions.';

export const SOUVERA_INTELLIGENCE_DISCLAIMER_SHORT =
  'For informational purposes only — not investment, legal, or trade advice. Not a final decision basis. © Afronovation, Inc.';
