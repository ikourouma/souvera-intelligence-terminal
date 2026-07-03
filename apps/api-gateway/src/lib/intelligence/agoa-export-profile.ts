/**
 * AGOA export-profile + MFN-treatment model.
 *
 * Powers the "added value" Souvera Analysis layer that distinguishes a market's
 * TOTAL exports to the U.S. from the slice that actually CLAIMS the AGOA
 * preference, and frames how much AGOA really matters given each economy's
 * dominant export sector and its baseline MFN (most-favoured-nation) tariff
 * treatment.
 *
 * Why this exists: for mineral/energy-led economies (e.g. DRC copper/cobalt,
 * Nigeria/Angola crude) the bulk of U.S.-bound goods already enter at zero or
 * near-zero MFN duties, so AGOA's marginal benefit is small and concentrated in
 * non-extractive lines. For apparel/agriculture-led economies (e.g. Lesotho,
 * Kenya, Madagascar) AGOA's duty-free access is genuinely decisive because the
 * same goods face meaningful MFN duties without it. Asserting "enters duty-free
 * under MFN anyway" only where it is true is what keeps the narrative credible.
 */

import { formatCurrency } from '@/lib/intelligence-entitlements';

export type AgoaExportProfile = 'minerals_energy' | 'apparel' | 'agriculture' | 'mixed';

/**
 * MFN treatment of the AGOA category groups used in souvera_agoa_trade_flows.
 * - duty_free_mfn: typically enters the U.S. at 0% MFN regardless of AGOA
 * - agoa_decisive: faces meaningful MFN duties; AGOA preference is material
 * - low_mfn: generally low (1-5%) MFN duties; AGOA helps at the margin
 */
export const AGOA_SECTOR_MFN: Record<string, 'duty_free_mfn' | 'agoa_decisive' | 'low_mfn'> = {
  petroleum: 'duty_free_mfn',
  minerals: 'duty_free_mfn',
  energy: 'duty_free_mfn',
  metals: 'duty_free_mfn',
  textiles_apparel: 'agoa_decisive',
  apparel: 'agoa_decisive',
  footwear: 'agoa_decisive',
  agriculture: 'agoa_decisive',
  processed_foods: 'agoa_decisive',
  handicrafts: 'agoa_decisive',
  leather: 'agoa_decisive',
  machinery: 'low_mfn',
  electronics: 'low_mfn',
  vehicles: 'low_mfn',
  chemicals: 'low_mfn',
};

/**
 * Dominant U.S.-export profile per SSA AGOA market. Curated from well-established
 * trade facts (USITC DataWeb / agoa.info sector composition). Markets not listed
 * fall back to 'mixed', which yields a neutral framing that never over-claims
 * MFN duty-free treatment.
 */
export const AGOA_EXPORT_PROFILE: Record<string, AgoaExportProfile> = {
  // Minerals & energy led — predominantly MFN duty-free; AGOA marginal
  NGA: 'minerals_energy', // crude petroleum
  AGO: 'minerals_energy', // crude petroleum
  COD: 'minerals_energy', // copper, cobalt
  TCD: 'minerals_energy', // crude petroleum
  COG: 'minerals_energy', // crude petroleum
  GAB: 'minerals_energy', // crude petroleum, manganese
  ZMB: 'minerals_energy', // copper
  NER: 'minerals_energy', // uranium
  MRT: 'minerals_energy', // iron ore
  BWA: 'minerals_energy', // diamonds
  NAM: 'minerals_energy', // diamonds, minerals
  GIN: 'minerals_energy', // bauxite, alumina
  SLE: 'minerals_energy', // titanium ores, diamonds
  LBR: 'minerals_energy', // iron ore, rubber

  // Apparel/textile led — AGOA duty-free access is decisive
  LSO: 'apparel', // apparel (AGOA poster child)
  KEN: 'apparel', // apparel + agriculture
  MDG: 'apparel', // apparel + vanilla
  MUS: 'apparel', // apparel + sugar
  SWZ: 'apparel', // apparel + sugar

  // Agriculture / agro-processing led — AGOA supports diversification
  CIV: 'agriculture', // cocoa
  GHA: 'agriculture', // cocoa, gold (mixed-leaning, ag for AGOA lens)
  RWA: 'agriculture', // coffee, tea (apparel benefits suspended)
  UGA: 'agriculture', // coffee
  MWI: 'agriculture', // tobacco, sugar
  CMR: 'agriculture', // cocoa, coffee, timber
  BEN: 'agriculture', // cashews, cotton
  TZA: 'agriculture', // agriculture, minerals
  SEN: 'agriculture', // groundnuts, seafood
  ETH: 'agriculture', // coffee (currently ineligible)

  // Diversified
  ZAF: 'mixed', // vehicles, metals, minerals, agriculture
};

export function getAgoaExportProfile(iso3: string): AgoaExportProfile {
  return AGOA_EXPORT_PROFILE[iso3.toUpperCase()] ?? 'mixed';
}

const PROFILE_DOMINANT_LABEL: Record<AgoaExportProfile, string> = {
  minerals_energy: 'minerals, metals, and energy products',
  apparel: 'apparel and textiles',
  agriculture: 'agricultural and agro-processing goods',
  mixed: 'a diversified mix of minerals, manufactures, and agriculture',
};

export interface AgoaTrendPoint {
  year: number;
  agoaPreferentialUsd: number;
}

export interface AgoaNarrativeInput {
  iso3: string;
  countryName: string;
  currentExportsUsd?: number | null;
  totalExportsToUsUsd?: number | null;
  trend?: AgoaTrendPoint[];
}

/**
 * Build the distinctive "utilization + MFN + trend" sentences that explain how
 * much AGOA actually matters for a market. Returns an empty string when there
 * is insufficient data to say anything credible.
 */
export function buildAgoaUtilizationNarrative({
  iso3,
  countryName,
  currentExportsUsd,
  totalExportsToUsUsd,
  trend,
}: AgoaNarrativeInput): string {
  const profile = getAgoaExportProfile(iso3);
  const current = currentExportsUsd ?? 0;
  const total = totalExportsToUsUsd ?? 0;

  const parts: string[] = [];

  // 1) Total vs preferential — the headline distinction.
  if (total > 0 && current > 0) {
    const utilization = Math.round((current / total) * 100);
    parts.push(
      `Of ${countryName}'s ${formatCurrency(total)} in total goods exports to the United States, roughly ${formatCurrency(current)} — about ${utilization}% — actually moves under AGOA's duty-free preference; the balance enters under standard tariff treatment.`
    );
  } else if (current > 0) {
    parts.push(
      `${countryName} ships an estimated ${formatCurrency(current)} under AGOA's duty-free preference.`
    );
  }

  // 2) MFN framing keyed to the dominant export sector.
  const dominant = PROFILE_DOMINANT_LABEL[profile];
  if (profile === 'minerals_energy') {
    parts.push(
      `Because ${countryName}'s U.S.-bound trade is dominated by ${dominant} — most of which already enter the United States at zero or near-zero MFN duties — AGOA's incremental advantage is concentrated in its non-extractive lines rather than its headline export volume. That is the diversification frontier SOUVERA tracks.`
    );
  } else if (profile === 'apparel') {
    parts.push(
      `For ${countryName}, AGOA's duty-free access is genuinely decisive: ${dominant} — its leading U.S. export — would otherwise face MFN apparel duties of up to ~32%, so the preference is a direct determinant of competitiveness and factory-level employment.`
    );
  } else if (profile === 'agriculture') {
    parts.push(
      `${countryName}'s ${dominant} capture the clearest AGOA upside, where preferential entry rewards value-added processing over raw-commodity exports — the margin SOUVERA flags for diversification planning.`
    );
  } else {
    parts.push(
      `${countryName}'s ${dominant} means AGOA's impact varies line by line; the preference is most decisive for its manufactured and agro-processed goods, where MFN duties bite hardest.`
    );
  }

  // 3) Trend — direction of AGOA utilization over time.
  const series = (trend ?? []).filter((t) => t.agoaPreferentialUsd > 0).sort((a, b) => a.year - b.year);
  if (series.length >= 2) {
    const first = series[0];
    const last = series[series.length - 1];
    const path = series.map((t) => formatCurrency(t.agoaPreferentialUsd)).join(' → ');
    const delta = last.agoaPreferentialUsd - first.agoaPreferentialUsd;
    const direction =
      Math.abs(delta) / Math.max(first.agoaPreferentialUsd, 1) < 0.08
        ? 'held broadly steady'
        : delta > 0
          ? 'risen'
          : 'declined';
    parts.push(
      `AGOA-preferential volume has ${direction} over ${first.year}–${last.year} (${path}), a trajectory operators should weigh alongside the program's December 2026 reauthorisation horizon.`
    );
  }

  return parts.join(' ');
}
