/**
 * Assembles Country Profile report payload (server-side, business-tier depth).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { buildSignalScan } from '@/lib/intelligence/country-signal-scan';
import {
  getVerifiedMarketAccessForReportAsync,
  primePolicyStatusCache,
  resolvePolicyStatusRegistry,
} from './policy-status-registry';
import { buildCountryProfileSections, type CountryProfileSections } from './country-profile-sections';
import { hydrateCountryProfileNarratives } from './narrative-template';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';
import { buildTop20SourceMeta } from './source-meta-top20';
import { TOP20_INDICATORS } from '@/lib/indicators/top20';
import { buildEconomyYearsFromObservations } from '@/lib/intelligence/build-economy-years';
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
    asOfYear?: number;
    exportsUsd?: string;
    importsUsd?: string;
    topPartners: Array<{ country: string; sharePct?: number }>;
  };
  sources: string;
  sourceMeta?: {
    defaultSource?: string;
    metrics?: Record<
      string,
      {
        source_name?: string;
        source_url?: string;
        as_of?: string;
        retrieved_at?: string;
      }
    >;
  };
  markets?: { asOfDate?: string };
  sections: CountryProfileSections;
  economyYears: EconomyYearPoint[];
  /** Resolved from Evidence Vault when available. */
  policyRecords?: import('@/types/report-integrity').PolicyStatusRecord[];
}

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
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
      value_text,
      indicator_id,
      souvera_indicators (key)
    `)
    .eq('country_id', countryId)
    .gte('period_date', '2020-01-01')
    .lte('period_date', '2025-12-31')
    .eq('period_type', 'annual')
    .order('period_date', { ascending: true });

  if (!observations?.length) return [];

  return buildEconomyYearsFromObservations(
    observations as Parameters<typeof buildEconomyYearsFromObservations>[0]
  );
}

export async function fetchCountryProfileReportData(iso3: string): Promise<CountryProfileReportData> {
  const supabase = getServiceClient();
  const iso3Upper = iso3.toUpperCase();

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, iso2, iso3, name, region, capital, currency_code')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  const countryIso2 = country?.iso2;

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
  const economyYears = await fetchEconomyYears(supabase, country!.id);
  const macroAsOfYear = economyYears.length
    ? Math.max(...economyYears.map((y) => y.year))
    : null;
  const macroRow = macroAsOfYear != null ? economyYears.find((y) => y.year === macroAsOfYear) : undefined;
  const populationVal = macroRow?.population_total ?? lite?.population_total;

  if (populationVal != null) {
    metrics.push({
      label: 'Population',
      value: formatNumber(populationVal, { compact: true }),
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
    macroAsOfYear,
  });

  const { data: snapshotRow } = await supabase
    .from('souvera_country_trade_snapshots')
    .select('year, top_trade_partners, top_exports, top_imports, trade_summary_md')
    .eq('country_id', country.id)
    .order('year', { ascending: false })
    .limit(1)
    .maybeSingle();

  let tradeSummary: CountryProfileReportData['tradeSummary'];
  if (snapshotRow) {
    // Parse JSON meta prefix for aggregate totals (see static-trade-migration)
    let agg: Record<string, number | null> = {};
    const summaryMd = (snapshotRow.trade_summary_md as string) ?? '';
    if (summaryMd.startsWith('{"_meta":')) {
      try { agg = JSON.parse(summaryMd.split('\n')[0])._meta ?? {}; } catch { /* fall through */ }
    }
    const partners = ((snapshotRow.top_trade_partners as any[]) ?? []).slice(0, 3).map((p: any) => ({
      country: p.country as string,
      sharePct: p.share_pct as number | undefined,
    }));
    tradeSummary = {
      asOfYear: snapshotRow.year,
      exportsUsd: agg.exports_usd != null ? formatCurrency(agg.exports_usd) : undefined,
      importsUsd: agg.imports_usd != null ? formatCurrency(agg.imports_usd) : undefined,
      topPartners: partners,
    };
  }

  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const policyRecords = await resolvePolicyStatusRegistry(iso3Upper);
  primePolicyStatusCache(iso3Upper, policyRecords);

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
    summary: profile?.summary_md?.trim(),
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
    marketAccess: await getVerifiedMarketAccessForReportAsync(iso3Upper),
    policyRecords,
    markets: {
      asOfDate: profile?.freshness_at ?? lite?.freshness_at ?? undefined,
    },
    tradeSummary,
    sources: 'World Bank, IMF, UN Comtrade, Souvera Curated Intelligence',
    sourceMeta: buildTop20SourceMeta(
      countryIso2 ?? country.iso2,
      macroAsOfYear,
      lite?.freshness_at ?? profile?.freshness_at ?? undefined
    ),
  };

  const assembled: CountryProfileReportData = {
    ...baseData,
    economyYears,
    sections: buildCountryProfileSections(baseData as CountryProfileReportData, economyYears),
  };

  const canonical = canonicalizeCountryPayload(assembled);
  return hydrateCountryProfileNarratives(assembled, canonical);
}
