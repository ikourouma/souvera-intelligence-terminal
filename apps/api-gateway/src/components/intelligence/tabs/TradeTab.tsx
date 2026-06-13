'use client';

import React from 'react';
import Link from 'next/link';
import {
  Ship, TrendingUp, Globe, DollarSign, ArrowUpRight, ArrowDownRight,
  Download, Shield, Package, AlertCircle, Import,
} from 'lucide-react';
import { formatCurrency } from '@/lib/intelligence-entitlements';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { getTradeTabCopy, getIntraRegionalTrade } from '@/lib/intelligence/country-trade-content';
import { getCountryRegion } from '@/lib/intelligence/country-overview-content';
import { getAGOAStatusLabel, getAGOAStatusColor } from '@/lib/data/utils';
import type {
  AgoaPolicyUiSnapshot,
  IntelligenceTabProps,
  CountryTrade,
  TradePartner,
} from '@/types/country-intelligence';
import {
  enrichCompositionWithUsd,
  compositionShareSum,
  compositionBullets,
  normalizeCompositionSlots,
  type SectorCompositionItem,
} from '@/lib/intelligence/trade-composition';

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

  const handleExport = (elementId: string, fileName: string, cardTitle: string) =>
    exportCardToPNG({ elementId, fileName, cardTitle, ...exportCtx });

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
            href="/pricing"
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
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-zinc-500">Trade data pending for {countryName}</p>
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
      />
      <IntraRegionalSection trade={trade} copy={tradeCopy} canExport={canExport} iso3Lower={iso3Lower} onExport={() => handleExport('intra-regional-trade-card', `${iso3Lower}-intra-regional-trade`, tradeCopy.intraRegionalTitle)} />
      <TopPartnersSection trade={trade} canExport={canExport} iso3Lower={iso3Lower} onExport={() => handleExport('top-trade-partners-card', `${iso3Lower}-top-trade-partners`, 'Top Trade Partners')} />
      <RegionalAgreementsSection agreements={tradeCopy.regionalAgreements} canExport={canExport} iso3Lower={iso3Lower} onExport={() => handleExport('regional-trade-agreements-card', `${iso3Lower}-regional-agreements`, 'Regional Trade Agreements')} />
      <ExportBreakdownSection
        trade={trade}
        canExport={canExport}
        iso3Lower={iso3Lower}
        onExport={() => handleExport('export-breakdown-card', `${iso3Lower}-export-breakdown`, 'Export Breakdown by Sector')}
      />
      <ImportBreakdownSection
        trade={trade}
        canExport={canExport}
        iso3Lower={iso3Lower}
        onExport={() => handleExport('import-breakdown-card', `${iso3Lower}-import-breakdown`, 'Import Breakdown by Sector')}
      />
      <TradeFinanceSection copy={tradeCopy} canExport={canExport} iso3Lower={iso3Lower} onExport={() => handleExport('trade-finance-mapping-card', `${iso3Lower}-trade-finance`, tradeCopy.financeTitle)} />
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
    <div className="mt-4 pt-3 border-t border-zinc-800">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Souvera Analysis</p>
      <ul className="space-y-1 text-xs text-zinc-400">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-export-exclude
      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">PNG</span>
    </button>
  );
}

function TradeHero({ trade, countryName, subtitle }: { trade: CountryTrade; countryName: string; subtitle: string }) {
  return (
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-6 lg:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <Ship className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{countryName} Trade & Market Access</h2>
            <p className="text-sm text-zinc-400">{subtitle}</p>
          </div>
        </div>
        <HelpTooltip term="trade_overview" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">{formatBillions(trade.totalTradeUsd)}</div>
          <div className="text-sm text-zinc-400">Total Trade</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{formatBillions(trade.exportsUsd)}</div>
          <div className="text-sm text-zinc-400">Total Exports</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">{formatBillions(trade.importsUsd)}</div>
          <div className="text-sm text-zinc-400">Total Imports</div>
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
}: {
  trade: CountryTrade;
  countryName: string;
  iso3: string;
  exportCtx: ReturnType<typeof countryExportContext>;
  agoaPolicy?: AgoaPolicyUiSnapshot;
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
    : (isRestoration ? 'Suspended since 2015 — restoration under legislative review' : 'Duty-Free U.S. Market Access');
  const currentExportsLabel = isCaribbean ? 'Current CBI Exports' : (isRestoration ? 'Current AGOA Exports' : 'Current AGOA Exports');
  const potentialLabel = isRestoration ? 'Potential if Restored' : 'Export Potential';

  return (
    <div id="us-trade-card" className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-xl font-bold text-white">U.S. Trade Relationship</h3>
            <p className="text-sm text-zinc-400">{tradeCopy.usTradeSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HelpTooltip term="us_trade_relationship" />
          <button
            onClick={() =>
              exportCardToPNG({
                elementId: 'us-trade-card',
                fileName: `${countryName.toLowerCase()}-us-trade`,
                cardTitle: 'US Trade Relationship',
                ...exportCtx,
              })
            }
            data-export-exclude
            className="shrink-0 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-semibold text-white">Exports to U.S.</h4>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">{formatBillions(trade.exportsToUs?.valueUsd)}</div>
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
          {trade.importsFromUs?.yoyPct != null && (
            <p className="text-sm text-zinc-400">Up {trade.importsFromUs.yoyPct}% YoY ({trade.importsFromUs.year})</p>
          )}
        </div>
      </div>

      {agoa && (
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
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">{agoa.statusNote}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-300">{agoa.eligibleCategories?.toLocaleString()}+</div>
              <div className="text-xs text-zinc-400">Product Categories</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-emerald-300">{formatBillions(agoa.potentialExportsUsd)}</div>
              <div className="text-xs text-zinc-400">{potentialLabel}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-amber-300">{formatBillions(agoa.currentExportsUsd)}</div>
              <div className="text-xs text-zinc-400">{currentExportsLabel}</div>
            </div>
          </div>
          {!isCaribbean && (
          <AgoaLegislativeTrackerStrip iso3={iso3} agoaPolicy={agoaPolicy} />
          )}
        </div>
      )}
      {!agoa && !isCaribbean && (
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
  onExport,
}: {
  trade: CountryTrade;
  copy: ReturnType<typeof getTradeTabCopy>;
  canExport: boolean;
  iso3Lower: string;
  onExport: () => void;
}) {
  const intra = getIntraRegionalTrade(trade);
  if (!intra) return null;

  const bullets = [
    `${copy.intraPrimaryVolumeLabel}: ${formatBillions(intra.primaryVolumeUsd)}`,
    ...(intra.secondaryVolumeUsd ? [`${copy.intraSecondaryVolumeLabel}: ${formatBillions(intra.secondaryVolumeUsd)}`] : []),
    ...(intra.topPartners[0] ? [`Top partner: ${intra.topPartners[0].country} (${formatBillions(intra.topPartners[0].totalUsd)})`] : []),
  ];

  return (
    <div id="intra-regional-trade-card" className="bg-gradient-to-br from-emerald-900/20 to-zinc-900/50 border border-emerald-500/20 rounded-xl p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold text-white">{copy.intraRegionalTitle}</h3>
            <p className="text-sm text-zinc-400">{copy.intraRegionalSubtitle}</p>
          </div>
        </div>
        {canExport && <ExportButton onClick={onExport} />}
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
  onExport,
}: {
  trade: CountryTrade;
  canExport: boolean;
  iso3Lower: string;
  onExport: () => void;
}) {
  const partners = trade.topPartners ?? [];
  const topTwo = partners.slice(0, 2);
  const rest = partners.slice(2, 5);
  const bullets = partners.slice(0, 3).map((p, i) =>
    `#${i + 1} ${p.country}: ${formatBillions(p.totalUsd)} total trade`
  );

  return (
    <div id="top-trade-partners-card" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Top Trade Partners
        </h3>
        {canExport && <ExportButton onClick={onExport} />}
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
  onExport,
}: {
  agreements: ReturnType<typeof getTradeTabCopy>['regionalAgreements'];
  canExport: boolean;
  iso3Lower: string;
  onExport: () => void;
}) {
  const bullets = agreements.map((a) => `${a.name}: ${a.description}`);

  return (
    <div id="regional-trade-agreements-card" className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Regional Trade Agreements</h3>
        <div className="flex items-center gap-2">
          <HelpTooltip term="regional_trade_agreements" />
          {canExport && <ExportButton onClick={onExport} />}
        </div>
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
  onExport: () => void;
}) {
  if (composition.length === 0) return null;

  const enriched = enrichCompositionWithUsd(normalizeCompositionSlots(composition), totalUsd);
  const shareSum = compositionShareSum(enriched);
  const topTwo = enriched.slice(0, 2);
  const rest = enriched.slice(2, 5);
  const bullets = compositionBullets(enriched, 3);

  return (
    <div id={id} className="space-y-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconClass}`} />
          {title}
        </h3>
        {canExport && <ExportButton onClick={onExport} />}
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
  onExport,
}: {
  trade: CountryTrade;
  canExport: boolean;
  iso3Lower: string;
  onExport: () => void;
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
      onExport={onExport}
    />
  );
}

function ImportBreakdownSection({
  trade,
  canExport,
  onExport,
}: {
  trade: CountryTrade;
  canExport: boolean;
  iso3Lower: string;
  onExport: () => void;
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
      onExport={onExport}
    />
  );
}

function TradeFinanceSection({
  copy,
  canExport,
  onExport,
}: {
  copy: ReturnType<typeof getTradeTabCopy>;
  canExport: boolean;
  iso3Lower: string;
  onExport: () => void;
}) {
  return (
    <div id="trade-finance-mapping-card" className="bg-gradient-to-br from-blue-900/20 to-zinc-900/50 border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-white">{copy.financeTitle}</h3>
        {canExport && <ExportButton onClick={onExport} />}
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
