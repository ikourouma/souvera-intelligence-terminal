'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronRight,
  Download, Globe, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  X, Filter, AlertTriangle, Building2, Users, Search, Info,
  ArrowUpRight, ArrowDownLeft, Repeat, Ship, Clock,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { iso3ToIso2, flagUrlFromIso3, formatTradeCountryLabel, tradeCountryMatchesSearch } from '@/lib/intelligence/export-branding';
import { buildCuratedCardAnalysisForExport } from '@/lib/intelligence/generate-card-analysis';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { CollapsibleAnalysis } from '@/components/intelligence/CollapsibleAnalysis';
import { TradeDataQualityBadge, TradeDataQualityBanner } from '@/components/intelligence/TradeDataQualityBadge';
import { DirectionToggle, FlowDirection } from '@/components/intelligence/DirectionToggle';
import { Top10Card, Top10Item } from '@/components/intelligence/Top10Card';

// ─── Types ────────────────────────────────────────────────────────────────────

type DataQualityTier = 'A' | 'B' | 'C';

interface CBTPAFlowRow {
  id: string;
  year: number;
  hs_chapter: string;
  category_label: string;
  category_group: string;
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  total_imports_usd: number | null;
  total_exports_usd: number | null;
  trade_with_us_usd: number | null;
  trade_with_us_share_pct: number | null;
  intra_caribbean_trade_usd: number | null;
  intra_caribbean_share_pct: number | null;
  trade_with_eu_usd: number | null;
  trade_with_china_usd: number | null;
  cbtpa_tariff_pct: number | null;
  mfn_tariff_pct: number | null;
  preference_margin_pct: number | null;
  roo_compliant: boolean | null;
  cbi_beneficiary: boolean | null;
  caricom_member: boolean | null;
  yoy_growth_pct: number | null;
  top_partners: Array<{ country: string; iso3: string; sharePct: number; valueUsd: number }>;
  top_products: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number }>;
  source_notes: string | null;
  data_quality_tier: DataQualityTier;
}

interface CBTPAFlowResponse {
  rows: CBTPAFlowRow[];
  summary: {
    record_count: number;
    total_us_trade_usd: number;
    total_intra_caribbean_trade_usd: number;
    total_trade_usd: number;
    us_trade_share_pct: number;
    intra_caribbean_share_pct: number;
    markets_covered: number;
    cbi_beneficiaries: number;
    caricom_members: number;
    category_group_totals: Record<string, {
      trade_with_us_usd: number;
      intra_caribbean_trade_usd: number;
      total_trade_usd: number;
      country_count: number;
    }>;
    top_traders?: Array<{ iso3: string; name: string; usTrade: number; total: number; cbi: boolean; caricom: boolean }>;
    data_vintage: string;
    direction: string;
    legislative_deadline: string;
  };
  attribution: { sources: string[]; note: string; framework: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usdB(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}
function pct(v: number | null | undefined): string {
  return v != null ? `${v.toFixed(1)}%` : '—';
}
function shareBar(share: number | null | undefined): { width: string; color: string } {
  const s = Math.max(0, Math.min(100, share ?? 0));
  let color = 'bg-zinc-600';
  if (s >= 30) color = 'bg-emerald-500';
  else if (s >= 20) color = 'bg-blue-500';
  else if (s >= 10) color = 'bg-amber-500';
  return { width: `${s}%`, color };
}

function daysUntilExpiration(): number {
  const deadline = new Date('2026-12-31');
  const now = new Date();
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; narrative: string }> = {
  machinery: {
    label: 'Machinery & Equipment', icon: '⚙️',
    color: 'text-blue-300',
    narrative: 'The Caribbean imports significant machinery from the US, supporting agriculture, mining, and construction sectors. CBTPA duty-free access enables competitive sourcing. Key markets: Trinidad & Tobago (oil & gas equipment), Dominican Republic (manufacturing), Jamaica (mining).',
  },
  minerals: {
    label: 'Minerals & Mining', icon: '⛏️',
    color: 'text-amber-300',
    narrative: 'Caribbean mineral exports, particularly bauxite from Jamaica and gold from Guyana, benefit from CBTPA preferences. US demand for critical minerals creates export opportunities for regional producers.',
  },
  petroleum: {
    label: 'Petroleum & Energy', icon: '⛽',
    color: 'text-orange-300',
    narrative: 'Trinidad & Tobago is a major regional energy hub, exporting LNG and petrochemicals. CBTPA supports the energy trade corridor between the Caribbean and US Gulf Coast refineries.',
  },
  agriculture: {
    label: 'Agriculture & Food', icon: '🌾',
    color: 'text-emerald-300',
    narrative: 'Agricultural trade is bidirectional — the Caribbean imports US grains while exporting tropical products like sugar, rum, and citrus. CBTPA preferences support Caribbean agricultural diversification.',
  },
  textiles: {
    label: 'Textiles & Apparel', icon: '🧵',
    color: 'text-pink-300',
    narrative: 'The apparel sector is critical for CBTPA, especially Haiti under HOPE/HELP provisions and the Dominican Republic. US yarn and fabric inputs support Caribbean garment assembly for re-export to the US market.',
  },
  chemicals: {
    label: 'Chemicals & Pharmaceuticals', icon: '🧪',
    color: 'text-violet-300',
    narrative: 'Caribbean imports of US pharmaceuticals are significant, while regional exports include Trinidad\'s methanol and ammonia. CBTPA enables competitive pricing for essential medicines and industrial chemicals.',
  },
  vehicles: {
    label: 'Vehicles & Transport', icon: '🚛',
    color: 'text-cyan-300',
    narrative: 'Vehicle imports from the US serve growing consumer and commercial markets. The proximity advantage under CBTPA makes US-sourced vehicles competitive against Asian alternatives.',
  },
  electronics: {
    label: 'Electronics & ICT', icon: '📡',
    color: 'text-sky-300',
    narrative: 'ICT imports support Caribbean digital transformation. US tech exports benefit from CBTPA preferences, while the region develops nearshore IT services.',
  },
};

// ─── Souvera analysis generator ─────────────────────────────────────────────

function generateSouveraAnalysis(row: CBTPAFlowRow, direction: FlowDirection): string {
  const isImport = direction === 'imports';
  const usValue = row.trade_with_us_usd;
  const usShare = row.trade_with_us_share_pct;
  const caribbeanValue = row.intra_caribbean_trade_usd;
  const caribbeanShare = row.intra_caribbean_share_pct;
  const totalValue = isImport ? row.total_imports_usd : row.total_exports_usd;
  const topPartner = row.top_partners?.[0];
  const topProduct = row.top_products?.[0];

  const flowText = isImport
    ? `${formatTradeCountryLabel(row.iso3, row.country_name)} imports ${usdB(totalValue ?? 0)} in ${row.category_label.toLowerCase()}, with ${pct(usShare)} (${usdB(usValue ?? 0)}) sourced from the United States.`
    : `${formatTradeCountryLabel(row.iso3, row.country_name)} exports ${usdB(totalValue ?? 0)} in ${row.category_label.toLowerCase()}, with ${pct(usShare)} (${usdB(usValue ?? 0)}) going to the US market.`;

  const caribbeanText = caribbeanValue && caribbeanShare && caribbeanShare > 5
    ? ` Intra-Caribbean trade represents ${pct(caribbeanShare)} (${usdB(caribbeanValue)}).`
    : '';

  const productText = topProduct
    ? ` Key product: ${topProduct.description} (HS ${topProduct.hsCode}) at ${usdB(topProduct.valueUsd)}/yr (${pct(topProduct.sharePct)} of category).`
    : '';

  const cbtpaText = row.roo_compliant
    ? ' Compliant with CBTPA Rules of Origin.'
    : row.cbi_beneficiary
      ? ' CBTPA-eligible product category.'
      : '';

  const growthText = row.yoy_growth_pct != null && row.yoy_growth_pct > 5
    ? ` US-Caribbean trade growing at ${pct(row.yoy_growth_pct)} YoY.`
    : '';

  return `${flowText}${caribbeanText}${productText}${cbtpaText}${growthText}`;
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
        flagUrl: flagUrlFromIso3(country.iso3),
        sourceAttribution: sourceNotes,
        dataAsOf: `${year}`,
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
        curatedAnalysis: buildCuratedCardAnalysisForExport({
          cardType: 'cbtpa_flows',
          countryName: country.name,
          iso3: country.iso3,
          data: { Category: category ?? title, Year: year },
        }),
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

// ─── Country Drawer ───────────────────────────────────────────────────────────

function CountryTradeDrawer({
  country,
  rows,
  direction,
  fromCategory,
  onClose,
}: {
  country: { iso3: string; name: string; fromCategory?: string };
  rows: CBTPAFlowRow[];
  direction: FlowDirection;
  fromCategory?: string;
  onClose: () => void;
}) {
  const [exportingSection, setExportingSection] = useState<string | null>(null);
  const handleExportStart = useCallback((id: string) => setExportingSection(id), []);
  const handleExportEnd = useCallback(() => setExportingSection(null), []);

  const isImport = direction === 'imports';
  const year = rows[0]?.year ?? 2023;
  const dateStr = new Date().toISOString().slice(0, 10);

  const totalValue = rows.reduce((s, r) => s + ((isImport ? r.total_imports_usd : r.total_exports_usd) ?? 0), 0);
  const usValue = rows.reduce((s, r) => s + (r.trade_with_us_usd ?? 0), 0);
  const usShare = totalValue > 0 ? (usValue / totalValue) * 100 : 0;
  const caribbeanValue = rows.reduce((s, r) => s + (r.intra_caribbean_trade_usd ?? 0), 0);
  const caribbeanShare = totalValue > 0 ? (caribbeanValue / totalValue) * 100 : 0;

  const isCbi = rows.some(r => r.cbi_beneficiary);
  const isCaricom = rows.some(r => r.caricom_member);
  const dataTier = rows[0]?.data_quality_tier ?? 'A';

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (fromCategory) {
        if (a.category_group === fromCategory) return -1;
        if (b.category_group === fromCategory) return 1;
      }
      const aVal = a.trade_with_us_usd ?? 0;
      const bVal = b.trade_with_us_usd ?? 0;
      return bVal - aVal;
    });
  }, [rows, fromCategory]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="shrink-0 p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
              {country.iso3}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-lg">{country.name}</h2>
                <TradeDataQualityBadge tier={dataTier} showLabel={false} />
              </div>
              <p className="text-zinc-400 text-xs">
                CBTPA {isImport ? 'Import' : 'Export'} Profile • {year}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Data quality banner for Tier C */}
          <TradeDataQualityBanner tier={dataTier} />

          {/* Summary KPIs */}
          <ExportableSection
            id={`${country.iso3}-overview`}
            title="Overview"
            country={country}
            year={year}
            sourceNotes="USTR CBI · ITC Trade Map · UN Comtrade"
            fileName={`${country.iso3}-cbtpa-overview-${dateStr}.png`}
            exporting={exportingSection === `${country.iso3}-overview`}
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="uppercase tracking-wide font-semibold text-emerald-400">Trade Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Total {isImport ? 'Imports' : 'Exports'}</p>
                  <p className="text-lg font-bold text-white">{usdB(totalValue)}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-[10px] text-blue-400 uppercase tracking-wide">US Trade</p>
                  <p className="text-lg font-bold text-blue-300">{usdB(usValue)}</p>
                  <p className="text-xs text-blue-400/70">{pct(usShare)} share</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <p className="text-[10px] text-cyan-400 uppercase tracking-wide">Intra-Caribbean</p>
                  <p className="text-lg font-bold text-cyan-300">{usdB(caribbeanValue)}</p>
                  <p className="text-xs text-cyan-400/70">{pct(caribbeanShare)} share</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Framework Status</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {isCbi && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">CBI Beneficiary</span>
                    )}
                    {isCaricom && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">CARICOM Member</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ExportableSection>

          {/* Category breakdown */}
          <ExportableSection
            id={`${country.iso3}-categories`}
            title="Categories"
            country={country}
            year={year}
            sourceNotes="USTR CBI · ITC Trade Map · UN Comtrade"
            fileName={`${country.iso3}-cbtpa-categories-${dateStr}.png`}
            exporting={exportingSection === `${country.iso3}-categories`}
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="uppercase tracking-wide font-semibold">Category Breakdown</span>
              </div>
              <div className="space-y-2">
                {sorted.map((r, idx) => {
                  const meta = CATEGORY_META[r.category_group];
                  const bar = shareBar(r.trade_with_us_share_pct);
                  return (
                    <div key={r.id} className="p-2 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${meta?.color ?? 'text-zinc-300'}`}>
                          {meta?.icon} {r.category_label}
                        </span>
                        <span className="text-xs text-blue-300 font-semibold">{usdB(r.trade_with_us_usd ?? 0)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} transition-all`} style={{ width: bar.width }} />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">{pct(r.trade_with_us_share_pct)} US share</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ExportableSection>

          {/* Souvera Analysis */}
          <ExportableSection
            id={`${country.iso3}-analysis`}
            title="Analysis"
            country={country}
            year={year}
            sourceNotes="Souvera Intelligence Platform"
            fileName={`${country.iso3}-cbtpa-analysis-${dateStr}.png`}
            exporting={exportingSection === `${country.iso3}-analysis`}
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
            isHighlighted
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <Sparkles className="w-4 h-4" />
                <span className="uppercase tracking-wide font-semibold">Souvera Analysis</span>
              </div>
              <CollapsibleAnalysis
                text={sorted.slice(0, 3).map((r) => generateSouveraAnalysis(r, direction)).join('\n\n')}
                titleClass="hidden"
                className="text-zinc-300 text-sm"
              />
            </div>
          </ExportableSection>

          {/* Top Products */}
          {sorted[0]?.top_products && sorted[0].top_products.length > 0 && (
            <ExportableSection
              id={`${country.iso3}-products`}
              title="Products"
              country={country}
              year={year}
              sourceNotes="USTR CBI · ITC Trade Map"
              fileName={`${country.iso3}-cbtpa-products-${dateStr}.png`}
              exporting={exportingSection === `${country.iso3}-products`}
              onExportStart={handleExportStart}
              onExportEnd={handleExportEnd}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <Ship className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase tracking-wide font-semibold">Top Products</span>
                </div>
                {sorted[0].top_products.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-zinc-400 truncate flex-1">
                      <span className="text-cyan-400/70 font-mono text-[10px]">HS {p.hsCode}</span>{' '}
                      {p.description}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-emerald-300 font-medium">{usdB(p.valueUsd)}</span>
                      <span className="text-zinc-500">{pct(p.sharePct)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ExportableSection>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between">
            <Link
              href="/intelligence/trade/demand-caribbean"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Caribbean Demand
            </Link>
            <span className="text-[10px] text-zinc-500">
              CBTPA expires Dec 31, 2026 • {daysUntilExpiration()} days
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  categoryGroup,
  rows,
  direction,
  expanded,
  onToggle,
  onCountryClick,
}: {
  categoryGroup: string;
  rows: CBTPAFlowRow[];
  direction: FlowDirection;
  expanded: boolean;
  onToggle: () => void;
  onCountryClick: (iso3: string, name: string, category: string) => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[categoryGroup];
  const isImport = direction === 'imports';

  const totalUSTrade = rows.reduce((s, r) => s + (r.trade_with_us_usd ?? 0), 0);
  const totalAllTrade = rows.reduce((s, r) => s + ((isImport ? r.total_imports_usd : r.total_exports_usd) ?? 0), 0);
  const totalCaribbeanTrade = rows.reduce((s, r) => s + (r.intra_caribbean_trade_usd ?? 0), 0);
  const avgUSShare = rows.length > 0
    ? rows.reduce((s, r) => s + (r.trade_with_us_share_pct ?? 0), 0) / rows.length
    : 0;
  const countryCount = new Set(rows.map(r => r.iso3)).size;

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => (b.trade_with_us_usd ?? 0) - (a.trade_with_us_usd ?? 0));
  }, [rows]);

  const handleExport = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tableRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: tableRef.current,
        fileName: `souvera-cbtpa-${direction}-${categoryGroup}-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: `CBTPA ${isImport ? 'Import' : 'Export'} Intelligence — ${meta?.label ?? categoryGroup}`,
        sourceAttribution: 'USTR CBI · ITC Trade Map · UN Comtrade',
        dataAsOf: rows[0]?.year?.toString() ?? '2023',
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
        curatedAnalysis: buildCuratedCardAnalysisForExport({
          cardType: 'cbtpa_flows',
          countryName: meta?.label ?? categoryGroup,
          iso3: 'CBI',
          data: { Category: meta?.label ?? categoryGroup, Direction: direction, Countries: rows.length },
        }),
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, categoryGroup, meta, rows, direction, isImport]);

  return (
    <div
      className="border border-zinc-700 rounded-xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/70 hover:bg-zinc-800/80 text-left transition-colors"
        >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />}
          <span className="text-xl">{meta?.icon ?? '📦'}</span>
          <div>
            <span className={`font-semibold text-sm ${meta?.color ?? 'text-zinc-200'}`}>{meta?.label ?? categoryGroup}</span>
            <p className="text-zinc-500 text-xs">{countryCount} markets · 2023 data</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs shrink-0 mr-8">
          <div className="text-right hidden sm:block">
            <p className="text-zinc-400">US Trade</p>
            <p className="text-blue-300 font-semibold">{usdB(totalUSTrade)}/yr</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-zinc-400">Total {isImport ? 'Imports' : 'Exports'}</p>
            <p className="text-zinc-300 font-semibold">{usdB(totalAllTrade)}/yr</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-zinc-400">Avg US share</p>
            <p className="text-cyan-400 font-semibold">{pct(avgUSShare)}</p>
          </div>
        </div>
      </button>

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
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400 text-xs">
              <th className="px-4 py-2.5 font-semibold">Country</th>
              <th className="px-4 py-2.5 font-semibold">US Trade</th>
              <th className="px-4 py-2.5 font-semibold">US Share</th>
              <th className="px-4 py-2.5 font-semibold">CARICOM</th>
              <th className="px-4 py-2.5 font-semibold">YoY</th>
              <th className="px-4 py-2.5 font-semibold">CBTPA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 10).map(r => (
              <tr
                key={r.id}
                onClick={() => onCountryClick(r.iso3, r.country_name, categoryGroup)}
                className="border-b border-zinc-800/60 hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                title={`Click for ${formatTradeCountryLabel(r.iso3, r.country_name)} CBTPA profile`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0" />
                    <div>
                      <p className="text-white font-medium text-xs group-hover:text-blue-300 transition-colors">{formatTradeCountryLabel(r.iso3, r.country_name)}</p>
                      {(r.sub_region || r.region) ? (
                        <p className="text-zinc-500 text-[10px]">{r.sub_region || r.region}</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-blue-300 font-semibold text-xs">{usdB(r.trade_with_us_usd ?? 0)}</td>
                <td className="px-4 py-3 text-zinc-300 text-xs">{pct(r.trade_with_us_share_pct)}</td>
                <td className="px-4 py-3 text-cyan-400 text-xs">{usdB(r.intra_caribbean_trade_usd ?? 0)}</td>
                <td className="px-4 py-3 text-xs">
                  {r.yoy_growth_pct != null ? (
                    <span className={`flex items-center gap-0.5 ${r.yoy_growth_pct > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                      {r.yoy_growth_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {r.yoy_growth_pct > 0 ? '+' : ''}{r.yoy_growth_pct.toFixed(1)}%
                    </span>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {r.preference_margin_pct != null && r.preference_margin_pct > 0 ? (
                    <span className="text-emerald-400 font-medium">{pct(r.preference_margin_pct)}</span>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta?.narrative && (
          <div className="px-5 py-3 bg-zinc-900/50 border-t border-zinc-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-400 leading-relaxed">{meta.narrative}</p>
          </div>
        )}
      </div>
    )}
  </div>
);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CBTpaTradeIntelligence() {
  const [data, setData] = useState<CBTPAFlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<FlowDirection>('imports');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<{ iso3: string; name: string; fromCategory?: string } | null>(null);
  const [groupFilter, setGroupFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('direction', direction);
    if (groupFilter) params.set('group', groupFilter);

    fetch(`/api/v1/trade/cbtpa/flows?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error('[CBTpaTradeIntelligence] Load error:', e);
        setError(e.message);
        setLoading(false);
      });
  }, [direction, groupFilter]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const handleCountryClick = useCallback((iso3: string, name: string, category: string) => {
    setSelectedCountry({ iso3, name, fromCategory: category });
  }, []);

  const groupedByCategory = useMemo(() => {
    if (!data?.rows) return {};
    const groups: Record<string, CBTPAFlowRow[]> = {};
    for (const row of data.rows) {
      if (regionFilter && row.region !== regionFilter && row.sub_region !== regionFilter) continue;
      if (!tradeCountryMatchesSearch(row.iso3, row.country_name, searchTerm)) continue;
      if (!groups[row.category_group]) groups[row.category_group] = [];
      groups[row.category_group].push(row);
    }
    return groups;
  }, [data, searchTerm, regionFilter]);

  const countryRows = useMemo(() => {
    if (!selectedCountry || !data?.rows) return [];
    return data.rows.filter(r => r.iso3 === selectedCountry.iso3);
  }, [selectedCountry, data]);

  const daysRemaining = daysUntilExpiration();
  const isImport = direction === 'imports';

  const allRegions = useMemo(() => {
    const s = new Set<string>();
    (data?.rows ?? []).forEach((r) => { if (r.sub_region) s.add(r.sub_region); });
    return [...s].sort();
  }, [data]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
          <Link href="/intelligence/trade" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Repeat className="w-6 h-6 text-blue-400" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-300">
              Phase 0.7 — CBTPA Trade Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CBTPA Import-Export Intelligence</h1>
          <p className="text-zinc-300 max-w-3xl text-base leading-relaxed">
            US-Caribbean bilateral trade flows under the Caribbean Basin Trade Partnership Act.
            Toggle between <span className="text-emerald-400 font-medium">Imports</span> and <span className="text-teal-400 font-medium">Exports</span> views
            to analyze trade corridors and market access opportunities.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Data vintage: 2023 curated estimates · Sources: USTR CBI · ITC Trade Map · UN Comtrade
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 space-y-6">

        {/* Direction Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <DirectionToggle direction={direction} onChange={setDirection} />
          
          {loading && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
        </div>

        {/* Summary KPIs */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">US {isImport ? 'Exports to' : 'Imports from'} Caribbean</p>
            <p className="text-2xl font-bold text-blue-300">{usdB(data.summary.total_us_trade_usd)}</p>
            <p className="text-xs text-zinc-500">{pct(data.summary.us_trade_share_pct)} of total</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Intra-Caribbean Trade</p>
            <p className="text-2xl font-bold text-cyan-300">{usdB(data.summary.total_intra_caribbean_trade_usd)}</p>
            <p className="text-xs text-zinc-500">{pct(data.summary.intra_caribbean_share_pct)} CARICOM share</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Markets Covered</p>
            <p className="text-2xl font-bold text-white">{data.summary.markets_covered}</p>
            <p className="text-xs text-zinc-500">Caribbean nations</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">CBI Beneficiaries</p>
            <p className="text-2xl font-bold text-emerald-300">{data.summary.cbi_beneficiaries}</p>
            <p className="text-xs text-zinc-500">CBTPA eligible</p>
          </div>
        </div>
        )}

        {/* Strategic Context with Legislative Urgency */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-cyan-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-sm font-semibold text-amber-300">CBTPA Legislative Alert</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{daysRemaining} days until expiration</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                <span className="font-semibold text-amber-200">CBTPA expires December 31, 2026.</span> Caribbean beneficiaries face tariff increases averaging 5-15% on key exports without reauthorization.{' '}
                {isImport 
                  ? "This intelligence demonstrates the strategic importance of the US-Caribbean trade corridor for American exporters and supports the economic case for CBTPA renewal."
                  : "This intelligence quantifies Caribbean export dependence on CBTPA preferences and supports the case for program reauthorization."
                }
              </p>
              <div className="pt-3 border-t border-zinc-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <p className="text-xs font-medium text-blue-300">US-Caribbean Reciprocal Trade Relationship</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isImport 
                    ? "Caribbean imports from the world show strong US market share due to CBTPA preferences and geographic proximity. This intelligence identifies opportunities for US exporters to increase market penetration in agriculture machinery, pharmaceuticals, and industrial inputs."
                    : "Caribbean exports to the US benefit from CBTPA duty-free treatment. Key export sectors include textiles (Haiti, DR), energy products (Trinidad), and agricultural goods. These trade flows demonstrate the mutual benefits of the US-Caribbean partnership."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Traders */}
        {data?.summary?.top_traders && data.summary.top_traders.length > 0 && (
          <Top10Card
            title={isImport ? 'Top 10 US-Caribbean Importers' : 'Top 10 US-Caribbean Exporters'}
            items={data.summary.top_traders.map((t) => ({
              id: t.iso3,
              label: t.name,
              sublabel: t.cbi ? 'CBI Beneficiary' : t.caricom ? 'CARICOM Member' : t.iso3,
              value: t.usTrade,
              secondaryValue: t.total > 0 ? (t.usTrade / t.total) * 100 : 0,
              secondaryLabel: 'US share',
              badge: t.cbi ? 'CBI' : t.caricom ? 'CARICOM' : undefined,
              badgeColor: t.cbi ? 'emerald' : 'blue',
            }))}
            onItemClick={(item) => setSelectedCountry({ iso3: item.id, name: item.label })}
            colorScheme="cyan"
            exportFileName={`souvera-cbtpa-top-${isImport ? 'importers' : 'exporters'}-${new Date().toISOString().slice(0, 10)}`}
            exportTitle={`Top 10 CBTPA ${isImport ? 'Importers' : 'Exporters'}`}
            sourceAttribution="USTR CBI Program · ITC Trade Map · UN Comtrade"
            dataAsOf={data.summary.data_vintage}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-transparent text-zinc-300 text-sm focus:outline-none">
              <option value="">All categories</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm focus:outline-none">
            <option value="">All regions</option>
            {allRegions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {(searchTerm || regionFilter || groupFilter) && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setRegionFilter(''); setGroupFilter(''); }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400 text-sm transition-colors"
            >
              Clear filters
            </button>
          )}
          <p className="text-zinc-600 text-xs self-center ml-auto hidden sm:block">
            Hover a category header to export PNG · Click any country row to open full CBTPA profile
          </p>
        </div>

        {/* Coverage info */}
        <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-start gap-2.5">
          <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">{data?.summary?.markets_covered ?? '—'} markets</span> currently covered across 8 product categories.
            Full 20-country Caribbean coverage with detailed bilateral flows is rolling out via ITC Trade Map API integration in Phase 1.
            All trade signals auto-update from source data.
          </div>
        </div>

        {error && <p className="text-red-400 text-sm p-3 bg-red-950/30 border border-red-500/20 rounded-lg">{error}</p>}

        {/* Category accordion tables */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-zinc-400">Loading CBTPA trade flows...</span>
            </div>
          ) : Object.keys(groupedByCategory).length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Globe className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
              <p className="text-sm">No trade signals found.</p>
              <p className="text-xs mt-1">CBTPA trade flow data will be populated in Phase 1.</p>
            </div>
          ) : (
            Object.entries(groupedByCategory)
              .sort(([, a], [, b]) => {
                const aTotal = a.reduce((s, r) => s + (r.trade_with_us_usd ?? 0), 0);
                const bTotal = b.reduce((s, r) => s + (r.trade_with_us_usd ?? 0), 0);
                return bTotal - aTotal;
              })
              .map(([category, rows]) => (
                <CategoryCard
                  key={category}
                  categoryGroup={category}
                  rows={rows}
                  direction={direction}
                  expanded={expandedCategories.has(category)}
                  onToggle={() => toggleCategory(category)}
                  onCountryClick={handleCountryClick}
                />
              ))
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
          <Link href="/intelligence/trade/demand-caribbean" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
            Caribbean Import Demand <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/afcfta/flows" className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors">
            AfCFTA Import-Export <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/agoa" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
            AGOA Eligibility Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer - kept separate for visual consistency */}
      <div className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span>Data: {data?.summary?.data_vintage ?? '2023'}</span>
            <span>•</span>
            <span>{data?.attribution?.framework}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/intelligence/trade/demand-caribbean" className="hover:text-zinc-300 transition-colors">
              Caribbean Demand Intelligence
            </Link>
            <span>•</span>
            <Link href="/intelligence/trade/afcfta/flows" className="hover:text-zinc-300 transition-colors">
              AfCFTA Import-Export
            </Link>
          </div>
        </div>
      </div>

      {/* Country Drawer */}
      {selectedCountry && countryRows.length > 0 && (
        <CountryTradeDrawer
          country={selectedCountry}
          rows={countryRows}
          direction={direction}
          fromCategory={selectedCountry.fromCategory}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
}
