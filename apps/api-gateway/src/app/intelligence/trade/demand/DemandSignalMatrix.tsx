'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, BarChart3, ChevronDown, ChevronRight,
  Download, Globe, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  X, Filter, AlertTriangle, Building2, Users, Search, Info,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { iso3ToIso2 } from '@/lib/intelligence/export-branding';
import { HighlightedText } from '@/components/intelligence/HighlightedText';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DemandRow {
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
  imports_from_us_usd: number | null;
  imports_from_us_vol_mt: number | null;
  imports_from_us_share_pct: number | null;
  us_export_potential_usd: number | null;
  us_benchmark_share_pct: number | null;
  yoy_growth_pct: number | null;
  top_suppliers: Array<{ country: string; iso3: string; sharePct: number; valueUsd: number }>;
  source_notes: string | null;
}

interface DemandResponse {
  rows: DemandRow[];
  summary: {
    record_count: number;
    total_us_exports_usd: number;
    total_us_export_potential_usd: number;
    potential_gap_usd: number;
    markets_covered: number;
    category_group_totals: Record<string, {
      total_imports_usd: number;
      imports_from_us_usd: number;
      us_export_potential_usd: number;
      country_count: number;
    }>;
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
  if (s >= 40) color = 'bg-emerald-500';
  else if (s >= 25) color = 'bg-blue-500';
  else if (s >= 12) color = 'bg-amber-500';
  return { width: `${s}%`, color };
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; bgColor: string; narrative: string }> = {
  machinery: {
    label: 'Ag & Mining Machinery', icon: '⚙️',
    color: 'text-blue-300', bgColor: 'bg-blue-500/10 border-blue-500/20',
    narrative: 'Agricultural and mining machinery represents the highest-value US export category to Africa. US brands (Caterpillar, John Deere, AGCO) compete directly with Chinese equipment on relationship and technology quality. AGOA\'s preferential trade relationship is the decisive factor in procurement decisions when US and Chinese equipment are comparably priced.',
  },
  grains: {
    label: 'Grains & Cereals', icon: '🌾',
    color: 'text-amber-300', bgColor: 'bg-amber-500/10 border-amber-500/20',
    narrative: 'US wheat and corn exports to Africa represent the largest agricultural trade flow in the US-Africa relationship. African food security depends on reliable grain supply — US Gulf and Pacific Northwest exporters supply 30–50% of East African milling needs. Post-AGOA, maintaining grain trade relationships requires bilateral investment agreements to replace preference framework.',
  },
  fertilizers: {
    label: 'Fertilizers & Agri-inputs', icon: '🌱',
    color: 'text-emerald-300', bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    narrative: 'US fertilizer exporters (CF Industries, Mosaic, Nutrien) compete directly against Russian and Moroccan OCP production. Russian fertilizer sanctions created a $4B+ annual market opening — AGOA relationship advantage is critical to capturing this shift. African food security programs increasingly specify US-sourced fertilizers under USAID/USDA development lending.',
  },
  pharma: {
    label: 'Pharmaceuticals', icon: '💊',
    color: 'text-violet-300', bgColor: 'bg-violet-500/10 border-violet-500/20',
    narrative: 'US pharmaceutical exports to Africa ($2.8B+) include PEPFAR ARV supply chains — making this the most strategically sensitive US-Africa trade category. Indian generic manufacturers (Sun, Cipla, Dr. Reddy\'s) compete aggressively on price. US market position depends on PEPFAR program continuity and strong bilateral trade relationships.',
  },
  cotton: {
    label: 'Cotton & Raw Textiles', icon: '🧵',
    color: 'text-pink-300', bgColor: 'bg-pink-500/10 border-pink-500/20',
    narrative: 'African EPZ garment factories — which export finished apparel to the US under AGOA — import significant cotton yarn and textile inputs from the US. This creates a direct feedback loop: AGOA apparel exports depend on US textile inputs, making cotton trade a two-way AGOA dependency. US textile states (NC, SC, GA) have direct congressional interest in maintaining this supply chain.',
  },
  transport: {
    label: 'Transport & Commercial Vehicles', icon: '🚛',
    color: 'text-orange-300', bgColor: 'bg-orange-500/10 border-orange-500/20',
    narrative: 'US commercial truck manufacturers (Mack, Kenworth, International) face growing competition from Chinese brands (Sinotruk, FAW, Dongfeng). Despite a 25% MFN tariff disadvantage, US trucks maintain strong market position in mining logistics and regional freight. AGOA relationship premium is the key differentiator — African fleet operators prefer US brands when financing terms are comparable.',
  },
  intermediate: {
    label: 'Intermediate Industrial Goods', icon: '🏭',
    color: 'text-cyan-300', bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    narrative: 'Iron, steel, chemicals, and plastic intermediate goods form the backbone of African manufacturing supply chains. China dominates with 40–55% share in most markets. US intermediate goods exports ($185M in Nigeria alone) face tariff and logistics disadvantages. Bilateral investment treaties and post-AGOA free trade agreements would significantly expand US competitiveness in this category.',
  },
  textiles_inputs: {
    label: 'Textile Inputs', icon: '🧶',
    color: 'text-rose-300', bgColor: 'bg-rose-500/10 border-rose-500/20',
    narrative: 'Synthetic yarn and fabric inputs imported by African EPZ factories are directly linked to AGOA apparel export capacity. US synthetic yarn and specialty fabric exports support 250,000+ garment jobs in Kenya, Ethiopia, and Lesotho. AGOA\'s third-country fabric rule creates the demand for these US inputs — making US textile exports a direct beneficiary of AGOA continuity.',
  },
  ict: {
    label: 'ICT & Telecommunications', icon: '📡',
    color: 'text-sky-300', bgColor: 'bg-sky-500/10 border-sky-500/20',
    narrative: 'ICT and telecom equipment is the fastest-growing US export category to Africa. US brands (Cisco, Dell, HP, Qualcomm) face aggressive competition from Chinese vendors (Huawei, ZTE, Xiaomi) who offer subsidized financing through the Belt and Road Initiative. The US CHIPS Act and the Prosper Africa/DFC initiative provide competitive financing tools, but only if the bilateral trade relationship under AGOA or a successor framework remains strong. African 5G rollouts and data center construction in Nigeria, Kenya, and South Africa represent the largest near-term opportunity.',
  },
  medical_devices: {
    label: 'Medical Devices & Diagnostics', icon: '🏥',
    color: 'text-teal-300', bgColor: 'bg-teal-500/10 border-teal-500/20',
    narrative: 'US medical device manufacturers (GE Healthcare, Becton Dickinson, Medtronic, Abbott) are the dominant suppliers across Africa and the Caribbean. PEPFAR and USAID health programs directly drive procurement of US diagnostic equipment and surgical instruments. The $2.4B+ US medical device export pipeline to Africa is the most strategically protected US export category — and one of the clearest beneficiaries of a strong AGOA/post-AGOA bilateral relationship. Chinese low-cost diagnostic equipment is the primary competitive threat.',
  },
};

// ─── HighlightedText imported from @/components/intelligence/HighlightedText ──

// ─── Souvera analysis generator per country-category ─────────────────────────

function generateSouveraAnalysis(row: DemandRow): string {
  const gap = (row.us_export_potential_usd ?? 0) - (row.imports_from_us_usd ?? 0);
  const share = row.imports_from_us_share_pct ?? 0;
  const benchmark = row.us_benchmark_share_pct ?? 35;
  const topSupplier = row.top_suppliers?.[0];
  const isUsTopSupplier = topSupplier?.iso3 === 'USA';
  const usShare = usdB(row.imports_from_us_usd ?? 0);
  const potential = usdB(row.us_export_potential_usd ?? 0);

  const gapText = gap > 0
    ? `The US currently captures ${pct(share)} of ${row.country_name}'s ${row.category_label.toLowerCase()} imports (${usShare}/yr). Reaching the benchmark share of ${pct(benchmark)} would unlock an additional ${usdB(gap)}/yr in US export revenue.`
    : `The US already exceeds the benchmark share in ${row.country_name} for ${row.category_label.toLowerCase()} — a strong competitive position to defend.`;

  const competitorText = topSupplier && !isUsTopSupplier
    ? ` ${topSupplier.country} currently leads with ${pct(topSupplier.sharePct)} market share — US exporters should target this gap through trade financing and relationship-building programs.`
    : isUsTopSupplier
    ? ` The US is the #1 supplier in this category — maintaining this position requires active AGOA engagement and bilateral investment.`
    : '';

  const growth = row.yoy_growth_pct;
  const growthText = growth != null && growth > 5
    ? ` Import demand is growing at ${pct(growth)} YoY — a favorable window for US market entry.`
    : growth != null && growth > 0
    ? ` Steady ${pct(growth)} YoY growth indicates stable long-term demand.`
    : '';

  return `${gapText}${competitorText}${growthText} Total US export potential in this market: ${potential}/yr.`;
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
        dataAsOf: year.toString(),
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
      });
    } finally {
      onExportEnd();
    }
  }, [id, fileName, country, category, title, sourceNotes, year, exporting, onExportStart, onExportEnd]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={sectionRef} className={`bg-zinc-900 rounded-xl overflow-hidden ${isHighlighted ? 'ring-2 ring-blue-500/50' : ''}`}>
        {/* Section header for export context */}
        <div className={`px-4 py-3 border-b border-zinc-800 ${isHighlighted ? 'bg-blue-950/30' : 'bg-zinc-900'}`}>
          <div className="flex items-center justify-between">
            <div>
              {/* Country name + ISO */}
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-white font-semibold text-sm">{country.name}</span>
                <span className="font-mono text-[10px] text-zinc-500 bg-zinc-800 rounded px-1 py-0.5">{country.iso3}</span>
              </div>
              {/* Profile line */}
              <p className="text-zinc-500 text-[10px] mt-0.5">
                US export demand profile · {year}
              </p>
              {/* Category name - prominent display */}
              {category && (
                <p className="text-zinc-300 text-xs font-medium mt-1 border-l-2 border-blue-500 pl-2">
                  {category}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-bold text-[10px] tracking-wide">SOUVERA</p>
              <p className="text-zinc-600 text-[9px]">{title}</p>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="p-4">
          {children}
        </div>

        {/* Section footer with sources */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/50">
          <p className="text-zinc-600 text-[9px] leading-relaxed">
            <span className="text-zinc-500 font-medium">Sources:</span> {sourceNotes}
          </p>
        </div>
      </div>

      {/* PNG download button — visible on hover */}
      <div
        data-export-exclude
        className={`absolute right-2 top-2 transition-all duration-150 z-10 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          title="Download section as PNG"
          className="flex items-center gap-1 px-2 py-1 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600 rounded text-[10px] text-zinc-300 hover:text-white transition-colors backdrop-blur-sm"
        >
          <Download className={`w-3 h-3 ${exporting ? 'animate-pulse' : ''}`} />
          <span>{exporting ? '…' : 'PNG'}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Country Demand Drawer ────────────────────────────────────────────────────

function CountryDemandDrawer({ rows, country, fromCategory, onClose }: {
  rows: DemandRow[];
  country: { iso3: string; name: string };
  fromCategory?: string;
  onClose: () => void;
}) {
  const [exportingSection, setExportingSection] = useState<string | null>(null);

  const sorted = [...rows].sort((a, b) => (b.imports_from_us_usd ?? 0) - (a.imports_from_us_usd ?? 0));
  const totalFromUs = rows.reduce((s, r) => s + (r.imports_from_us_usd ?? 0), 0);
  const totalPotential = rows.reduce((s, r) => s + (r.us_export_potential_usd ?? 0), 0);
  const totalImports = rows.reduce((s, r) => s + (r.total_imports_usd ?? 0), 0);
  const overallUsShare = totalImports > 0 ? (totalFromUs / totalImports) * 100 : 0;
  const gap = Math.max(0, totalPotential - totalFromUs);
  const year = rows[0]?.year ?? 2023;
  const dateStr = new Date().toISOString().slice(0, 10);

  const fromCategoryMeta = fromCategory ? CATEGORY_META[fromCategory] : null;

  const competitorTotals: Record<string, { name: string; total: number }> = {};
  for (const r of rows) {
    for (const s of r.top_suppliers ?? []) {
      if (s.iso3 === 'USA') continue;
      if (!competitorTotals[s.iso3]) competitorTotals[s.iso3] = { name: s.country, total: 0 };
      competitorTotals[s.iso3].total += s.valueUsd ?? 0;
    }
  }
  const topCompetitor = Object.entries(competitorTotals)
    .sort(([, a], [, b]) => b.total - a.total)[0];

  const handleExportStart = useCallback((id: string) => setExportingSection(id), []);
  const handleExportEnd = useCallback(() => setExportingSection(null), []);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-zinc-950 border-l border-zinc-700 z-50 overflow-y-auto">

        {/* Sticky Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Globe className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-lg">{country.name}</h2>
                <span className="font-mono text-xs text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">{country.iso3}</span>
              </div>
              <p className="text-zinc-400 text-sm">US export demand profile · {year}</p>
              {fromCategoryMeta && (
                <p className={`text-xs font-medium mt-1.5 flex items-center gap-1.5 ${fromCategoryMeta.color}`}>
                  <span className="text-base">{fromCategoryMeta.icon}</span>
                  {fromCategoryMeta.label}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ═══════════════════════════════════════════════════════════════════════
              OVERVIEW SECTION — Downloadable as single PNG
              ═══════════════════════════════════════════════════════════════════════ */}
          <ExportableSection
            id="overview"
            title="Country Overview"
            country={country}
            year={year}
            sourceNotes="ITC Trade Data Monitor · UN Comtrade · BEA · USDA GATS · Souvera Analysis"
            fileName={`souvera-${country.iso3}-overview-${dateStr}`}
            exporting={exportingSection === 'overview'}
            onExportStart={handleExportStart}
            onExportEnd={handleExportEnd}
          >
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-zinc-400 text-xs mb-1">Current US exports</p>
                <p className="text-blue-300 font-bold text-xl">{usdB(totalFromUs)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
                <p className="text-zinc-500 text-xs mt-1">{pct(overallUsShare)} of total imports</p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-zinc-400 text-xs mb-1">US export potential</p>
                <p className="text-emerald-300 font-bold text-xl">{usdB(totalPotential)}<span className="text-zinc-500 font-normal text-xs">/yr</span></p>
                <p className="text-zinc-500 text-xs mt-1">at benchmark share</p>
              </div>
            </div>

            {/* Gap */}
            {gap > 0 && (
              <div className="p-3 bg-amber-500/8 border border-amber-500/25 rounded-xl flex items-start gap-3 mb-4">
                <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">{usdB(gap)}/yr unrealized US export opportunity</p>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Gap between current US exports and benchmark share.
                  </p>
                </div>
              </div>
            )}

            {/* Top competitor */}
            {topCompetitor && (
              <div className="p-3 bg-zinc-800/60 border border-zinc-700 rounded-xl flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-400">Primary US competitor</p>
                    <p className="text-white font-semibold text-sm">{topCompetitor[1].name}</p>
                  </div>
                </div>
                <span className="text-red-300 font-bold text-sm">{usdB(topCompetitor[1].total)}/yr</span>
              </div>
            )}

            {/* Souvera analysis */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">
                <HighlightedText text={`${country.name} presents a combined US export opportunity of ${usdB(totalPotential)}/yr across ${rows.length} product ${rows.length === 1 ? 'category' : 'categories'}. Current US penetration of ${pct(overallUsShare)} of total tracked imports (${usdB(totalFromUs)}/yr) leaves a meaningful gap.${topCompetitor ? ` ${topCompetitor[1].name} leads as the primary competitor with ${usdB(topCompetitor[1].total)}/yr in exports to this market.` : ''} AGOA reauthorization and post-AGOA bilateral trade frameworks are the most effective levers to close this gap and sustain US competitiveness.`} />
              </p>
            </div>
          </ExportableSection>

          {/* ═══════════════════════════════════════════════════════════════════════
              CATEGORY BREAKDOWN — Each downloadable separately
              ═══════════════════════════════════════════════════════════════════════ */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Category breakdown</h3>
            <div className="space-y-4">
              {/* Sort to put the clicked category first if applicable */}
              {[...sorted].sort((a, b) => {
                if (a.category_group === fromCategory && b.category_group !== fromCategory) return -1;
                if (b.category_group === fromCategory && a.category_group !== fromCategory) return 1;
                return 0;
              }).map((r) => {
                const bar = shareBar(r.imports_from_us_share_pct);
                const meta = CATEGORY_META[r.category_group];
                const catGap = (r.us_export_potential_usd ?? 0) - (r.imports_from_us_usd ?? 0);
                const isHighlighted = r.category_group === fromCategory;

                return (
                  <ExportableSection
                    key={r.id}
                    id={r.id}
                    title={r.category_label}
                    country={country}
                    year={year}
                    category={r.category_label}
                    sourceNotes={r.source_notes ?? 'ITC Trade Data Monitor · UN Comtrade'}
                    fileName={`souvera-${country.iso3}-${r.category_group}-${dateStr}`}
                    isHighlighted={isHighlighted}
                    exporting={exportingSection === r.id}
                    onExportStart={handleExportStart}
                    onExportEnd={handleExportEnd}
                  >
                    <div className="space-y-3">
                      {/* Category header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold flex items-center gap-2 ${meta?.color ?? 'text-zinc-300'}`}>
                          <span className="text-lg">{meta?.icon ?? '📦'}</span>
                          {r.category_label}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="text-right">
                            <p className="text-zinc-500 text-[10px]">US exports</p>
                            <p className="text-blue-300 font-bold">{r.imports_from_us_usd ? usdB(r.imports_from_us_usd) : '—'}/yr</p>
                          </div>
                          <div className="text-right">
                            <p className="text-zinc-500 text-[10px]">Potential</p>
                            <p className="text-emerald-300 font-bold">{r.us_export_potential_usd ? usdB(r.us_export_potential_usd) : '—'}/yr</p>
                          </div>
                          {catGap > 0 && (
                            <div className="text-right">
                              <p className="text-zinc-500 text-[10px]">Gap</p>
                              <p className="text-amber-400 font-bold">+{usdB(catGap)}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* US share bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: bar.width }} />
                        </div>
                        <span className="text-zinc-300 text-xs font-semibold w-16 text-right">{pct(r.imports_from_us_share_pct)} US</span>
                      </div>

                      {/* Top suppliers */}
                      {r.top_suppliers?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {r.top_suppliers.slice(0, 4).map((s) => (
                            <span
                              key={s.iso3}
                              className={`px-2 py-1 rounded text-[10px] font-medium ${s.iso3 === 'USA' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                            >
                              {s.country} <span className="font-bold">{pct(s.sharePct)}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Souvera analysis */}
                      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <p className="text-indigo-300 text-[9px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <HighlightedText text={generateSouveraAnalysis(r)} />
                        </p>
                      </div>

                      {/* YoY growth if available */}
                      {r.yoy_growth_pct != null && (
                        <div className="flex items-center gap-2 text-xs">
                          {r.yoy_growth_pct > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className={r.yoy_growth_pct > 0 ? 'text-emerald-300' : 'text-red-300'}>
                            {r.yoy_growth_pct > 0 ? '+' : ''}{r.yoy_growth_pct.toFixed(1)}% YoY import growth
                          </span>
                        </div>
                      )}
                    </div>
                  </ExportableSection>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800 text-sm" data-export-exclude>
            <Link href={`/country/${country.iso3}?tab=trade`}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
              <Building2 className="w-3.5 h-3.5" /> Country trade profile <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href={`/intelligence/trade/agoa/products?country=${country.iso3}`}
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
              AGOA product finder <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Category Card with PNG export ───────────────────────────────────────────

function CategoryCard({ group, rows, onCountryClick }: {
  group: string;
  rows: DemandRow[];
  onCountryClick: (country: { iso3: string; name: string }, categoryGroup: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const meta = CATEGORY_META[group];
  const sorted = [...rows].sort((a, b) => (b.imports_from_us_usd ?? 0) - (a.imports_from_us_usd ?? 0));
  const totalImports = rows.reduce((s, r) => s + (r.imports_from_us_usd ?? 0), 0);
  const totalPotential = rows.reduce((s, r) => s + (r.us_export_potential_usd ?? 0), 0);
  const avgShare = rows.length > 0 ? rows.reduce((s, r) => s + (r.imports_from_us_share_pct ?? 0), 0) / rows.length : 0;
  const totalGap = Math.max(0, totalPotential - totalImports);

  const handleExport = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tableRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: tableRef.current,
        fileName: `souvera-demand-${group}-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: `African Import Demand — ${meta?.label ?? group}`,
        sourceAttribution: 'ITC Trade Data Monitor · UN Comtrade · BEA · USDA GATS',
        dataAsOf: rows[0]?.year?.toString() ?? '2023',
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
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
      {/* Accordion header */}
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
              <p className="text-zinc-400">US exports</p>
              <p className="text-blue-300 font-semibold">{usdB(totalImports)}/yr</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-zinc-400">Potential</p>
              <p className="text-emerald-300 font-semibold">{usdB(totalPotential)}/yr</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-zinc-400">Gap</p>
              <p className="text-amber-400 font-semibold">{usdB(totalGap)}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-zinc-400">Avg US share</p>
              <p className="text-white font-semibold">{pct(avgShare)}</p>
            </div>
          </div>
        </button>

        {/* PNG download button — visible on hover */}
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

      {/* Expanded table */}
      {expanded && (
        <div ref={tableRef} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-zinc-400 text-xs">
                <th className="px-4 py-2.5 font-semibold">Country</th>
                <th className="px-4 py-2.5 font-semibold">Total imports</th>
                <th className="px-4 py-2.5 font-semibold">US exports</th>
                <th className="px-4 py-2.5 font-semibold">US share</th>
                <th className="px-4 py-2.5 font-semibold">US potential</th>
                <th className="px-4 py-2.5 font-semibold">Gap</th>
                <th className="px-4 py-2.5 font-semibold">YoY</th>
                <th className="px-4 py-2.5 font-semibold">#1 supplier</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const bar = shareBar(r.imports_from_us_share_pct);
                const gap = (r.us_export_potential_usd ?? 0) - (r.imports_from_us_usd ?? 0);
                const topSupplier = r.top_suppliers?.[0];
                return (
                  <tr
                    key={r.id}
                    onClick={() => onCountryClick({ iso3: r.iso3, name: r.country_name }, group)}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                    title={`Click for ${r.country_name} full demand profile`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0" />
                        <div>
                          <p className="text-white font-medium text-xs group-hover:text-blue-300 transition-colors">{r.country_name}</p>
                          <p className="text-zinc-500 text-[10px]">{r.iso3} · {r.sub_region || r.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">
                      {r.total_imports_usd ? usdB(r.total_imports_usd) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-blue-300 font-semibold text-xs">
                        {r.imports_from_us_usd ? usdB(r.imports_from_us_usd) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                        </div>
                        <span className="text-xs text-zinc-300">{pct(r.imports_from_us_share_pct)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-emerald-300 text-xs font-medium">
                      {r.us_export_potential_usd ? usdB(r.us_export_potential_usd) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {gap > 0 ? (
                        <span className="text-amber-400 text-xs font-medium">+{usdB(gap)}</span>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.yoy_growth_pct != null ? (
                        <span className={`flex items-center gap-0.5 ${r.yoy_growth_pct > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                          {r.yoy_growth_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {r.yoy_growth_pct > 0 ? '+' : ''}{r.yoy_growth_pct.toFixed(1)}%
                        </span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {topSupplier ? (
                        <span className={topSupplier.iso3 === 'USA' ? 'text-blue-300 font-medium' : ''}>
                          {topSupplier.country} {pct(topSupplier.sharePct)}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-900/60 border-t border-zinc-700 text-xs font-semibold">
                <td className="px-4 py-2.5 text-zinc-400">Totals ({rows.length} markets)</td>
                <td className="px-4 py-2.5 text-zinc-300">—</td>
                <td className="px-4 py-2.5 text-blue-300">{usdB(totalImports)}/yr</td>
                <td className="px-4 py-2.5 text-zinc-400">{pct(avgShare)} avg</td>
                <td className="px-4 py-2.5 text-emerald-300">{usdB(totalPotential)}/yr</td>
                <td className="px-4 py-2.5 text-amber-400">+{usdB(totalGap)}</td>
                <td className="px-4 py-2.5 text-zinc-500">—</td>
                <td className="px-4 py-2.5 text-zinc-500">—</td>
              </tr>
            </tfoot>
          </table>

          {/* Category narrative */}
          {meta?.narrative && (
            <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/30 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-zinc-500 text-xs leading-relaxed">{meta.narrative}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DemandSignalMatrix() {
  const [data, setData] = useState<DemandResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<{ iso3: string; name: string; fromCategory?: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (groupFilter) params.set('group', groupFilter);
    fetch(`/api/v1/trade/demand?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setData(d as DemandResponse); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, [groupFilter]);

  const byGroup = useMemo(() => {
    if (!data?.rows) return {};
    const grouped: Record<string, DemandRow[]> = {};
    const searchLower = countrySearch.toLowerCase().trim();
    for (const r of data.rows) {
      if (regionFilter && r.region !== regionFilter && r.sub_region !== regionFilter) continue;
      if (searchLower && !r.country_name.toLowerCase().includes(searchLower) && !r.iso3.toLowerCase().includes(searchLower)) continue;
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
        const aT = a.reduce((s, r) => s + (r.imports_from_us_usd ?? 0), 0);
        const bT = b.reduce((s, r) => s + (r.imports_from_us_usd ?? 0), 0);
        return bT - aT;
      })
      .map(([g]) => g);
  }, [byGroup]);

  const allRegions = useMemo(() => {
    const s = new Set<string>();
    (data?.rows ?? []).forEach((r) => { if (r.sub_region) s.add(r.sub_region); });
    return [...s].sort();
  }, [data]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {selectedCountry && countryRows.length > 0 && (
        <CountryDemandDrawer
          rows={countryRows}
          country={selectedCountry}
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
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-300">
              Phase 0.5A — US-Africa Trade Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">African Import Demand Intelligence</h1>
          <p className="text-zinc-300 max-w-3xl text-base leading-relaxed">
            US export opportunity sizing by product category across African and Caribbean markets.
            Each row shows <span className="text-white font-medium">current US market share vs. benchmark potential</span>.
            Click any country row to open a full demand profile with Souvera analysis.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Data vintage: 2023 curated estimates · Sources: ITC Trade Data Monitor · UN Comtrade · BEA · USDA GATS
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 space-y-6">

        {/* Summary KPIs */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Current US exports to covered markets</p>
              <p className="text-blue-300 text-2xl font-bold">{usdB(data.summary.total_us_exports_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">US export potential at benchmark</p>
              <p className="text-emerald-300 text-2xl font-bold">{usdB(data.summary.total_us_export_potential_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Unrealized gap — trade policy can close</p>
              <p className="text-amber-300 text-2xl font-bold">{usdB(data.summary.potential_gap_usd)}<span className="text-zinc-500 text-sm font-normal">/yr</span></p>
            </div>
            <div className="p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs mb-1">Markets with demand data</p>
              <p className="text-white text-2xl font-bold">{data.summary.markets_covered}</p>
              <p className="text-zinc-500 text-xs">{data.summary.record_count} demand signals</p>
            </div>
          </div>
        )}

        {/* Strategic context */}
        <div className="p-4 bg-blue-950/40 border border-blue-500/25 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">US-Africa Trade Relationship — the two-way street argument</p>
            <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
              This matrix demonstrates African demand for US exports — the reciprocal argument that US jobs depend on
              African market access. Every dollar of &ldquo;unrealized gap&rdquo; represents US export revenue
              contingent on a strong US-Africa trade framework. This data is sourced for all stakeholders engaged in
              AGOA reauthorization and post-AGOA trade policy discussions — including policymakers, trade associations,
              development institutions, and private sector partners.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Country search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
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
          {(countrySearch || regionFilter || groupFilter) && (
            <button
              type="button"
              onClick={() => { setCountrySearch(''); setRegionFilter(''); setGroupFilter(''); }}
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
            Hover a category header to export PNG · Click any country row to open full demand profile
          </p>
        </div>

        {/* Coverage info */}
        <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-start gap-2.5">
          <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400 font-medium">{data?.summary?.markets_covered ?? '—'} markets</span> currently covered across 10 product categories.
            Full 54-country African coverage is rolling out via ITC Trade Data Monitor integration in Phase 1.
            All demand signals auto-update from source data — no manual refresh required.
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
              onCountryClick={(c, categoryGroup) => setSelectedCountry({ ...c, fromCategory: categoryGroup })}
            />
          ))}
          {orderedGroups.length === 0 && !loading && (
            <div className="py-12 text-center text-zinc-500">
              <p className="text-sm">No demand signals found.</p>
              <p className="text-xs mt-1">Run <code className="text-zinc-400">npm run ingest:import-demand</code> from the api-gateway folder.</p>
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
          <Link href="/intelligence/trade/agoa/products" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
            AGOA Product Finder <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/supply-demand" className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors">
            Supply-Demand Matrix <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/intelligence/trade/agoa" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
            AGOA Eligibility Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
