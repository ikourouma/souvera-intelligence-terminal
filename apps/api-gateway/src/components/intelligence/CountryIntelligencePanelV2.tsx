'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, FileText, TrendingUp, Building2, Target, AlertTriangle, Ship, Download, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { EntitlementKey } from '@souvera/entitlements';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { CountryHeaderBar } from './CountryHeaderBar';
import { LimitedCoverageBanner } from './LimitedCoverageBanner';
import { MetricCardV2 } from './MetricCardV2';
import { SignalMomentumRow } from './SignalMomentumRow';
import { getStructuralDataGap } from '@/lib/market-coverage/structural-data-gaps';
import { EconomyTab } from './tabs/EconomyTab';
import { OverviewTabV2 } from './tabs/OverviewTabV2';
import { SectorsTab } from './tabs/SectorsTab';
import OpportunityTab from './tabs/OpportunityTab';
import RiskTab from './tabs/RiskTab';
import TradeTab from './tabs/TradeTab';
import ReportsTab from './tabs/ReportsTab';
import {
  EXECUTIVE_METRICS,
  TAB_ENTITLEMENTS,
  canAccessTab,
  canAccessMetric,
  getAccessibleTabs,
  type SignalLevel,
} from '@/lib/intelligence-entitlements';

// Metric Key → Tab ID + Section mapping (for clickable cards)
const METRIC_NAV_MAP: Record<string, { tab: string; section?: string }> = {
  gdp_current_usd: { tab: 'economy', section: 'gdp' },
  gdp_growth_annual_pct: { tab: 'economy', section: 'growth' },
  population_total: { tab: 'overview', section: 'demographics' },
  fdi_net_inflows_current_usd: { tab: 'opportunity', section: 'fdi' },
  inflation_consumer_prices_annual_pct: { tab: 'risk', section: 'inflation' },
  fx_rate_usd: { tab: 'economy', section: 'fx' },
};

/**
 * Breadcrumb Component - Bloomberg-grade navigation
 */
function Breadcrumb({ 
  countryName, 
  iso3, 
  activeTab 
}: { 
  countryName: string; 
  iso3: string; 
  activeTab: string;
}) {
  const tabLabel = TAB_ENTITLEMENTS.find(t => t.id === activeTab)?.label || 'Overview';
  
  return (
    <nav className="flex items-center gap-2 text-xs text-zinc-500 px-6 py-3 border-b border-zinc-800/50 bg-zinc-950/50">
      <Link 
        href="/dashboard" 
        className="hover:text-emerald-400 transition-colors flex items-center gap-1"
      >
        <Home className="w-3 h-3" />
        Home
      </Link>
      <ChevronRight className="w-3 h-3" />
      <Link 
        href="/intelligence" 
        className="hover:text-emerald-400 transition-colors"
      >
        Intelligence
      </Link>
      <ChevronRight className="w-3 h-3" />
      <Link 
        href={`/country/${iso3}`}
        className="hover:text-emerald-400 transition-colors"
      >
        {countryName}
      </Link>
      {activeTab !== 'overview' && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300 font-medium">{tabLabel}</span>
        </>
      )}
    </nav>
  );
}

// Tab icons mapping
const TAB_ICONS = {
  overview: FileText,
  economy: TrendingUp,
  sectors: Building2,
  opportunity: Target,
  risk: AlertTriangle,
  trade: Ship,
  reports: Download,
};

export interface CountryIntelligencePanelV2Props {
  iso3: string;
  mode?: 'full-page' | 'drawer' | 'embedded';
  onClose?: () => void;
  userEntitlements: EntitlementKey[];
  planId?: string;
  className?: string;
}

/**
 * CountryIntelligencePanelV2 - Bloomberg-Grade Intelligence Terminal
 * 
 * 7-Tab System:
 * 1. Overview - Country summary, why now, key highlights
 * 2. Economy - Macro indicators and time series charts
 * 3. Sectors - Sector scores and rationale
 * 4. Opportunity - Investment thesis and growth drivers
 * 5. Risk - Risk narrative and scorecard
 * 6. Trade - Bilateral trade flows (exports + imports)
 * 7. Reports - Downloadable intelligence reports
 * 
 * All content is entitlement-gated:
 * - Public: Basic country info only
 * - Explorer: Overview + Sectors (teasers)
 * - Professional: + Economy, full metrics
 * - Business: + Opportunity, Risk, Trade
 * - Institutional: + Advanced reports
 * - Platform Admin: EVERYTHING (admin_access entitlement)
 */
export function CountryIntelligencePanelV2({
  iso3,
  mode = 'full-page',
  onClose,
  userEntitlements,
  planId,
  className = '',
}: CountryIntelligencePanelV2Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Scroll detection for sticky header behavior
  const { scrollY, scrollDirection, isAtTop } = useScrollDirection();
  
  // Get accessible tabs for this user
  const accessibleTabs = getAccessibleTabs(userEntitlements);
  
  // Read tab from URL or default to overview
  const tabFromUrl = searchParams.get('tab');
  const defaultTab = accessibleTabs.includes('overview') ? 'overview' : (accessibleTabs[0] || 'overview');
  const resolvedTab =
    tabFromUrl && accessibleTabs.includes(tabFromUrl) ? tabFromUrl : defaultTab;
  const [activeTab, setActiveTab] = useState<string>(resolvedTab);

  // Canonicalize URL when tab param is missing or invalid
  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTab = tab && accessibleTabs.includes(tab);
    if (!validTab) {
      const params = new URLSearchParams(searchParams);
      params.set('tab', defaultTab);
      router.replace(`/country/${iso3}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, accessibleTabs, defaultTab, iso3, router]);
  
  // Determine header state based on scroll position and direction
  const shouldShowCompactHeader = scrollY > 100 && !isAtTop;
  const shouldHideHeader = scrollY > 300 && scrollDirection === 'down';
  
  // Get current tab label for compact header breadcrumb
  const getTabLabel = (tabId: string) => {
    return TAB_ENTITLEMENTS.find(t => t.id === tabId)?.label || 'Overview';
  };

  // Update URL when tab changes
  const navigateToTab = (tabId: string, section?: string) => {
    if (!canAccessTab(tabId, userEntitlements)) return;
    
    setActiveTab(tabId);
    
    // Update URL with tab and optional section
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    if (section) {
      params.set('section', section);
    } else {
      params.delete('section');
    }
    
    const newUrl = `/country/${iso3}?${params.toString()}${section ? `#${section}` : ''}`;
    router.push(newUrl, { scroll: false });
  };

  // Handle metric card clicks (navigate to relevant tab)
  const handleMetricClick = (metricKey: string) => {
    const navTarget = METRIC_NAV_MAP[metricKey];
    if (navTarget) {
      navigateToTab(navTarget.tab, navTarget.section);
      
      // Scroll to section after a short delay (allow tab render)
      if (navTarget.section) {
        setTimeout(() => {
          document.getElementById(navTarget.section!)?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  };

  // Sync tab state with URL (back/forward navigation)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && accessibleTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, accessibleTabs, activeTab]);

  // Scroll to section on load when ?section= or hash present
  useEffect(() => {
    if (loading || !data) return;
    const section = searchParams.get('section') || (typeof window !== 'undefined' ? window.location.hash.slice(1) : '');
    if (section) {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [loading, data, searchParams, activeTab]);

  // Fetch country data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/v1/country/${iso3}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching country:', err);
        setError(err instanceof Error ? err.message : 'Failed to load country data');
      } finally {
        setLoading(false);
      }
    };
    
    if (iso3) {
      fetchData();
    }
  }, [iso3]);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] bg-zinc-950 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] bg-zinc-950 ${className}`}>
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Unable to Load Intelligence</h3>
          <p className="text-sm text-zinc-500">
            {error || 'Country data not available'}
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-sm transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // Check if data is fresh (< 90 days)
  const isStale = (updatedAt: string) => {
    const updated = new Date(updatedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 90;
  };

  return (
    <div className={`bg-zinc-950 ${mode === 'drawer' ? 'h-full overflow-hidden flex flex-col' : ''} ${className}`}>
      {/* Breadcrumb Navigation (full-page mode only, visible only at scroll top) */}
      {mode === 'full-page' && data?.country && isAtTop && (
        <Breadcrumb 
          countryName={data.country.name} 
          iso3={iso3} 
          activeTab={activeTab} 
        />
      )}

      {/* Sticky Country Header (without tab bar) */}
      <div className={`
        sticky top-0 z-50 bg-zinc-950 
        transition-transform duration-300 ease-in-out
        ${shouldHideHeader ? '-translate-y-full' : 'translate-y-0'}
      `}>
        {!shouldHideHeader && (
          <CountryHeaderBar
            country={data.country}
            signal={data.signal}
            freshness={data.freshness}
            compact={shouldShowCompactHeader}
            currentSection={getTabLabel(activeTab)}
          />
        )}
      </div>

      {/* Close button (drawer mode) */}
      {mode === 'drawer' && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Limited coverage banner — only shown for 6 structural gap markets */}
      {(() => {
        const gap = getStructuralDataGap(iso3);
        return gap ? (
          <LimitedCoverageBanner gap={gap} className="mx-6 mt-4" />
        ) : null;
      })()}

      {/* Executive Snapshot Grid */}
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
          Executive Snapshot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXECUTIVE_METRICS.map((metric) => {
            const isLocked = !canAccessMetric(metric.key, userEntitlements);
            const value = data.metrics?.[metric.key];
            const hasNavTarget = METRIC_NAV_MAP[metric.key] !== undefined;
            const canNavigate = hasNavTarget && !isLocked && value !== null && value !== undefined;
            
            return (
              <MetricCardV2
                key={metric.key}
                metric={metric}
                value={value}
                isLocked={isLocked}
                isLoading={false}
                isStale={data.freshness?.updatedAt ? isStale(data.freshness.updatedAt) : false}
                userEntitlements={userEntitlements}
                clickable={canNavigate}
                onClick={() => canNavigate && handleMetricClick(metric.key)}
              />
            );
          })}
        </div>
      </div>

      {/* Signal + Momentum Row */}
      {(data.signal || data.momentum || data.newsPulse) && (
        <div className="p-6 border-b border-zinc-800">
          <SignalMomentumRow
            signal={data.signal ?? { level: 'stable', investmentScore: null, confidenceScore: null }}
            momentum={data.momentum ?? { economicMomentum: null, investorReadiness: null }}
            newsPulse={data.newsPulse ?? { sentimentScore: null, riskIntensity: null, opportunityIntensity: null, pending: true }}
            onMomentumClick={() => navigateToTab('overview', 'economic-momentum-card')}
          />
        </div>
      )}

      {/* 7-Tab System */}
      <div className={`${mode === 'drawer' ? 'flex-1 flex flex-col overflow-hidden' : ''}`}>
        {/* Tab Bar (Sticky, below Executive Snapshot) */}
        <div className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {TAB_ENTITLEMENTS.map((tab) => {
              const Icon = TAB_ICONS[tab.id as keyof typeof TAB_ICONS];
              const isAccessible = canAccessTab(tab.id, userEntitlements);
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => isAccessible && navigateToTab(tab.id)}
                  disabled={!isAccessible}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap
                    ${isActive 
                      ? 'text-blue-400 border-blue-500 bg-blue-500/5' 
                      : isAccessible
                        ? 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700'
                        : 'text-zinc-700 border-transparent cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {!isAccessible && (
                    <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded">
                      {tab.minTier === 'professional' ? 'PRO+' : tab.minTier === 'business' ? 'BIZ+' : 'INV+'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${mode === 'drawer' ? 'flex-1 overflow-y-auto' : ''} p-6`}>
          {activeTab === 'overview' && (
            <OverviewTabV2
              data={data}
              userEntitlements={userEntitlements}
              onNavigateToTab={navigateToTab}
            />
          )}
          {activeTab === 'economy' && <EconomyTab data={data} userEntitlements={userEntitlements} />}
          {activeTab === 'sectors' && <SectorsTab data={data} userEntitlements={userEntitlements} />}
          {activeTab === 'opportunity' && <OpportunityTab data={data} userEntitlements={userEntitlements} />}
          {activeTab === 'risk' && <RiskTab data={data} userEntitlements={userEntitlements} />}
          {activeTab === 'trade' && <TradeTab data={data} userEntitlements={userEntitlements} />}
          {activeTab === 'reports' && (
            <ReportsTab data={data} userEntitlements={userEntitlements} planId={planId} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB COMPONENTS (All implemented)
// ============================================
// Overview, Economy, Sectors, Opportunity, Risk, Trade, Reports tabs
// are now imported from dedicated component files
