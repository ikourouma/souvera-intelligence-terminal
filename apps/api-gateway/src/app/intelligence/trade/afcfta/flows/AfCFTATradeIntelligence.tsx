'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronRight,
  Download, Globe, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  X, Filter, AlertTriangle, Building2, Users, Search, Info,
  ArrowUpRight, ArrowDownLeft, Repeat,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { iso3ToIso2, flagUrlFromIso3, formatTradeCountryLabel, tradeCountryMatchesSearch } from '@/lib/intelligence/export-branding';
import { buildCuratedCardAnalysisForExport } from '@/lib/intelligence/generate-card-analysis';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { CollapsibleAnalysis } from '@/components/intelligence/CollapsibleAnalysis';
import { DirectionToggle, FlowDirection } from '@/components/intelligence/DirectionToggle';
import { Top10Card, Top10Item } from '@/components/intelligence/Top10Card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TradeFlowRow {
  id: string;
  year: number;
  hs_chapter: string;
  category_label: string;
  category_group: string;
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  // Import-side data (what country imports)
  total_imports_usd: number | null;
  imports_from_africa_usd: number | null;
  imports_from_africa_share_pct: number | null;
  // Export-side data (what country exports)
  total_exports_usd: number | null;
  exports_to_africa_usd: number | null;
  exports_to_africa_share_pct: number | null;
  // AfCFTA-specific
  afcfta_tariff_pct: number | null;
  mfn_tariff_pct: number | null;
  preference_margin_pct: number | null;
  roo_compliant: boolean | null;
  yoy_growth_pct: number | null;
  top_partners: Array<{ country: string; iso3: string; sharePct: number; valueUsd: number }>;
  top_products: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number }>;
  source_notes: string | null;
}

interface TradeFlowResponse {
  rows: TradeFlowRow[];
  summary: {
    record_count: number;
    total_intra_africa_trade_usd: number;
    total_trade_usd: number;
    intra_africa_share_pct: number;
    markets_covered: number;
    category_group_totals: Record<string, {
      intra_africa_trade_usd: number;
      total_trade_usd: number;
      country_count: number;
    }>;
    top_traders?: Array<{ iso3: string; name: string; intraAfrica: number; total: number }>;
    data_vintage: string;
  };
  attribution: { sources: string[]; note: string };
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

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; narrative: string }> = {
  machinery: {
    label: 'Machinery & Equipment', icon: '⚙️',
    color: 'text-blue-300',
    narrative: 'Machinery and equipment represents the largest intra-Africa trade category under AfCFTA. South Africa, Egypt, and Morocco are the primary regional suppliers, with manufacturing hubs serving automotive, mining, and agricultural sectors. AfCFTA tariff liberalization on HS 84-85 creates new regional supply chain opportunities.',
  },
  minerals: {
    label: 'Minerals & Mining', icon: '⛏️',
    color: 'text-amber-300',
    narrative: 'Africa\'s mineral wealth drives significant intra-regional trade flows. AfCFTA enables value addition within Africa — transforming raw material exports into processed goods. Key corridors: DRC copper to Zambia smelters, Guinea bauxite to Ghana alumina.',
  },
  petroleum: {
    label: 'Petroleum & Energy', icon: '⛽',
    color: 'text-orange-300',
    narrative: 'Energy products represent the highest-value intra-Africa trade category. Nigeria, Angola, and Algeria supply crude and refined products regionally. AfCFTA facilitates regional energy security through preferential market access.',
  },
  agriculture: {
    label: 'Agriculture & Food', icon: '🌾',
    color: 'text-emerald-300',
    narrative: 'Food security is a core AfCFTA objective. Intra-Africa agricultural trade is growing rapidly, with South Africa, Kenya, and Egypt as key suppliers. AfCFTA reduces barriers to regional food trade, supporting the AU\'s food sovereignty goals.',
  },
  textiles: {
    label: 'Textiles & Apparel', icon: '🧵',
    color: 'text-pink-300',
    narrative: 'AfCFTA\'s Rules of Origin for textiles favor African-sourced inputs. Ethiopia, Kenya, and Lesotho are emerging as regional apparel hubs. Intra-Africa yarn and fabric trade supports continental value chains under AfCFTA provisions.',
  },
  chemicals: {
    label: 'Chemicals & Pharmaceuticals', icon: '🧪',
    color: 'text-violet-300',
    narrative: 'The African pharmaceutical market is growing 8-10% annually. AfCFTA promotes regional manufacturing and distribution of essential medicines. South Africa, Morocco, and Egypt lead regional pharmaceutical exports.',
  },
  vehicles: {
    label: 'Vehicles & Transport', icon: '🚛',
    color: 'text-cyan-300',
    narrative: 'Automotive represents a strategic AfCFTA sector. South Africa dominates regional vehicle exports, with Morocco emerging as a North African hub. AfCFTA\'s automotive protocol aims to build continental supply chains.',
  },
  electronics: {
    label: 'Electronics & ICT', icon: '📡',
    color: 'text-sky-300',
    narrative: 'Digital infrastructure is growing rapidly across Africa. Intra-Africa ICT trade supports regional connectivity goals. AfCFTA\'s e-commerce protocol complements goods trade liberalization.',
  },
};

// ─── Souvera analysis generator ─────────────────────────────────────────────

function generateSouveraAnalysis(row: TradeFlowRow, direction: FlowDirection): string {
  const isImport = direction === 'imports';
  const africaValue = isImport ? row.imports_from_africa_usd : row.exports_to_africa_usd;
  const africaShare = isImport ? row.imports_from_africa_share_pct : row.exports_to_africa_share_pct;
  const totalValue = isImport ? row.total_imports_usd : row.total_exports_usd;
  const topPartner = row.top_partners?.[0];
  const topProduct = row.top_products?.[0];

  const flowText = isImport
    ? `${formatTradeCountryLabel(row.iso3, row.country_name)} imports ${usdB(totalValue ?? 0)} in ${row.category_label.toLowerCase()}, with ${pct(africaShare)} (${usdB(africaValue ?? 0)}) sourced from African partners.`
    : `${formatTradeCountryLabel(row.iso3, row.country_name)} exports ${usdB(totalValue ?? 0)} in ${row.category_label.toLowerCase()}, with ${pct(africaShare)} (${usdB(africaValue ?? 0)}) going to African markets.`;

  const productText = topProduct
    ? ` Key product: ${topProduct.description} (HS ${topProduct.hsCode}) at ${usdB(topProduct.valueUsd)}/yr (${pct(topProduct.sharePct)} of category).`
    : '';

  const partnerText = topPartner
    ? ` Top ${isImport ? 'supplier' : 'destination'}: ${topPartner.country} (${pct(topPartner.sharePct)}).`
    : '';

  const afcftaText = row.roo_compliant
    ? ' Compliant with AfCFTA Rules of Origin.'
    : '';

  const growthText = row.yoy_growth_pct != null && row.yoy_growth_pct > 5
    ? ` Intra-Africa ${isImport ? 'imports' : 'exports'} growing at ${pct(row.yoy_growth_pct)} YoY.`
    : '';

  return `${flowText}${productText}${partnerText}${afcftaText}${growthText}`;
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
          cardType: 'afcfta_flows',
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
  rows: TradeFlowRow[];
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
  const africaValue = rows.reduce((s, r) => s + ((isImport ? r.imports_from_africa_usd : r.exports_to_africa_usd) ?? 0), 0);
  const africaShare = totalValue > 0 ? (africaValue / totalValue) * 100 : 0;

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (fromCategory) {
        if (a.category_group === fromCategory) return -1;
        if (b.category_group === fromCategory) return 1;
      }
      const aVal = (isImport ? a.imports_from_africa_usd : a.exports_to_africa_usd) ?? 0;
      const bVal = (isImport ? b.imports_from_africa_usd : b.exports_to_africa_usd) ?? 0;
      return bVal - aVal;
    });
  }, [rows, fromCategory, isImport]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="shrink-0 p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {country.iso3}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{country.name}</h2>
              <p className="text-zinc-400 text-xs">
                AfCFTA {isImport ? 'Import' : 'Export'} Profile • {year}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ExportableSection
            id="overview"
            title={`${isImport ? 'Import' : 'Export'} Overview`}
            country={country}
            year={year}
            sourceNotes="AfCFTA Secretariat · ITC Trade Map · UN Comtrade · Souvera Analysis"
            fileName={`souvera-afcfta-${country.iso3}-${direction}-overview-${dateStr}`}
            exporting={exportingSection === 'overview'}
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-zinc-400 text-xs mb-1">Total {isImport ? 'Imports' : 'Exports'}</p>
                <p className="text-emerald-300 font-bold text-xl">{usdB(totalValue)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
              </div>
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                <p className="text-zinc-400 text-xs mb-1">Intra-Africa {isImport ? 'Imports' : 'Exports'}</p>
                <p className="text-teal-300 font-bold text-xl">{usdB(africaValue)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
                <p className="text-zinc-500 text-xs mt-1">{pct(africaShare)} of total</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
              </div>
              <CollapsibleAnalysis
                text={`${country.name}'s intra-Africa ${isImport ? 'imports total' : 'exports total'} ${usdB(africaValue)}/yr across ${rows.length} product categories, representing ${pct(africaShare)} of total ${isImport ? 'imports' : 'exports'}.\n\nAfCFTA tariff liberalization is expected to boost intra-regional trade by 15-25% by 2030. ${country.name}'s strategic position within AfCFTA regional blocs (${rows[0]?.sub_region || 'African Union'}) enhances market access opportunities and positions the economy for expanded continental integration.`}
                titleClass="hidden"
                className="text-zinc-300 text-xs"
              />
            </div>
          </ExportableSection>

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Category breakdown</h3>
            <div className="space-y-4">
              {sorted.map((r) => {
                const meta = CATEGORY_META[r.category_group];
                const africaVal = (isImport ? r.imports_from_africa_usd : r.exports_to_africa_usd) ?? 0;
                const africaShr = (isImport ? r.imports_from_africa_share_pct : r.exports_to_africa_share_pct) ?? 0;
                const bar = shareBar(africaShr);
                const isHighlighted = r.category_group === fromCategory;

                return (
                  <ExportableSection
                    key={r.id}
                    id={r.id}
                    title={r.category_label}
                    country={country}
                    year={year}
                    category={r.category_label}
                    sourceNotes={r.source_notes ?? 'AfCFTA Secretariat · UN Comtrade'}
                    fileName={`souvera-afcfta-${country.iso3}-${r.category_group}-${dateStr}`}
                    isHighlighted={isHighlighted}
                    exporting={exportingSection === r.id}
                    onExportStart={handleExportStart}
                    onExportEnd={handleExportEnd}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold flex items-center gap-2 ${meta?.color ?? 'text-zinc-300'}`}>
                          <span className="text-lg">{meta?.icon ?? '📦'}</span>
                          {r.category_label}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-zinc-500">HS {r.hs_chapter}</span>
                          <span className="text-emerald-400 font-semibold">{usdB(africaVal)}/yr</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-zinc-800/50 rounded-lg text-center">
                          <p className="text-zinc-500 text-[10px]">Africa share</p>
                          <p className="text-teal-300 font-semibold text-sm">{pct(africaShr)}</p>
                        </div>
                        <div className="p-2 bg-zinc-800/50 rounded-lg text-center">
                          <p className="text-zinc-500 text-[10px]">Pref. margin</p>
                          <p className="text-emerald-300 font-semibold text-sm">{pct(r.preference_margin_pct)}</p>
                        </div>
                        <div className="p-2 bg-zinc-800/50 rounded-lg text-center">
                          <p className="text-zinc-500 text-[10px]">Growth YoY</p>
                          <p className={`font-semibold text-sm ${(r.yoy_growth_pct ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {pct(r.yoy_growth_pct)}
                          </p>
                        </div>
                      </div>

                      {r.top_partners && r.top_partners.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                            Top {isImport ? 'Suppliers' : 'Destinations'}
                          </p>
                          {r.top_partners.slice(0, 3).map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400">{idx + 1}. {p.country}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500">{pct(p.sharePct)}</span>
                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, p.sharePct)}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {r.top_products && r.top_products.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                            Top {isImport ? 'Import' : 'Export'} Products
                          </p>
                          {r.top_products.slice(0, 4).map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs gap-2">
                              <span className="text-zinc-400 truncate flex-1">
                                <span className="text-amber-400/70 font-mono text-[10px]">HS {p.hsCode}</span>{' '}
                                {p.description}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-emerald-300 font-medium">{usdB(p.valueUsd)}</span>
                                <span className="text-zinc-500">{pct(p.sharePct)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-2.5 bg-violet-950/30 border border-violet-500/20 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <p className="text-violet-300 text-[9px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
                        </div>
                        <CollapsibleAnalysis
                          text={generateSouveraAnalysis(r, direction)}
                          titleClass="hidden"
                          className="text-zinc-300 text-xs"
                        />
                      </div>
                    </div>
                  </ExportableSection>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800 text-sm" data-export-exclude>
            <Link href={`/country/${country.iso3}?tab=trade`}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
              <Building2 className="w-3.5 h-3.5" /> Country trade profile <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/intelligence/trade/afcfta"
              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors">
              AfCFTA Status Tracker <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Category Card ───────────────────────────────────────────────────────────

function CategoryCard({ group, rows, direction, onCountryClick }: {
  group: string;
  rows: TradeFlowRow[];
  direction: FlowDirection;
  onCountryClick: (country: { iso3: string; name: string }, categoryGroup: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const isImport = direction === 'imports';
  const meta = CATEGORY_META[group];
  const sorted = [...rows].sort((a, b) => {
    const aVal = (isImport ? a.imports_from_africa_usd : a.exports_to_africa_usd) ?? 0;
    const bVal = (isImport ? b.imports_from_africa_usd : b.exports_to_africa_usd) ?? 0;
    return bVal - aVal;
  });

  const totalAfrica = rows.reduce((s, r) => s + ((isImport ? r.imports_from_africa_usd : r.exports_to_africa_usd) ?? 0), 0);
  const totalAll = rows.reduce((s, r) => s + ((isImport ? r.total_imports_usd : r.total_exports_usd) ?? 0), 0);
  const avgShare = rows.length > 0
    ? rows.reduce((s, r) => s + ((isImport ? r.imports_from_africa_share_pct : r.exports_to_africa_share_pct) ?? 0), 0) / rows.length
    : 0;

  const handleExport = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tableRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: tableRef.current,
        fileName: `souvera-afcfta-${direction}-${group}-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: `AfCFTA ${isImport ? 'Import' : 'Export'} Intelligence — ${meta?.label ?? group}`,
        sourceAttribution: 'AfCFTA Secretariat · ITC Trade Map · UN Comtrade',
        dataAsOf: rows[0]?.year?.toString() ?? '2023',
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
        curatedAnalysis: buildCuratedCardAnalysisForExport({
          cardType: 'afcfta_flows',
          countryName: meta?.label ?? group,
          iso3: 'AFC',
          data: { Category: meta?.label ?? group, Direction: direction, Countries: rows.length },
        }),
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, group, meta, rows, direction, isImport]);

  return (
    <div
      className="border border-zinc-700 rounded-xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/70 hover:bg-zinc-800/80 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />}
            <span className="text-xl">{meta?.icon ?? '📦'}</span>
            <div>
              <span className={`font-semibold text-sm ${meta?.color ?? 'text-zinc-200'}`}>{meta?.label ?? group}</span>
              <p className="text-zinc-500 text-xs">{rows.length} markets · 2023 data</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs shrink-0 mr-8">
            <div className="text-right hidden sm:block">
              <p className="text-zinc-400">Intra-Africa</p>
              <p className="text-emerald-300 font-semibold">{usdB(totalAfrica)}/yr</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-zinc-400">Total {isImport ? 'Imports' : 'Exports'}</p>
              <p className="text-zinc-300 font-semibold">{usdB(totalAll)}/yr</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-zinc-400">Avg Africa share</p>
              <p className="text-teal-400 font-semibold">{pct(avgShare)}</p>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400 text-xs">
                <th className="px-4 py-2.5 font-semibold">Country</th>
                <th className="px-4 py-2.5 font-semibold">Total {isImport ? 'Imports' : 'Exports'}</th>
                <th className="px-4 py-2.5 font-semibold">Intra-Africa</th>
                <th className="px-4 py-2.5 font-semibold">Africa Share</th>
                <th className="px-4 py-2.5 font-semibold">Pref. Margin</th>
                <th className="px-4 py-2.5 font-semibold">YoY</th>
                <th className="px-4 py-2.5 font-semibold">Top Partner</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const africaVal = (isImport ? r.imports_from_africa_usd : r.exports_to_africa_usd) ?? 0;
                const africaShr = (isImport ? r.imports_from_africa_share_pct : r.exports_to_africa_share_pct) ?? 0;
                const totalVal = (isImport ? r.total_imports_usd : r.total_exports_usd) ?? 0;
                const bar = shareBar(africaShr);
                const topPartner = r.top_partners?.[0];

                return (
                  <tr
                    key={r.id}
                    onClick={() => onCountryClick({ iso3: r.iso3, name: r.country_name }, group)}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    title={`Click for ${formatTradeCountryLabel(r.iso3, r.country_name)} AfCFTA profile`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                        <div>
                          <p className="text-white font-medium text-xs group-hover:text-emerald-300 transition-colors">{formatTradeCountryLabel(r.iso3, r.country_name)}</p>
                          {(r.sub_region || r.region) ? (
                            <p className="text-zinc-500 text-[10px]">{r.sub_region || r.region}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">
                      {usdB(totalVal)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-300 font-semibold text-xs">{usdB(africaVal)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                        </div>
                        <span className="text-xs text-zinc-300">{pct(africaShr)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-emerald-300 text-xs font-medium">
                      {pct(r.preference_margin_pct)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.yoy_growth_pct != null ? (
                        <span className={`flex items-center gap-0.5 ${r.yoy_growth_pct > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                          {r.yoy_growth_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {r.yoy_growth_pct > 0 ? '+' : ''}{r.yoy_growth_pct.toFixed(1)}%
                        </span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {topPartner ? `${topPartner.country} ${pct(topPartner.sharePct)}` : '—'}
                    </td>
                  </tr>
                );
              })}
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

export function AfCFTATradeIntelligence() {
  const [data, setData] = useState<TradeFlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<FlowDirection>('imports');
  const [selectedCountry, setSelectedCountry] = useState<{ iso3: string; name: string; fromCategory?: string } | null>(null);
  const [groupFilter, setGroupFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('direction', direction);
    if (groupFilter) params.set('group', groupFilter);
    
    fetch(`/api/v1/trade/afcfta/flows?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        // Transform API response to component's expected format
        const isImport = direction === 'imports';
        const transformed: TradeFlowResponse = {
          rows: (d.rows || []).map((r: any) => ({
            ...r,
            total_imports_usd: isImport ? r.total_trade_usd : null,
            total_exports_usd: isImport ? null : r.total_trade_usd,
            imports_from_africa_usd: isImport ? r.intra_africa_trade_usd : null,
            imports_from_africa_share_pct: isImport ? r.intra_africa_share_pct : null,
            exports_to_africa_usd: isImport ? null : r.intra_africa_trade_usd,
            exports_to_africa_share_pct: isImport ? null : r.intra_africa_share_pct,
          })),
          summary: d.summary || {
            record_count: 0,
            total_intra_africa_trade_usd: 0,
            total_trade_usd: 0,
            intra_africa_share_pct: 0,
            markets_covered: 0,
            category_group_totals: {},
            data_vintage: '2023',
          },
          attribution: d.attribution || { sources: ['AfCFTA Secretariat', 'UN Comtrade'], note: 'Curated estimates' },
        };
        setData(transformed);
        setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, [direction, groupFilter]);

  const byGroup = useMemo(() => {
    if (!data?.rows) return {};
    const grouped: Record<string, TradeFlowRow[]> = {};
    for (const r of data.rows) {
      if (regionFilter && r.region !== regionFilter && r.sub_region !== regionFilter) continue;
      if (!tradeCountryMatchesSearch(r.iso3, r.country_name, countrySearch)) continue;
      if (!grouped[r.category_group]) grouped[r.category_group] = [];
      grouped[r.category_group].push(r);
    }
    return grouped;
  }, [data, regionFilter, countrySearch]);

  const countryRows = useMemo(() => {
    if (!selectedCountry || !data?.rows) return [];
    return data.rows.filter((r) => r.iso3 === selectedCountry.iso3);
  }, [selectedCountry, data]);

  const orderedGroups = useMemo(() => {
    return Object.entries(byGroup)
      .sort(([, a], [, b]) => {
        const aT = a.reduce((s, r) => s + ((direction === 'imports' ? r.imports_from_africa_usd : r.exports_to_africa_usd) ?? 0), 0);
        const bT = b.reduce((s, r) => s + ((direction === 'imports' ? r.imports_from_africa_usd : r.exports_to_africa_usd) ?? 0), 0);
        return bT - aT;
      })
      .map(([g]) => g);
  }, [byGroup, direction]);

  const allRegions = useMemo(() => {
    const s = new Set<string>();
    (data?.rows ?? []).forEach((r) => { if (r.sub_region) s.add(r.sub_region); });
    return [...s].sort();
  }, [data]);

  const isImport = direction === 'imports';

  return (
    <div className="min-h-screen bg-zinc-950">
      {selectedCountry && countryRows.length > 0 && (
        <CountryTradeDrawer
          rows={countryRows}
          country={selectedCountry}
          direction={direction}
          fromCategory={selectedCountry.fromCategory}
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
              <Repeat className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-300">
              Phase 0.5D — AfCFTA Trade Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AfCFTA Import-Export Intelligence</h1>
          <p className="text-zinc-300 max-w-3xl text-base leading-relaxed">
            Intra-Africa trade flows under the African Continental Free Trade Area.
            Toggle between <span className="text-emerald-400 font-medium">Import</span> and <span className="text-teal-400 font-medium">Export</span> views
            to analyze regional supply chains and market access opportunities.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Data vintage: 2023 curated estimates · Sources: AfCFTA Secretariat · ITC Trade Map · UN Comtrade
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
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Intra-Africa Trade</p>
              <p className="text-emerald-300 text-2xl font-bold">{usdB(data.summary.total_intra_africa_trade_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Total {isImport ? 'Imports' : 'Exports'}</p>
              <p className="text-zinc-300 text-2xl font-bold">{usdB(data.summary.total_trade_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
            </div>
            <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Intra-Africa Share</p>
              <p className="text-teal-300 text-2xl font-bold">{pct(data.summary.intra_africa_share_pct)}</p>
              <p className="text-zinc-500 text-xs">AfCFTA target: 50% by 2030</p>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Markets covered</p>
              <p className="text-white text-2xl font-bold">{data.summary.markets_covered}</p>
              <p className="text-zinc-500 text-xs">{data.summary.record_count} trade signals</p>
            </div>
          </div>
        )}

        {/* Strategic context */}
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/25 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">AfCFTA — Building African Trade Integration</p>
            <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
              {isImport
                ? 'Import Intelligence shows what African nations source from within the continent. AfCFTA tariff liberalization is creating new opportunities for African suppliers to compete against extra-continental imports. Eligibility is determined by AfCFTA rules of origin and product-specific tariff schedules — not a flat preference margin.'
                : 'Export Intelligence shows what African nations sell to regional partners. AfCFTA aims to boost intra-Africa exports from ~18% to 50% of total African trade by 2030. Identifying high-growth export corridors supports continental value chain development.'}
            </p>
          </div>
        </div>

        {/* Top 10 Traders */}
        {data?.summary?.top_traders && data.summary.top_traders.length > 0 && (
          <Top10Card
            title={isImport ? 'Top 10 Intra-Africa Importers' : 'Top 10 Intra-Africa Exporters'}
            items={data.summary.top_traders.map((t) => ({
              id: t.iso3,
              label: t.name,
              sublabel: t.iso3,
              value: t.intraAfrica,
              secondaryValue: t.total > 0 ? (t.intraAfrica / t.total) * 100 : 0,
              secondaryLabel: 'Africa share',
            }))}
            onItemClick={(item) => setSelectedCountry({ iso3: item.id, name: item.label })}
            colorScheme="emerald"
            exportFileName={`souvera-afcfta-top-${isImport ? 'importers' : 'exporters'}-${new Date().toISOString().slice(0, 10)}`}
            exportTitle={`Top 10 AfCFTA ${isImport ? 'Importers' : 'Exporters'}`}
            sourceAttribution="AfCFTA Secretariat · ITC Trade Map · UN Comtrade"
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
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
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
          {(countrySearch || regionFilter || groupFilter) && (
            <button
              type="button"
              onClick={() => { setCountrySearch(''); setRegionFilter(''); setGroupFilter(''); }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400 text-sm transition-colors"
            >
              Clear filters
            </button>
          )}
          <p className="text-zinc-600 text-xs self-center ml-auto hidden sm:block">
            Hover a category header to export PNG · Click any country row to open full AfCFTA profile
          </p>
        </div>

        {/* Coverage info */}
        <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-start gap-2.5">
          <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">{data?.summary?.markets_covered ?? '—'} markets</span> currently covered across 8 product categories.
            Full 54-country AfCFTA coverage with detailed bilateral flows is rolling out via ITC Trade Map API integration in Phase 1.
            All trade signals auto-update from source data.
          </div>
        </div>

        {error && <p className="text-red-400 text-sm p-3 bg-red-950/30 border border-red-500/20 rounded-lg">{error}</p>}

        {/* Category accordion tables */}
        <div className="space-y-3">
          {orderedGroups.map((group) => (
            <CategoryCard
              key={group}
              group={group}
              rows={byGroup[group] ?? []}
              direction={direction}
              onCountryClick={(c, categoryGroup) => setSelectedCountry({ ...c, fromCategory: categoryGroup })}
            />
          ))}
          {orderedGroups.length === 0 && !loading && (
            <div className="py-12 text-center text-zinc-500">
              <Globe className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
              <p className="text-sm">No trade signals found.</p>
              <p className="text-xs mt-1">AfCFTA trade flow data will be populated in Phase 1.</p>
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
          <Link href="/intelligence/trade/afcfta" className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors">
            AfCFTA Status Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/demand" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
            African Import Demand <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/agoa" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
            AGOA Eligibility Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AfCFTATradeIntelligence;
