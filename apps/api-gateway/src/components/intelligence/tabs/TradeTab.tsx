'use client';

import React from 'react';
import Link from 'next/link';
import {
  Ship, TrendingUp, Globe, DollarSign, ArrowUpRight, ArrowDownRight,
  Download, Shield, Package, AlertCircle, Import,
} from 'lucide-react';
import { formatCurrency } from '@/lib/intelligence-entitlements';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext, flagUrlFromIso3 } from '@/lib/intelligence/export-branding';
import type { CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { getTradeTabCopy, getIntraRegionalTrade } from '@/lib/intelligence/country-trade-content';
import { getCountryRegion } from '@/lib/intelligence/country-overview-content';
import { getAGOAStatusLabel, getAGOAStatusColor } from '@/lib/data/utils';
import type {
  AgoaPolicyUiSnapshot,
  IntelligenceTabProps,
  CountryTrade,
  TradePartner,
  OfficialReferenceLink,
  UstrTradeSummaryPayload,
} from '@/types/country-intelligence';
import {
  enrichCompositionWithUsd,
  compositionShareSum,
  compositionBullets,
  normalizeCompositionSlots,
  type SectorCompositionItem,
} from '@/lib/intelligence/trade-composition';
import {
  buildTradeTabCardAnalysis,
  buildUsTradeCardAnalysis,
} from '@/lib/intelligence/us-trade-card-analysis';
import { DataPendingState } from '@/components/intelligence/DataPendingState';
import { CollapsibleAnalysis } from '@/components/intelligence/CollapsibleAnalysis';
import { HighlightedText } from '@/components/intelligence/HighlightedText';
import { PetroleumExclusionFootnote } from '@/components/intelligence/PetroleumExclusionFootnote';
import { preferentialFrameworkLabel } from '@/lib/intelligence/preferential-trade-policy';
import {
  TradeSourceReconciliationBanner,
  TradeMetricSourceLabel,
} from '@/components/intelligence/TradeSourceReconciliationBanner';
import { OfficialTradeReferences } from '@/components/intelligence/OfficialTradeReferences';
import { UstrTradeSummaryPanel } from '@/components/intelligence/UstrTradeSummaryPanel';

function formatBillions(value?: number): string {
  if (value == null) return 'N/A';
  return formatCurrency(value);
}

export default function TradeTab({ data, userEntitlements }: IntelligenceTabProps) {
  const hasBusinessAccess =
    userEntitlements.includes('trade_data') || userEntitlements.includes('admin_access');
  const trade = data.trade;
  const countryName = data.country.name;
  const iso3 = data.country.iso3.toUpperCase();
  const tradeCopy = getTradeTabCopy(iso3);
  const iso3Lower = iso3.toLowerCase();
  const exportCtx = countryExportContext(data.country);
  const canExport = hasBusinessAccess;

  const region = getCountryRegion(iso3);
  const upgradeBlurb = region === 'caribbean'
    ? 'Unlock comprehensive bilateral trade data, CBI/CARICOM analysis, export/import breakdowns, and intra-Caribbean trade intelligence.'
    : 'Unlock comprehensive bilateral trade data, AGOA restoration analysis, export/import breakdowns, and intra-African trade intelligence.';

  const handleExport = (
    elementId: string,
    fileName: string,
    cardTitle: string,
    curatedAnalysis?: string,
    aiAnalysisConfig?: CardAnalysisInput
  ) =>
    exportCardToPNG({
      elementId,
      fileName,
      cardTitle,
      curatedAnalysis,
      aiAnalysisConfig,
      ...exportCtx,
    });

  if (!hasBusinessAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-700/50 rounded-lg p-8 text-center">
          <Ship className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-3">Business+ Feature</h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            {upgradeBlurb}
          </p>
          <Link
            href="/access"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Upgrade to Business
          </Link>
        </div>
      </div>
    );
  }

  if (!trade || trade.pending) {
    return (
      <div className="flex items-center justify-center min-h-[300px] px-4">
        <DataPendingState
          variant="pending"
          message={`Bilateral and preferential trade data for ${countryName} is awaiting verified ingestion from U.S. Census / USITC sources.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TradeHero trade={trade} countryName={countryName} subtitle={tradeCopy.heroSubtitle} />
      <USTradeSection
        trade={trade}
        countryName={countryName}
        iso3={iso3}
        exportCtx={exportCtx}
        agoaPolicy={data.agoaPolicy}
        officialReferences={data.officialReferences}
        ustrTradeSummary={data.ustrTradeSummary}
      />
      <IntraRegionalSection
        trade={trade}
        copy={tradeCopy}
        canExport={canExport}
        iso3Lower={iso3Lower}
        countryName={countryName}
        onExport={(analysis) =>
          handleExport(
            'intra-regional-trade-card',
            `${iso3Lower}-intra-regional-trade`,
            tradeCopy.intraRegionalTitle,
            analysis
          )
        }
      />
      <TopPartnersSection
        trade={trade}
        canExport={canExport}
        iso3Lower={iso3Lower}
        countryName={countryName}
        onExport={(analysis) =>
          handleExport('top-trade-partners-card', `${iso3Lower}-top-trade-partners`, 'Top Trade Partners', analysis)
        }
      />
      <RegionalAgreementsSection
        agreements={tradeCopy.regionalAgreements}
        canExport={canExport}
        iso3Lower={iso3Lower}
        countryName={countryName}
        onExport={(analysis) =>
          handleExport(
            'regional-trade-agreements-card',
            `${iso3Lower}-regional-agreements`,
            'Regional Trade Agreements',
            analysis
          )
        }
      />
      <ExportBreakdownSection
        trade={trade}
        canExport={canExport}
        iso3Lower={iso3Lower}
        countryName={countryName}
        onExport={(analysis) =>
          handleExport(
            'export-breakdown-card',
            `${iso3Lower}-export-breakdown`,
            'Export Breakdown by Sector',
            analysis
          )
        }
      />
      <ImportBreakdownSection
        trade={trade}
        canExport={canExport}
        iso3Lower={iso3Lower}
        countryName={countryName}
        onExport={(analysis) =>
          handleExport(
            'import-breakdown-card',
            `${iso3Lower}-import-breakdown`,
            'Import Breakdown by Sector',
            analysis
          )
        }
      />
      <TradeFinanceSection
        copy={tradeCopy}
        canExport={canExport}
        iso3Lower={iso3Lower}
        countryName={countryName}
        onExport={(analysis) =>
          handleExport('trade-finance-mapping-card', `${iso3Lower}-trade-finance`, tradeCopy.financeTitle, analysis)
        }
      />
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6 text-center">
        <h4 className="text-lg font-bold text-white mb-2">Need Detailed Trade Intelligence?</h4>
        <p className="text-sm text-zinc-300 mb-4">
          Our trade advisory team can provide customs documentation, tariff optimization, and partner introductions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors">
            Schedule Trade Consultation
          </Link>
          <Link href={`/country/${data.country.iso3}?tab=reports`} className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-semibold transition-colors">
            Download Trade Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

function AnalysisBullets({ bullets }: { bullets: string[] }) {
  if (!bullets.length) return null;
  return (
    <div className="mt-4 pt-3 border-t border-zinc-800" data-export-hide-analysis>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Souvera Analysis</p>
      <ul className="space-y-1 text-xs text-zinc-400">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span><HighlightedText text={b} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TradeHero({ trade, countryName, subtitle }: { trade: CountryTrade; countryName: string; subtitle: string }) {
  const isBilateral = trade.tradeScope === 'bilateral_us';
  const heroSubtitle = isBilateral
    ? `U.S. bilateral trade${trade.asOfYear ? ` · ${trade.asOfYear}` : ''}${trade.dataSource ? ` · ${trade.dataSource}` : ''}`
    : subtitle;
  const totalLabel = isBilateral ? 'U.S. Bilateral Trade' : 'Total Trade';
  const exportLabel = isBilateral ? 'Exports to U.S.' : 'Total Exports';
  const importLabel = isBilateral ? 'Imports from U.S.' : 'Total Imports';

  return (
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-6 lg:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <Ship className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{countryName} Trade & Market Access</h2>
            <p className="text-sm text-zinc-400">{heroSubtitle}</p>
          </div>
        </div>
        <HelpTooltip term="trade_overview" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          {trade.totalTradeUsd != null ? (
            <div className="text-2xl font-bold text-emerald-400 mb-1">{formatBillions(trade.totalTradeUsd)}</div>
          ) : (
            <DataPendingState variant="pending" compact className="justify-center mb-1" message="Global trade totals pending UN Comtrade ingestion." />
          )}
          <div className="text-sm text-zinc-400">{totalLabel}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          {trade.exportsUsd != null ? (
            <div className="text-2xl font-bold text-blue-400 mb-1">{formatBillions(trade.exportsUsd)}</div>
          ) : (
            <DataPendingState variant="pending" compact className="justify-center mb-1" message="Export totals pending verified ingestion." />
          )}
          <div className="text-sm text-zinc-400">{exportLabel}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          {trade.importsUsd != null ? (
            <div className="text-2xl font-bold text-amber-400 mb-1">{formatBillions(trade.importsUsd)}</div>
          ) : (
            <DataPendingState variant="pending" compact className="justify-center mb-1" message="Import totals pending verified ingestion." />
          )}
          <div className="text-sm text-zinc-400">{importLabel}</div>
        </div>
      </div>
    </div>
  );
}

function USTradeSection({
  trade,
  countryName,
  iso3,
  exportCtx,
  agoaPolicy,
  officialReferences,
  ustrTradeSummary,
}: {
  trade: CountryTrade;
  countryName: string;
  iso3: string;
  exportCtx: ReturnType<typeof countryExportContext>;
  agoaPolicy?: AgoaPolicyUiSnapshot;
  officialReferences?: OfficialReferenceLink[];
  ustrTradeSummary?: UstrTradeSummaryPayload;
}) {
  const agoa = trade.agoa;
  const isRestoration = agoa?.status === 'restoration_opportunity';
  const isCaribbean = getCountryRegion(iso3) === 'caribbean';
  const tradeCopy = getTradeTabCopy(iso3);
  const preferentialTitle = isCaribbean
    ? (isRestoration ? 'CBI Market Access' : 'CBI Trade Advantage')
    : (isRestoration ? 'AGOA Restoration Opportunity' : 'AGOA Trade Advantage');
  const preferentialSubtitle = isCaribbean
    ? 'Preferential U.S. market access under CBI/CARICOM'
    : isRestoration
      ? agoaPolicy?.suspensionSinceYear
        ? `Suspended since ${agoaPolicy.suspensionSinceYear} — restoration under legislative review`
        : 'AGOA benefits suspended — restoration under legislative review'
      : 'Duty-Free U.S. Market Access';
  const currentExportsLabel = isCaribbean ? 'Current CBI Exports' : 'Current AGOA Exports';
  const potentialLabel = isRestoration ? 'Restoration Upside' : 'Export Potential';
  const mfnTotalLabel = 'Category-Flow Exports (USITC)';
  const prefFramework = preferentialFrameworkLabel(iso3);
  const usTradeAnalysis = buildUsTradeCardAnalysis({
    countryName,
    iso3,
    trade,
    agoaPolicy,
    ustrTradeSummary,
  });

  return (
    <div id="us-trade-card" className="exportable-card group relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 lg:p-8">
      {/* Hover-activated PNG download button */}
      <button
        onClick={() =>
          exportCardToPNG({
            elementId: 'us-trade-card',
            fileName: `${countryName.toLowerCase()}-us-trade`,
            cardTitle: 'US Trade Relationship',
            flagUrl: exportCtx.flagUrl ?? flagUrlFromIso3(iso3),
            curatedAnalysis: usTradeAnalysis,
            aiAnalysisConfig: {
              cardType: 'agoa_tracker',
              countryName,
              iso3,
              trade,
              data: {
                'Exports to US': trade.exportsToUs?.valueUsd != null ? formatBillions(trade.exportsToUs.valueUsd) : 'N/A',
                'Imports from US': trade.importsFromUs?.valueUsd != null ? formatBillions(trade.importsFromUs.valueUsd) : 'N/A',
                'AGOA Status': agoa?.status ?? 'N/A',
                'Preferential Framework': prefFramework,
                'MFN Total Exports': agoa?.totalExportsToUsUsd != null ? formatBillions(agoa.totalExportsToUsUsd) : 'N/A',
                [`Current ${isCaribbean ? 'CBI' : 'AGOA'} Exports`]: agoa?.currentExportsUsd != null ? formatBillions(agoa.currentExportsUsd) : 'N/A',
                'Restoration Potential': agoa?.restorationPotentialUsd != null ? formatBillions(agoa.restorationPotentialUsd) : 'N/A',
                'Export Potential': agoa?.potentialExportsUsd != null ? formatBillions(agoa.potentialExportsUsd) : 'N/A',
                'Data Source': agoa?.dataSource ?? trade.asOfYear?.toString() ?? 'Souvera trade flows',
              },
            } satisfies CardAnalysisInput,
            ...exportCtx,
          })
        }
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title="Download US Trade Relationship as PNG"
        aria-label="Download US Trade Relationship as PNG"
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-xl font-bold text-white">U.S. Trade Relationship</h3>
            <p className="text-sm text-zinc-400">{tradeCopy.usTradeSubtitle}</p>
          </div>
        </div>
        <HelpTooltip term="us_trade_relationship" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-semibold text-white">Exports to U.S.</h4>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">{formatBillions(trade.exportsToUs?.valueUsd)}</div>
          {trade.exportsToUs?.source && (
            <TradeMetricSourceLabel
              sourceLabel={trade.exportsToUs.source.sourceLabel}
              metricScope={trade.exportsToUs.source.metricScope}
            />
          )}
          {trade.exportsToUs?.yoyPct != null && (
            <p className="text-sm text-zinc-400">Up {trade.exportsToUs.yoyPct}% YoY ({trade.exportsToUs.year})</p>
          )}
        </div>
        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5 text-blue-400" />
            <h4 className="text-base font-semibold text-white">Imports from U.S.</h4>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-1">{formatBillions(trade.importsFromUs?.valueUsd)}</div>
          {trade.importsFromUs?.source && (
            <TradeMetricSourceLabel
              sourceLabel={trade.importsFromUs.source.sourceLabel}
              metricScope={trade.importsFromUs.source.metricScope}
            />
          )}
          {trade.importsFromUs?.yoyPct != null && (
            <p className="text-sm text-zinc-400">Up {trade.importsFromUs.yoyPct}% YoY ({trade.importsFromUs.year})</p>
          )}
        </div>
      </div>

      {trade.sourceReconciliation && (
        <TradeSourceReconciliationBanner reconciliation={trade.sourceReconciliation} />
      )}

      {officialReferences?.length ? (
        <OfficialTradeReferences references={officialReferences} compact className="mb-4" />
      ) : null}

      {ustrTradeSummary && (
        <UstrTradeSummaryPanel summary={ustrTradeSummary} className="mb-4" />
      )}

      <PetroleumExclusionFootnote iso3={iso3} className="mb-6" />

      {agoa && agoa.status !== 'not_applicable' && agoa.status !== 'ineligible' && (
        <div className="bg-gradient-to-br from-amber-900/20 to-blue-900/20 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {isRestoration ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <Shield className="w-5 h-5 text-blue-400" />
              )}
              <div>
                <h4 className="text-lg font-bold text-white">{preferentialTitle}</h4>
                <p className={`text-sm font-semibold ${isRestoration ? 'text-amber-400' : 'text-blue-400'}`}>
                  {preferentialSubtitle}
                </p>
              </div>
            </div>
            <HelpTooltip term="agoa_detailed" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-300">{agoa.eligibleCategories?.toLocaleString() ?? '—'}+</div>
              <div className="text-xs text-zinc-400">Product Categories</div>
            </div>
            {isRestoration && agoa.totalExportsToUsUsd != null ? (
              <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                <div className="text-xl font-bold text-zinc-200">{formatBillions(agoa.totalExportsToUsUsd)}</div>
                <div className="text-xs text-zinc-400">{mfnTotalLabel}</div>
                {agoa.metricsSource && (
                  <TradeMetricSourceLabel
                    sourceLabel={agoa.metricsSource.sourceLabel}
                    metricScope={agoa.metricsSource.metricScope}
                  />
                )}
              </div>
            ) : (
              <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-emerald-300">{formatBillions(agoa.potentialExportsUsd)}</div>
                <div className="text-xs text-zinc-400">{potentialLabel}</div>
              </div>
            )}
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              {isRestoration ? (
                <>
                  <DollarSign className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-amber-300">{formatBillions(agoa.restorationPotentialUsd ?? agoa.potentialExportsUsd)}</div>
                  <div className="text-xs text-zinc-400">{potentialLabel}</div>
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-amber-300">{formatBillions(agoa.currentExportsUsd)}</div>
                  <div className="text-xs text-zinc-400">{currentExportsLabel}</div>
                </>
              )}
            </div>
          </div>
          {agoa.dataSource && (
            <p className="text-[10px] text-zinc-600 mt-2">
              Trade data: {agoa.dataSource}{agoa.dataVintage ? ` · ${agoa.dataVintage}` : ''}
            </p>
          )}
          <PetroleumExclusionFootnote iso3={iso3} compact className="mt-2" />
          {!isCaribbean && (
          <AgoaLegislativeTrackerStrip iso3={iso3} agoaPolicy={agoaPolicy} />
          )}
          <div className="mt-4 pt-4 border-t border-zinc-700/50" data-export-hide-analysis>
            <CollapsibleAnalysis
              text={usTradeAnalysis}
              title="Souvera Analysis"
              titleClass="text-xs font-bold text-blue-400 uppercase tracking-wider"
            />
          </div>
        </div>
      )}
      {agoa && (agoa.status === 'not_applicable' || agoa.status === 'ineligible') && !isCaribbean && (
        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-600/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-zinc-400" />
              <div>
                <h4 className="text-lg font-bold text-white">U.S. Market Access</h4>
                <p className="text-sm font-semibold text-zinc-400">
                  {agoa.status === 'ineligible' ? 'AGOA Ineligible' : 'AGOA Not Applicable'}
                </p>
              </div>
            </div>
            <HelpTooltip term="agoa_detailed" />
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {agoa.statusNote || (agoa.status === 'ineligible'
              ? 'This country is sub-Saharan but not a current AGOA beneficiary. Exports to the U.S. operate under MFN tariff rates pending re-designation.'
              : 'This country is outside the AGOA geographic scope. Trade with the U.S. operates under MFN tariff rates and bilateral trade agreements.')}
          </p>
        </div>
      )}
      {!agoa && !isCaribbean && agoaPolicy?.agoaStatus !== 'not_applicable' && (
        <AgoaLegislativeTrackerStrip iso3={iso3} agoaPolicy={agoaPolicy} className="mt-0" />
      )}
    </div>
  );
}

function AgoaLegislativeTrackerStrip({
  iso3,
  agoaPolicy,
  className = 'mt-4',
}: {
  iso3: string;
  agoaPolicy?: AgoaPolicyUiSnapshot;
  className?: string;
}) {
  const status = agoaPolicy?.agoaStatus ?? 'eligible';
  const statusLabel = agoaPolicy?.statusLabel ?? getAGOAStatusLabel(status);
  const statusColor = agoaPolicy?.evidenceBacked
    ? getAGOAStatusColor(status)
    : 'bg-amber-500/10 text-amber-300 border-amber-500/30';

  return (
    <div className={`${className} pt-4 border-t border-zinc-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Legislative Tracker</span>
        {agoaPolicy && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
            {statusLabel}
          </span>
        )}
        {agoaPolicy?.apparelEligible && (
          <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            Apparel Eligible
          </span>
        )}
      </div>
      <Link
        href={`/intelligence/trade/agoa?country=${iso3}`}
        className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
      >
        View AGOA Legislative Tracker →
      </Link>
    </div>
  );
}

function IntraRegionalSection({
  trade,
  copy,
  canExport,
  countryName,
  iso3Lower,
  onExport,
}: {
  trade: CountryTrade;
  copy: ReturnType<typeof getTradeTabCopy>;
  canExport: boolean;
  iso3Lower: string;
  countryName: string;
  onExport: (analysis: string) => void;
}) {
  const intra = getIntraRegionalTrade(trade);
  if (!intra) return null;

  const bullets = [
    `${copy.intraPrimaryVolumeLabel}: ${formatBillions(intra.primaryVolumeUsd)}`,
    ...(intra.secondaryVolumeUsd ? [`${copy.intraSecondaryVolumeLabel}: ${formatBillions(intra.secondaryVolumeUsd)}`] : []),
    ...(intra.topPartners[0] ? [`Top partner: ${intra.topPartners[0].country} (${formatBillions(intra.topPartners[0].totalUsd)})`] : []),
  ];

  const exportAnalysis = buildTradeTabCardAnalysis({
    cardType: 'intra_regional',
    countryName,
    iso3: iso3Lower.toUpperCase(),
    data: {
      'Primary Volume': formatBillions(intra.primaryVolumeUsd),
      'Secondary Volume': intra.secondaryVolumeUsd != null ? formatBillions(intra.secondaryVolumeUsd) : null,
      'Top Partner': intra.topPartners[0]
        ? `${intra.topPartners[0].country} (${formatBillions(intra.topPartners[0].totalUsd)})`
        : 'N/A',
    },
  });

  return (
    <div id="intra-regional-trade-card" className="exportable-card group relative bg-gradient-to-br from-emerald-900/20 to-zinc-900/50 border border-emerald-500/20 rounded-xl p-6 lg:p-8">
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={() => onExport(exportAnalysis)}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title={`Download ${copy.intraRegionalTitle} as PNG`}
        aria-label={`Download ${copy.intraRegionalTitle} as PNG`}
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold text-white">{copy.intraRegionalTitle}</h3>
            <p className="text-sm text-zinc-400">{copy.intraRegionalSubtitle}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="text-sm text-zinc-400 mb-1">{copy.intraPrimaryVolumeLabel}</div>
          <div className="text-2xl font-bold text-emerald-400">{formatBillions(intra.primaryVolumeUsd)}</div>
        </div>
        {intra.secondaryVolumeUsd != null && (
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">{copy.intraSecondaryVolumeLabel}</div>
            <div className="text-2xl font-bold text-blue-400">{formatBillions(intra.secondaryVolumeUsd)}</div>
          </div>
        )}
      </div>
      {intra.topPartners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {intra.topPartners.map((p) => (
            <div key={p.country} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span>{p.flag}</span>
                <span className="text-sm font-semibold text-white">{p.country}</span>
              </div>
              <div className="text-lg font-bold text-emerald-300">{formatBillions(p.totalUsd)}</div>
              {p.sharePct != null && <div className="text-xs text-zinc-500">{p.sharePct}% {copy.intraPartnerShareLabel}</div>}
            </div>
          ))}
        </div>
      )}
      <AnalysisBullets bullets={bullets} />
    </div>
  );
}

function PartnerCard({ partner, rank, size }: { partner: TradePartner; rank: number; size: 'large' | 'compact' }) {
  const isLarge = size === 'large';
  return (
    <div
      className={`bg-zinc-800/50 rounded-lg border border-zinc-700/50 ${
        isLarge ? 'p-5 lg:p-6' : 'p-4'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-semibold text-white ${isLarge ? 'text-lg' : 'text-base'}`}>
          {partner.flag} {partner.country}
        </h4>
        {partner.badge ? (
          <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">{partner.badge}</span>
        ) : (
          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">#{rank}</span>
        )}
      </div>
      <div className={`font-bold text-blue-300 mb-2 ${isLarge ? 'text-3xl' : 'text-xl'}`}>
        {formatBillions(partner.totalUsd)}
      </div>
      <div className={`space-y-1 text-zinc-400 ${isLarge ? 'text-sm' : 'text-xs'}`}>
        <div className="flex justify-between">
          <span>Exports:</span>
          <span className="text-emerald-400">{formatBillions(partner.exportsUsd)}</span>
        </div>
        <div className="flex justify-between">
          <span>Imports:</span>
          <span className="text-amber-400">{formatBillions(partner.importsUsd)}</span>
        </div>
      </div>
    </div>
  );
}

function TopPartnersSection({
  trade,
  canExport,
  countryName,
  iso3Lower,
  onExport,
}: {
  trade: CountryTrade;
  canExport: boolean;
  iso3Lower: string;
  countryName: string;
  onExport: (analysis: string) => void;
}) {
  const partners = trade.topPartners ?? [];
  const topTwo = partners.slice(0, 2);
  const rest = partners.slice(2, 5);
  const bullets = partners.slice(0, 3).map((p, i) =>
    `#${i + 1} ${p.country}: ${formatBillions(p.totalUsd)} total trade`
  );

  const exportAnalysis = buildTradeTabCardAnalysis({
    cardType: 'trade_partners',
    countryName,
    iso3: iso3Lower.toUpperCase(),
    data: {
      'Partner 1': partners[0] ? `${partners[0].country} (${formatBillions(partners[0].totalUsd)})` : 'N/A',
      'Partner 2': partners[1] ? `${partners[1].country} (${formatBillions(partners[1].totalUsd)})` : 'N/A',
      'Partner 3': partners[2] ? `${partners[2].country} (${formatBillions(partners[2].totalUsd)})` : 'N/A',
      'Preferential Framework': getCountryRegion(iso3Lower.toUpperCase()) === 'caribbean' ? 'CBI/CARICOM' : 'AGOA',
    },
  });

  return (
    <div id="top-trade-partners-card" className="exportable-card group relative space-y-4">
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={() => onExport(exportAnalysis)}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title="Download Top Trade Partners as PNG"
        aria-label="Download Top Trade Partners as PNG"
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Top Trade Partners
        </h3>
      </div>

      {topTwo.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topTwo.map((p, i) => (
            <PartnerCard key={p.country} partner={p} rank={i + 1} size="large" />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rest.map((p, i) => (
            <PartnerCard key={p.country} partner={p} rank={i + 3} size="compact" />
          ))}
        </div>
      )}

      <AnalysisBullets bullets={bullets} />
    </div>
  );
}

function RegionalAgreementsSection({
  agreements,
  canExport,
  countryName,
  iso3Lower,
  onExport,
}: {
  agreements: ReturnType<typeof getTradeTabCopy>['regionalAgreements'];
  canExport: boolean;
  iso3Lower: string;
  countryName: string;
  onExport: (analysis: string) => void;
}) {
  const bullets = agreements.map((a) => `${a.name}: ${a.description}`);

  const exportAnalysis = buildTradeTabCardAnalysis({
    cardType: 'regional_agreements',
    countryName,
    iso3: iso3Lower.toUpperCase(),
    data: {
      'Agreement 1': agreements[0] ? `${agreements[0].name}: ${agreements[0].description}` : 'N/A',
      'Agreement 2': agreements[1] ? `${agreements[1].name}: ${agreements[1].description}` : 'N/A',
      'Agreement 3': agreements[2] ? `${agreements[2].name}: ${agreements[2].description}` : 'N/A',
    },
  });

  return (
    <div id="regional-trade-agreements-card" className="exportable-card group relative bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-6">
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={() => onExport(exportAnalysis)}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title="Download Regional Trade Agreements as PNG"
        aria-label="Download Regional Trade Agreements as PNG"
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Regional Trade Agreements</h3>
        <HelpTooltip term="regional_trade_agreements" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agreements.map((agreement) => (
          <div key={agreement.name} className={`bg-zinc-800/50 rounded-lg p-4 border h-full ${agreement.borderClass}`}>
            <h4 className="font-semibold text-white mb-2">{agreement.name}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{agreement.description}</p>
          </div>
        ))}
      </div>
      <AnalysisBullets bullets={bullets} />
    </div>
  );
}

function SectorBreakdownCard({
  item,
  rank,
  size,
  accentClass,
  barClass,
}: {
  item: SectorCompositionItem;
  rank: number;
  size: 'large' | 'compact';
  accentClass: string;
  barClass: string;
}) {
  const isLarge = size === 'large';
  return (
    <div
      className={`animate-fade-in-up bg-zinc-800/50 rounded-lg border border-zinc-700/50 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 ${
        isLarge ? 'p-5 lg:p-6' : 'p-4'
      }`}
      style={{ animationDelay: `${rank * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-bold text-zinc-500">#{rank}</span>
        <div className="text-right shrink-0">
          <div className={`text-lg font-bold ${accentClass}`}>{item.sharePct}%</div>
          {item.valueUsd != null && (
            <div className="text-xs font-medium text-zinc-400 mt-0.5">{formatBillions(item.valueUsd)}</div>
          )}
        </div>
      </div>
      <h4 className={`font-semibold text-white leading-snug mb-3 ${isLarge ? 'text-base' : 'text-sm'}`}>
        {item.sector}
      </h4>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
          style={{ width: `${Math.min(item.sharePct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function BreakdownTotalBanner({
  label,
  totalUsd,
  shareSum,
  accentClass,
}: {
  label: string;
  totalUsd?: number;
  shareSum: number;
  accentClass: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold ${accentClass} mt-0.5`}>
          {totalUsd != null ? formatBillions(totalUsd) : 'N/A'}
        </p>
      </div>
      <div className="text-right text-xs text-zinc-500">
        <p>Sector shares sum to <span className="text-zinc-300 font-medium">{shareSum}%</span></p>
        {totalUsd != null && shareSum === 100 && (
          <p className="mt-0.5">Volumes derived from total {label.toLowerCase()}</p>
        )}
      </div>
    </div>
  );
}

function BreakdownBySectorSection({
  id,
  title,
  icon: Icon,
  iconClass,
  accentClass,
  barClass,
  composition,
  totalUsd,
  canExport,
  countryName,
  iso3Lower,
  direction,
  onExport,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  accentClass: string;
  barClass: string;
  composition: SectorCompositionItem[];
  totalUsd?: number;
  canExport: boolean;
  countryName: string;
  iso3Lower: string;
  direction: 'Exports' | 'Imports';
  onExport: (analysis: string) => void;
}) {
  if (composition.length === 0) return null;

  const enriched = enrichCompositionWithUsd(normalizeCompositionSlots(composition), totalUsd);
  const shareSum = compositionShareSum(enriched);
  const topTwo = enriched.slice(0, 2);
  const rest = enriched.slice(2, 5);
  const bullets = compositionBullets(enriched, 3);

  const exportAnalysis = buildTradeTabCardAnalysis({
    cardType: 'trade_composition',
    countryName,
    iso3: iso3Lower.toUpperCase(),
    data: {
      Direction: direction,
      'Top Sector 1': enriched[0]?.sector ?? 'N/A',
      'Top Share 1': enriched[0] ? `${enriched[0].sharePct}%` : 'N/A',
      'Top Sector 2': enriched[1]?.sector ?? 'N/A',
      'Top Share 2': enriched[1] ? `${enriched[1].sharePct}%` : 'N/A',
      'Total Value': totalUsd != null ? formatBillions(totalUsd) : 'N/A',
    },
  });

  return (
    <div id={id} className="exportable-card group relative space-y-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 lg:p-6">
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={() => onExport(exportAnalysis)}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title={`Download ${title} as PNG`}
        aria-label={`Download ${title} as PNG`}
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconClass}`} />
          {title}
        </h3>
      </div>

      <BreakdownTotalBanner
        label={title.includes('Export') ? 'Total Exports' : 'Total Imports'}
        totalUsd={totalUsd}
        shareSum={shareSum}
        accentClass={accentClass}
      />

      {topTwo.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topTwo.map((item, i) => (
            <SectorBreakdownCard
              key={item.sector}
              item={item}
              rank={i + 1}
              size="large"
              accentClass={accentClass}
              barClass={barClass}
            />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rest.map((item, i) => (
            <SectorBreakdownCard
              key={item.sector}
              item={item}
              rank={i + 3}
              size="compact"
              accentClass={accentClass}
              barClass={barClass}
            />
          ))}
        </div>
      )}

      <AnalysisBullets bullets={bullets} />
    </div>
  );
}

function ExportBreakdownSection({
  trade,
  canExport,
  countryName,
  iso3Lower,
  onExport,
}: {
  trade: CountryTrade;
  canExport: boolean;
  iso3Lower: string;
  countryName: string;
  onExport: (analysis: string) => void;
}) {
  return (
    <BreakdownBySectorSection
      id="export-breakdown-card"
      title="Export Breakdown by Sector"
      icon={Package}
      iconClass="text-emerald-400"
      accentClass="text-emerald-400"
      barClass="bg-emerald-500"
      composition={trade.exportComposition ?? []}
      totalUsd={trade.exportsUsd}
      canExport={canExport}
      countryName={countryName}
      iso3Lower={iso3Lower}
      direction="Exports"
      onExport={onExport}
    />
  );
}

function ImportBreakdownSection({
  trade,
  canExport,
  countryName,
  iso3Lower,
  onExport,
}: {
  trade: CountryTrade;
  canExport: boolean;
  iso3Lower: string;
  countryName: string;
  onExport: (analysis: string) => void;
}) {
  return (
    <BreakdownBySectorSection
      id="import-breakdown-card"
      title="Import Breakdown by Sector"
      icon={Import}
      iconClass="text-cyan-400"
      accentClass="text-cyan-400"
      barClass="bg-cyan-500"
      composition={trade.importComposition ?? []}
      totalUsd={trade.importsUsd}
      canExport={canExport}
      countryName={countryName}
      iso3Lower={iso3Lower}
      direction="Imports"
      onExport={onExport}
    />
  );
}

function TradeFinanceSection({
  copy,
  canExport,
  countryName,
  iso3Lower,
  onExport,
}: {
  copy: ReturnType<typeof getTradeTabCopy>;
  canExport: boolean;
  iso3Lower: string;
  countryName: string;
  onExport: (analysis: string) => void;
}) {
  const exportAnalysis = buildTradeTabCardAnalysis({
    cardType: 'trade_finance',
    countryName,
    iso3: iso3Lower.toUpperCase(),
    data: {
      'Product 1': copy.financeProducts[0]?.name ?? 'N/A',
      'Product 2': copy.financeProducts[1]?.name ?? 'N/A',
    },
  });

  return (
    <div id="trade-finance-mapping-card" className="exportable-card group relative bg-gradient-to-br from-blue-900/20 to-zinc-900/50 border border-blue-500/20 rounded-xl p-6">
      {/* Hover-activated PNG download button */}
      <button
        type="button"
        onClick={() => onExport(exportAnalysis)}
        data-export-exclude
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title={`Download ${copy.financeTitle} as PNG`}
        aria-label={`Download ${copy.financeTitle} as PNG`}
      >
        <Download className="w-4 h-4 text-zinc-300" />
      </button>
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-white">{copy.financeTitle}</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">{copy.financeSubtitle}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {copy.financeProducts.map((p) => (
          <div key={p.name} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
            <h4 className="text-sm font-semibold text-white mb-1">{p.name}</h4>
            <p className="text-xs text-zinc-400 mb-2">{p.desc}</p>
            <p className="text-xs text-blue-400">{p.provider}</p>
          </div>
        ))}
      </div>
      <AnalysisBullets bullets={copy.financeBullets} />
    </div>
  );
}
