import type { EntitlementKey } from '@souvera/entitlements';
import { planCompareHref } from '@/lib/upgrade-paths';

export type TabNavigationTarget = {
  tab: string;
  section?: string;
  label: string;
};

function has(entitlements: EntitlementKey[], key: EntitlementKey) {
  return entitlements.includes(key) || entitlements.includes('admin_access');
}

/** Resolve where "View Full Trade Benefits" should go based on persona entitlements. */
export function getTradeBenefitsTarget(entitlements: EntitlementKey[]): TabNavigationTarget | { href: string; label: string } {
  if (has(entitlements, 'trade_data')) {
    return { tab: 'trade', section: 'us-trade-card', label: 'View Full Trade Benefits' };
  }
  if (has(entitlements, 'reports_preview')) {
    return { tab: 'reports', label: 'Generate Trade Profile Report' };
  }
  return { href: planCompareHref('business', 'trade-tab'), label: 'Upgrade for Trade Intelligence' };
}

export function buildCountryTabHref(iso3: string, tab: string, section?: string): string {
  const params = new URLSearchParams({ tab });
  if (section) params.set('section', section);
  const hash = section ? `#${section}` : '';
  return `/country/${iso3}?${params.toString()}${hash}`;
}
