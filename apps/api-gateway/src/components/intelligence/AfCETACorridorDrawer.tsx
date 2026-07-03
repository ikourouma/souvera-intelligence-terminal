'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe2,
  Sparkles,
  Star,
  X,
  Zap,
  Layers,
} from 'lucide-react';
import { flagUrlFromIso3, formatTradeCountryLabel, iso3ToIso2 } from '@/lib/intelligence/export-branding';
import { ExportableCard } from '@/components/intelligence/ExportableCard';
import { AFCETA_PILLARS } from '@/lib/intelligence/afceta-pillar-map';
import { AFCETA_METHODOLOGY_NOTE } from '@/lib/intelligence/afceta-types';
import {
  buildAfcetaExecutiveAnalysisContent,
  buildAfcetaExecutiveKeyMetrics,
  type AnalysisSegment,
  type AnalysisTone,
} from '@/lib/intelligence/afceta-corridor-analysis';
import {
  normalizeExportProductTiers,
  AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION,
  buildAfcetaExportProductsContext,
  buildAfcetaExportProductsCuratedText,
  type AfcetaExportProductTier,
} from '@/lib/intelligence/afceta-export-product-tiers';
import {
  SOUVERA_INTELLIGENCE_DISCLAIMER,
  SOUVERA_INTELLIGENCE_DISCLAIMER_SHORT,
} from '@/lib/intelligence/executive-analysis-voice';
import type { AfcetaPillarKey } from '@/lib/intelligence/afceta-types';

export type AfcetaDirection = 'africa_to_caribbean' | 'caribbean_to_africa';

export interface AfcetaCorridorRow {
  id: string;
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

const CATEGORY_COLORS: Record<string, string> = {
  machinery: 'text-blue-300',
  minerals: 'text-amber-300',
  petroleum: 'text-orange-300',
  agriculture: 'text-emerald-300',
  textiles: 'text-pink-300',
  chemicals: 'text-violet-300',
  vehicles: 'text-cyan-300',
  electronics: 'text-sky-300',
};

/** Souvera SDM-aligned metric card colors: supply=emerald, demand=blue, opportunity=purple */
const METRIC_CARD_STYLES: Record<
  string,
  { box: string; label: string; value: string; sublabel: string }
> = {
  emerald: {
    box: 'bg-emerald-500/5 border border-emerald-500/20',
    label: 'text-emerald-400/70',
    value: 'text-emerald-400',
    sublabel: 'text-emerald-400/50',
  },
  blue: {
    box: 'bg-blue-500/5 border border-blue-500/20',
    label: 'text-blue-400/70',
    value: 'text-blue-400',
    sublabel: 'text-blue-400/50',
  },
  purple: {
    box: 'bg-purple-500/10 border border-purple-500/20',
    label: 'text-purple-400/70',
    value: 'text-purple-400',
    sublabel: 'text-purple-400/50',
  },
  amber: {
    box: 'bg-amber-500/5 border border-amber-500/20',
    label: 'text-amber-400/70',
    value: 'text-amber-400',
    sublabel: 'text-amber-400/50',
  },
  zinc: {
    box: 'bg-zinc-900/60 border border-zinc-800',
    label: 'text-zinc-500',
    value: 'text-white',
    sublabel: 'text-zinc-600',
  },
};

const TIER_HEADER_COLORS: Record<string, string> = {
  'Primary Exports': 'text-emerald-400',
  'Secondary Products': 'text-blue-400',
  'Emerging Lines': 'text-purple-400',
};

const SEGMENT_TEXT_COLORS: Record<AnalysisTone, string> = {
  emerald: 'text-emerald-400 font-semibold',
  blue: 'text-blue-400 font-semibold',
  purple: 'text-purple-400 font-semibold',
  amber: 'text-amber-400 font-semibold',
  white: 'text-white font-medium',
};

function AnalysisParagraph({ segments }: { segments: AnalysisSegment[] }) {
  return (
    <p className="text-sm text-zinc-300 leading-relaxed">
      {segments.map((s, i) =>
        s.tone ? (
          <span key={i} className={SEGMENT_TEXT_COLORS[s.tone]}>
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  );
}

function corridorCountryLabel(row: AfcetaCorridorRow): string {
  const origin = row.origin_name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const dest = row.dest_name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return `${origin} → ${dest}`;
}

function corridorExportBase(row: AfcetaCorridorRow) {
  const dateSlug = new Date().toISOString().slice(0, 10);
  return {
    countryName: corridorCountryLabel(row),
    iso2: iso3ToIso2(row.origin_iso3),
    flagUrl: flagUrlFromIso3(row.origin_iso3),
    sourceAttribution: 'AfCFTA · CBTPA · Import Demand Signals · SOUVERA Intelligence',
    dataAsOf: `${row.data_year ?? 2023}`,
    disclaimer: SOUVERA_INTELLIGENCE_DISCLAIMER_SHORT,
    dateSlug,
  };
}

function usd(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1e6).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

interface AfCETACorridorDrawerProps {
  row: AfcetaCorridorRow;
  onClose: () => void;
}

export default function AfCETACorridorDrawer({ row, onClose }: AfCETACorridorDrawerProps) {
  const [analysisExpanded, setAnalysisExpanded] = useState(false);

  useEffect(() => {
    setAnalysisExpanded(false);
  }, [row.id]);

  const pillar = AFCETA_PILLARS[row.pillar_key as AfcetaPillarKey];
  const isCaribbeanOrigin = row.direction === 'caribbean_to_africa';
  const totalUsd = Math.min(row.origin_capacity_usd, row.dest_demand_usd);

  const productTiers = normalizeExportProductTiers(
    row.origin_iso3,
    row.category_group,
    totalUsd,
    isCaribbeanOrigin,
    row.top_products,
  );

  const analysisInput = {
    ...row,
    top_products: productTiers,
    evaluation_mode: row.evaluation_mode ?? 'platform',
  };
  const analysisContent = buildAfcetaExecutiveAnalysisContent(analysisInput);
  const keyMetrics = buildAfcetaExecutiveKeyMetrics(analysisInput);
  const [summaryParagraph, detailParagraph] = analysisContent.paragraphs;
  const exportBase = corridorExportBase(row);
  const exportProductsContext = buildAfcetaExportProductsContext({
    origin_name: row.origin_name,
    dest_name: row.dest_name,
    category_label: row.category_label,
    direction: row.direction,
    origin_capacity_usd: row.origin_capacity_usd,
    dest_demand_usd: row.dest_demand_usd,
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-950 border-l border-violet-500/30 overflow-y-auto">
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="font-bold text-white">Corridor Detail</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {row.is_spotlight && (
                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Tier-A Spotlight
                </span>
              )}
              {row.evaluation_mode === 'custom' && (
                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Live evaluation
                </span>
              )}
              {row.platform_index_match && row.evaluation_mode === 'custom' && (
                <span className="px-2 py-0.5 rounded text-xs bg-violet-500/10 text-violet-300 border border-violet-500/30">
                  In platform index
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">
                Tier {row.data_quality_tier}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
              <img src={flagUrlFromIso3(row.origin_iso3)} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
              {formatTradeCountryLabel(row.origin_iso3, row.origin_name)}
              <ArrowRight className="w-4 h-4 text-violet-400" />
              <img src={flagUrlFromIso3(row.dest_iso3)} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
              {formatTradeCountryLabel(row.dest_iso3, row.dest_name)}
            </h3>
            <p className={`text-sm mt-1 ${CATEGORY_COLORS[row.category_group] ?? 'text-zinc-300'}`}>
              {row.category_label}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-400/70">Capacity</p>
              <p className="text-lg font-bold text-emerald-400">{usd(row.origin_capacity_usd)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-400/70">Demand</p>
              <p className="text-lg font-bold text-blue-400">{usd(row.dest_demand_usd)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-400/70">Opportunity</p>
              <p className="text-lg font-bold text-purple-400">{row.opportunity_score.toFixed(1)}</p>
            </div>
          </div>

          {pillar && (
            <div className="p-4 rounded-lg border border-violet-500/20 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <p className="text-xs text-violet-400 font-medium">AfCETA Protocol Pillar</p>
              </div>
              <p className="text-white font-semibold">{pillar.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{pillar.subtitle}</p>
              <p className="text-sm text-zinc-400 mt-2">{pillar.summary}</p>
            </div>
          )}

          <ExportableCard
            buttonLabel="PNG"
            exportConfig={{
              fileName: `souvera-afceta-executive-analysis-${row.origin_iso3}-${row.dest_iso3}-${row.category_group}-${exportBase.dateSlug}`,
              cardTitle: `Souvera Executive Analysis · ${row.category_label}`,
              countryName: exportBase.countryName,
              iso2: exportBase.iso2,
              flagUrl: exportBase.flagUrl,
              sourceAttribution: exportBase.sourceAttribution,
              dataAsOf: exportBase.dataAsOf,
              disclaimer: exportBase.disclaimer,
            }}
          >
            <div className="rounded-lg border border-purple-500/20 bg-zinc-950/80 overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Souvera Executive Analysis
                </h3>
              </div>
              <div className="p-4 pt-2 bg-purple-500/5 border-t border-purple-500/20 space-y-4">
              <p className="text-[10px] text-purple-400/70 uppercase tracking-wider">
                Key data — decision support metrics
              </p>
              <div className="grid grid-cols-2 gap-3 pb-4 border-b border-purple-500/20">
                {keyMetrics.slice(0, 6).map((m) => {
                  const style = METRIC_CARD_STYLES[m.tone ?? 'zinc'];
                  return (
                    <div key={m.label} className={`p-2.5 rounded-lg ${style.box}`}>
                      <p className={`text-[10px] mb-0.5 ${style.label}`}>{m.label}</p>
                      <p className={`text-sm font-bold ${style.value}`}>{m.value}</p>
                      {m.sublabel && (
                        <p className={`text-[10px] mt-0.5 ${style.sublabel}`}>{m.sublabel}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {keyMetrics.length > 6 && (
                <div className="grid grid-cols-1 gap-2 pb-4 border-b border-purple-500/20">
                  {keyMetrics.slice(6).map((m) => {
                    const style = METRIC_CARD_STYLES[m.tone ?? 'zinc'];
                    return (
                      <div
                        key={m.label}
                        className={`flex items-center justify-between text-xs p-2 rounded-lg ${style.box}`}
                      >
                        <span className={style.label}>{m.label}</span>
                        <span className={`font-medium ${style.value}`}>{m.value}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <AnalysisParagraph segments={summaryParagraph} />
              {detailParagraph && (
                <div
                  data-export-expand
                  className={
                    analysisExpanded
                      ? 'space-y-0'
                      : 'max-h-0 overflow-hidden opacity-0 pointer-events-none'
                  }
                  aria-hidden={!analysisExpanded}
                >
                  <AnalysisParagraph segments={detailParagraph} />
                </div>
              )}
              {detailParagraph && (
                <button
                  type="button"
                  onClick={() => setAnalysisExpanded((v) => !v)}
                  data-export-exclude
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {analysisExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Read full analysis
                    </>
                  )}
                </button>
              )}
              <div className="pt-3 border-t border-purple-500/20 space-y-2">
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {SOUVERA_INTELLIGENCE_DISCLAIMER}
                </p>
                <p className="text-[10px] text-zinc-600">
                  {SOUVERA_INTELLIGENCE_DISCLAIMER_SHORT}
                </p>
              </div>
              </div>
            </div>
          </ExportableCard>

          {row.caribbean_asset_class && (
            <div className="p-4 rounded-lg border border-teal-500/20 bg-teal-500/5">
              <p className="text-xs text-teal-400 font-medium mb-1">Caribbean Asset Class</p>
              <p className="text-white capitalize">{row.caribbean_asset_class.replace(/_/g, ' ')}</p>
            </div>
          )}

          {productTiers.length > 0 && (
            <ExportableCard
              buttonLabel="PNG"
              exportConfig={{
                fileName: `souvera-afceta-export-products-${row.origin_iso3}-${row.dest_iso3}-${row.category_group}-${exportBase.dateSlug}`,
                cardTitle: `Top Export Products · ${row.category_label}`,
                countryName: exportBase.countryName,
                iso2: exportBase.iso2,
                flagUrl: exportBase.flagUrl,
                sourceAttribution: exportBase.sourceAttribution,
                dataAsOf: exportBase.dataAsOf,
                disclaimer: exportBase.disclaimer,
                curatedAnalysis: buildAfcetaExportProductsCuratedText({
                  origin_name: row.origin_name,
                  dest_name: row.dest_name,
                  category_label: row.category_label,
                  direction: row.direction,
                  origin_capacity_usd: row.origin_capacity_usd,
                  dest_demand_usd: row.dest_demand_usd,
                }),
              }}
            >
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <h4 className="text-sm font-semibold text-white">Top Export Products</h4>
                </div>
                <div className="p-4 pt-2 space-y-4 border-t border-zinc-800">
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <p className="text-xs text-zinc-300 leading-relaxed">{exportProductsContext}</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION}
                  </p>
                </div>
                {productTiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className="p-3 rounded-lg bg-zinc-900 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${TIER_HEADER_COLORS[tier.tier] ?? 'text-zinc-400'}`}>
                        {tier.tier}
                      </p>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{usd(tier.valueUsd)}</p>
                        <p className="text-xs text-zinc-500">{tier.sharePct}% of mix</p>
                      </div>
                    </div>
                    <ul className="space-y-0.5 mt-1">
                      {tier.products.map((product) => (
                        <li key={product} className="text-[11px] text-zinc-500">
                          {product}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                </div>
              </div>
            </ExportableCard>
          )}

          <p className="text-[10px] text-zinc-600 leading-relaxed">
            {AFCETA_METHODOLOGY_NOTE} Data vintage: {row.data_year ?? 2023}.
          </p>

          <Link
            href="/intelligence/trade/afceta"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
          >
            <Globe2 className="w-4 h-4" />
            View AfCETA treaty framework
          </Link>
        </div>
      </div>
    </div>
  );
}

export { CATEGORY_COLORS, usd as formatCorridorUsd };
