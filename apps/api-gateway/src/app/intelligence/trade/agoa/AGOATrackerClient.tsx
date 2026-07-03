'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AGOA Tracker Client Component
// Owner: Afronovation, Inc.
// ===========================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Scale,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Info,
  Lock,
  Calendar,
  Gavel,
  Clock,
  X,
  Globe,
  Shirt,
  Download,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
} from 'lucide-react';
import { exportTradePolicyCard } from '@/lib/intelligence/trade-policy-export';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import type { CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';
import { PolicyExportButton } from '@/components/intelligence/trade/PolicyExportButton';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { CollapsibleAnalysis } from '@/components/intelligence/CollapsibleAnalysis';
import {
  getAGOAStatusLabel,
  getAGOAStatusColor,
  formatDisplayDate,
} from '@/lib/data/utils';
import {
  aggregateAgoaTradeFromFlowRows,
  formatTradeValueUSD,
  type AgoaCountryTradeData,
} from '@/data/agoa-country-trade-data';

export interface AgoaInitialEntitlement {
  planId: string;
  isFullAccess: boolean;
  isAuthenticated: boolean;
}

interface AGOAStatus {
  country_iso3: string;
  country_name: string;
  agoa_status: string;
  agoa_apparel_eligible?: boolean;
  agoa_eligible_since?: string;
  agoa_suspension_date?: string;
  agoa_notes?: string;
  agoa_source_url?: string;
  agoa_as_of_date?: string;
  agoa_last_reviewed_at?: string;
  source_type: string;
  data_label: string;
  is_full_access: boolean;
  upgrade_message?: string;
}

interface LegislativeEvent {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: 'active' | 'upcoming' | 'completed' | 'watchpoint';
  impact: 'high' | 'medium';
  source_url?: string;
  affected_iso3?: string[];
}

interface AGOAResponse {
  statuses: AGOAStatus[];
  legislative_events: LegislativeEvent[];
  summary: {
    total_tracked: number;
    eligible_count: number;
    suspended_count: number;
    under_review_count?: number;
    note: string;
  };
  attribution: {
    source_name: string;
    source_type: string;
    data_label: string;
    confidence_level: string;
  };
  entitlement: {
    plan_id: string;
    is_full_access: boolean;
  };
}

const EVENT_STATUS_STYLE: Record<LegislativeEvent['status'], string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  watchpoint: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const EVENT_STATUS_LABEL: Record<LegislativeEvent['status'], string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  watchpoint: 'Watchpoint',
};

const AGOA_EXPIRY = new Date('2026-12-31T23:59:59Z');

function daysUntilExpiry(): number {
  const now = new Date();
  const diff = AGOA_EXPIRY.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Exportable AGOA Section Component ────────────────────────────────────────

function ExportableAGOASection({
  children,
  id,
  title,
  country,
  sourceNotes,
  fileName,
  souveraAnalysis,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
  country: AGOAStatus;
  sourceNotes: string;
  fileName: string;
  souveraAnalysis?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!sectionRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: sectionRef.current,
        fileName,
        cardTitle: `${country.country_iso3} — ${title}`,
        countryName: country.country_name,
        sourceAttribution: sourceNotes,
        dataAsOf: new Date().getFullYear().toString(),
        disclaimer: 'Curated estimates. For research and policy analysis purposes only.',
        aiAnalysisConfig: {
          cardType: 'agoa_tracker',
          countryName: country.country_name,
          iso3: country.country_iso3,
          data: {
            Status: country.agoa_status,
            'Eligibility Since': country.agoa_eligible_since ?? 'N/A',
            Section: title,
          },
        } satisfies CardAnalysisInput,
      });
    } finally {
      setExporting(false);
    }
  }, [country, title, sourceNotes, fileName, exporting]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={sectionRef} className="bg-zinc-900 rounded-xl overflow-hidden">
        {/* Section header for export context */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-mono text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded px-1.5 py-0.5">{country.country_iso3}</span>
              </div>
              <p className="text-white font-semibold text-sm leading-snug">{country.country_name}</p>
              <p className="text-zinc-500 text-[10px] mt-1">AGOA Eligibility Analysis · {new Date().getFullYear()}</p>
              <p className="text-zinc-300 text-xs font-medium mt-1.5 border-l-2 border-blue-500 pl-2">{title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-blue-400 font-bold text-[10px] tracking-wide">SOUVERA</p>
              <p className="text-zinc-600 text-[9px]">U.S. Trade Policy</p>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="p-4">{children}</div>

        {/* Souvera Analysis block */}
        {souveraAnalysis && (
          <div className="px-4 pb-4">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <p className="text-indigo-300 text-[9px] font-semibold uppercase tracking-wide">Souvera Analysis</p>
              </div>
              <CollapsibleAnalysis
                text={souveraAnalysis}
                titleClass="hidden"
                className="text-zinc-300 text-xs"
              />
            </div>
          </div>
        )}

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

// ─── AGOA Country Drawer ─────────────────────────────────────────────────────

interface AGOACountryDrawerProps {
  country: AGOAStatus | null;
  onClose: () => void;
  daysRemaining: number;
  isAuthenticated: boolean;
}

function AGOACountryDrawer({ country, onClose, daysRemaining, isAuthenticated }: AGOACountryDrawerProps) {
  const iso3 = country?.country_iso3 ?? '';
  const isEligible = country?.agoa_status === 'eligible';

  const [tradeData, setTradeData] = useState<AgoaCountryTradeData | undefined>(undefined);

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    fetch(`/api/v1/trade/agoa/flows?iso3=${country.country_iso3}&year=2023`)
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (cancelled || !payload?.rows?.length) return;
        const aggregated = aggregateAgoaTradeFromFlowRows(
          country.country_iso3,
          payload.rows,
          country.agoa_status === 'eligible'
        );
        if (aggregated) setTradeData(aggregated);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [country]);

  if (!country) return null;

  const dateStr = new Date().toISOString().slice(0, 10);
  const statusColor = getAGOAStatusColor(country.agoa_status);
  const statusLabel = getAGOAStatusLabel(country.agoa_status);
  const isSuspended = country.agoa_status === 'suspended';
  const hasApparelEligibility = country.agoa_apparel_eligible === true;

  // Generate contextual Souvera analysis with trade data
  const tradeVolumeStr = tradeData ? formatTradeValueUSD(tradeData.totalExportsToUSUSD) : null;
  const tradeGrowthStr = tradeData ? `${tradeData.yoyGrowthPct > 0 ? '+' : ''}${tradeData.yoyGrowthPct}%` : null;
  
  const eligibilityAnalysis = isEligible
    ? `${country.country_name} maintains full AGOA eligibility, providing duty-free access to the US market for over 6,000 product lines. ${tradeVolumeStr ? `Current AGOA exports total ${tradeVolumeStr}/yr${tradeGrowthStr ? ` (${tradeGrowthStr} YoY)` : ''}. ` : ''}${hasApparelEligibility ? 'The additional apparel provision (AGOA IV) enables third-country fabric sourcing, dramatically expanding textile export capacity. ' : ''}With ${daysRemaining} days until reauthorization deadline, maintaining eligibility is critical for preserving trade relationships.`
    : isSuspended
    ? `${country.country_name}'s AGOA eligibility is currently suspended${country.agoa_suspension_date ? ` since ${formatDisplayDate(country.agoa_suspension_date)}` : ''}. Suspension removes preferential access to the US market, requiring exports to face standard MFN tariffs. ${country.agoa_notes ? country.agoa_notes : 'Restoration requires addressing the eligibility criteria specified by USTR.'}`
    : `${country.country_name}'s current AGOA status (${statusLabel}) affects its ability to export duty-free to the United States. Monitor USTR announcements for eligibility changes that may impact trade flows.`;

  const apparelAnalysis = hasApparelEligibility
    ? `${country.country_name} qualifies for the AGOA apparel provision under AGOA IV, enabling preferential treatment for textile and apparel products (HS 50–63). The third-country fabric rule allows garments assembled in ${country.country_name} from fabric sourced outside Africa to still qualify for duty-free entry — a critical provision that enables scaling production without domestic textile mill constraints.`
    : `${country.country_name} does not currently have AGOA apparel eligibility. This means textile and apparel exports must meet stricter rules of origin (African fabric requirement) or face MFN tariffs. Apparel eligibility is determined by USTR based on labor and market access criteria.`;

  const reauthorizationAnalysis = isEligible
    ? `AGOA reauthorization is critical for ${country.country_name}'s trade position. ${tradeVolumeStr ? `The ${tradeVolumeStr}/yr in current exports would face immediate tariff exposure if AGOA lapses. ` : ''}The ${daysRemaining}-day countdown to December 31, 2026 means exporters face uncertainty on long-term contracts. ${country.country_name} products would lose competitiveness against Asian suppliers with FTA access.`
    : `The AGOA reauthorization process will determine whether ${country.country_name} can restore or maintain preferential access. The December 2026 deadline creates urgency for addressing any eligibility concerns with USTR.`;

  const tradeVolumeAnalysis = tradeData
    ? `${country.country_name} exported ${tradeVolumeStr} to the US under AGOA in the most recent reporting period${tradeGrowthStr ? `, representing ${tradeGrowthStr} year-over-year growth` : ''}. ${tradeData.agoaUtilizationPct >= 60 ? `With ${tradeData.agoaUtilizationPct}% utilization rate, the country demonstrates strong awareness of AGOA benefits.` : tradeData.agoaUtilizationPct >= 30 ? `The ${tradeData.agoaUtilizationPct}% utilization rate indicates room for expanded AGOA engagement.` : `The ${tradeData.agoaUtilizationPct}% utilization rate highlights significant untapped potential.`} ${tradeData.topProducts.length > 0 ? `Top export ${tradeData.topProducts[0].description} accounts for ${tradeData.topProducts[0].shareOfTotal}% of total.` : ''}${tradeData.narrative ? ` ${tradeData.narrative}` : ''}`
    : `Trade volume data for ${country.country_name} will be available following Comtrade integration. AGOA eligibility provides duty-free access to over 6,000 product lines.`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto">
        {/* Drawer header */}
        <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-sm text-blue-300">{country.country_iso3}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{country.country_name}</h2>
              <p className="text-zinc-500 text-xs mt-1">
                AGOA Eligibility Profile · {new Date().getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer content */}
        <div className="p-5 space-y-5">
          {/* Overview Section — EXPORTABLE */}
          <ExportableAGOASection
            id="overview"
            title="AGOA Status Overview"
            country={country}
            sourceNotes="Office of the U.S. Trade Representative · Federal Register · Souvera Analysis"
            fileName={`souvera-agoa-${country.country_iso3.toLowerCase()}-overview-${dateStr}`}
            souveraAnalysis={eligibilityAnalysis}
          >
            <div className="space-y-4">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Current Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                  {isEligible ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {statusLabel}
                </span>
              </div>

              {/* Eligible since */}
              {country.agoa_eligible_since && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Eligible Since</span>
                  <span className="text-white text-sm font-medium">{formatDisplayDate(country.agoa_eligible_since)}</span>
                </div>
              )}

              {/* Suspension date */}
              {country.agoa_suspension_date && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Suspended Since</span>
                  <span className="text-red-400 text-sm font-medium">{formatDisplayDate(country.agoa_suspension_date)}</span>
                </div>
              )}

              {/* Days until reauthorization */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Reauthorization Deadline</span>
                <span className="text-amber-400 text-sm font-medium">{daysRemaining} days remaining</span>
              </div>

              {/* Notes */}
              {country.agoa_notes && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-zinc-400 text-xs mb-1">USTR Notes</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{country.agoa_notes}</p>
                </div>
              )}
            </div>
          </ExportableAGOASection>

          {/* Trade Volume Section — EXPORTABLE */}
          <ExportableAGOASection
            id="trade-volume"
            title="AGOA Trade Volume"
            country={country}
            sourceNotes="UN Comtrade · USITC · ITC Trade Data Monitor · Souvera Analysis"
            fileName={`souvera-agoa-${country.country_iso3.toLowerCase()}-trade-${dateStr}`}
            souveraAnalysis={tradeVolumeAnalysis}
          >
            <div className="space-y-4">
              {tradeData ? (
                <>
                  {/* Trade summary KPIs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-center">
                      <p className="text-2xl font-bold text-emerald-400">{formatTradeValueUSD(tradeData.totalExportsToUSUSD)}</p>
                      <p className="text-zinc-500 text-xs">Exports to US</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-400">{tradeData.agoaUtilizationPct}%</p>
                      <p className="text-zinc-500 text-xs">AGOA Utilization</p>
                    </div>
                  </div>
                  
                  {/* YoY Growth */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Year-over-Year Growth</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
                      tradeData.yoyGrowthPct >= 0
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-red-400 bg-red-500/10'
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${tradeData.yoyGrowthPct < 0 ? 'rotate-180' : ''}`} />
                      {tradeData.yoyGrowthPct > 0 ? '+' : ''}{tradeData.yoyGrowthPct}%
                    </span>
                  </div>
                  
                  {/* Top 3 Products */}
                  {tradeData.topProducts.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                      <p className="text-zinc-400 text-xs mb-3 flex items-center gap-1.5">
                        <Package className="w-3 h-3" />
                        Top Products Exported to US
                      </p>
                      <div className="space-y-2">
                        {tradeData.topProducts.map((product, idx) => (
                          <div key={product.hsCode} className="p-2.5 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-zinc-500 text-[10px] font-mono">#{idx + 1}</span>
                                  <span className="text-violet-300 text-[10px] font-mono bg-violet-500/10 px-1 rounded">{product.hsCode}</span>
                                </div>
                                <p className="text-white text-xs font-medium truncate">{product.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-emerald-400 text-sm font-semibold">{formatTradeValueUSD(product.exportValueUSD)}</p>
                                <p className="text-zinc-500 text-[10px]">{product.shareOfTotal}% of total</p>
                              </div>
                            </div>
                            {/* Share bar */}
                            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500/50 rounded-full"
                                style={{ width: `${Math.min(product.shareOfTotal, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Top Sectors */}
                  {tradeData.topSectors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tradeData.topSectors.map((sector) => (
                        <span key={sector} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
                          {sector}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
                  <BarChart3 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">Trade data pending integration</p>
                  <p className="text-zinc-500 text-xs mt-1">Comtrade API integration in Phase 1</p>
                </div>
              )}
            </div>
          </ExportableAGOASection>

          {/* Apparel Eligibility Section — EXPORTABLE */}
          <ExportableAGOASection
            id="apparel"
            title="Apparel Provision (AGOA IV)"
            country={country}
            sourceNotes="USTR AGOA Apparel Eligibility · Congressional Research Service · Souvera Analysis"
            fileName={`souvera-agoa-${country.country_iso3.toLowerCase()}-apparel-${dateStr}`}
            souveraAnalysis={apparelAnalysis}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Apparel Eligibility</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                  hasApparelEligibility
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-zinc-500 bg-zinc-800/50 border-zinc-700'
                }`}>
                  <Shirt className="w-3.5 h-3.5" />
                  {hasApparelEligibility ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>

              {hasApparelEligibility && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg">
                  <p className="text-emerald-300 text-xs leading-relaxed">
                    <span className="font-semibold">Third-country fabric rule applies.</span> Garments assembled in {country.country_name} from fabric sourced anywhere in the world qualify for duty-free US entry under AGOA IV.
                  </p>
                </div>
              )}

              {/* Product Finder link */}
              {hasApparelEligibility && (
                <Link
                  href={`/intelligence/trade/agoa/products?country=${country.country_iso3}`}
                  className="flex items-center justify-between p-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-violet-300">AGOA Product Finder</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-violet-400" />
                </Link>
              )}
            </div>
          </ExportableAGOASection>

          {/* Reauthorization Impact Section — EXPORTABLE */}
          <ExportableAGOASection
            id="reauthorization"
            title="Reauthorization Impact"
            country={country}
            sourceNotes="Congressional Research Service · USTR AGOA Review · Souvera Analysis"
            fileName={`souvera-agoa-${country.country_iso3.toLowerCase()}-reauth-${dateStr}`}
            souveraAnalysis={reauthorizationAnalysis}
          >
            <div className="space-y-4">
              {/* Countdown banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm font-medium">Deadline: December 31, 2026</span>
                </div>
                <p className="text-zinc-400 text-xs">
                  Without congressional reauthorization, AGOA preferences will expire and {country.country_name} exports will face MFN tariffs.
                </p>
              </div>

              {/* Trade continuity indicator */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Trade Continuity</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                  isEligible
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-red-400 bg-red-500/10 border-red-500/30'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {isEligible ? 'Stable (if renewed)' : 'At Risk'}
                </span>
              </div>
            </div>
          </ExportableAGOASection>

          {/* Source link */}
          {country.agoa_source_url && (
            <div className="pt-3 border-t border-zinc-800">
              <a
                href={country.agoa_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View USTR Official Source
              </a>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Quick Actions</p>
            <Link
              href={`/country/${country.country_iso3}?tab=trade`}
              className="flex items-center justify-between w-full p-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">View Country Trade Profile</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
            <Link
              href="/intelligence/trade/afcfta"
              className="flex items-center justify-between w-full p-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              <span className="text-sm text-white">View AfCFTA Status</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function tradeTabHref(iso3: string, isAuthenticated: boolean): string {
  if (!isAuthenticated) {
    return `/access/request-access?country=${iso3}`;
  }
  return `/country/${iso3}?tab=trade`;
}

// Component now protected by server-side paywall - all users have access
export function AGOATrackerClient() {
  const searchParams = useSearchParams();
  const highlightCountry = searchParams.get('country')?.toUpperCase() ?? '';

  const [data, setData] = useState<AGOAResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<AGOAStatus | null>(null);

  // All users who reach this component are authenticated with Business+ tier
  const isFullAccess = data?.entitlement?.is_full_access ?? true;
  const isAuthenticated = true;

  async function fetchAGOAData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/trade/agoa', {
        credentials: 'include',
      });

      if (!response.ok) {
        let message = 'Failed to fetch AGOA data';
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
          // non-JSON error body
        }
        throw new Error(message);
      }

      const responseData: AGOAResponse = await response.json();
      setData(responseData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch AGOA data';
      setError(message.includes('fetch') ? 'Unable to reach AGOA API — check network and retry.' : message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAGOAData();
  }, []);

  const filteredStatuses = useMemo(() => {
    return (data?.statuses || []).filter((status) => {
      if (statusFilter && status.agoa_status !== statusFilter) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        status.country_name.toLowerCase().includes(query) ||
        status.country_iso3.toLowerCase().includes(query)
      );
    });
  }, [data?.statuses, searchQuery, statusFilter]);

  useEffect(() => {
    if (!highlightCountry || loading) return;
    const el = document.getElementById(`agoa-country-${highlightCountry}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightCountry, loading, filteredStatuses.length]);

  const sortedEvents = useMemo(() => {
    let events = [...(data?.legislative_events ?? [])];
    if (eventStatusFilter) {
      events = events.filter((e) => e.status === eventStatusFilter);
    }
    return events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data?.legislative_events, eventStatusFilter]);

  const daysRemaining = daysUntilExpiry();

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/intelligence/trade"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Scale className="w-6 h-6 text-blue-400" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400">
              U.S. Trade Policy
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">AGOA Legislative Tracker</h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Track AGOA eligibility, reauthorization milestones, and U.S. legislative watchpoints for
            sub-Saharan African countries.
          </p>

          <div className="mt-6">
            <Link
              href="/intelligence/trade/agoa/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-lg text-sm font-medium text-violet-300 transition-colors"
            >
              <Scale className="w-4 h-4" />
              AGOA Product Finder — Apparel & Textiles (HS 50–63)
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
              {data?.attribution?.data_label || 'Souvera Curated Intelligence'}
            </span>
            <span className="text-zinc-500">
              Source: {data?.attribution?.source_name || 'Office of the U.S. Trade Representative'}
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {/* Reauthorization countdown */}
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium">AGOA Reauthorization Countdown</p>
              <p className="text-zinc-400 text-sm mt-1">
                Current AGOA authorization expires <span className="text-amber-400 font-medium">December 31, 2026</span>.
                {' '}
                <span className="text-white font-medium">{daysRemaining.toLocaleString()} days</span> remaining until reauthorization deadline.
              </p>
            </div>
          </div>
        </div>

        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Total Tracked</p>
              <p className="text-2xl font-bold text-white">{data.summary.total_tracked}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Currently Eligible</p>
              <p className="text-2xl font-bold text-emerald-400">{data.summary.eligible_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Suspended</p>
              <p className="text-2xl font-bold text-red-400">{data.summary.suspended_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Under Review</p>
              <p className="text-2xl font-bold text-amber-400">{data.summary.under_review_count ?? 0}</p>
            </div>
          </div>
        )}

        {data?.summary?.note && (
          <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-zinc-500">{data.summary.note}</p>
          </div>
        )}

        {(data?.legislative_events?.length ?? 0) > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Gavel className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Legislative Timeline</h2>
              </div>
              <div className="flex items-center gap-3">
                <PolicyExportButton
                  label="Export for deck"
                  onClick={() =>
                    exportTradePolicyCard(
                      'agoa-legislative-timeline-grid',
                      'agoa-legislative-timeline',
                      'AGOA Legislative Timeline',
                      'U.S. Trade Policy'
                    )
                  }
                />
                <Filter className="w-4 h-4 text-zinc-500" />
                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Events</option>
                  <option value="watchpoint">Watchpoint</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            {sortedEvents.length > 0 ? (
              <div id="agoa-legislative-timeline-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    id={`agoa-event-${event.id}`}
                    className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.01] min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${EVENT_STATUS_STYLE[event.status]}`}>
                        {EVENT_STATUS_LABEL[event.status]}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDisplayDate(event.date)}
                        </span>
                        <PolicyExportButton
                          label="Slide"
                          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                          onClick={() =>
                            exportTradePolicyCard(
                              `agoa-event-${event.id}`,
                              `agoa-event-${event.id}`,
                              event.title,
                              'AGOA Legislative Event'
                            )
                          }
                        />
                      </div>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-2">{event.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">{event.summary}</p>
                    {event.source_url && (
                      <a
                        href={event.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-export-exclude
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        USTR Source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 py-4">No events match the selected filter.</p>
            )}
          </div>
        )}

        {!isFullAccess && (
          <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-white font-medium">Limited View</p>
                <p className="text-zinc-400 text-sm">
                  Upgrade to Business+ for full AGOA intelligence including eligibility history,
                  suspension details, and source citations.
                </p>
              </div>
              <Link
                href="/access"
                className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Status</option>
              <option value="eligible">Eligible</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
              <option value="ineligible">Ineligible</option>
            </select>
          </div>
          <button
            onClick={() => fetchAGOAData()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
            <p className="text-zinc-500 mt-4">Loading AGOA data...</p>
          </div>
        ) : filteredStatuses.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Scale className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 mt-4">
              {data?.statuses?.length
                ? 'No countries match the current search or status filter.'
                : 'No AGOA status data available'}
            </p>
            {(searchQuery || statusFilter) && (data?.statuses?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div id="agoa-country-grid" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">
                {filteredStatuses.length} countries · hover a card to export a single-country slide
              </p>
              <PolicyExportButton
                label="Export visible countries"
                onClick={() =>
                  exportTradePolicyCard(
                    'agoa-country-grid',
                    'agoa-country-status-grid',
                    'AGOA Country Status',
                    'Sub-Saharan Africa'
                  )
                }
              />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStatuses.map((status) => {
              const isHighlighted = highlightCountry === status.country_iso3;
              return (
                <div
                  key={status.country_iso3}
                  id={`agoa-country-${status.country_iso3}`}
                  onClick={() => setSelectedCountry(status)}
                  className={`group relative bg-zinc-900/50 border rounded-lg p-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                    isHighlighted
                      ? 'border-blue-500/50 ring-1 ring-blue-500/30'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div>
                      <h3 className="text-white font-medium">{status.country_name}</h3>
                      <p className="text-zinc-500 text-sm">{status.country_iso3}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAGOAStatusColor(status.agoa_status)}`}
                      >
                        {getAGOAStatusLabel(status.agoa_status)}
                      </span>
                      <PolicyExportButton
                        label="Slide"
                        className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                        onClick={() =>
                          exportTradePolicyCard(
                            `agoa-country-${status.country_iso3}`,
                            `agoa-${status.country_iso3.toLowerCase()}-status`,
                            `${status.country_name} — AGOA Status`,
                            status.country_iso3
                          )
                        }
                      />
                    </div>
                  </div>

                  {status.agoa_apparel_eligible !== undefined && (
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-400">Apparel Eligible</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        status.agoa_apparel_eligible
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-zinc-500 bg-zinc-800/50 border-zinc-700'
                      }`}>
                        {status.agoa_apparel_eligible ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}

                  {status.is_full_access ? (
                    <div className="space-y-2 text-sm">
                      {status.agoa_eligible_since && (
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Eligible Since</span>
                          <span className="text-zinc-300">{formatDisplayDate(status.agoa_eligible_since)}</span>
                        </div>
                      )}
                      {status.agoa_suspension_date && (
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Suspended</span>
                          <span className="text-red-400">{formatDisplayDate(status.agoa_suspension_date)}</span>
                        </div>
                      )}
                      {status.agoa_notes && (
                        <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800 leading-relaxed">
                          {status.agoa_notes}
                        </p>
                      )}
                      {status.agoa_source_url && (
                        <a
                          href={status.agoa_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-export-exclude
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          USTR Source
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-zinc-800" data-export-exclude>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Lock className="w-3 h-3" />
                        <span>{status.upgrade_message ?? 'Upgrade to Business+ for full AGOA intelligence'}</span>
                      </div>
                    </div>
                  )}

                  <div
                    className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between"
                    data-export-exclude
                  >
                    <span className="text-xs text-zinc-500">{status.data_label}</span>
                    <div className="flex items-center gap-3">
                      {status.agoa_apparel_eligible && (
                        <Link
                          href={`/intelligence/trade/agoa/products?country=${status.country_iso3}`}
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          Products →
                        </Link>
                      )}
                      <Link
                        href={tradeTabHref(status.country_iso3, isAuthenticated)}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Trade tab →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </section>

      {/* Country Drawer */}
      {selectedCountry && (
        <AGOACountryDrawer
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          daysRemaining={daysRemaining}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
