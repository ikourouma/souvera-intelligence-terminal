'use client';

/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Cell Drawer
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 */

import { useRef, useState } from 'react';
import { PreferentialExcludedBadge } from '@/components/intelligence/PreferentialExcludedBadge';
import {
  X,
  TrendingUp,
  TrendingDown,
  Factory,
  Globe,
  Briefcase,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
  BarChart3,
  Target,
  Shield,
  Zap,
  ArrowRightLeft,
  Package,
} from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import { flagUrlFromIso3, iso3ToIso2 } from '@/lib/intelligence/export-branding';
import {
  buildSupplyDemandCardAnalysis,
  type SupplyDemandCardType,
} from '@/lib/intelligence/supply-demand-card-analysis';
import type { MatrixCell, ConfidenceLevel } from '@/lib/intelligence/supply-demand-types';
import { TradeDataQualityBadge, type DataQualityTier } from './TradeDataQualityBadge';
import { CollapsibleAnalysis } from './CollapsibleAnalysis';

import { formatUsdCompact } from '@/lib/intelligence/format-usd';
import {
  buildCountrySupplyProducts,
  buildUsSectorDemandProducts,
  getSdmReciprocityContext,
  SDM_PRODUCT_MIX_FOOTNOTE,
  SDM_IMPORT_NEEDS_PENDING_NOTE,
  exportProductSourceLabel,
  countryImportVolumeLabel,
  capacityCorridorBridge,
  computeCountryImportDemandScore,
  type SdmProductRow,
} from '@/lib/intelligence/sdm-sector-products';

const pct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

const getConfidenceInfo = (level: ConfidenceLevel): { label: string; color: string; description: string } => {
  switch (level) {
    case 'A': return { label: 'High Confidence', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', description: '≥4 data sources, vintage ≤2 years' };
    case 'B': return { label: 'Medium Confidence', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', description: '2-3 sources, vintage ≤3 years' };
    case 'C': return { label: 'Estimated', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', description: 'Programmatic estimate' };
    default: return { label: 'Unknown', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', description: '' };
  }
};

const getTierInfo = (tier: number): { label: string; color: string; description: string } => {
  switch (tier) {
    case 1: return { label: 'Tier 1 — High Conviction', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', description: 'Investor-ready with established infrastructure and proven export capacity' };
    case 2: return { label: 'Tier 2 — Strong Opportunity', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', description: 'Strong fundamentals with manageable execution risk' };
    case 3: return { label: 'Tier 3 — Emerging', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', description: 'Growth potential with longer-term capital deployment horizon' };
    case 4: return { label: 'Tier 4 — Early Stage', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', description: 'Requires technical assistance and capacity building' };
    default: return { label: 'Unknown', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', description: '' };
  }
};

interface Props {
  cell: MatrixCell;
  onClose: () => void;
}

function cellExportDefaults(cell: MatrixCell) {
  return {
    iso2: iso3ToIso2(cell.iso3),
    flagUrl: flagUrlFromIso3(cell.iso3),
    dataAsOf: `Source: ${cell.data_year} · Analysis: June 2026 · Tier ${cell.data_quality_tier}`,
    disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
  };
}

function usExportDefaults(cell: MatrixCell) {
  return {
    iso2: 'US',
    flagUrl: flagUrlFromIso3('USA'),
    dataAsOf: `Source: ${cell.data_year} · Analysis: June 2026 · Tier ${cell.data_quality_tier}`,
    disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
  };
}

// Exportable Card wrapper component
function ExportableCard({
  children,
  title,
  fileName,
  countryName,
  cell,
  cardType,
  flowDirection,
  extras,
  exportDefaults,
}: {
  children: React.ReactNode;
  title: string;
  fileName: string;
  countryName: string;
  cell: MatrixCell;
  cardType: SupplyDemandCardType;
  flowDirection?: 'africa_to_us' | 'us_to_africa';
  extras?: { countryDemandScore?: number; reverseImportNeeds?: string };
  exportDefaults?: ReturnType<typeof cellExportDefaults>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const branding = exportDefaults ?? cellExportDefaults(cell);
  const curatedAnalysis = buildSupplyDemandCardAnalysis(cardType, cell, {
    flowDirection,
    ...extras,
  });

  const handleExport = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: cardRef.current,
        fileName,
        cardTitle: title,
        countryName,
        curatedAnalysis,
        sourceAttribution: 'Souvera Intelligence Terminal · World Bank · UN Comtrade · UNCTAD · US Census Bureau',
        ...branding,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="absolute top-2 right-2 p-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Download as PNG"
      >
        <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-pulse' : ''} text-zinc-400`} />
      </button>
      <div ref={cardRef}>
        {children}
      </div>
    </div>
  );
}

export function SupplyDemandCellDrawer({ cell, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [flowDirection, setFlowDirection] = useState<'africa_to_us' | 'us_to_africa'>('africa_to_us');
  const supplyConf = getConfidenceInfo(cell.supply_confidence);
  const demandConf = getConfidenceInfo(cell.demand_confidence);
  const tierInfo = getTierInfo(cell.opportunity_tier);
  
  // Generate US → Africa data (reverse flow)
  const reverseFlow = generateReverseFlowData(cell);

  const handleExport = async () => {
    if (drawerRef.current) {
      await exportElementToPNG({
        element: drawerRef.current,
        fileName: `souvera-sdm-${cell.iso3}-${cell.sector_key}-${new Date().toISOString().slice(0, 10)}`,
        cardTitle: `${cell.country_name} — ${cell.sector_label}`,
        countryName: cell.country_name,
        iso2: iso3ToIso2(cell.iso3),
        flagUrl: flagUrlFromIso3(cell.iso3),
        curatedAnalysis: buildSupplyDemandCardAnalysis('executive_summary', cell, { flowDirection }),
        sourceAttribution: 'World Bank · UN Comtrade · UNCTAD · US Census Bureau',
        dataAsOf: `Source: ${cell.data_year} · Analysis: June 2026 · Tier ${cell.data_quality_tier}`,
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-zinc-950 border-l border-zinc-800 overflow-y-auto">
        <div ref={drawerRef} className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-3 h-3 rounded-full ${cell.region === 'Africa' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                <h2 className="text-xl font-bold text-white">{cell.country_name}</h2>
                <span className="text-zinc-500">{cell.iso3}</span>
              </div>
              <p className="text-zinc-400">{cell.sector_label}</p>
              {cell.preferential_excluded && (
                <div className="mt-2">
                  <PreferentialExcludedBadge />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Export as PNG"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Flow Direction Toggle */}
          <div className="mb-6 p-1 bg-zinc-900 rounded-lg flex gap-1">
            <button
              onClick={() => setFlowDirection('africa_to_us')}
              className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-colors ${
                flowDirection === 'africa_to_us' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cell.region} → US (Export)
            </button>
            <button
              onClick={() => setFlowDirection('us_to_africa')}
              className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-colors ${
                flowDirection === 'us_to_africa' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              US → {cell.region} (Import)
            </button>
          </div>

          {/* Opportunity Score Hero */}
          <ExportableCard 
            title={`${cell.country_name} — Opportunity Score`} 
            fileName={`souvera-${cell.iso3}-opportunity-${new Date().toISOString().slice(0,10)}`}
            countryName={cell.country_name}
            cell={cell}
            cardType="opportunity_score"
            flowDirection={flowDirection}
            extras={{ countryDemandScore: reverseFlow.countryDemandScore }}
          >
            <div className={`p-6 rounded-xl border mb-6 ${flowDirection === 'africa_to_us' ? tierInfo.color : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70 mb-1">
                    {flowDirection === 'africa_to_us' ? 'Export Opportunity Score' : 'Import Opportunity Score'}
                  </p>
                  <p className="text-4xl font-bold">
                    {flowDirection === 'africa_to_us' ? Math.round(cell.opportunity_score) : reverseFlow.opportunityScore}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${flowDirection === 'africa_to_us' ? tierInfo.color : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                    {flowDirection === 'africa_to_us' ? tierInfo.label : reverseFlow.tierLabel}
                  </span>
                </div>
              </div>
              <p className="text-xs mt-4 opacity-70">
                {flowDirection === 'africa_to_us' 
                  ? tierInfo.description 
                  : `Opportunity for US exports to meet ${cell.country_name}'s import demand in ${cell.sector_label.toLowerCase()}`}
              </p>
            </div>
          </ExportableCard>

          {/* Spacer */}
          <div className="h-4" />

          {/* Quick Stats */}
          <ExportableCard
            title={`${cell.country_name} — Quick Stats`}
            fileName={`souvera-${cell.iso3}-stats-${new Date().toISOString().slice(0,10)}`}
            countryName={cell.country_name}
            cell={cell}
            cardType="quick_stats"
            flowDirection={flowDirection}
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              {flowDirection === 'africa_to_us' ? (
                <>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 mb-1">Exports to U.S.</p>
                    <p className="text-lg font-bold text-white">{formatUsdCompact(cell.current_trade_usd)}</p>
                    <p className="text-xs text-zinc-500">/year bilateral corridor</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 mb-1">Preferential Status</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {cell.agoa_eligible ? 'AGOA' : cell.cbtpa_eligible ? 'CBTPA' : '—'}
                    </p>
                    <p className="text-xs text-zinc-500">rules of origin</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 mb-1">US Import Growth</p>
                    <p className={`text-lg font-bold ${cell.us_import_growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pct(cell.us_import_growth_pct)}
                    </p>
                    <p className="text-xs text-zinc-500">5Y CAGR</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 mb-1">U.S. Sector Market</p>
                    <p className="text-lg font-bold text-blue-400">{reverseFlow.tradeValue}</p>
                    <p className="text-xs text-zinc-500">/yr reference</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 mb-1">US Export Growth</p>
                    <p className="text-lg font-bold text-emerald-400">{reverseFlow.growthRate}</p>
                    <p className="text-xs text-zinc-500">5Y CAGR</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 mb-1">Import Demand Index</p>
                    <p className="text-lg font-bold text-white">{reverseFlow.countryDemandScore}</p>
                    <p className="text-xs text-zinc-500">/100 modeled score</p>
                  </div>
                </>
              )}
            </div>
          </ExportableCard>

          {/* Trade Preferences & Data Quality */}
          <div className="flex flex-wrap gap-2 mb-6">
            {cell.agoa_eligible && (
              <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                AGOA Eligible
              </span>
            )}
            {cell.cbtpa_eligible && (
              <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-sm text-cyan-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                CBTPA Eligible
              </span>
            )}
            {cell.data_quality_tier && (
              <TradeDataQualityBadge 
                tier={cell.data_quality_tier as DataQualityTier} 
                showLabel={true} 
              />
            )}
            {cell.afcfta_member && (
              <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-400 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                AfCFTA Member
              </span>
            )}
          </div>

          {/* Supply Analysis - Conditional on flow direction */}
          {flowDirection === 'africa_to_us' ? (
            <ExportableCard
              title={`${cell.country_name} — Supply Analysis`}
              fileName={`souvera-${cell.iso3}-supply-${new Date().toISOString().slice(0,10)}`}
              countryName={cell.country_name}
              cell={cell}
              cardType="supply_analysis"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Factory className="w-5 h-5 text-emerald-400" />
                    {cell.country_name} Supply Analysis
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs border ${supplyConf.color}`}>
                    {supplyConf.label}
                  </span>
                </div>
                
                {/* Supply Score Gauge */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Export Capacity Score</span>
                    <span className="text-2xl font-bold text-white">{Math.round(cell.supply_score)}<span className="text-sm text-zinc-500">/100</span></span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${cell.supply_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </ExportableCard>
          ) : (
            <ExportableCard
              title={`US — Export Capacity`}
              fileName={`souvera-us-supply-${cell.sector_key}-${new Date().toISOString().slice(0,10)}`}
              countryName="United States"
              cell={cell}
              cardType="supply_analysis"
              exportDefaults={usExportDefaults(cell)}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Factory className="w-5 h-5 text-blue-400" />
                    US Export Capacity
                  </h3>
                  <span className="px-2 py-1 rounded text-xs border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    High Confidence
                  </span>
                </div>
                
                {/* US Supply Score Gauge */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">US Export Capacity Score</span>
                    <span className="text-2xl font-bold text-white">{reverseFlow.usSupplyScore}<span className="text-sm text-zinc-500">/100</span></span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                      style={{ width: `${reverseFlow.usSupplyScore}%` }}
                    />
                  </div>
                </div>
                
                {/* US Export Products */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-3">Top US Exports in {cell.sector_label}</p>
                  {reverseFlow.usExportProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-xs text-blue-400">{idx + 1}</span>
                        <span className="text-zinc-300 text-sm">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{product.value}</p>
                        <p className="text-zinc-500 text-xs">{product.share} of sector</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ExportableCard>
          )}

          {flowDirection === 'africa_to_us' && (
            <div className="mb-6">
              {/* Supply Metrics */}
              <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Export Volume</p>
                <p className="text-white font-medium">{formatUsdCompact(cell.export_volume_usd)}/yr</p>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">FDI Inflows (3yr)</p>
                <p className="text-white font-medium">{formatUsdCompact(cell.fdi_inflows_usd)}</p>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Infrastructure</p>
                <p className="text-white font-medium">{Math.round(cell.infrastructure_score)}/100</p>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Manufacturing Capacity</p>
                <p className="text-white font-medium">{Math.round(cell.manufacturing_capacity_index)}/100</p>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Labor Quality</p>
                <p className="text-white font-medium">{Math.round(cell.labor_quality_index)}/100</p>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Regulatory Environment</p>
                <p className="text-white font-medium">{Math.round(cell.regulatory_score)}/100</p>
              </div>
            </div>
          </div>
          )}

          {/* Demand Analysis - Conditional on flow direction */}
          {flowDirection === 'africa_to_us' ? (
            <ExportableCard
              title={`US — Import Demand Analysis`}
              fileName={`souvera-us-demand-${cell.sector_key}-${new Date().toISOString().slice(0,10)}`}
              countryName="United States"
              cell={cell}
              cardType="us_import_demand"
              exportDefaults={usExportDefaults(cell)}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    US Import Demand Analysis
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs border ${demandConf.color}`}>
                    {demandConf.label}
                  </span>
                </div>
                
                {/* Demand Score Gauge */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">US Import Demand Score</span>
                    <span className="text-2xl font-bold text-white">{Math.round(cell.demand_score)}<span className="text-sm text-zinc-500">/100</span></span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                      style={{ width: `${cell.demand_score}%` }}
                    />
                  </div>
                </div>

                {/* Demand Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">US Import Volume</p>
                    <p className="text-white font-medium">{formatUsdCompact(cell.us_import_volume_usd)}/yr</p>
                  </div>
                  <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Import Growth (5Y)</p>
                    <p className={`font-medium ${cell.us_import_growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pct(cell.us_import_growth_pct)}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Diversification Pressure</p>
                    <p className="text-white font-medium">{Math.round(cell.us_diversification_pressure)}/100</p>
                  </div>
                  <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Policy Incentives</p>
                    <p className="text-white font-medium">{Math.round(cell.policy_incentive_score)}/100</p>
                  </div>
                </div>
              </div>
            </ExportableCard>
          ) : (
            <ExportableCard
              title={`${cell.country_name} — Import Needs`}
              fileName={`souvera-${cell.iso3}-import-needs-${new Date().toISOString().slice(0,10)}`}
              countryName={cell.country_name}
              cell={cell}
              cardType="country_import_needs"
              flowDirection={flowDirection}
              extras={{
                countryDemandScore: reverseFlow.countryDemandScore,
              }}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    {cell.country_name} Import Needs
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs border ${supplyConf.color}`}>
                    {supplyConf.label}
                  </span>
                </div>
                
                {/* Country Import Demand Score Gauge */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Import Demand Score</span>
                    <span className="text-2xl font-bold text-white">{reverseFlow.countryDemandScore}<span className="text-sm text-zinc-500">/100</span></span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                      style={{ width: `${reverseFlow.countryDemandScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Indicates {cell.country_name}'s need for imports in {cell.sector_label.toLowerCase()}
                  </p>
                </div>

                {/* Import demand index — no dollar product lines until Comtrade */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-3">
                  <p className="text-xs text-zinc-500">{SDM_IMPORT_NEEDS_PENDING_NOTE}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-zinc-950/50 rounded-lg">
                      <p className="text-[10px] text-zinc-600 uppercase">Import demand index</p>
                      <p className="text-lg font-bold text-purple-400">{reverseFlow.countryDemandScore}/100</p>
                    </div>
                    <div className="p-3 bg-zinc-950/50 rounded-lg">
                      <p className="text-[10px] text-zinc-600 uppercase">U.S. sector reference</p>
                      <p className="text-lg font-bold text-blue-400">{formatUsdCompact(cell.us_import_volume_usd)}/yr</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600">
                    Infrastructure {Math.round(cell.infrastructure_score)}/100 · supply gap drives modeled import pull for U.S. exporters.
                  </p>
                </div>
              </div>
            </ExportableCard>
          )}

          {/* Competitive Landscape - Only for Africa → US */}
          {flowDirection === 'africa_to_us' && (
            <ExportableCard
              title={`${cell.country_name} — Competitive Landscape`}
              fileName={`souvera-${cell.iso3}-competition-${new Date().toISOString().slice(0,10)}`}
              countryName={cell.country_name}
              cell={cell}
              cardType="competitive_landscape"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Competitive Landscape
                </h3>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-3">
                    China controls <span className="text-white font-medium">{cell.china_market_share_pct.toFixed(1)}%</span> of US imports in this sector
                    {cell.china_market_share_pct > 30 && (
                      <span className="text-orange-400"> — high diversification pressure</span>
                    )}
                  </p>
                  {cell.top_competitors && cell.top_competitors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 mb-2">Top Competitors</p>
                      {cell.top_competitors.map((comp, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{idx + 1}. {comp.country}</span>
                          <span className="text-zinc-500">{comp.sharePct?.toFixed(1) || '—'}% share</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ExportableCard>
          )}

          {/* Top Products - Conditional */}
          {flowDirection === 'africa_to_us' ? (
            <>
              {/* Top Export Products (Supply) */}
              <ExportableCard
                title={`${cell.country_name} — Top Export Products`}
                fileName={`souvera-${cell.iso3}-exports-${new Date().toISOString().slice(0,10)}`}
                countryName={cell.country_name}
                cell={cell}
                cardType="supply_analysis"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Top Export Products ({cell.country_name})
                  </h3>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Country export lines in {cell.sector_label} — capacity {formatUsdCompact(cell.export_volume_usd)}/yr</p>
                    <p className="text-[10px] text-zinc-600 mb-3">Source: {exportProductSourceLabel(cell)} · Tier {cell.data_quality_tier}</p>
                    {buildCountrySupplyProducts(cell).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400">{idx + 1}</span>
                          <span className="text-zinc-300 text-sm">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">{product.value}</p>
                          <p className="text-zinc-500 text-xs">{product.share} of sector</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-zinc-600 mt-3 leading-relaxed">{SDM_PRODUCT_MIX_FOOTNOTE}</p>
                    {capacityCorridorBridge(cell) && (
                      <p className="text-[10px] text-cyan-400/80 mt-2">{capacityCorridorBridge(cell)}</p>
                    )}
                  </div>
                </div>
              </ExportableCard>

              {/* Top US Import Products (Demand) */}
              <ExportableCard
                title={`US — Top Import Products`}
                fileName={`souvera-us-imports-${cell.sector_key}-${new Date().toISOString().slice(0,10)}`}
                countryName="United States"
                cell={cell}
                cardType="us_import_demand"
                exportDefaults={usExportDefaults(cell)}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Top U.S. Sector Import Products
                  </h3>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-3">U.S. market demand in {cell.sector_label} — same baseline for all {cell.region} suppliers</p>
                    {buildUsSectorDemandProducts(cell).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-xs text-blue-400">{idx + 1}</span>
                          <span className="text-zinc-300 text-sm">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">{product.value}</p>
                          <p className="text-zinc-500 text-xs">{product.growth}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-zinc-600 mt-3 leading-relaxed">
                      U.S. sector import total: {formatUsdCompact(cell.us_import_volume_usd)}/yr · {SDM_PRODUCT_MIX_FOOTNOTE}
                    </p>
                  </div>
                </div>
              </ExportableCard>
            </>
          ) : (
            <>
              {/* Preferential reciprocity context (AGOA for Africa, CBI/CBTPA for Caribbean) */}
              {(() => {
                const reciprocity = getSdmReciprocityContext(cell);
                return (
              <ExportableCard
                title={`${reciprocity.framework} — Reciprocal Trade`}
                fileName={`souvera-${reciprocity.exportFileSlug}-${cell.iso3}-${new Date().toISOString().slice(0,10)}`}
                countryName={cell.country_name}
                cell={cell}
                cardType="executive_summary"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                    {reciprocity.title}
                  </h3>
                  <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                    <p className="text-sm text-zinc-300 mb-4">
                      {reciprocity.narrative}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-zinc-900/50 rounded-lg text-center">
                        <p className="text-xs text-zinc-500 mb-1">{reciprocity.framework} Status</p>
                        <p className={`font-medium ${reciprocity.eligible ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {reciprocity.statusLabel}
                        </p>
                      </div>
                      <div className="p-3 bg-zinc-900/50 rounded-lg text-center">
                        <p className="text-xs text-zinc-500 mb-1">Market Access</p>
                        <p className="text-white font-medium">
                          {cell.infrastructure_score > 60 ? 'Strong' : cell.infrastructure_score > 40 ? 'Moderate' : 'Developing'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Key narrative: &ldquo;{reciprocity.keyNarrative}&rdquo;
                    </p>
                    {cell.preferential_excluded && cell.preferential_framework_note && (
                      <p className="text-xs text-amber-400/80 mt-3 leading-relaxed">
                        {cell.preferential_framework_note}
                      </p>
                    )}
                  </div>
                </div>
              </ExportableCard>
                );
              })()}
            </>
          )}

          {/* Executive Souvera Analysis - Conditional */}
          <ExportableCard
            title={`${cell.country_name} — Souvera Analysis`}
            fileName={`souvera-${cell.iso3}-analysis-${flowDirection}-${new Date().toISOString().slice(0,10)}`}
            countryName={cell.country_name}
            cell={cell}
            cardType="executive_summary"
            flowDirection={flowDirection}
            extras={{ countryDemandScore: reverseFlow.countryDemandScore }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Souvera Executive Summary
                <span className="ml-auto text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                  {cell.region} ↔ US
                </span>
              </h3>
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg space-y-4">
                {/* Bidirectional metrics */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-purple-500/20">
                  <div>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-2">{cell.region} → U.S.</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-purple-400">{Math.round(cell.opportunity_score)}</p>
                        <p className="text-[10px] text-zinc-500">Opportunity</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">{formatUsdCompact(cell.current_trade_usd)}</p>
                        <p className="text-[10px] text-zinc-500">U.S. corridor</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-300">{formatUsdCompact(cell.export_volume_usd)}</p>
                        <p className="text-[10px] text-zinc-500">Capacity</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-500 uppercase tracking-wider mb-2">U.S. → {cell.region}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-purple-400">{reverseFlow.countryDemandScore}</p>
                        <p className="text-[10px] text-zinc-500">Import index</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-400">
                          {(cell.country_sector_imports_from_us_usd ?? cell.country_imports_from_us_usd ?? 0) > 0
                            ? formatUsdCompact(cell.country_sector_imports_from_us_usd ?? cell.country_imports_from_us_usd ?? 0)
                            : '—'}
                        </p>
                        <p className="text-[10px] text-zinc-500">Country imports</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-300">{reverseFlow.opportunityScore}</p>
                        <p className="text-[10px] text-zinc-500">Import opp.</p>
                      </div>
                    </div>
                    {cell.country_top_import_product && (
                      <p className="text-[10px] text-zinc-500 mt-2 text-center">
                        Key import: {cell.country_top_import_product}
                      </p>
                    )}
                  </div>
                </div>
                {capacityCorridorBridge(cell) && (
                  <p className="text-xs text-cyan-400/90">{capacityCorridorBridge(cell)}</p>
                )}
                
                {/* Flow-specific bullets */}
                <div className="space-y-2">
                  {flowDirection === 'africa_to_us' 
                    ? generateExecutiveAnalysis(cell).map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${bullet.type === 'positive' ? 'bg-emerald-400' : bullet.type === 'negative' ? 'bg-red-400' : 'bg-blue-400'}`} />
                          <p className="text-sm text-zinc-300">{bullet.content}</p>
                        </div>
                      ))
                    : reverseFlow.keyInsights.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${bullet.type === 'positive' ? 'bg-emerald-400' : bullet.type === 'negative' ? 'bg-red-400' : 'bg-blue-400'}`} />
                          <p className="text-sm text-zinc-300">{bullet.content}</p>
                        </div>
                      ))
                  }
                </div>

                {/* Investment Thesis */}
                <div className="pt-4 border-t border-purple-500/20">
                  <p className="text-xs text-purple-400 font-semibold mb-2">
                    {flowDirection === 'africa_to_us' ? 'INVESTMENT THESIS' : 'MARKET ENTRY THESIS'}
                  </p>
                  <p className="text-sm text-white font-medium">
                    {flowDirection === 'africa_to_us' ? getInvestmentThesis(cell) : reverseFlow.investmentThesis}
                  </p>
                </div>
              </div>
            </div>
          </ExportableCard>

          {/* Data Attribution */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-start gap-2 text-xs text-zinc-500">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="mb-1">
                  Data Quality: <span className={`${cell.data_quality_tier === 'A' ? 'text-emerald-400' : cell.data_quality_tier === 'B' ? 'text-yellow-400' : 'text-zinc-400'}`}>
                    Tier {cell.data_quality_tier}
                  </span>
                  {' · '}Source Data: {cell.data_year} (Latest Available)
                </p>
                <p>{cell.source_notes || 'World Bank · UN Comtrade · UNCTAD FDI Statistics'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <a
              href={`/intelligence/map?iso3=${cell.iso3}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              View Country Profile
            </a>
            <a
              href={`/intelligence/trade?sector=${cell.sector_key}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Sector Analysis
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Top Products Data ────────────────────────────────────────────────────────

function buildUsExportProducts(cell: MatrixCell): SdmProductRow[] {
  const sectorData = US_EXPORT_DATA[cell.sector_key];
  if (!sectorData) {
    return buildUsSectorDemandProducts(cell);
  }
  return sectorData.products
    .map((p) => {
      const sharePct = parseInt(p.share, 10) || 0;
      const valueUsd = Math.round(sectorData.totalExports * (sharePct / 100));
      return {
        name: p.name,
        value: `${formatUsdCompact(valueUsd)}/yr`,
        share: p.share,
        valueUsd,
      };
    })
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

interface ProductInfo {
  name: string;
  value: string;
  share: string;
  growth?: string;
}

// ─── Executive Analysis Generator ─────────────────────────────────────────────

interface AnalysisBullet {
  content: React.ReactNode;
  type: 'positive' | 'negative' | 'neutral';
}

function generateExecutiveAnalysis(cell: MatrixCell): AnalysisBullet[] {
  const bullets: AnalysisBullet[] = [];
  const { country_name, sector_label, supply_score, demand_score, 
          agoa_eligible, cbtpa_eligible, current_trade_usd, china_market_share_pct,
          us_import_growth_pct, infrastructure_score } = cell;
  const exportProducts = buildCountrySupplyProducts(cell);
  const leadExport = exportProducts[0]?.name;
  
  // Supply capacity assessment
  if (supply_score >= 70) {
    bullets.push({
      content: <>{country_name} has <span className="text-emerald-400 font-medium">strong export capacity</span> (<span className="text-emerald-400">{Math.round(supply_score)}</span>/100) in {sector_label.toLowerCase()}</>,
      type: 'positive'
    });
  } else if (supply_score >= 50) {
    bullets.push({
      content: <>{country_name} has <span className="text-yellow-400">developing capacity</span> (<span className="text-yellow-400">{Math.round(supply_score)}</span>/100) with room for growth</>,
      type: 'neutral'
    });
  } else {
    bullets.push({
      content: <>Export capacity is <span className="text-orange-400">emerging</span> (<span className="text-orange-400">{Math.round(supply_score)}</span>/100) — requires investment in production infrastructure</>,
      type: 'negative'
    });
  }
  
  // US demand context
  if (demand_score >= 70) {
    bullets.push({
      content: <>US imports <span className="text-blue-400 font-medium">{formatUsdCompact(cell.us_import_volume_usd)} annually</span> in this sector with <span className={us_import_growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>{us_import_growth_pct >= 0 ? '+' : ''}{us_import_growth_pct.toFixed(1)}%</span> growth</>,
      type: 'positive'
    });
  } else {
    bullets.push({
      content: <>US market demand is <span className="text-blue-400">moderate</span> at <span className="text-blue-400">{Math.round(demand_score)}</span>/100 with <span className={us_import_growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>{us_import_growth_pct.toFixed(1)}%</span> annual growth</>,
      type: 'neutral'
    });
  }
  
  // Trade preference advantage
  if (agoa_eligible || cbtpa_eligible) {
    const pref = agoa_eligible ? 'AGOA' : 'CBTPA';
    bullets.push({
      content: <><span className="text-emerald-400 font-medium">{pref} eligible</span> under preferential rules of origin — duty-free entry subject to product-specific HTS qualification</>,
      type: 'positive'
    });
  }
  
  // China diversification opportunity
  if (china_market_share_pct > 30) {
    bullets.push({
      content: <>China holds <span className="text-orange-400 font-medium">{china_market_share_pct.toFixed(0)}%</span> of US imports — <span className="text-amber-400">high diversification pressure</span> creates opportunity</>,
      type: 'positive'
    });
  } else if (china_market_share_pct > 20) {
    bullets.push({
      content: <>China&apos;s <span className="text-orange-400">{china_market_share_pct.toFixed(0)}%</span> market share indicates <span className="text-yellow-400">moderate</span> diversification opportunity</>,
      type: 'neutral'
    });
  }
  
  // Current trade corridor
  if (current_trade_usd > 100_000_000) {
    bullets.push({
      content: <><span className="text-emerald-400 font-medium">Established trade corridor</span> with <span className="text-emerald-400 font-medium">{formatUsdCompact(current_trade_usd)}</span> in annual bilateral exports{leadExport ? <> (lead export: {leadExport})</> : null}</>,
      type: 'positive'
    });
  } else if (current_trade_usd > 10_000_000) {
    bullets.push({
      content: <>Nascent corridor with <span className="text-blue-400">{formatUsdCompact(current_trade_usd)}</span> in bilateral exports{leadExport ? <> ({leadExport})</> : null} — <span className="text-amber-400">expansion opportunity</span></>,
      type: 'neutral'
    });
  } else {
    bullets.push({
      content: <><span className="text-blue-400 font-medium">Greenfield opportunity</span> — minimal existing trade allows first-mover advantage{leadExport ? <>; lead export line: {leadExport}</> : null}</>,
      type: 'neutral'
    });
  }

  const countryImportUsd = cell.country_sector_imports_from_us_usd ?? cell.country_imports_from_us_usd ?? 0;
  if (countryImportUsd > 0) {
    bullets.push({
      content: <>Country imports from U.S.: <span className="text-blue-400 font-medium">{countryImportVolumeLabel(cell)}</span></>,
      type: 'neutral'
    });
  }
  
  // Infrastructure consideration
  if (infrastructure_score < 50) {
    bullets.push({
      content: <>Infrastructure score of <span className="text-orange-400 font-medium">{Math.round(infrastructure_score)}</span>/100 may require logistics investment</>,
      type: 'negative'
    });
  }
  
  return bullets;
}

function getInvestmentThesis(cell: MatrixCell): string {
  const { country_name, sector_label, opportunity_tier, agoa_eligible, cbtpa_eligible } = cell;
  const pref = agoa_eligible ? 'AGOA' : cbtpa_eligible ? 'CBTPA' : '';
  
  if (opportunity_tier === 1) {
    return `${country_name}'s ${sector_label.toLowerCase()} sector is investor-ready. ${pref ? `${pref} benefits ` : ''}Combined with strong supply capacity and clear US demand signals, this corridor is suitable for institutional capital deployment with near-term returns.`;
  } else if (opportunity_tier === 2) {
    return `Strong fundamentals position ${country_name} as a compelling ${sector_label.toLowerCase()} opportunity. ${pref ? `${pref} access provides tariff advantages. ` : ''}Suitable for growth equity or DFI deployment with 3-5 year horizon.`;
  } else if (opportunity_tier === 3) {
    return `${country_name} represents an emerging ${sector_label.toLowerCase()} opportunity. Investment should focus on capacity building and infrastructure development. Ideal for patient capital or technical assistance programs.`;
  } else {
    return `Early-stage opportunity requiring foundational investment. Consider development finance or public-private partnerships to build ${sector_label.toLowerCase()} export capacity in ${country_name}.`;
  }
}

// ─── Reverse Flow Data Generator (US → Africa) ────────────────────────────────

interface ReverseFlowData {
  opportunityScore: number;
  tierLabel: string;
  usSupplyScore: number;
  countryDemandScore: number;
  usExportProducts: ProductInfo[];
  countryImportNeeds: ProductInfo[];
  tradeValue: string;
  growthRate: string;
  keyInsights: AnalysisBullet[];
  investmentThesis: string;
}

const US_EXPORT_DATA: Record<string, { products: ProductInfo[], totalExports: number, growthRate: number }> = {
  manufacturing_textiles: {
    products: [
      { name: 'Industrial Machinery', value: '$45B/yr', share: '32%' },
      { name: 'Medical Equipment', value: '$28B/yr', share: '20%' },
      { name: 'Auto Parts & Vehicles', value: '$22B/yr', share: '16%' },
    ],
    totalExports: 142000000000,
    growthRate: 4.2,
  },
  agriculture_food: {
    products: [
      { name: 'Grains & Cereals', value: '$32B/yr', share: '35%' },
      { name: 'Meat & Poultry', value: '$18B/yr', share: '20%' },
      { name: 'Processed Foods', value: '$15B/yr', share: '16%' },
    ],
    totalExports: 92000000000,
    growthRate: 5.8,
  },
  energy_power: {
    products: [
      { name: 'LNG & Natural Gas', value: '$28B/yr', share: '38%' },
      { name: 'Refined Petroleum', value: '$22B/yr', share: '30%' },
      { name: 'Power Equipment', value: '$12B/yr', share: '16%' },
    ],
    totalExports: 74000000000,
    growthRate: 8.5,
  },
  mining_minerals: {
    products: [
      { name: 'Mining Equipment', value: '$8B/yr', share: '42%' },
      { name: 'Processed Metals', value: '$5B/yr', share: '26%' },
      { name: 'Exploration Tech', value: '$3B/yr', share: '16%' },
    ],
    totalExports: 19000000000,
    growthRate: 6.2,
  },
  digital_infrastructure: {
    products: [
      { name: 'Telecom Equipment', value: '$18B/yr', share: '35%' },
      { name: 'Cloud Services', value: '$12B/yr', share: '24%' },
      { name: 'Semiconductors', value: '$15B/yr', share: '29%' },
    ],
    totalExports: 51000000000,
    growthRate: 12.5,
  },
  fintech_finance: {
    products: [
      { name: 'Payment Systems', value: '$4B/yr', share: '40%' },
      { name: 'Banking Software', value: '$2.5B/yr', share: '25%' },
      { name: 'Insurance Tech', value: '$1.8B/yr', share: '18%' },
    ],
    totalExports: 10000000000,
    growthRate: 18.5,
  },
  logistics_trade: {
    products: [
      { name: 'Logistics Software', value: '$5B/yr', share: '35%' },
      { name: 'Transport Equipment', value: '$8B/yr', share: '55%' },
      { name: 'Supply Chain Services', value: '$1.5B/yr', share: '10%' },
    ],
    totalExports: 14500000000,
    growthRate: 7.2,
  },
  tourism_hospitality: {
    products: [
      { name: 'Hotel Management', value: '$2B/yr', share: '40%' },
      { name: 'Travel Tech', value: '$1.5B/yr', share: '30%' },
      { name: 'Franchise Services', value: '$1B/yr', share: '20%' },
    ],
    totalExports: 5000000000,
    growthRate: 15.0,
  },
};

function generateReverseFlowData(cell: MatrixCell): ReverseFlowData {
  const usExportTotal = cell.us_import_volume_usd;
  const usExportGrowth = cell.us_import_growth_pct;
  const countryDemandScore = computeCountryImportDemandScore(cell);
  const countryImportUsd = cell.country_sector_imports_from_us_usd ?? cell.country_imports_from_us_usd ?? 0;

  const usSupplyScore = 85;

  const baseScore = (usSupplyScore * 0.4 + countryDemandScore * 0.5);
  const agoaBonus = cell.agoa_eligible ? 8 : cell.cbtpa_eligible ? 6 : 0;
  const infrastructurePenalty = cell.infrastructure_score < 40 ? -10 : cell.infrastructure_score < 60 ? -5 : 0;
  const opportunityScore = Math.min(100, Math.max(0, Math.round(baseScore + agoaBonus + infrastructurePenalty)));

  const tierLabel = opportunityScore >= 75 ? 'Tier 1 — High Potential'
    : opportunityScore >= 55 ? 'Tier 2 — Strong Market'
    : opportunityScore >= 35 ? 'Tier 3 — Developing'
    : 'Tier 4 — Emerging';

  const countryImportNeeds: ProductInfo[] = [];

  const keyInsights: AnalysisBullet[] = [];

  keyInsights.push({
    content: <>{cell.country_name}&apos;s country import volume from the U.S. is <span className="text-blue-400 font-medium">{countryImportVolumeLabel(cell)}</span></>,
    type: countryImportUsd > 0 ? 'positive' : 'neutral'
  });

  keyInsights.push({
    content: <>{cell.country_name}&apos;s modeled import demand index is <span className="text-purple-400 font-medium">{countryDemandScore}/100</span> in {cell.sector_label.toLowerCase()}</>,
    type: 'neutral'
  });

  keyInsights.push({
    content: <>U.S. sector import market totals <span className="text-blue-400 font-medium">{formatUsdCompact(usExportTotal)}/yr</span> with <span className={usExportGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}>{usExportGrowth >= 0 ? '+' : ''}{usExportGrowth.toFixed(1)}%</span> five-year CAGR (shared baseline for all suppliers)</>,
    type: 'positive'
  });
  
  if (cell.cbtpa_eligible && cell.region === 'Caribbean') {
    keyInsights.push({
      content: <><span className="text-emerald-400 font-medium">CBI/CBTPA framework</span> facilitates reciprocal trade — supports U.S. export access under nearshore preferences</>,
      type: 'positive'
    });
  } else if (cell.agoa_eligible) {
    keyInsights.push({
      content: <><span className="text-emerald-400 font-medium">AGOA framework</span> facilitates reciprocal trade — supports US export access</>,
      type: 'positive'
    });
  }
  
  if (cell.infrastructure_score < 50) {
    keyInsights.push({
      content: <>Infrastructure development needs create demand for <span className="text-blue-400">US equipment & services</span></>,
      type: 'positive'
    });
  }
  
  keyInsights.push({
    content: <>Population of <span className="text-white font-medium">{cell.region === 'Africa' ? '1.4B (Africa)' : '45M (Caribbean)'}</span> represents significant consumer market</>,
    type: 'neutral'
  });
  
  // Investment thesis
  const prefNote =
    cell.region === 'Caribbean' && cell.cbtpa_eligible
      ? 'CBI/CBTPA provides framework for reciprocal trade benefits. '
      : cell.agoa_eligible
        ? 'AGOA provides framework for reciprocal trade benefits. '
        : '';
  const investmentThesis = opportunityScore >= 60
    ? `${cell.country_name}'s growing ${cell.sector_label.toLowerCase()} sector presents strong opportunity for US exporters. ${prefNote}Market entry via local partnerships recommended.`
    : `Emerging market opportunity in ${cell.country_name}. US companies can capture market share as ${cell.sector_label.toLowerCase()} sector develops. Focus on equipment, technology transfer, and capacity building partnerships.`;
  
  return {
    opportunityScore,
    tierLabel,
    usSupplyScore,
    countryDemandScore,
    usExportProducts: buildUsExportProducts(cell),
    countryImportNeeds,
    tradeValue: countryImportUsd > 0 ? formatUsdCompact(countryImportUsd) : formatUsdCompact(usExportTotal),
    growthRate: `${usExportGrowth >= 0 ? '+' : ''}${usExportGrowth.toFixed(1)}%`,
    keyInsights,
    investmentThesis,
  };
}

export default SupplyDemandCellDrawer;
