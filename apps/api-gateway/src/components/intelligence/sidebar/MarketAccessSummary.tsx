'use client';

import Link from 'next/link';
import { CheckCircle2, Globe, AlertCircle, XCircle } from 'lucide-react';
import type { EntitlementKey } from '@souvera/entitlements';
import type { CountryIdentity } from '@/types/country-intelligence';
import { buildCountryTabHref, getTradeBenefitsTarget } from '@/lib/intelligence/navigation';
import {
  getMarketAccessFrameworks,
  type MarketAccessFramework,
  type MarketAccessStatus,
} from '@/lib/intelligence/market-access-registry';

interface MarketAccessSummaryProps {
  country: CountryIdentity;
  frameworks?: MarketAccessFramework[];
  userEntitlements?: EntitlementKey[];
  onNavigateToTab?: (tab: string, section?: string) => void;
}

function StatusIcon({ status }: { status: MarketAccessStatus }) {
  switch (status) {
    case 'suspended':
    case 'ineligible':
      return <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />;
    case 'graduated':
    case 'not_applicable':
      return <XCircle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />;
    default:
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />;
  }
}

function TradeBenefitsLink({
  country,
  userEntitlements = [],
  onNavigateToTab,
}: MarketAccessSummaryProps) {
  const iso3 = country.iso3.toUpperCase();
  const target = getTradeBenefitsTarget(userEntitlements);
  const className =
    'text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium w-full text-left block';

  if ('href' in target) {
    return (
      <Link href={target.href} className={className}>
        {target.label} →
      </Link>
    );
  }

  if (onNavigateToTab) {
    return (
      <button
        type="button"
        onClick={() => onNavigateToTab(target.tab, target.section)}
        className={className}
      >
        {target.label} →
      </button>
    );
  }

  return (
    <Link href={buildCountryTabHref(iso3, target.tab, target.section)} className={className}>
      {target.label} →
    </Link>
  );
}

/**
 * MarketAccessSummary - Sidebar trade agreement badges from market access registry.
 */
export function MarketAccessSummary({
  country,
  frameworks: frameworksProp,
  userEntitlements,
  onNavigateToTab,
}: MarketAccessSummaryProps) {
  const frameworks = frameworksProp?.length
    ? frameworksProp
    : getMarketAccessFrameworks(country.iso3);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Globe className="w-3 h-3" />
        Market Access
      </h3>

      <div className="space-y-3">
        {frameworks.length === 0 ? (
          <p className="text-xs text-zinc-500">No registered trade frameworks for this market.</p>
        ) : (
          frameworks.map((framework) => (
            <div key={framework.id} className="flex items-start gap-2">
              <StatusIcon status={framework.status} />
              <div>
                <p className="text-sm font-bold text-white mb-0.5">
                  {framework.emoji ? `${framework.emoji} ` : ''}{framework.label}
                  {framework.statusLabel && framework.status !== 'active' && (
                    <span className="ml-1.5 text-[10px] font-normal text-zinc-500 uppercase">
                      ({framework.statusLabel})
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">{framework.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <TradeBenefitsLink
          country={country}
          userEntitlements={userEntitlements}
          onNavigateToTab={onNavigateToTab}
        />
      </div>
    </div>
  );
}
