'use client';

import type { ReactNode } from 'react';
import { Download, BarChart3, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { EntitlementKey } from '@souvera/entitlements';
import { exportCardToPNG } from '@/lib/intelligence/export-png';
import { buildCountryTabHref } from '@/lib/intelligence/navigation';
import { planCompareHref } from '@/lib/upgrade-paths';

interface RelatedActionsProps {
  country: {
    iso3: string;
    name: string;
  };
  userEntitlements: EntitlementKey[];
  onNavigateToTab?: (tab: string, section?: string) => void;
}

function TabAction({
  tab,
  section,
  iso3,
  onNavigateToTab,
  className,
  children,
}: {
  tab: string;
  section?: string;
  iso3: string;
  onNavigateToTab?: (tab: string, section?: string) => void;
  className: string;
  children: ReactNode;
}) {
  if (onNavigateToTab) {
    return (
      <button type="button" onClick={() => onNavigateToTab(tab, section)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link href={buildCountryTabHref(iso3, tab, section)} className={className}>
      {children}
    </Link>
  );
}

/**
 * RelatedActions - Sidebar quick actions with entitlement-aware routing.
 */
export function RelatedActions({ country, userEntitlements, onNavigateToTab }: RelatedActionsProps) {
  const hasExportAccess = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const hasReportsAccess = userEntitlements.includes('full_macro') || userEntitlements.includes('admin_access');
  const hasTradeAccess = userEntitlements.includes('trade_data') || userEntitlements.includes('admin_access');
  const hasCompareAccess = userEntitlements.includes('compare_lite') || userEntitlements.includes('admin_access');

  const iso3 = country.iso3.toUpperCase();

  const handleExportTab = () => {
    exportCardToPNG({
      elementId: 'country-snapshot-card',
      fileName: `${iso3.toLowerCase()}-country-snapshot`,
      countryName: country.name,
    });
  };

  const tabBtn =
    'w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-colors';
  const tabBtnDefault = `${tabBtn} bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white`;
  const tabBtnTrade = `${tabBtn} bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 hover:text-emerald-300`;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ArrowRight className="w-3 h-3" />
        Related Actions
      </h3>

      <div className="space-y-2">
        {hasExportAccess ? (
          <button
            type="button"
            onClick={handleExportTab}
            className={`${tabBtn} bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:text-blue-300`}
          >
            <Download className="w-3 h-3" />
            Export Snapshot (PNG)
          </button>
        ) : (
          <div className="px-3 py-2 bg-zinc-800/30 border border-zinc-800 rounded-sm text-zinc-600 text-xs">
            <Download className="w-3 h-3 inline mr-2" />
            Export (PRO+)
          </div>
        )}

        {hasCompareAccess ? (
          <Link
            href={`/intelligence/compare?countries=${iso3}`}
            className={tabBtnDefault}
          >
            <BarChart3 className="w-3 h-3" />
            Compare Countries
          </Link>
        ) : (
          <Link href={planCompareHref('professional', 'compare-tool')} className={tabBtnDefault}>
            <BarChart3 className="w-3 h-3" />
            Compare (Upgrade)
          </Link>
        )}

        {hasReportsAccess ? (
          <TabAction tab="reports" iso3={iso3} onNavigateToTab={onNavigateToTab} className={tabBtnDefault}>
            <FileText className="w-3 h-3" />
            Generate Report
          </TabAction>
        ) : (
          <div className="px-3 py-2 bg-zinc-800/30 border border-zinc-800 rounded-sm text-zinc-600 text-xs">
            <FileText className="w-3 h-3 inline mr-2" />
            Reports (Professional+)
          </div>
        )}

        {hasTradeAccess && (
          <TabAction
            tab="trade"
            section="us-trade-card"
            iso3={iso3}
            onNavigateToTab={onNavigateToTab}
            className={tabBtnTrade}
          >
            View Trade Data →
          </TabAction>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Data Sources</p>
        <p className="text-xs text-zinc-500">World Bank, IMF, CBN, U.S. Census Bureau</p>
      </div>
    </div>
  );
}
