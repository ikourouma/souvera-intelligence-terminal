'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronRight,
  Download, Globe, RefreshCw, TrendingUp, TrendingDown,
  Filter, CheckCircle2, XCircle, Info, Sparkles,
  X, Users, Building2, Search,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { iso3ToIso2, formatTradeCountryLabel, tradeCountryMatchesSearch } from '@/lib/intelligence/export-branding';
import type { CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { CollapsibleAnalysis } from '@/components/intelligence/CollapsibleAnalysis';
import { PetroleumExclusionFootnote } from '@/components/intelligence/PetroleumExclusionFootnote';
import {
  isPetroleumOrEnergySector,
  petroleumExclusionClause,
  petroleumSectorNote,
} from '@/lib/intelligence/preferential-trade-policy';
import { AGOA_FLOW_CATEGORY_LABELS } from '@/lib/trade/agoa-flow-categories';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AGOAFlowRow {
  id: string;
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  agoa_eligible: boolean;
  agoa_status: 'eligible' | 'suspended' | 'graduated';
  eligibility_since: number | null;
  year: number;
  hs_chapter: string;
  category_group: string;
  category_label: string;
  total_exports_to_us_usd: number | null;
  agoa_exports_usd: number | null;
  agoa_share_pct: number | null;
  non_agoa_exports_usd: number | null;
  mfn_tariff_pct: number | null;
  tariff_savings_usd: number | null;
  is_textile_apparel: boolean;
  third_country_fabric_eligible: boolean;
  yoy_growth_pct: number | null;
  top_products: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number; agoaEligible: boolean }>;
  us_total_imports_usd: number | null;
  country_share_of_us_imports_pct: number | null;
  competitor_suppliers: Array<{ iso3: string; country: string; valueUsd: number; sharePct: number }>;
  source_notes: string | null;
  data_quality_tier?: 'A' | 'B' | 'C';
}

interface AGOAFlowsResponse {
  rows: AGOAFlowRow[];
  summary: {
    record_count: number;
    total_exports_to_us_usd: number;
    total_agoa_exports_usd: number;
    agoa_share_pct: number;
    total_tariff_savings_usd: number;
    markets_covered: number;
    eligible_markets: number;
    suspended_markets: number;
    category_group_totals: Record<string, { total_exports_usd: number; agoa_exports_usd: number; tariff_savings_usd: number; country_count: number }>;
    top_exporters: Array<{ iso3: string; name: string; total: number; agoa: number }>;
    data_vintage: string;
    data_gaps?: {
      scaffold_rows: number;
      markets_no_db_data: string[];
      markets_with_db_data: number;
      expected_markets: number;
      expected_categories: number;
    };
    country_metrics?: Record<string, {
      restoration_potential_usd: number;
      current_tariff_savings_usd: number;
      current_agoa_exports_usd: number;
    }>;
  };
  attribution: { sources: string[]; note: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usdB(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${(v / 1e3).toFixed(0)}K`;
}

function pct(v: number | null | undefined): string {
  return v != null ? `${v.toFixed(1)}%` : '—';
}

type PreferentialDisplayReason =
  | 'pending'
  | 'suspended'
  | 'petroleum_excluded'
  | 'no_utilization'
  | 'value';

function formatPreferentialUsd(
  value: number | null | undefined,
  reason: PreferentialDisplayReason,
): { text: string; sublabel?: string } {
  if (reason === 'pending' || value == null) {
    return { text: '—', sublabel: 'Pending' };
  }
  const text = usdB(value);
  if (value === 0) {
    if (reason === 'suspended') return { text, sublabel: 'AGOA suspended' };
    if (reason === 'petroleum_excluded') return { text, sublabel: 'Excluded (HTS Ch. 27)' };
    if (reason === 'no_utilization') return { text, sublabel: 'No preferential utilization' };
  }
  return { text };
}

function dutySavingsReason(row: AGOAFlowRow): PreferentialDisplayReason {
  if (row.id.startsWith('scaffold-') || row.tariff_savings_usd == null) {
    if (row.tariff_savings_usd == null && row.mfn_tariff_pct == null && row.agoa_exports_usd == null) {
      return 'pending';
    }
  }
  if (row.tariff_savings_usd == null && row.mfn_tariff_pct == null) return 'pending';
  if (!row.agoa_eligible || row.agoa_status === 'suspended') return 'suspended';
  if (isPetroleumOrEnergySector(row.category_group, row.category_label)) return 'petroleum_excluded';
  if ((row.tariff_savings_usd ?? 0) === 0) return 'no_utilization';
  return 'value';
}

function agoaExportsReason(row: AGOAFlowRow): PreferentialDisplayReason {
  if (row.id.startsWith('scaffold-')) return 'pending';
  if (!row.agoa_eligible || row.agoa_status === 'suspended') return 'suspended';
  if (isPetroleumOrEnergySector(row.category_group, row.category_label)) return 'petroleum_excluded';
  if ((row.agoa_exports_usd ?? 0) === 0 && (row.total_exports_to_us_usd ?? 0) > 0) return 'no_utilization';
  if (row.agoa_exports_usd == null) return 'pending';
  return 'value';
}

function formatDutySavingsCell(row: AGOAFlowRow): { text: string; sublabel?: string } {
  const reason = dutySavingsReason(row);
  if (reason === 'pending') return { text: '—', sublabel: 'Pending' };
  return formatPreferentialUsd(row.tariff_savings_usd ?? 0, reason);
}

function shareBar(share: number | null | undefined): { width: string; color: string } {
  const s = Math.max(0, Math.min(100, share ?? 0));
  let color = 'bg-zinc-600';
  if (s >= 70) color = 'bg-emerald-500';
  else if (s >= 50) color = 'bg-blue-500';
  else if (s >= 30) color = 'bg-amber-500';
  return { width: `${s}%`, color };
}

function tierBadge(tier?: string, rowId?: string): React.ReactNode {
  if (rowId?.startsWith('scaffold-')) {
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">Pending</span>;
  }
  if (tier === 'A') {
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tier A</span>;
  }
  if (tier === 'B') {
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">Est.</span>;
  }
  if (tier === 'C') {
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Proj.</span>;
  }
  return null;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  petroleum: { label: 'Petroleum & Energy', icon: '⛽', color: 'text-orange-300' },
  minerals: { label: 'Minerals & Precious Metals', icon: '💎', color: 'text-purple-300' },
  textiles_apparel: { label: 'Textiles & Apparel', icon: '👕', color: 'text-pink-300' },
  agriculture: { label: 'Agriculture & Food', icon: '🌾', color: 'text-amber-300' },
  vehicles: { label: 'Vehicles & Transport', icon: '🚗', color: 'text-blue-300' },
  chemicals: { label: 'Chemicals & Pharma', icon: '🧪', color: 'text-emerald-300' },
  machinery: { label: 'Machinery & Equipment', icon: '⚙️', color: 'text-cyan-300' },
  electronics: { label: 'Electronics & ICT', icon: '📱', color: 'text-sky-300' },
  handicrafts: { label: 'Handicrafts & Artisanal', icon: '🎨', color: 'text-rose-300' },
  footwear: { label: 'Footwear & Leather', icon: '👟', color: 'text-yellow-300' },
  processed_foods: { label: 'Processed Foods & Beverages', icon: '🍽️', color: 'text-amber-300' },
  leather: { label: 'Leather & Hides', icon: '🧥', color: 'text-yellow-300' },
  forest: { label: 'Forest Products', icon: '🌲', color: 'text-green-300' },
};

function categoryMeta(group: string, label?: string) {
  return CATEGORY_META[group] ?? {
    label: label ?? AGOA_FLOW_CATEGORY_LABELS[group as keyof typeof AGOA_FLOW_CATEGORY_LABELS] ?? group,
    icon: '📦',
    color: 'text-zinc-300',
  };
}

// ─── Souvera Analysis Generator ───────────────────────────────────────────────

function generateSouveraAnalysis(row: AGOAFlowRow): string {
  const agoaShare = row.agoa_share_pct ?? 0;
  const savings = row.tariff_savings_usd;
  const topCompetitor = row.competitor_suppliers?.[0];
  const topProduct = row.top_products?.[0];
  const isPetroleum = isPetroleumOrEnergySector(row.category_group, row.category_label);
  const countryLabel = formatTradeCountryLabel(row.iso3, row.country_name);

  let analysis = `${countryLabel} exports ${usdB(row.total_exports_to_us_usd ?? 0)} in ${row.category_label.toLowerCase()} to the US annually. `;

  if (isPetroleum) {
    analysis += petroleumSectorNote(row.iso3) + ' ';
  } else if (!row.agoa_eligible || row.agoa_status === 'suspended') {
    analysis += `AGOA benefits are currently suspended — exports face MFN tariff rates${row.mfn_tariff_pct != null ? ` of ${pct(row.mfn_tariff_pct)}` : ''}. No duty savings apply under current status. `;
  } else if (savings != null && savings > 0) {
    analysis += `${pct(agoaShare)} (${usdB(row.agoa_exports_usd ?? 0)}) enters duty-free under AGOA, generating estimated tariff savings of ${usdB(savings)}/yr. `;
  } else if ((row.agoa_exports_usd ?? 0) > 0) {
    analysis += `${pct(agoaShare)} (${usdB(row.agoa_exports_usd ?? 0)}) enters duty-free under AGOA. `;
  } else if (row.mfn_tariff_pct == null) {
    analysis += `Preferential utilization and tariff savings for this category are pending MFN rate data from USITC. `;
  } else {
    analysis += `No AGOA preferential utilization recorded for this category in the reference year. `;
  }

  if (topProduct && topProduct.agoaEligible && !isPetroleum) {
    analysis += `Key product: ${topProduct.description} (HS ${topProduct.hsCode}) at ${usdB(topProduct.valueUsd)}/yr. `;
  } else if (topProduct && !topProduct.agoaEligible) {
    analysis += `Key product: ${topProduct.description} (HS ${topProduct.hsCode}) at ${usdB(topProduct.valueUsd)}/yr — MFN only. `;
  }

  if (topCompetitor) {
    analysis += `Primary competitor: ${topCompetitor.country} (${pct(topCompetitor.sharePct)} US market share).`;
  }

  return analysis.trim();
}

function buildOverviewAnalysis(
  countryName: string,
  rows: AGOAFlowRow[],
  isEligible: boolean,
  isSuspended: boolean,
  preferentialSavings: number,
  preferentialAgoa: number,
  totalExports: number,
  agoaShare: number,
  hasPetroleumExports: boolean,
  iso3: string,
): string {
  const nonPetroleumRows = rows.filter((r) => !isPetroleumOrEnergySector(r.category_group, r.category_label));
  const categoryCount = nonPetroleumRows.filter((r) => (r.total_exports_to_us_usd ?? 0) > 0).length
    || rows.filter((r) => (r.total_exports_to_us_usd ?? 0) > 0).length;

  let text = `${countryName}'s exports to the US amount to ${usdB(totalExports)}/yr across ${categoryCount} product categories with reported trade. `;

  if (isSuspended) {
    text += `With AGOA benefits currently suspended, exports face standard MFN tariff rates — current preferential tariff savings are ${usdB(preferentialSavings)}/yr. `;
  } else if (preferentialSavings > 0) {
    text += `AGOA preferences generate ${usdB(preferentialSavings)}/yr in tariff savings on ${usdB(preferentialAgoa)} in duty-free exports (${pct(agoaShare)} of non-petroleum total). `;
  } else {
    text += `AGOA duty-free exports stand at ${usdB(preferentialAgoa)}/yr (${pct(agoaShare)} of non-petroleum total). `;
  }

  if (hasPetroleumExports) {
    text += petroleumExclusionClause(iso3);
  }

  if (rows[0]?.sub_region) {
    text += `\n\nAs a ${rows[0].sub_region} market, ${countryName} can expand AGOA utilization through regional value chain integration where eligibility and rules-of-origin compliance support preferential access.`;
  }

  return text;
}

// ─── Exportable Section Wrapper ───────────────────────────────────────────────

function ExportableSection({
  children,
  id,
  title,
  country,
  year,
  category,
  sourceNotes,
  fileName,
  exporting,
  onExportStart,
  onExportEnd,
  isHighlighted = false,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
  country: { iso3: string; name: string };
  year: number;
  category?: string;
  sourceNotes: string;
  fileName: string;
  exporting: boolean;
  onExportStart: (id: string) => void;
  onExportEnd: () => void;
  isHighlighted?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!sectionRef.current || exporting) return;
    onExportStart(id);
    try {
      await exportElementToPNG({
        element: sectionRef.current,
        fileName,
        cardTitle: `${country.name} — ${category ?? title}`,
        countryName: country.name,
        iso2: iso3ToIso2(country.iso3),
        sourceAttribution: sourceNotes,
        dataAsOf: `${year}`,
        aiAnalysisConfig: {
          cardType: 'agoa_flows',
          countryName: country.name,
          iso3: country.iso3,
          data: {
            Category: category ?? title,
            Year: year,
          },
        } satisfies CardAnalysisInput,
      });
    } finally {
      onExportEnd();
    }
  }, [sectionRef, exporting, id, fileName, country, category, title, sourceNotes, year, onExportStart, onExportEnd]);

  return (
    <div
      ref={sectionRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-4 rounded-xl border transition-all ${
        isHighlighted
          ? 'bg-emerald-500/8 border-emerald-500/40 ring-1 ring-emerald-500/30'
          : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {hovered && !exporting && (
        <button
          onClick={handleExport}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/90 border border-zinc-700 hover:bg-zinc-700 transition-colors z-10"
          title="Download as PNG"
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
      )}
      {exporting && (
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Country AGOA Drawer ──────────────────────────────────────────────────────

function CountryAGOADrawer({
  country,
  rows,
  fromCategory,
  countryMetrics,
  onClose,
}: {
  country: { iso3: string; name: string; fromCategory?: string };
  rows: AGOAFlowRow[];
  fromCategory?: string;
  countryMetrics?: {
    restoration_potential_usd: number;
    current_tariff_savings_usd: number;
    current_agoa_exports_usd: number;
  };
  onClose: () => void;
}) {
  const [exportingSection, setExportingSection] = useState<string | null>(null);
  const handleExportStart = useCallback((id: string) => setExportingSection(id), []);
  const handleExportEnd = useCallback(() => setExportingSection(null), []);

  const year = rows[0]?.year ?? 2023;
  const dateStr = new Date().toISOString().slice(0, 10);
  const isEligible = rows[0]?.agoa_eligible === true;
  const agoaStatus = rows[0]?.agoa_status;
  const eligibleSince = rows[0]?.eligibility_since;
  const isSuspended = agoaStatus === 'suspended' || !isEligible;

  const dbRows = rows.filter((r) => !r.id.startsWith('scaffold-'));
  const preferentialRows = dbRows.filter((r) => !isPetroleumOrEnergySector(r.category_group, r.category_label));

  const totalExports = rows.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
  const agoaExports = preferentialRows.reduce((s, r) => s + (r.agoa_exports_usd ?? 0), 0);
  const totalSavings = countryMetrics?.current_tariff_savings_usd
    ?? preferentialRows.reduce((s, r) => s + (r.tariff_savings_usd ?? 0), 0);
  const nonPetroleumTotal = preferentialRows.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
  const agoaShare = nonPetroleumTotal > 0 ? (agoaExports / nonPetroleumTotal) * 100 : 0;
  const hasPetroleumExports = dbRows.some(
    (r) => isPetroleumOrEnergySector(r.category_group, r.category_label) && (r.total_exports_to_us_usd ?? 0) > 0,
  );
  const restorationPotential = countryMetrics?.restoration_potential_usd ?? 0;

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (fromCategory) {
        if (a.category_group === fromCategory) return -1;
        if (b.category_group === fromCategory) return 1;
      }
      return (b.total_exports_to_us_usd ?? 0) - (a.total_exports_to_us_usd ?? 0);
    });
  }, [rows, fromCategory]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="shrink-0 p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
              isEligible ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-orange-600'
            }`}>
              {country.iso3}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-lg">{country.name}</h2>
                {isEligible ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Eligible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-medium">
                    <XCircle className="w-3 h-3" /> Suspended
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-xs">
                AGOA Export Profile • {year}
                {isEligible && eligibleSince ? ` • Eligible since ${eligibleSince}` : ''}
                {isSuspended && eligibleSince ? ` • Suspended since ${eligibleSince}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overview Section */}
          <ExportableSection
            id="overview"
            title="AGOA Export Overview"
            country={country}
            year={year}
            sourceNotes="USITC DataWeb · US Census · USTR AGOA Reports · Souvera Analysis"
            fileName={`souvera-agoa-${country.iso3}-overview-${dateStr}`}
            exporting={exportingSection === 'overview'}
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                <p className="text-zinc-400 text-xs mb-1">Total Exports to US</p>
                <p className="text-white font-bold text-xl">{usdB(totalExports)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-zinc-400 text-xs mb-1">AGOA Duty-Free</p>
                <p className="text-emerald-300 font-bold text-xl">{usdB(agoaExports)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
                <p className="text-zinc-500 text-xs mt-1">{pct(agoaShare)} of total</p>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
              <p className="text-zinc-400 text-xs mb-1">
                {isSuspended ? 'Current Tariff Savings' : 'Annual Tariff Savings'}
              </p>
              <p className="text-amber-300 font-bold text-xl">{usdB(totalSavings)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
              <p className="text-zinc-500 text-xs mt-1">
                {isSuspended
                  ? 'AGOA suspended — exports subject to MFN rates'
                  : 'Duties avoided under AGOA preferences (excludes petroleum)'}
              </p>
            </div>

            {isSuspended && restorationPotential > 0 && (
              <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl mb-4">
                <p className="text-zinc-400 text-xs mb-1">Restoration Potential</p>
                <p className="text-white font-bold text-xl">{usdB(restorationPotential)}</p>
                <p className="text-zinc-500 text-xs mt-1">Non-petroleum export base if AGOA were reinstated</p>
              </div>
            )}

            {hasPetroleumExports && (
              <PetroleumExclusionFootnote iso3={country.iso3} compact className="mb-4" />
            )}

            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
              </div>
              <CollapsibleAnalysis
                text={buildOverviewAnalysis(
                  country.name,
                  dbRows,
                  isEligible,
                  isSuspended,
                  totalSavings,
                  agoaExports,
                  totalExports,
                  agoaShare,
                  hasPetroleumExports,
                  country.iso3,
                )}
                titleClass="hidden"
                className="text-zinc-300 text-xs"
              />
            </div>
          </ExportableSection>

          {/* Category Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Category breakdown</h3>
            <div className="space-y-4">
              {sorted.map((r) => {
                const meta = categoryMeta(r.category_group, r.category_label);
                const isHighlighted = r.category_group === fromCategory;
                const bar = shareBar(r.agoa_share_pct);
                const dutyDisplay = formatDutySavingsCell(r);
                const isPetroleum = isPetroleumOrEnergySector(r.category_group, r.category_label);

                return (
                  <ExportableSection
                    key={r.id}
                    id={r.id}
                    title={r.category_label}
                    country={country}
                    year={year}
                    category={r.category_label}
                    sourceNotes={r.source_notes ?? 'USITC DataWeb · US Census'}
                    fileName={`souvera-agoa-${country.iso3}-${r.category_group}-${dateStr}`}
                    isHighlighted={isHighlighted}
                    exporting={exportingSection === r.id}
                    onExportStart={handleExportStart}
                    onExportEnd={handleExportEnd}
                  >
                    <div className="space-y-3">
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold flex items-center gap-2 ${meta?.color ?? 'text-zinc-300'}`}>
                          <span className="text-lg">{meta?.icon ?? '📦'}</span>
                          {r.category_label}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-zinc-500">HS {r.hs_chapter}</span>
                          <span className="text-white font-semibold">{usdB(r.total_exports_to_us_usd ?? 0)}/yr</span>
                        </div>
                      </div>

                      {/* KPI Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-zinc-800/50 rounded-lg text-center">
                          <p className="text-zinc-500 text-[10px]">AGOA Share</p>
                          <p className="text-emerald-300 font-semibold text-sm">{pct(r.agoa_share_pct)}</p>
                        </div>
                        <div className="p-2 bg-zinc-800/50 rounded-lg text-center">
                          <p className="text-zinc-500 text-[10px]">Duty Savings</p>
                          <p className="text-amber-300 font-semibold text-sm">{dutyDisplay.text}</p>
                          {dutyDisplay.sublabel && (
                            <p className="text-zinc-600 text-[9px] mt-0.5">{dutyDisplay.sublabel}</p>
                          )}
                        </div>
                        <div className="p-2 bg-zinc-800/50 rounded-lg text-center">
                          <p className="text-zinc-500 text-[10px]">Growth YoY</p>
                          <p className={`font-semibold text-sm ${(r.yoy_growth_pct ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {pct(r.yoy_growth_pct)}
                          </p>
                        </div>
                      </div>

                      {/* AGOA Share Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 w-20">AGOA Utilization</span>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                        </div>
                        <span className="text-xs text-zinc-400 w-12 text-right">{pct(r.agoa_share_pct)}</span>
                      </div>

                      {/* Top Products */}
                      {r.top_products && r.top_products.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Top Export Products</p>
                          {r.top_products.slice(0, 4).map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs gap-2">
                              <span className="text-zinc-400 truncate flex-1">
                                <span className="text-amber-400/70 font-mono text-[10px]">HS {p.hsCode}</span>{' '}
                                {p.description}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-emerald-300 font-medium">{usdB(p.valueUsd)}</span>
                                {p.agoaEligible ? (
                                  <span className="text-emerald-400 text-[9px]">✓ AGOA</span>
                                ) : (
                                  <span className="text-zinc-500 text-[9px]">MFN</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Competitor Suppliers */}
                      {r.competitor_suppliers && r.competitor_suppliers.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Top Competitors (US Market)</p>
                          {r.competitor_suppliers.slice(0, 3).map((c, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400">{idx + 1}. {c.country}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500">{pct(c.sharePct)}</span>
                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="bg-red-500/50 h-full" style={{ width: `${Math.min(100, c.sharePct)}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Souvera Analysis */}
                      <div className="p-2.5 bg-violet-950/30 border border-violet-500/20 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <p className="text-violet-300 text-[9px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
                        </div>
                        <CollapsibleAnalysis
                          text={generateSouveraAnalysis(r)}
                          titleClass="hidden"
                          className="text-zinc-300 text-xs"
                        />
                        {isPetroleum && (
                          <ul className="mt-2 text-[10px] text-zinc-500 list-disc list-inside space-y-0.5">
                            <li>{petroleumSectorNote(country.iso3)}</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </ExportableSection>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800 text-sm" data-export-exclude>
            <Link href={`/country/${country.iso3}?tab=trade`}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
              <Building2 className="w-3.5 h-3.5" /> Country trade profile <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/intelligence/trade/agoa"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
              AGOA Eligibility Tracker <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/intelligence/trade/agoa/products"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
              AGOA Product Finder <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ group, rows, onCountryClick }: {
  group: string;
  rows: AGOAFlowRow[];
  onCountryClick: (country: { iso3: string; name: string }, categoryGroup: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const meta = categoryMeta(group);
  const preferentialRows = rows.filter((r) => !isPetroleumOrEnergySector(r.category_group, r.category_label));
  const totalExports = rows.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
  const agoaExports = preferentialRows.reduce((s, r) => s + (r.agoa_exports_usd ?? 0), 0);
  const tariffSavings = rows.reduce((s, r) => s + (r.tariff_savings_usd ?? 0), 0);
  const nonPetTotal = preferentialRows.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
  const agoaShare = nonPetTotal > 0 ? (agoaExports / nonPetTotal) * 100 : 0;
  const sorted = [...rows].sort((a, b) => (b.total_exports_to_us_usd ?? 0) - (a.total_exports_to_us_usd ?? 0));

  const handleExport = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tableRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: tableRef.current,
        fileName: `souvera-agoa-${group}-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: `AGOA Trade Flows — ${meta.label}`,
        sourceAttribution: 'USITC DataWeb · US Census · USTR AGOA Reports',
        dataAsOf: rows[0]?.year?.toString() ?? '2023',
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
        aiAnalysisConfig: {
          cardType: 'agoa_flows',
          countryName: meta.label,
          iso3: 'AGO',
          data: {
            Category: meta.label,
            'Total US Exports': `$${Math.round(totalExports / 1e6)}M`,
            'AGOA Exports': `$${Math.round(agoaExports / 1e6)}M`,
            'AGOA Share': `${agoaShare.toFixed(1)}%`,
            Countries: rows.length,
          },
        } satisfies CardAnalysisInput,
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, group, meta, rows]);

  return (
    <div
      className="border border-zinc-700 rounded-xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/70 hover:bg-zinc-800/80 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            <span className="text-xl">{meta.icon}</span>
            <div>
              <span className={`font-semibold text-sm ${meta.color}`}>{meta.label}</span>
              <p className="text-zinc-500 text-xs">{rows.length} countries</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs mr-8">
            <div className="text-right hidden sm:block">
              <p className="text-zinc-400">Total exports</p>
              <p className="text-white font-semibold">{usdB(totalExports)}/yr</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-zinc-400">AGOA exports</p>
              <p className="text-emerald-300 font-semibold">{usdB(agoaExports)}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-zinc-400">Duty savings</p>
              <p className="text-amber-300 font-semibold">{usdB(tariffSavings)}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-zinc-400">AGOA share</p>
              <p className="text-blue-300 font-semibold">{pct(agoaShare)}</p>
            </div>
          </div>
        </button>

        {/* PNG Export Button */}
        <div
          data-export-exclude
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-150 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            title="Download as PNG"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-pulse' : ''}`} />
            <span>{exporting ? 'Saving…' : 'PNG'}</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div ref={tableRef} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400 text-xs">
                <th className="px-4 py-2.5 font-semibold">Country</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Total exports</th>
                <th className="px-4 py-2.5 font-semibold">AGOA exports</th>
                <th className="px-4 py-2.5 font-semibold">AGOA share</th>
                <th className="px-4 py-2.5 font-semibold">Duty savings</th>
                <th className="px-4 py-2.5 font-semibold">YoY</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const bar = shareBar(r.agoa_share_pct);
                return (
                  <tr 
                    key={r.id} 
                    onClick={() => onCountryClick({ iso3: r.iso3, name: r.country_name || r.iso3 }, group)}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    title={`Click for ${formatTradeCountryLabel(r.iso3, r.country_name)} AGOA profile`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                        <div>
                          <p className="text-white font-medium text-xs group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 flex-wrap">
                            {formatTradeCountryLabel(r.iso3, r.country_name)}
                            {tierBadge(r.data_quality_tier, r.id)}
                          </p>
                          {r.sub_region ? (
                            <p className="text-zinc-500 text-[10px]">{r.sub_region}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.agoa_eligible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-medium">
                          <XCircle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs font-medium">
                      {r.total_exports_to_us_usd ? usdB(r.total_exports_to_us_usd) : '—'}
                    </td>
                    <td className="px-4 py-3 text-emerald-300 text-xs font-semibold">
                      {(() => {
                        const exp = formatPreferentialUsd(
                          r.agoa_exports_usd,
                          agoaExportsReason(r),
                        );
                        return (
                          <span title={exp.sublabel}>
                            {r.agoa_exports_usd != null || agoaExportsReason(r) !== 'pending' ? exp.text : '—'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                        </div>
                        <span className="text-xs text-zinc-300">{pct(r.agoa_share_pct)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-amber-300 text-xs font-medium">
                      {(() => {
                        const duty = formatDutySavingsCell(r);
                        return (
                          <div>
                            <span>{duty.text}</span>
                            {duty.sublabel && (
                              <p className="text-zinc-600 text-[9px]">{duty.sublabel}</p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.yoy_growth_pct != null ? (
                        <span className={`flex items-center gap-0.5 ${r.yoy_growth_pct > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                          {r.yoy_growth_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {r.yoy_growth_pct > 0 ? '+' : ''}{r.yoy_growth_pct.toFixed(1)}%
                        </span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Top Exporters Card ───────────────────────────────────────────────────────

function TopExportersCard({ exporters, onCountryClick }: {
  exporters: Array<{ iso3: string; name: string; total: number; agoa: number }>;
  onCountryClick: (country: { iso3: string; name: string }) => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: cardRef.current,
        fileName: `souvera-agoa-top-exporters-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: 'Top AGOA Exporters to the United States',
        sourceAttribution: 'USITC DataWeb · US Census · USTR AGOA Reports',
        dataAsOf: '2023',
        aiAnalysisConfig: {
          cardType: 'agoa_flows',
          countryName: 'AGOA Markets',
          iso3: 'AGO',
          data: {
            'Top Exporter': exporters[0]?.name ?? 'N/A',
            'Top AGOA Volume': exporters[0] ? `$${Math.round(exporters[0].agoa / 1e6)}M` : 'N/A',
            'Markets Tracked': exporters.length,
          },
        } satisfies CardAnalysisInput,
      });
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  const maxTotal = Math.max(...exporters.map(e => e.total));

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative p-5 bg-zinc-900/50 border border-zinc-700 rounded-xl"
    >
      {hovered && !exporting && (
        <button
          onClick={handleExport}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/90 border border-zinc-700 hover:bg-zinc-700 transition-colors z-10"
          title="Download as PNG"
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
      )}
      
      <h3 className="text-sm font-semibold text-white mb-4">Top 10 AGOA Exporters</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {exporters.slice(0, 10).map((e, idx) => {
          const barWidth = (e.total / maxTotal) * 100;
          const agoaShare = e.total > 0 ? (e.agoa / e.total) * 100 : 0;
          
          return (
            <button
              key={e.iso3}
              onClick={() => onCountryClick({ iso3: e.iso3, name: e.name })}
              className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-emerald-500/50 hover:bg-zinc-800 transition-all text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                <span className="text-white font-medium text-xs group-hover:text-emerald-300 transition-colors truncate">{formatTradeCountryLabel(e.iso3, e.name)}</span>
              </div>
              <p className="text-emerald-400 text-sm font-bold">{usdB(e.total)}</p>
              <div className="mt-2">
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                    style={{ width: `${barWidth}%` }} 
                  />
                </div>
                <p className="text-zinc-500 text-[10px] mt-1">{pct(agoaShare)} AGOA</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AGOAFlowsClient() {
  const [data, setData] = useState<AGOAFlowsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState('');
  const [eligibleFilter, setEligibleFilter] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<{ iso3: string; name: string; fromCategory?: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (groupFilter) params.set('group', groupFilter);
    if (eligibleFilter) params.set('eligible', eligibleFilter);
    fetch(`/api/v1/trade/agoa/flows?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, [groupFilter, eligibleFilter]);

  const byGroup = useMemo(() => {
    if (!data?.rows) return {};
    const grouped: Record<string, AGOAFlowRow[]> = {};
    for (const r of data.rows) {
      if (!tradeCountryMatchesSearch(r.iso3, r.country_name, countrySearch)) continue;
      if (!grouped[r.category_group]) grouped[r.category_group] = [];
      grouped[r.category_group].push(r);
    }
    return grouped;
  }, [data, countrySearch]);

  const countryRows = useMemo(() => {
    if (!selectedCountry || !data?.rows) return [];
    return data.rows.filter((r) => r.iso3 === selectedCountry.iso3);
  }, [selectedCountry, data]);

  const orderedGroups = useMemo(() => {
    return Object.entries(byGroup)
      .sort(([, a], [, b]) => {
        const aT = a.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
        const bT = b.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
        return bT - aT;
      })
      .map(([g]) => g);
  }, [byGroup]);

  const handleCountryClick = useCallback((country: { iso3: string; name: string }, categoryGroup?: string) => {
    setSelectedCountry({ ...country, fromCategory: categoryGroup });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Country Drawer */}
      {selectedCountry && countryRows.length > 0 && (
        <CountryAGOADrawer
          country={selectedCountry}
          rows={countryRows}
          fromCategory={selectedCountry.fromCategory}
          countryMetrics={data?.summary?.country_metrics?.[selectedCountry.iso3]}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Header */}
      <section className="border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
          <Link href="/intelligence/trade" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-300">
              Phase 0.5E — AGOA Export Intelligence
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">AGOA Trade Flows</h1>
          <p className="text-zinc-300 max-w-3xl text-base leading-relaxed">
            African exports to the United States under AGOA preferential treatment.
            Track <span className="text-white font-medium">duty-free exports, tariff savings, and product opportunities</span> by country and sector.
            Click any country row to view detailed AGOA profile.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Data vintage: 2023 estimates · Sources: USITC DataWeb · US Census · USTR AGOA Reports
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 space-y-6">
        {/* Summary KPIs */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Total African exports to US</p>
              <p className="text-white text-2xl font-bold">{usdB(data.summary.total_exports_to_us_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">AGOA duty-free exports</p>
              <p className="text-emerald-300 text-2xl font-bold">{usdB(data.summary.total_agoa_exports_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
              <p className="text-zinc-500 text-xs mt-1">{pct(data.summary.agoa_share_pct)} of total</p>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Annual tariff savings</p>
              <p className="text-amber-300 text-2xl font-bold">{usdB(data.summary.total_tariff_savings_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
              <p className="text-zinc-500 text-xs mt-1">Excludes petroleum (HTS Ch. 27)</p>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">AGOA-eligible countries</p>
              <p className="text-white text-2xl font-bold">{data.summary.eligible_markets}</p>
              <p className="text-zinc-500 text-xs">{data.summary.suspended_markets} suspended</p>
            </div>
          </div>
        )}

        {/* Strategic Context */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/25 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">AGOA Preference Program — African Exports to US</p>
            <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
              The African Growth and Opportunity Act provides duty-free access for eligible products from sub-Saharan African countries.
              The <span className="text-amber-300 font-medium">tariff savings</span> shown represent the direct benefit to African exporters —
              duties that would otherwise be paid under MFN rates. These savings translate to price competitiveness in the US market.
            </p>
          </div>
        </div>

        {/* Top Exporters */}
        {data?.summary?.top_exporters && data.summary.top_exporters.length > 0 && (
          <TopExportersCard 
            exporters={data.summary.top_exporters} 
            onCountryClick={(country) => handleCountryClick(country)}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
              className="bg-transparent text-zinc-300 text-sm focus:outline-none">
              <option value="">All categories</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <select value={eligibleFilter} onChange={e => setEligibleFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm focus:outline-none">
            <option value="">All countries</option>
            <option value="true">Eligible only</option>
            <option value="false">Suspended only</option>
          </select>
          {(groupFilter || eligibleFilter || countrySearch) && (
            <button
              type="button"
              onClick={() => { setGroupFilter(''); setEligibleFilter(''); setCountrySearch(''); }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400 text-sm transition-colors"
            >
              Clear filters
            </button>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
          <p className="text-zinc-600 text-xs self-center ml-auto hidden sm:block">
            Hover a category header to export PNG · Click any country row to open full AGOA profile
          </p>
        </div>

        {/* Coverage Info */}
        <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-start gap-2.5">
          <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">{data?.summary?.markets_covered ?? '—'} countries</span> covered across 10 product categories.
            {data?.summary?.data_gaps && data.summary.data_gaps.markets_no_db_data.length > 0 && (
              <span className="text-amber-500/80"> · {data.summary.data_gaps.markets_no_db_data.length} markets awaiting category breakdown</span>
            )}
            AGOA trade flow data is updated from USITC DataWeb and US Census Bureau statistics.
          </div>
        </div>

        {error && <p className="text-red-400 text-sm p-3 bg-red-950/30 border border-red-500/20 rounded-lg">{error}</p>}

        {/* Category Cards */}
        <div className="space-y-3">
          {orderedGroups.map(group => (
            <CategoryCard 
              key={group} 
              group={group} 
              rows={byGroup[group] ?? []} 
              onCountryClick={handleCountryClick}
            />
          ))}
          {orderedGroups.length === 0 && !loading && (
            <div className="py-12 text-center text-zinc-500">
              <Globe className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
              <p className="text-sm">No AGOA trade flow data found.</p>
              <p className="text-xs mt-1">Run the ingestion script to populate data.</p>
            </div>
          )}
        </div>

        {/* Attribution */}
        {data?.attribution && (
          <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500">
            <p className="font-medium text-zinc-400 mb-1">Data attribution</p>
            <p>{data.attribution.sources.join(' · ')}</p>
            <p className="mt-1">{data.attribution.note}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 pt-2 text-sm border-t border-zinc-800">
          <Link href="/intelligence/trade/agoa" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
            AGOA Eligibility Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/agoa/products" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
            AGOA Product Finder <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/demand" className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors">
            African Demand Intelligence <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/afcfta/flows" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
            AfCFTA Trade Flows <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
