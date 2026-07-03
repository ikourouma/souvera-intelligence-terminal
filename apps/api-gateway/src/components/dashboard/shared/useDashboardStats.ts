'use client';

import { useEffect, useState } from 'react';
import type { UserAccess } from '@souvera/entitlements';

export interface DashboardStats {
  countriesViewed: number;
  exportsGenerated: number;
  reportsUsed: number;
  reportsLimit: number;
  watchlistCount: number;
  watchlistLimit: number;
  recentCountries: { iso3: string; name: string; flag: string }[];
}

const REPORT_LIMITS: Record<string, number> = {
  explorer: 1,
  professional: 5,
  business: 1,
  investor: 5,
  institutional: 999,
};

const WATCHLIST_LIMITS: Record<string, number> = {
  explorer: 5,
  professional: 20,
  business: 50,
  investor: 50,
  institutional: 999,
};

export function useDashboardStats(tier: string) {
  const [stats, setStats] = useState<DashboardStats>({
    countriesViewed: 0,
    exportsGenerated: 0,
    reportsUsed: 0,
    reportsLimit: REPORT_LIMITS[tier] ?? 1,
    watchlistCount: 0,
    watchlistLimit: WATCHLIST_LIMITS[tier] ?? 5,
    recentCountries: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/dashboard/stats');
        if (res.ok) {
          const data = (await res.json()) as DashboardStats;
          if (!cancelled) setStats(data);
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tier]);

  return { stats, loading };
}

export function tierDisplayName(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export type { UserAccess };
