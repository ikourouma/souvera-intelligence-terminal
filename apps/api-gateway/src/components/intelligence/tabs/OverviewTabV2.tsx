'use client';

import { Download } from 'lucide-react';
import Link from 'next/link';
import type { EntitlementKey } from '@souvera/entitlements';
import { QuickStatsWidget } from '../sidebar/QuickStatsWidget';
import { MarketAccessSummary } from '../sidebar/MarketAccessSummary';
import { OfficialTradeReferences } from '../OfficialTradeReferences';
import { RelatedActions } from '../sidebar/RelatedActions';
import type { CountryIntelligenceResponse } from '@/types/country-intelligence';
import { buildCountryTabHref, getTradeBenefitsTarget } from '@/lib/intelligence/navigation';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { countryExportContext } from '@/lib/intelligence/export-branding';
import { getOverviewContent, buildEconomicMomentumAnalysis } from '@/lib/intelligence/country-overview-content';
import { hydrateOverviewContent } from '@/lib/intelligence/hydrate-intelligence-content';
import { buildOverviewMarketAccessItems } from '@/lib/intelligence/market-access-overview';
import { CountryAnalysisSection } from '../CountryAnalysisSection';
import { EstimateBadge } from '@/components/intelligence/EstimateBadge';
import { isMetricEstimate } from '@/lib/intelligence/metric-estimate-flags';

interface OverviewTabV2Props {
  data: CountryIntelligenceResponse;
  userEntitlements: EntitlementKey[];
  onNavigateToTab?: (tab: string, section?: string) => void;
}

/**
 * OverviewTabV2 - Card-Based Intelligence Overview
 * 
 * Bloomberg-grade scannable intelligence:
 * - Country Snapshot Card
 * - Economic Momentum Card
 * - Why Now Card (3 distinct points)
 * - Souvera Country Analysis (API narrative)
 * - Market Access Card (AGOA-focused)
 * 
 * Each card:
 * - Exportable as PNG (Professional+)
 * - Includes Souvera credit
 * - Evidence-based narratives
 */
export function OverviewTabV2({ data, userEntitlements, onNavigateToTab }: OverviewTabV2Props) {
  const hasFullAccess = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const canExport = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  
  const countryName = data.country?.name || 'Country';
  const m = data.metrics;
  const updatedAt = data.freshness?.updatedAt
    ? new Date(data.freshness.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Pending';

  const iso3 = data.country?.iso3?.toLowerCase() ?? 'country';
  const iso3Upper = data.country?.iso3?.toUpperCase() ?? '';
  const overview = hydrateOverviewContent(
    getOverviewContent(iso3Upper, countryName, m),
    data
  );
  const vaultMarketAccessItems = buildOverviewMarketAccessItems(data.marketAccess);
  const marketAccessItems =
    vaultMarketAccessItems.length > 0 ? vaultMarketAccessItems : overview.marketAccessItems;
  const showKeySectors = iso3Upper === 'NGA';
  const exportCtx = countryExportContext(data.country);

  const handleExport = (
    elementId: string,
    fileName: string,
    cardTitle: string,
    sourceAttribution?: string,
    curatedAnalysis?: string
  ) =>
    exportCardToPNG({
      elementId,
      fileName,
      cardTitle,
      sourceAttribution,
      curatedAnalysis,
      dataAsOf: updatedAt,
      disclaimer: 'Intelligence snapshot — not investment advice. Verify against official sources.',
      ...exportCtx,
    });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content Column (2/3 width on desktop) */}
      <div className="lg:col-span-2 space-y-5">
      
      {/* Country Snapshot Card */}
      <div id="country-snapshot-card" className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        {/* Hover-activated PNG download button */}
        {canExport && (
          <button
            type="button"
            onClick={() => handleExport('country-snapshot-card', `${iso3}-country-snapshot`, 'Country Snapshot')}
            className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            title="Download Country Snapshot as PNG"
            aria-label="Download Country Snapshot as PNG"
            data-export-exclude
          >
            <Download className="w-4 h-4 text-zinc-300" />
          </button>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Country Snapshot
          </h3>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          {/* Africa's Largest Economy */}
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-xl">🌍</span>
              {overview.snapshotTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              {overview.snapshotIntro}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {overview.snapshotMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{metric.emoji}</span>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      {metric.label}
                    </h4>
                    {isMetricEstimate(metric.label, data.metricEstimates) && <EstimateBadge />}
                  </div>
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-xs text-zinc-500">{metric.sublabel}</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{metric.narrative}</p>
                </div>
              ))}
            </div>
          </div>
          
          {showKeySectors && (
          <div className="pt-3 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-lg">📈</span>
              Key Sectors
            </h3>
            
            {/* 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Technology */}
              <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-lg hover:border-emerald-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💻</span>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Technology
                  </h4>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold">
                    <span className="text-blue-400">18%</span>
                  </p>
                  <p className="text-xs text-zinc-500">of GDP</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Growing <span className="text-blue-400">15%</span> annually, fintech-led expansion
                </p>
              </div>
              
              {/* Card 2: Finance */}
              <div className="p-3 bg-blue-950/10 border border-blue-900/30 rounded-lg hover:border-blue-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🏦</span>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Finance
                  </h4>
                </div>
                <div className="mb-2">
                  <p className="text-lg font-bold text-white">
                    Regional Hub
                  </p>
                  <p className="text-xs text-zinc-500">Banking & Payments</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Digital payments leader — OPay, PalmPay, Kuda drive fintech adoption
                </p>
              </div>
              
              {/* Card 3: Agriculture */}
              <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-lg hover:border-amber-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🌾</span>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Agriculture
                  </h4>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold">
                    <span className="text-blue-400">35%</span>
                  </p>
                  <p className="text-xs text-zinc-500">of Workforce</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Value-add processing opportunity, export potential
                </p>
              </div>
              
              {/* Card 4: Energy */}
              <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚡</span>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Energy
                  </h4>
                </div>
                <div className="mb-2">
                  <p className="text-lg font-bold text-white">
                    <span className="text-emerald-400 font-semibold">37B</span> bbl
                  </p>
                  <p className="text-xs text-zinc-500">Oil Reserves</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span className="text-blue-300">209 TCF</span> gas, Africa's largest reserves
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
        
        {/* Souvera Credit */}
        <div data-export-exclude className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
          <div>
            <p className="font-bold">📊 Souvera Intelligence Terminal</p>
            <p>📅 Updated: {updatedAt}</p>
          </div>
          <div className="text-right">
            <p>Data: World Bank</p>
            <p>{overview.momentumFooterSources.split(', ').slice(0, 2).join(', ')}</p>
          </div>
        </div>
      </div>
      
      {/* Economic Momentum Card */}
      <div id="economic-momentum-card" className="exportable-card group relative bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4">
        {/* Hover-activated PNG download button */}
        {canExport && (
          <button
            type="button"
            onClick={() =>
              handleExport(
                'economic-momentum-card',
                `${iso3}-economic-momentum`,
                'Economic Momentum',
                overview.momentumFooterSources,
                buildEconomicMomentumAnalysis(
                  countryName,
                  overview,
                  data.momentum?.economicMomentum,
                  data.momentum?.investorReadiness,
                  updatedAt
                )
              )
            }
            className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            title="Download Economic Momentum as PNG"
            aria-label="Download Economic Momentum as PNG"
            data-export-exclude
          >
            <Download className="w-4 h-4 text-emerald-300" />
          </button>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Economic Momentum
          </h3>
        </div>
        
        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
          {overview.momentumIntro}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {overview.momentumMetrics.map((metric) => (
            <div
              key={metric.label}
              className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-lg hover:border-emerald-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{metric.emoji}</span>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {metric.label}
                </h4>
                {isMetricEstimate(metric.label, data.metricEstimates) && <EstimateBadge />}
              </div>
              <div className="mb-2">
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-zinc-500">{metric.sublabel}</p>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{metric.narrative}</p>
            </div>
          ))}
        </div>
        
        {hasFullAccess && (
          <div className="mt-3 pt-3 border-t border-emerald-900/30">
            <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              View Full Economic Analysis →
            </button>
          </div>
        )}
        
        <div data-export-exclude className="mt-4 pt-3 border-t border-emerald-900/30 flex items-center justify-between text-xs text-zinc-600">
          <div>
            <p className="font-bold">📊 Souvera Intelligence Terminal</p>
            <p>📅 Updated: {updatedAt}</p>
          </div>
          <div className="text-right">
            <p>Data: World Bank</p>
            <p>{overview.momentumFooterSources}</p>
          </div>
        </div>
      </div>
      
      {/* Why Now Card */}
      <div id="why-now-card" className="exportable-card group relative bg-blue-950/10 border border-blue-900/30 rounded-xl p-4">
        {/* Hover-activated PNG download button */}
        {canExport && (
          <button
            type="button"
            onClick={() => handleExport('why-now-card', `${iso3}-why-now`, 'Why Now')}
            className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            title="Download Why Now as PNG"
            aria-label="Download Why Now as PNG"
            data-export-exclude
          >
            <Download className="w-4 h-4 text-blue-300" />
          </button>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Why Now
          </h3>
        </div>
        
        <p className="text-sm text-zinc-400 mb-4">
          {overview.whyNowLead}
        </p>
        
        <div className="space-y-4">
          {overview.whyNowPoints.map((point) => (
            <div key={point.title}>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{point.emoji}</span>
                <h4 className="text-sm font-bold text-white">{point.title}</h4>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed pl-7">{point.body}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/10 border border-blue-800/30 rounded-lg">
          <p className="text-xs text-blue-300 leading-relaxed">{overview.whyNowCallout}</p>
        </div>
        
        <div data-export-exclude className="mt-4 pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs text-zinc-600">
          <div>
            <p className="font-bold">📊 Souvera Intelligence Terminal</p>
            <p>📅 Updated: {updatedAt}</p>
          </div>
          <div className="text-right">
            <p>Analysis: Souvera</p>
            <p>Data: World Bank, UN</p>
          </div>
        </div>
      </div>
      
      {/* Market Access Card (AGOA-Focused) */}
      <div id="market-access-card" className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        {/* Hover-activated PNG download button */}
        {canExport && (
          <button
            type="button"
            onClick={() => handleExport('market-access-card', `${iso3}-market-access`, 'Market Access')}
            className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            title="Download Market Access as PNG"
            aria-label="Download Market Access as PNG"
            data-export-exclude
          >
            <Download className="w-4 h-4 text-zinc-300" />
          </button>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Market Access & Trade Benefits
          </h3>
        </div>
        
        <ul className="space-y-3 text-sm text-zinc-300">
          {marketAccessItems.map((item) => (
            <li key={item.title} className="flex items-start gap-2">
              <span className={`${item.tone === 'amber' ? 'text-amber-400' : 'text-emerald-400'} text-lg`}>
                {item.tone === 'amber' ? '!' : '✓'}
              </span>
              <div>
                <p className="font-bold text-white mb-1">
                  {item.emoji} {item.title}
                </p>
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-zinc-400 mb-2">{paragraph}</p>
                ))}
                {item.bullets && item.bullets.length > 0 && (
                  <div className={`${item.tone === 'amber' ? 'bg-amber-950/20 border-amber-900/30' : 'bg-emerald-950/20 border-emerald-900/30'} border rounded-lg p-3 space-y-1.5 text-xs text-zinc-300`}>
                    {item.bullets.map((bullet, i) => (
                      <p key={bullet}>
                        <span className={item.tone === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>{i + 1}.</span> {bullet}
                      </p>
                    ))}
                  </div>
                )}
                {item.footnote && (
                  <p className="text-xs text-zinc-500 mt-2">{item.footnote}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        <div data-export-exclude className="mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-600">
          <div>
            <p className="font-bold">📊 Souvera Intelligence Terminal</p>
            <p>📅 Updated: {updatedAt}</p>
          </div>
          <div className="sm:text-right space-y-1">
            <p>Data: USTR, AfCFTA · U.S. Census Bureau</p>
            {data.country && (() => {
              const target = getTradeBenefitsTarget(userEntitlements);
              const iso3 = data.country.iso3.toUpperCase();
              const linkClass = 'text-blue-400 hover:text-blue-300 font-medium transition-colors';
              if ('href' in target) {
                return (
                  <Link href={target.href} className={linkClass}>
                    {target.label} →
                  </Link>
                );
              }
              if (onNavigateToTab) {
                return (
                  <button
                    type="button"
                    onClick={() => onNavigateToTab(target.tab, target.section)}
                    className={`${linkClass} block sm:ml-auto`}
                  >
                    {target.label} →
                  </button>
                );
              }
              return (
                <Link href={buildCountryTabHref(iso3, target.tab, target.section)} className={linkClass}>
                  {target.label} →
                </Link>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* Souvera Country Analysis — API narrative (distinct from structured Why Now card above) */}
      {hasFullAccess && data.narrative?.whyNow && data.country && (
        <CountryAnalysisSection
          narrative={data.narrative.whyNow}
          country={data.country}
          updatedAt={updatedAt}
          canExport={canExport}
        />
      )}

      {/* Mobile Quick Stats + sidebar actions */}
      <div className="lg:hidden space-y-4">
        {data.country && data.metrics && data.signal && (
          <QuickStatsWidget country={data.country} metrics={data.metrics} signal={data.signal} />
        )}
        {data.country && (
          <>
            <MarketAccessSummary
              country={data.country}
              frameworks={data.marketAccess}
              userEntitlements={userEntitlements}
              onNavigateToTab={onNavigateToTab}
            />
            <RelatedActions
              country={data.country}
              userEntitlements={userEntitlements}
              onNavigateToTab={onNavigateToTab}
            />
          </>
        )}
      </div>
      {hasFullAccess && data.narrative?.summary && (
        <details className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
          <summary className="text-sm font-bold text-zinc-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2">
            <span>📄</span>
            <span>Expand Full Country Summary (for Reports)</span>
            <span className="text-xs text-zinc-600 ml-auto">→</span>
          </summary>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-3 italic">
              This full-text summary is available for export in the Reports tab (PDF, Word, PowerPoint)
            </p>
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {data.narrative.summary}
            </div>
            <div data-export-exclude className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
              <p className="font-bold">📊 Souvera Intelligence Terminal</p>
              <p>📅 Updated: May 13, 2026</p>
            </div>
          </div>
        </details>
      )}
      
      {/* Upgrade Prompt for Explorer Users */}
      {!hasFullAccess && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-400 mb-2">
            <span className="font-bold">Unlock Full Intelligence</span>
          </p>
          <p className="text-xs text-zinc-500 mb-3">
            Access comprehensive country summaries, detailed sector analysis, and exportable intelligence cards with Professional or higher subscription.
          </p>
          <Link href="/access" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-sm transition-colors">
            Upgrade to Professional
          </Link>
        </div>
      )}
      
      </div>
      
      {/* Sidebar Column (1/3 width on desktop, hidden on mobile) */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* Quick Stats Widget */}
          {data.country && data.metrics && data.signal && (
            <QuickStatsWidget 
              country={data.country}
              metrics={data.metrics}
              signal={data.signal}
            />
          )}
          {data.country && (
            <MarketAccessSummary
              country={data.country}
              frameworks={data.marketAccess}
              userEntitlements={userEntitlements}
              onNavigateToTab={onNavigateToTab}
            />
          )}

          {data.officialReferences?.length ? (
            <OfficialTradeReferences references={data.officialReferences} />
          ) : null}

          {data.country && (
            <RelatedActions
              country={data.country}
              userEntitlements={userEntitlements}
              onNavigateToTab={onNavigateToTab}
            />
          )}
        </div>
      </div>
      
      {/* Market Access Card - Full Width Below (Desktop Only) */}
      <div className="hidden lg:block lg:col-span-3">
        {/* This will be the Market Access Card moved here for full-width display */}
      </div>
    </div>
  );
}
