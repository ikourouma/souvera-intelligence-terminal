/**
 * Signal Strength scan summaries — badge + 2 bullets (Option A, Sprint G).
 * Country-specific editorial with metric-derived bullets where available.
 */

import type { CountryMetrics } from '@/types/country-intelligence';

export interface SignalScan {
  badge: string;
  bullets: [string, string];
}

export interface SignalScanInput {
  iso3: string;
  signalLevel: string;
  metrics: CountryMetrics;
  topSectorLabel?: string | null;
  /** Latest structured macro year — used in bullet timestamps */
  macroAsOfYear?: number | null;
}

const SIGNAL_LEVEL_SHORT: Record<string, string> = {
  high_growth: 'High growth',
  emerging: 'Emerging',
  stable: 'Stable',
  watchlist: 'Watchlist',
  risk_elevated: 'Elevated risk',
};

/** Country-specific badge suffix — never cross-applied. */
const BADGE_SUFFIX: Record<string, string> = {
  NGA: 'Reform momentum',
  JAM: 'Caribbean gateway',
  KEN: 'East Africa hub',
};

/** Editorial fallbacks when metrics unavailable. */
const FALLBACK_BULLETS: Record<string, [string, string]> = {
  NGA: [
    'Tech/fintech leading sector strength',
    'Post-reform macro stabilizing',
  ],
  JAM: [
    'Tourism recovery driving services growth',
    'Nearshore digital hub — Kingston corridor',
  ],
  KEN: [
    'Fintech & digital finance leading sector strength',
    'Mombasa gateway + AGOA export corridor',
  ],
  default: [
    'Sector strength under review',
    'Macro indicators being assessed',
  ],
};

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function fmtUsdBillions(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function gdpGrowthClause(iso3: string, pct: number): string {
  if (iso3 === 'NGA') {
    if (pct >= 5) return 'fastest growth in a decade';
    if (pct >= 3) return 'above regional average';
    return 'moderating from reform cycle';
  }
  if (iso3 === 'JAM') {
    if (pct >= 3) return 'tourism-led recovery';
    if (pct >= 1) return 'steady post-pandemic rebound';
    return 'services sector stabilizing';
  }
  if (iso3 === 'KEN') {
    if (pct >= 5) return 'services-led expansion';
    if (pct >= 3) return 'fintech and logistics driving growth';
    return 'macro stabilizing under CBK anchor';
  }
  if (pct >= 4) return 'above emerging-market average';
  if (pct >= 2) return 'steady expansion';
  return 'growth moderating';
}

function buildMetricBullets(
  iso3: string,
  metrics: CountryMetrics,
  topSectorLabel?: string | null,
  macroAsOfYear?: number | null
): string[] {
  const bullets: string[] = [];
  const yearLabel = macroAsOfYear != null ? String(macroAsOfYear) : 'latest';

  if (metrics.fdi_net_inflows_current_usd != null && metrics.fdi_net_inflows_current_usd > 0) {
    bullets.push(`FDI inflows ${fmtUsdBillions(metrics.fdi_net_inflows_current_usd)} (${yearLabel})`);
  }

  if (topSectorLabel) {
    bullets.push(`${topSectorLabel} leading sector strength`);
  }

  if (metrics.gdp_growth_annual_pct != null) {
    const clause = gdpGrowthClause(iso3, metrics.gdp_growth_annual_pct);
    bullets.push(`GDP growth ${fmtPct(metrics.gdp_growth_annual_pct)} — ${clause}`);
  }

  if (metrics.inflation_consumer_prices_annual_pct != null && bullets.length < 2) {
    const inf = metrics.inflation_consumer_prices_annual_pct;
    if (inf <= 10) {
      bullets.push(`Inflation easing to ${fmtPct(inf)}`);
    } else {
      bullets.push(`Inflation at ${fmtPct(inf)} — monitor macro risk`);
    }
  }

  return bullets;
}

export function buildSignalScan(input: SignalScanInput): SignalScan {
  const iso3 = input.iso3.toUpperCase();
  const levelShort = SIGNAL_LEVEL_SHORT[input.signalLevel] ?? 'Emerging';
  const suffix = BADGE_SUFFIX[iso3] ?? 'Market watch';
  const badge = `${levelShort} · ${suffix}`;

  const fallbacks = FALLBACK_BULLETS[iso3] ?? FALLBACK_BULLETS.default;
  const metricBullets = buildMetricBullets(
    iso3,
    input.metrics,
    input.topSectorLabel,
    input.macroAsOfYear ?? null
  );

  const bullets: [string, string] = [
    metricBullets[0] ?? fallbacks[0],
    metricBullets[1] ?? fallbacks[1],
  ];

  return { badge, bullets };
}

/** Guard: ensure bullets never contain wrong-country markers. */
export function assertSignalScanPurity(iso3: string, scan: SignalScan): void {
  const upper = iso3.toUpperCase();
  const text = `${scan.badge} ${scan.bullets.join(' ')}`.toLowerCase();

  if (upper === 'JAM') {
    const ngaMarkers = ['nigeria', 'naira', 'agoa restoration', 'tinubu', 'lagos fintech', 'ecowas gateway', 'afcfta export corridor'];
    for (const m of ngaMarkers) {
      if (text.includes(m)) throw new Error(`JAM signal scan contaminated with NGA marker: ${m}`);
    }
  }

  if (upper === 'NGA') {
    const jamMarkers = ['jamaica', 'jmd', 'caribbean gateway', 'kingston corridor', 'caricom', 'cbi export', 'boj ', 'statin', 'jam-dex'];
    for (const m of jamMarkers) {
      if (text.includes(m)) throw new Error(`NGA signal scan contaminated with JAM marker: ${m}`);
    }
  }

  if (upper === 'KEN') {
    const ngaMarkers = ['nigeria', 'naira', 'agoa restoration', 'tinubu', 'lagos fintech', 'ecowas gateway'];
    const jamMarkers = ['jamaica', 'jmd', 'caribbean gateway', 'kingston corridor', 'caricom', 'cbi export', 'jam-dex'];
    for (const m of [...ngaMarkers, ...jamMarkers]) {
      if (text.includes(m)) throw new Error(`KEN signal scan contaminated with wrong-country marker: ${m}`);
    }
  }
}
