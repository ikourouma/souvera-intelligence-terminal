/**
 * Curated executive Souvera analysis for AfCETA corridor drawer exports.
 *
 * Rules: two paragraphs max; only interpret fields present on the row;
 * no diligence boilerplate, no invented country context.
 */

import { formatUsdCompact } from '@/lib/intelligence/format-usd';
import { AFCETA_PILLARS } from '@/lib/intelligence/afceta-pillar-map';
import { AFCETA_SPOTLIGHT_PAIRS } from '@/lib/intelligence/afceta-spotlights';
import type { AfcetaExportProductTier } from '@/lib/intelligence/afceta-export-product-tiers';
import type { AfcetaDirection, AfcetaPillarKey } from '@/lib/intelligence/afceta-types';

export interface AfcetaCorridorAnalysisInput {
  origin_iso3: string;
  origin_name: string;
  dest_iso3: string;
  dest_name: string;
  direction: AfcetaDirection;
  category_group: string;
  category_label: string;
  pillar_key: string;
  origin_capacity_usd: number;
  dest_demand_usd: number;
  opportunity_score: number;
  caribbean_asset_class: string | null;
  top_products: Array<AfcetaExportProductTier | { name: string; valueUsd: number; sharePct: number }>;
  data_quality_tier: string;
  is_spotlight: boolean;
  data_year?: number;
  evaluation_mode?: 'platform' | 'custom';
  platform_index_match?: boolean;
}

export type AnalysisTone = 'emerald' | 'blue' | 'purple' | 'amber' | 'white';

export interface AnalysisSegment {
  text: string;
  tone?: AnalysisTone;
}

export interface AfcetaExecutiveAnalysisContent {
  paragraphs: AnalysisSegment[][];
}

export interface AfcetaExecutiveKeyMetric {
  label: string;
  value: string;
  sublabel?: string;
  tone?: 'emerald' | 'blue' | 'purple' | 'amber' | 'zinc';
}

function harmonicFitPct(capacity: number, demand: number): number {
  if (capacity <= 0 || demand <= 0) return 0;
  const min = Math.min(capacity, demand);
  return Math.round(((2 * min) / (capacity + demand)) * 100);
}

function tradeScaleLabel(capacity: number, demand: number): string {
  const total = capacity + demand;
  if (total >= 1_000_000_000) return 'Large-scale corridor';
  if (total >= 100_000_000) return 'Mid-scale corridor';
  if (total > 0) return 'Emerging scale';
  return 'Insufficient signal';
}

function capacitySourceLabel(direction: AfcetaDirection): string {
  return direction === 'africa_to_caribbean' ? 'AfCFTA export profile' : 'CBTPA export profile';
}

function countryName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function seg(text: string, tone?: AnalysisTone): AnalysisSegment {
  return tone ? { text, tone } : { text };
}

function matchLabel(fit: number): string {
  if (fit >= 85) return 'closely aligned';
  if (fit >= 65) return 'reasonably balanced';
  if (fit >= 40) return 'partially matched';
  return 'misaligned';
}

function collectProductNames(
  tiers: AfcetaCorridorAnalysisInput['top_products'],
): string[] {
  const names: string[] = [];
  for (const tier of tiers) {
    if ('products' in tier && Array.isArray(tier.products)) {
      names.push(...tier.products);
    } else if ('name' in tier && tier.name) {
      names.push(tier.name);
    }
  }
  return [...new Set(names)];
}

function findSpotlightNarrative(row: AfcetaCorridorAnalysisInput): string | null {
  if (!row.is_spotlight) return null;
  const match = AFCETA_SPOTLIGHT_PAIRS.find(
    (p) =>
      p.origin_iso3 === row.origin_iso3.toUpperCase() &&
      p.dest_iso3 === row.dest_iso3.toUpperCase() &&
      p.direction === row.direction &&
      p.categories.includes(row.category_group),
  );
  return match?.narrative ?? null;
}

function directionPhrase(direction: AfcetaDirection): string {
  return direction === 'africa_to_caribbean' ? 'Africa → Caribbean' : 'Caribbean → Africa';
}

/** Two paragraphs with color-tagged metrics — paragraph 1 is the summary. */
export function buildAfcetaExecutiveAnalysisContent(
  row: AfcetaCorridorAnalysisInput,
): AfcetaExecutiveAnalysisContent {
  const origin = countryName(row.origin_name);
  const dest = countryName(row.dest_name);
  const cap = formatUsdCompact(row.origin_capacity_usd);
  const dem = formatUsdCompact(row.dest_demand_usd);
  const score = row.opportunity_score.toFixed(1);
  const fit = harmonicFitPct(row.origin_capacity_usd, row.dest_demand_usd);
  const fitLabel = matchLabel(fit);
  const source = capacitySourceLabel(row.direction);

  // Paragraph 1 — corridor summary (always visible)
  const p1: AnalysisSegment[] = [
    seg('In '),
    seg(row.category_label, 'white'),
    seg(', '),
    seg(origin, 'white'),
    seg(' → '),
    seg(dest, 'white'),
    seg(` (${directionPhrase(row.direction)}): `),
    seg(origin, 'white'),
    seg(' has '),
    seg(cap, 'emerald'),
    seg(` in export capacity (${source}). `),
    seg(dest, 'white'),
    seg(' has '),
    seg(dem, 'blue'),
    seg(' in modeled import demand. Opportunity Index: '),
    seg(`${score}/100`, 'purple'),
    seg('. Supply and demand are '),
    seg(`${fit}%`, fit >= 65 ? 'emerald' : 'amber'),
    seg(` ${fitLabel} by scale.`),
  ];

  // Paragraph 2 — products, pillar, spotlight (expand only)
  const p2: AnalysisSegment[] = [];
  const spotlight = findSpotlightNarrative(row);
  if (spotlight) {
    p2.push(seg(spotlight));
    p2.push(seg(' '));
  }

  const products = collectProductNames(row.top_products);
  if (products.length > 0) {
    p2.push(seg('Export lines in this category: '));
    p2.push(seg(products.join(', '), 'emerald'));
    p2.push(seg('. '));
  }

  const pillar = AFCETA_PILLARS[row.pillar_key as AfcetaPillarKey];
  if (pillar) {
    p2.push(seg('AfCETA pillar: '));
    p2.push(seg(pillar.title, 'purple'));
    p2.push(seg('. '));
  }

  if (row.caribbean_asset_class) {
    p2.push(seg('Caribbean asset class on this lane: '));
    p2.push(seg(row.caribbean_asset_class.replace(/_/g, ' '), 'blue'));
    p2.push(seg('.'));
  }

  if (p2.length === 0) {
    p2.push(
      seg('No additional product or policy detail is attached to this row beyond the capacity and demand figures above.'),
    );
  }

  return { paragraphs: [p1, p2] };
}

/** @deprecated Use buildAfcetaExecutiveAnalysisContent for UI rendering */
export function buildAfcetaExecutiveAnalysis(row: AfcetaCorridorAnalysisInput): string {
  const { paragraphs } = buildAfcetaExecutiveAnalysisContent(row);
  return paragraphs.map((p) => p.map((s) => s.text).join('')).join('\n\n');
}

/** Quantified key metrics for executive analysis UI grid. */
export function buildAfcetaExecutiveKeyMetrics(row: AfcetaCorridorAnalysisInput): AfcetaExecutiveKeyMetric[] {
  const fit = harmonicFitPct(row.origin_capacity_usd, row.dest_demand_usd);
  const scale = row.origin_capacity_usd + row.dest_demand_usd;
  const pillar = AFCETA_PILLARS[row.pillar_key as AfcetaPillarKey];

  const metrics: AfcetaExecutiveKeyMetric[] = [
    {
      label: 'Opportunity Index',
      value: row.opportunity_score.toFixed(1),
      sublabel: tradeScaleLabel(row.origin_capacity_usd, row.dest_demand_usd),
      tone: row.opportunity_score >= 50 ? 'purple' : 'zinc',
    },
    {
      label: 'Origin Capacity',
      value: formatUsdCompact(row.origin_capacity_usd),
      sublabel: capacitySourceLabel(row.direction),
      tone: 'emerald',
    },
    {
      label: 'Destination Demand',
      value: formatUsdCompact(row.dest_demand_usd),
      sublabel: 'Modeled import pull',
      tone: 'blue',
    },
    {
      label: 'Supply–Demand Match',
      value: `${fit}%`,
      sublabel: matchLabel(fit),
      tone: fit >= 60 ? 'emerald' : fit >= 35 ? 'amber' : 'zinc',
    },
    {
      label: 'Combined Scale',
      value: formatUsdCompact(scale),
      sublabel: `Vintage ${row.data_year ?? 2023}`,
      tone: 'zinc',
    },
  ];

  if (pillar) {
    metrics.push({
      label: 'AfCETA Pillar',
      value: pillar.title,
      sublabel: row.category_label,
      tone: 'purple',
    });
  }

  if (row.caribbean_asset_class) {
    metrics.push({
      label: 'Caribbean Asset Class',
      value: row.caribbean_asset_class.replace(/_/g, ' '),
      tone: 'blue',
    });
  }

  return metrics;
}
