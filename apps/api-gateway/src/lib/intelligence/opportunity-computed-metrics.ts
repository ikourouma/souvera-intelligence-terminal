/**
 * Computed opportunity metrics from live API payload — Wave 1 + pilot countries.
 */

import { formatCurrency } from '@/lib/intelligence-entitlements';
import { isRolloutCountry, isWave1Africa } from '@/lib/intelligence/rollout-manifest';
import type { RegionalAdvantage } from '@/lib/intelligence/country-opportunity-content';
import type { CountrySector, CountryMetrics, CountryTrade } from '@/types/country-intelligence';

interface OpportunityDataInput {
  iso3: string;
  countryName: string;
  metrics?: CountryMetrics;
  trade?: CountryTrade & { pending?: boolean };
  sectors?: CountrySector[];
}

function formatGdp(value?: number): string {
  if (value == null) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
}

function topSectorLabel(sectors?: CountrySector[]): string {
  if (!sectors?.length) return 'N/A';
  const sorted = [...sectors].sort(
    (a, b) => (b.attractivenessScore ?? 0) - (a.attractivenessScore ?? 0)
  );
  return sorted[0]?.sectorLabel ?? 'N/A';
}

function tradePartnerShare(trade?: CountryTrade): string {
  const partner = trade?.topPartners?.[0];
  if (!partner) return 'N/A';
  return `${partner.country} ${partner.sharePct ?? 0}%`;
}

function agoaUtilizationLabel(trade?: CountryTrade): { value: string; sublabel: string; accent: string } {
  if (!trade?.agoa) {
    return { value: 'N/A', sublabel: 'Trade data pending', accent: 'text-zinc-400' };
  }
  const status = trade.agoa.status;
  if (status === 'restoration_opportunity' || status === 'suspended') {
    return {
      value: 'Suspended',
      sublabel: 'Restoration watchpoint',
      accent: 'text-amber-400',
    };
  }
  const current = trade.agoa.currentExportsUsd ?? 0;
  return {
    value: current > 0 ? formatCurrency(current) : 'Active',
    sublabel: 'Preferential export corridor',
    accent: 'text-emerald-400',
  };
}

/**
 * Returns up to 4 computed tiles for rollout countries; empty for others.
 */
export function buildOpportunityComputedMetrics(input: OpportunityDataInput): RegionalAdvantage[] {
  const iso3 = input.iso3.toUpperCase();
  if (!isRolloutCountry(iso3)) return [];

  const metrics = input.metrics;
  const trade = input.trade?.pending ? undefined : input.trade;
  const agoa = agoaUtilizationLabel(trade);

  const tiles: RegionalAdvantage[] = [
    {
      icon: 'globe',
      value: formatGdp(metrics?.gdp_current_usd),
      label: 'GDP (Latest)',
      sublabel: metrics?.gdp_growth_annual_pct != null
        ? `${metrics.gdp_growth_annual_pct.toFixed(1)}% growth`
        : 'Macro anchor',
      accentClass: 'text-blue-400',
    },
    {
      icon: 'shield',
      value: tradePartnerShare(trade),
      label: 'Top Trade Partner',
      sublabel: 'Bilateral concentration',
      accentClass: 'text-cyan-400',
    },
    {
      icon: 'users',
      value: topSectorLabel(input.sectors),
      label: 'Lead Sector',
      sublabel: (() => {
        const top = [...(input.sectors ?? [])].sort(
          (a, b) => (b.attractivenessScore ?? 0) - (a.attractivenessScore ?? 0)
        )[0];
        return top?.attractivenessScore != null
          ? `Attractiveness ${top.attractivenessScore}/100`
          : 'By attractiveness score';
      })(),
      accentClass: 'text-emerald-400',
    },
  ];

  if (isWave1Africa(iso3) || iso3 === 'NGA' || iso3 === 'KEN') {
    tiles.push({
      icon: 'globe',
      value: agoa.value,
      label: 'AGOA / Preferential',
      sublabel: agoa.sublabel,
      accentClass: agoa.accent,
    });
  } else {
    tiles.push({
      icon: 'shield',
      value: trade?.intraRegional?.primaryVolumeUsd
        ? formatCurrency(trade.intraRegional.primaryVolumeUsd)
        : 'N/A',
      label: 'Regional Trade',
      sublabel: 'CARICOM / intra-regional',
      accentClass: 'text-teal-400',
    });
  }

  return tiles;
}
