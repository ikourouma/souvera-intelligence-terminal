/**
 * Assembles Country Profile report payload (server-side, business-tier depth).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NIGERIA_TRADE } from '@/data/nigeria-trade';
import { JAMAICA_TRADE } from '@/data/jamaica-trade';
import { KENYA_TRADE } from '@/data/kenya-trade';
import { WAVE1_AFRICA_TRADE } from '@/data/wave1-africa-trade';
import { CARIBBEAN_WAVE2_TRADE } from '@/data/caribbean-wave2-trade';
import { buildSignalScan } from '@/lib/intelligence/country-signal-scan';
import { getVerifiedMarketAccessForReport } from './policy-status-registry';
import { buildCountryProfileSections, type CountryProfileSections } from './country-profile-sections';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/data/utils';

export interface CountryProfileReportData {
  country: {
    name: string;
    iso3: string;
    iso2?: string;
    region?: string;
    capital?: string;
    currencyCode?: string;
  };
  generatedAt: string;
  freshnessAt?: string;
  summary?: string;
  whyNow?: string;
  riskNarrative?: string;
  opportunityThesis?: string;
  metrics: Array<{ label: string; value: string }>;
  signalScan: { badge: string; bullets: [string, string] };
  sectors: Array<{
    label: string;
    strength?: number;
    growth?: number;
    attractiveness?: number;
    teaser?: string;
  }>;
  marketAccess: Array<{ label: string; statusLabel: string; description: string }>;
  tradeSummary?: {
    exportsUsd?: string;
    importsUsd?: string;
    topPartners: Array<{ country: string; sharePct?: number }>;
  };
  sources: string;
  sections: CountryProfileSections;
  economyYears: EconomyYearPoint[];
}

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function buildExecutiveSummaryFallback(
  countryName: string,
  signalScan: CountryProfileReportData['signalScan'],
  metrics: CountryProfileReportData['metrics'],
  topSector?: string
): string {
  const growth = metrics.find((m) => m.label === 'GDP growth')?.value;
  const parts = [
    `${countryName} is profiled in Souvera's institutional intelligence coverage.`,
    signalScan.bullets[0],
    signalScan.bullets[1],
  ];
  if (growth) parts.push(`GDP growth is tracking at ${growth}.`);
  if (topSector) parts.push(`${topSector} leads the sector scorecard by attractiveness.`);
  parts.push(
    'This document synthesizes macro indicators, sector positioning, market-access frameworks, and bilateral trade data for professional due diligence.'
  );
  return parts.join(' ');
}

function truncateMd(md: string | undefined, maxLen: number): string | undefined {
  if (!md) return undefined;
  const plain = md.replace(/\*\*/g, '').replace(/^[-*]\s+/gm, '').trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}

async function fetchEconomyYears(
  supabase: SupabaseClient,
  countryId: string
): Promise<EconomyYearPoint[]> {
  const { data: observations } = await supabase
    .from('souvera_country_observations')
    .select(`
      period_date,
      value_numeric,
      indicator_id,
      souvera_indicators (key)
    `)
    .eq('country_id', countryId)
    .gte('period_date', '2020-01-01')
    .lte('period_date', '2025-12-31')
    .eq('period_type', 'annual')
    .order('period_date', { ascending: true });

  if (!observations?.length) return [];

  const yearMap = new Map<number, EconomyYearPoint>();
  const keyMap: Record<string, keyof EconomyYearPoint> = {
    gdp_current_usd: 'gdp_current_usd',
    gdp_growth_pct: 'gdp_growth_pct',
    fdi_net_inflows_usd: 'fdi_net_inflows_usd',
    inflation_cpi_pct: 'inflation_cpi_pct',
    fx_to_usd: 'fx_to_usd',
  };

  for (const obs of observations) {
    const year = new Date(obs.period_date as string).getFullYear();
    const indicatorKey = (obs.souvera_indicators as { key?: string })?.key;
    if (!yearMap.has(year)) yearMap.set(year, { year });
    const row = yearMap.get(year)!;
    if (indicatorKey && keyMap[indicatorKey]) {
      (row as Record<string, number>)[keyMap[indicatorKey]] = obs.value_numeric as number;
    }
  }

  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}

export async function fetchCountryProfileReportData(iso3: string): Promise<CountryProfileReportData> {
  const supabase = getServiceClient();
  const iso3Upper = iso3.toUpperCase();

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, iso2, iso3, name, region, capital, currency_code')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  if (!country) {
    throw new Error(`Country not found: ${iso3Upper}`);
  }

  const metrics: CountryProfileReportData['metrics'] = [];

  const { data: lite } = await supabase
    .from('souvera_country_lite_v')
    .select('gdp_current_usd, gdp_growth_pct, population_total, freshness_at')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  const { data: pro } = await supabase
    .from('souvera_country_professional_v')
    .select('fdi_net_inflows_usd, inflation_cpi_pct, fx_to_usd')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  if (lite?.gdp_current_usd != null) {
    metrics.push({ label: 'GDP (current USD)', value: formatCurrency(lite.gdp_current_usd) });
  }
  if (lite?.gdp_growth_pct != null) {
    metrics.push({ label: 'GDP growth', value: formatPercent(lite.gdp_growth_pct) });
  }
  if (lite?.population_total != null) {
    metrics.push({
      label: 'Population',
      value: formatNumber(lite.population_total, { compact: true }),
    });
  }
  if (pro?.fdi_net_inflows_usd != null) {
    metrics.push({ label: 'FDI net inflows', value: formatCurrency(pro.fdi_net_inflows_usd) });
  }
  if (pro?.inflation_cpi_pct != null) {
    metrics.push({ label: 'Inflation (CPI)', value: formatPercent(pro.inflation_cpi_pct) });
  }
  if (pro?.fx_to_usd != null) {
    metrics.push({ label: 'FX rate (local/USD)', value: pro.fx_to_usd.toFixed(2) });
  }

  const { data: profile } = await supabase
    .from('souvera_country_profiles')
    .select('summary_md, why_now_md, risk_narrative_md, opportunity_thesis_md, freshness_at')
    .eq('country_id', country.id)
    .maybeSingle();

  const { data: signalRow } = await supabase
    .from('souvera_country_signal_scores')
    .select('signal_level, investment_score')
    .eq('country_id', country.id)
    .maybeSingle();

  const { data: sectorsRows } = await supabase
    .from('souvera_country_sectors')
    .select('sector_label, strength_score, growth_score, attractiveness_score, teaser')
    .eq('country_id', country.id)
    .eq('row_status', 'active')
    .order('display_order', { ascending: true })
    .limit(5);

  const topSector = sectorsRows?.[0]?.sector_label as string | undefined;
  const signalScan = buildSignalScan({
    iso3: iso3Upper,
    signalLevel: (signalRow?.signal_level as string) ?? 'stable',
    metrics: {
      gdp_growth_annual_pct: lite?.gdp_growth_pct ?? undefined,
      fdi_net_inflows_current_usd: pro?.fdi_net_inflows_usd ?? undefined,
      inflation_consumer_prices_annual_pct: pro?.inflation_cpi_pct ?? undefined,
    },
    topSectorLabel: topSector,
  });

  const tradeByIso: Record<string, typeof NIGERIA_TRADE> = {
    NGA: NIGERIA_TRADE,
    JAM: JAMAICA_TRADE,
    KEN: KENYA_TRADE,
    ...WAVE1_AFRICA_TRADE,
    ...CARIBBEAN_WAVE2_TRADE,
  };
  const trade = tradeByIso[iso3Upper];
  let tradeSummary: CountryProfileReportData['tradeSummary'];
  if (trade && !('pending' in trade && trade.pending)) {
    const partners = (trade.topPartners ?? []).slice(0, 3).map((p) => ({
      country: p.country,
      sharePct: p.sharePct,
    }));
    tradeSummary = {
      asOfYear:
        trade.asOfYear ??
        trade.exportsToUs?.year ??
        trade.importsFromUs?.year ??
        undefined,
      exportsUsd: trade.exportsUsd != null ? formatCurrency(trade.exportsUsd) : undefined,
      importsUsd: trade.importsUsd != null ? formatCurrency(trade.importsUsd) : undefined,
      topPartners: partners,
    };
  }

  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const economyYears = await fetchEconomyYears(supabase, country.id);

  const baseData: Omit<CountryProfileReportData, 'sections'> = {
    country: {
      name: country.name,
      iso3: country.iso3,
      iso2: country.iso2 ?? undefined,
      region: country.region ?? undefined,
      capital: country.capital ?? undefined,
      currencyCode: country.currency_code ?? undefined,
    },
    generatedAt,
    freshnessAt: profile?.freshness_at ?? lite?.freshness_at ?? undefined,
    summary: profile?.summary_md?.trim() ?? buildExecutiveSummaryFallback(country.name, signalScan, metrics, topSector),
    whyNow: profile?.why_now_md?.trim(),
    riskNarrative: profile?.risk_narrative_md?.trim(),
    opportunityThesis: profile?.opportunity_thesis_md?.trim(),
    metrics,
    signalScan,
    sectors: (sectorsRows ?? []).map((s) => ({
      label: s.sector_label as string,
      strength: s.strength_score as number | undefined,
      growth: s.growth_score as number | undefined,
      attractiveness: s.attractiveness_score as number | undefined,
      teaser: s.teaser as string | undefined,
    })),
    marketAccess: getVerifiedMarketAccessForReport(iso3Upper),
    markets: {
      asOfDate: profile?.freshness_at ?? lite?.freshness_at ?? undefined,
    },
    tradeSummary,
    sources: 'World Bank, IMF, UN Comtrade, Souvera Curated Intelligence',
  };

  return {
    ...baseData,
    economyYears,
    sections: buildCountryProfileSections(baseData as CountryProfileReportData, economyYears),
  };
}
