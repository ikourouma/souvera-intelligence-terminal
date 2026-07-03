'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X, Download, TrendingUp, TrendingDown, Globe, Building2,
  BarChart3, Sparkles, AlertTriangle, ChevronRight, Package,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { iso3ToIso2 } from '@/lib/intelligence/export-branding';
import { TradeDataQualityBadge, type DataQualityTier } from './TradeDataQualityBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductDemandRow {
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
  imports_from_us_share_pct: number | null;
  us_export_potential_usd: number | null;
  us_benchmark_share_pct: number | null;
  yoy_growth_pct: number | null;
  top_suppliers: Array<{ country: string; iso3: string; sharePct: number; valueUsd: number }>;
  data_quality_tier?: string;
}

export interface ProductCategoryMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  narrative: string;
}

export interface ProductDemandDrawerProps {
  categoryGroup: string;
  categoryMeta: ProductCategoryMeta;
  rows: ProductDemandRow[];
  region: 'Africa' | 'Caribbean';
  onClose: () => void;
  onCountryClick?: (country: { iso3: string; name: string; fromCategory?: string }) => void;
  colorScheme?: 'blue' | 'cyan';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usdB(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1e6).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function pct(v: number | null | undefined): string {
  return v != null ? `${v.toFixed(1)}%` : '—';
}

function getFlagEmoji(iso3: string): string {
  const mapping: Record<string, string> = {
    USA: '🇺🇸', CHN: '🇨🇳', IND: '🇮🇳', DEU: '🇩🇪', FRA: '🇫🇷', GBR: '🇬🇧', JPN: '🇯🇵',
    KOR: '🇰🇷', BRA: '🇧🇷', ZAF: '🇿🇦', NGA: '🇳🇬', EGY: '🇪🇬', KEN: '🇰🇪', ETH: '🇪🇹',
    GHA: '🇬🇭', TZA: '🇹🇿', MAR: '🇲🇦', TUN: '🇹🇳', SEN: '🇸🇳', CIV: '🇨🇮', UGA: '🇺🇬',
    JAM: '🇯🇲', TTO: '🇹🇹', DOM: '🇩🇴', HTI: '🇭🇹', BHS: '🇧🇸', BRB: '🇧🇧', GUY: '🇬🇾',
    SUR: '🇸🇷', BLZ: '🇧🇿', PAN: '🇵🇦', CRI: '🇨🇷', GTM: '🇬🇹', HND: '🇭🇳', NIC: '🇳🇮',
    RUS: '🇷🇺', NLD: '🇳🇱', BEL: '🇧🇪', ITA: '🇮🇹', ESP: '🇪🇸', TUR: '🇹🇷', SAU: '🇸🇦',
    ARE: '🇦🇪', VNM: '🇻🇳', THA: '🇹🇭', MYS: '🇲🇾', IDN: '🇮🇩', PHL: '🇵🇭', SGP: '🇸🇬',
  };
  return mapping[iso3] || '🌍';
}

// ─── Exportable Section ───────────────────────────────────────────────────────

function ExportableSection({
  children,
  id,
  title,
  category,
  year,
  region,
  sourceNotes,
  fileName,
  exporting,
  onExportStart,
  onExportEnd,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
  category: string;
  year: number;
  region: string;
  sourceNotes: string;
  fileName: string;
  exporting: boolean;
  onExportStart: (id: string) => void;
  onExportEnd: () => void;
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
        cardTitle: title,
        sourceAttribution: sourceNotes,
        dataAsOf: `${year}`,
      });
    } finally {
      onExportEnd();
    }
  }, [exporting, fileName, id, onExportEnd, onExportStart, sourceNotes, title, year]);

  return (
    <div
      ref={sectionRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
    >
      {hovered && !exporting && (
        <button
          onClick={handleExport}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800/90 border border-zinc-700 hover:bg-zinc-700 transition-colors z-10"
          title="Download as PNG"
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
      )}
      {children}
    </div>
  );
}

// ─── Product Demand Drawer ────────────────────────────────────────────────────

export function ProductDemandDrawer({
  categoryGroup,
  categoryMeta,
  rows,
  region,
  onClose,
  onCountryClick,
  colorScheme = 'blue',
}: ProductDemandDrawerProps) {
  const [exportingSection, setExportingSection] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Aggregate data
  const totalImports = rows.reduce((s, r) => s + (r.total_imports_usd ?? 0), 0);
  const totalUsExports = rows.reduce((s, r) => s + (r.imports_from_us_usd ?? 0), 0);
  const totalPotential = rows.reduce((s, r) => s + (r.us_export_potential_usd ?? 0), 0);
  const avgUsShare = rows.length > 0 
    ? rows.reduce((s, r) => s + (r.imports_from_us_share_pct ?? 0), 0) / rows.length 
    : 0;
  const avgGrowth = rows.length > 0
    ? rows.reduce((s, r) => s + (r.yoy_growth_pct ?? 0), 0) / rows.length
    : 0;

  // Top 5 importing countries by US export value
  const topImporters = [...rows]
    .sort((a, b) => (b.imports_from_us_usd ?? 0) - (a.imports_from_us_usd ?? 0))
    .slice(0, 5);

  // Aggregate competitor data across all countries
  const competitorTotals: Record<string, { country: string; total: number }> = {};
  for (const row of rows) {
    for (const supplier of row.top_suppliers || []) {
      if (supplier.iso3 === 'USA') continue;
      if (!competitorTotals[supplier.iso3]) {
        competitorTotals[supplier.iso3] = { country: supplier.country, total: 0 };
      }
      competitorTotals[supplier.iso3].total += supplier.valueUsd ?? 0;
    }
  }
  
  // Calculate total market for percentage calculation
  const totalMarketForCompetitors = Object.values(competitorTotals).reduce((sum, c) => sum + c.total, 0) + totalUsExports;
  
  // All competitors with market share - sorted by total value
  const allCompetitors = Object.entries(competitorTotals)
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([iso3, data]) => ({ 
      iso3, 
      ...data, 
      sharePercent: totalMarketForCompetitors > 0 ? (data.total / totalMarketForCompetitors) * 100 : 0 
    }));
  
  // Top 5 for display
  const topCompetitors = allCompetitors.slice(0, 5);
  
  // US market share percentage
  const usMarketSharePct = totalMarketForCompetitors > 0 ? (totalUsExports / totalMarketForCompetitors) * 100 : 0;

  // Generate investor-ready Souvera analysis with colored metrics (JSX)
  const renderAnalysis = () => {
    const gap = totalPotential - totalUsExports;
    const growthTrend = avgGrowth > 5 ? 'rapidly expanding' : avgGrowth > 0 ? 'growing steadily' : 'mature';
    const topCompetitor = topCompetitors[0];
    const secondCompetitor = topCompetitors[1];
    const isLeading = !topCompetitor || totalUsExports >= topCompetitor.total;
    
    return (
      <>
        The {region} {categoryMeta.label.toLowerCase()} market represents{' '}
        <span className="text-white font-medium">{usdB(totalImports)}</span> in annual import value.{' '}
        The United States currently captures{' '}
        <span className="text-emerald-400 font-medium">{pct(usMarketSharePct)}</span> market share{' '}
        (<span className="text-emerald-400 font-medium">{usdB(totalUsExports)}</span>/yr)
        {topCompetitor && (
          <>
            , {isLeading ? 'leading' : 'trailing'} {topCompetitor.country} (
            <span className={isLeading ? 'text-zinc-400' : 'text-red-400 font-medium'}>{pct(topCompetitor.sharePercent)}</span> share,{' '}
            <span className={isLeading ? 'text-zinc-400' : 'text-red-400'}>{usdB(topCompetitor.total)}</span>)
          </>
        )}
        {secondCompetitor && (
          <>
            {' '}and {secondCompetitor.country} (
            <span className="text-zinc-400">{pct(secondCompetitor.sharePercent)}</span> share,{' '}
            <span className="text-zinc-400">{usdB(secondCompetitor.total)}</span>)
          </>
        )}
        .{' '}
        {avgGrowth !== 0 && (
          <>
            Market demand is {growthTrend} at{' '}
            <span className={avgGrowth >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
              {pct(avgGrowth)}
            </span>{' '}YoY.{' '}
          </>
        )}
        {gap > 0 && gap > totalUsExports * 0.1 && (
          <>
            An addressable opportunity gap of{' '}
            <span className="text-amber-400 font-medium">{usdB(gap)}</span>{' '}
            exists if US exporters achieve benchmark penetration rates.
          </>
        )}
      </>
    );
  };
  
  // Generate investment thesis separately for better formatting
  const renderInvestmentThesis = () => {
    const topCompetitor = topCompetitors[0];
    const usPosition = usMarketSharePct >= 25 ? 'strong' : usMarketSharePct >= 10 ? 'moderate' : 'developing';
    
    if (usPosition === 'strong') {
      return (
        <>
          <span className="text-emerald-400">Defensive positioning</span> required. 
          The US maintains a competitive position but faces pressure from {topCompetitor?.country || 'regional suppliers'}. 
          Priority: protect existing share through enhanced trade finance and supply chain reliability.
        </>
      );
    } else if (usPosition === 'moderate') {
      return (
        <>
          <span className="text-blue-400">Growth opportunity</span>. 
          The US has established market presence with room for expansion. 
          Priority: targeted DFC financing and trade promotion to capture incremental share from {topCompetitor?.country || 'competitors'}.
        </>
      );
    } else {
      return (
        <>
          <span className="text-amber-400">Market development opportunity</span>. 
          US penetration is below potential. 
          Priority: strategic entry via DFC-backed financing, diaspora networks, and bilateral trade agreements to establish competitive footing against {topCompetitor?.country || 'established suppliers'}.
        </>
      );
    }
  };

  const colors = colorScheme === 'cyan' 
    ? { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', accent: 'bg-cyan-500' }
    : { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', accent: 'bg-blue-500' };

  const maxImporterValue = Math.max(...topImporters.map(r => r.imports_from_us_usd ?? 0), 1);
  const maxCompetitorValue = Math.max(...topCompetitors.map(c => c.total), 1);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-2xl bg-zinc-900 border-r border-zinc-700 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300"
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 ${colors.bg} border-b ${colors.border} px-6 py-4`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{categoryMeta.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{categoryMeta.label}</h2>
                <p className="text-sm text-zinc-400">
                  {region} Import Demand · {rows.length} markets · HS Chapter {rows[0]?.hs_chapter || '—'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview KPIs */}
          <ExportableSection
            id="overview"
            title={`${categoryMeta.label} · ${region} Import Demand`}
            category={categoryGroup}
            year={rows[0]?.year ?? 2023}
            region={region}
            sourceNotes="ITC Trade Data Monitor · UN Comtrade · BEA"
            fileName={`souvera-${region.toLowerCase()}-${categoryGroup}-overview-${new Date().toISOString().slice(0, 10)}`}
            exporting={exportingSection === 'overview'}
            onExportStart={setExportingSection}
            onExportEnd={() => setExportingSection(null)}
          >
            <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl`}>
              {/* Context Header */}
              <div className="mb-3 pb-2 border-b border-zinc-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{categoryMeta.icon}</span>
                  <h3 className="text-base font-bold text-white">{categoryMeta.label}</h3>
                </div>
                <p className="text-zinc-400 text-xs">{region} Import Demand · Market Overview · Source: {rows[0]?.year ?? 2023} (Latest Available)</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">Total {region} Imports</p>
                  <p className={`text-lg font-bold ${colors.text}`}>{usdB(totalImports)}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">US Exports</p>
                  <p className="text-lg font-bold text-emerald-400">{usdB(totalUsExports)}</p>
                  <p className="text-zinc-500 text-[10px]">{pct(usMarketSharePct)} share</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">US Potential</p>
                  <p className="text-lg font-bold text-amber-400">{usdB(totalPotential)}</p>
                  <p className="text-zinc-500 text-[10px]">+{usdB(totalPotential - totalUsExports)} gap</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">Avg YoY Growth</p>
                  <div className="flex items-center gap-1">
                    {avgGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <p className={`text-lg font-bold ${avgGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pct(avgGrowth)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mini insight for export */}
              <div className="mt-3 pt-2 border-t border-zinc-700/50">
                <p className="text-xs text-zinc-400">
                  US exporters hold {pct(usMarketSharePct)} of the {usdB(totalImports)} {region.toLowerCase()} {categoryMeta.label.toLowerCase()} market. 
                  Potential gap of {usdB(totalPotential - totalUsExports)} at benchmark share rates.
                </p>
              </div>
            </div>
          </ExportableSection>

          {/* Top 5 Importing Countries */}
          <ExportableSection
            id="top-importers"
            title={`${categoryMeta.label} · ${region} Import Demand`}
            category={categoryGroup}
            year={rows[0]?.year ?? 2023}
            region={region}
            sourceNotes="ITC Trade Data Monitor · UN Comtrade"
            fileName={`souvera-${region.toLowerCase()}-${categoryGroup}-top-importers-${new Date().toISOString().slice(0, 10)}`}
            exporting={exportingSection === 'top-importers'}
            onExportStart={setExportingSection}
            onExportEnd={() => setExportingSection(null)}
          >
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              {/* Context Header */}
              <div className="mb-3 pb-2 border-b border-zinc-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{categoryMeta.icon}</span>
                  <h3 className="text-base font-bold text-white">{categoryMeta.label}</h3>
                </div>
                <p className="text-zinc-400 text-xs">{region} Import Demand · Top US Export Markets · Source: {rows[0]?.year ?? 2023}</p>
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-400" />
                Top 5 Importing Countries
                {onCountryClick && <span className="text-zinc-600 text-xs font-normal ml-auto">Click to view details</span>}
              </h4>
              <div className="space-y-2">
                {topImporters.map((row, idx) => {
                  const barWidth = ((row.imports_from_us_usd ?? 0) / maxImporterValue) * 100;
                  const growth = row.yoy_growth_pct;
                  
                  return (
                    <div 
                      key={row.iso3} 
                      className={`p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg ${onCountryClick ? 'cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors' : ''}`}
                      onClick={() => {
                        if (onCountryClick) {
                          onCountryClick({ iso3: row.iso3, name: row.country_name, fromCategory: categoryGroup });
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                          <span className="text-lg">{getFlagEmoji(row.iso3)}</span>
                          <div>
                            <p className="text-white font-medium text-sm">{row.country_name}</p>
                            <p className="text-zinc-500 text-xs">{row.iso3}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className={`font-bold ${colors.text}`}>{usdB(row.imports_from_us_usd ?? 0)}</p>
                            <p className="text-zinc-500 text-xs">{pct(row.imports_from_us_share_pct)} US share</p>
                          </div>
                          {onCountryClick && <ChevronRight className="w-4 h-4 text-zinc-600" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors.accent} rounded-full transition-all`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        {growth != null && (
                          <div className={`flex items-center gap-1 text-xs ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{pct(growth)} YoY</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Total imports: {usdB(row.total_imports_usd ?? 0)}</span>
                          {row.data_quality_tier && (
                            <TradeDataQualityBadge tier={row.data_quality_tier as DataQualityTier} showLabel={false} />
                          )}
                        </div>
                        <span className="text-amber-400">Potential: {usdB(row.us_export_potential_usd ?? 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ExportableSection>

          {/* Competitor Analysis */}
          <ExportableSection
            id="competitors"
            title={`${categoryMeta.label} · ${region} Import Demand`}
            category={categoryGroup}
            year={rows[0]?.year ?? 2023}
            region={region}
            sourceNotes="ITC Trade Data Monitor · UN Comtrade"
            fileName={`souvera-${region.toLowerCase()}-${categoryGroup}-competitors-${new Date().toISOString().slice(0, 10)}`}
            exporting={exportingSection === 'competitors'}
            onExportStart={setExportingSection}
            onExportEnd={() => setExportingSection(null)}
          >
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              {/* Context Header - Shows what this card is about */}
              <div className="mb-4 pb-3 border-b border-zinc-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{categoryMeta.icon}</span>
                  <h3 className="text-base font-bold text-white">{categoryMeta.label}</h3>
                </div>
                <p className="text-zinc-400 text-xs">
                  {region} Import Demand · US Competitive Position · Source: {rows[0]?.year ?? 2023}
                </p>
              </div>

              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                US Competitive Position
              </h4>
              
              {/* US Position Card */}
              <div className={`p-3 ${colors.bg} border ${colors.border} rounded-lg mb-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold">United States</p>
                    <p className="text-zinc-400 text-xs">Current US Position</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${colors.text}`}>{usdB(totalUsExports)}</p>
                    <p className="text-emerald-400 text-xs font-medium">{pct(usMarketSharePct)} market share</p>
                  </div>
                </div>
              </div>

              {/* Top Competitors - Simplified for export */}
              <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wide">Top Competitors</p>
              <div className="space-y-2 mb-4">
                {topCompetitors.slice(0, 5).map((comp, idx) => {
                  const isAhead = comp.total > totalUsExports;
                  const barWidth = (comp.total / (topCompetitors[0]?.total || 1)) * 100;
                  return (
                    <div key={comp.iso3} className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-lg">
                      <span className="text-zinc-500 text-xs font-mono w-5">#{idx + 1}</span>
                      <span className="text-lg">{getFlagEmoji(comp.iso3)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{comp.country}</p>
                          {isAhead && <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded shrink-0">ahead of US</span>}
                        </div>
                        <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${isAhead ? 'bg-red-500' : 'bg-zinc-500'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isAhead ? 'text-red-400' : 'text-zinc-300'}`}>
                          {usdB(comp.total)}
                        </p>
                        <p className={`text-[10px] ${isAhead ? 'text-red-400' : 'text-zinc-500'}`}>
                          {pct(comp.sharePercent)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Inline Souvera Analysis for Export Context */}
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wide">Souvera Analysis</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {topCompetitors[0] && topCompetitors[0].total > totalUsExports ? (
                    <>
                      The US ranks behind {topCompetitors[0].country} (
                      <span className="text-red-400 font-medium">{pct(topCompetitors[0].sharePercent)}</span>
                      ) in {region.toLowerCase()} {categoryMeta.label.toLowerCase()} imports.
                      {topCompetitors.filter(c => c.total > totalUsExports).length > 1 && (
                        <> <span className="text-red-400">{topCompetitors.filter(c => c.total > totalUsExports).length}</span> competitors lead US market share.</>
                      )}
                      {' '}Strategic opportunity exists to close the{' '}
                      <span className="text-amber-400 font-medium">{usdB(topCompetitors[0].total - totalUsExports)}</span>{' '}
                      gap through targeted DFC financing and trade promotion.
                    </>
                  ) : (
                    <>
                      The US holds a competitive position in {region.toLowerCase()} {categoryMeta.label.toLowerCase()} imports with{' '}
                      <span className="text-emerald-400 font-medium">{pct(usMarketSharePct)}</span> market share (
                      <span className="text-emerald-400">{usdB(totalUsExports)}</span>/yr).
                      {topCompetitors[0] && (
                        <> Nearest competitor: {topCompetitors[0].country} at <span className="text-zinc-400">{pct(topCompetitors[0].sharePercent)}</span>.</>
                      )}
                      {' '}Position defensible through continued engagement and supply chain reliability.
                    </>
                  )}
                </p>
              </div>
              
              {allCompetitors.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">No competitor data available</p>
              )}
            </div>
          </ExportableSection>

          {/* Souvera Analysis */}
          <ExportableSection
            id="analysis"
            title={`${categoryMeta.label} · ${region} Import Demand`}
            category={categoryGroup}
            year={rows[0]?.year ?? 2023}
            region={region}
            sourceNotes="Souvera Intelligence Terminal"
            fileName={`souvera-${region.toLowerCase()}-${categoryGroup}-analysis-${new Date().toISOString().slice(0, 10)}`}
            exporting={exportingSection === 'analysis'}
            onExportStart={setExportingSection}
            onExportEnd={() => setExportingSection(null)}
          >
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/25 rounded-xl">
              {/* Context Header */}
              <div className="mb-3 pb-2 border-b border-indigo-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{categoryMeta.icon}</span>
                  <h3 className="text-base font-bold text-white">{categoryMeta.label}</h3>
                </div>
                <p className="text-indigo-300/70 text-xs">{region} Import Demand · Strategic Analysis · Analysis: June 2026</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-2">Market Analysis</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                    {renderAnalysis()}
                  </p>
                  
                  {/* Investment Thesis */}
                  <div className="pt-3 border-t border-indigo-500/20">
                    <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Investment Thesis</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {renderInvestmentThesis()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ExportableSection>

          {/* Country Breakdown Table */}
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              All Markets ({rows.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wide border-b border-zinc-700">
                    <th className="text-left py-2 px-2">Country</th>
                    <th className="text-right py-2 px-2">US Exports</th>
                    <th className="text-right py-2 px-2">Share</th>
                    <th className="text-right py-2 px-2">Growth</th>
                    <th className="text-right py-2 px-2">Potential</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .sort((a, b) => (b.imports_from_us_usd ?? 0) - (a.imports_from_us_usd ?? 0))
                    .map((row) => (
                      <tr 
                        key={row.id} 
                        className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${onCountryClick ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (onCountryClick) {
                            onCountryClick({ iso3: row.iso3, name: row.country_name, fromCategory: categoryGroup });
                          }
                        }}
                      >
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <span>{getFlagEmoji(row.iso3)}</span>
                            <span className={`text-white ${onCountryClick ? 'group-hover:text-blue-300' : ''}`}>{row.country_name}</span>
                            {onCountryClick && <ChevronRight className="w-3 h-3 text-zinc-600" />}
                          </div>
                        </td>
                        <td className={`text-right py-2 px-2 ${colors.text} font-medium`}>
                          {usdB(row.imports_from_us_usd ?? 0)}
                        </td>
                        <td className="text-right py-2 px-2 text-zinc-400">
                          {pct(row.imports_from_us_share_pct)}
                        </td>
                        <td className={`text-right py-2 px-2 ${(row.yoy_growth_pct ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pct(row.yoy_growth_pct)}
                        </td>
                        <td className="text-right py-2 px-2 text-amber-400">
                          {usdB(row.us_export_potential_usd ?? 0)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attribution */}
          <div className="text-center text-xs text-zinc-600 pt-4 border-t border-zinc-800">
            <p>Data: ITC Trade Data Monitor · UN Comtrade · BEA · USDA GATS</p>
            <p className="mt-1">© 2026 Souvera Intelligence Terminal · Afronovation, Inc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDemandDrawer;
