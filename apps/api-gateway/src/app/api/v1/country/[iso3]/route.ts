import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveUserAccess, hasEntitlement } from '@souvera/entitlements';
import { createServerClient } from '@/lib/supabase/server';
import { COUNTRY_FORECASTS } from '@/lib/intelligence/country-trade-content';
import { resolveMomentum, getMomentumBand } from '@/lib/intelligence/momentum';
import { buildSignalScan } from '@/lib/intelligence/country-signal-scan';
import {
  filterStoredHeadlines,
  newsPulseFilterConfig,
} from '@/lib/intelligence/news-pulse-relevance';
import type { CountryIntelligenceResponse, CountryMetrics, MetricEstimateFlags, NewsHeadline } from '@/types/country-intelligence';
import { buildEconomyYearsFromObservations } from '@/lib/intelligence/build-economy-years';
import { buildCountrySourceMeta } from '@/lib/intelligence/country-source-meta';
import {
  policyRecordToAgoaUiSnapshot,
  resolveMarketAccessForCountry,
} from '@/lib/intelligence/trade-policy-vault';
import { resolvePolicyStatusRegistry } from '@/lib/reports/policy-status-registry';
import { normalizeKeyPlayers } from '@/lib/intelligence/normalize-key-players';
import { fetchExternalReferencesForEntity } from '@/lib/external-references';
import { fetchUstrTradeSummaryForCountry } from '@/lib/intelligence/fetch-ustr-trade-summary';
import type { SignalLevel } from '@/lib/intelligence-entitlements';
import { isApprovedCaribbeanMarket } from '@/lib/market-coverage';
import { fetchAgoaMetrics } from '@/lib/trade/agoa-flow-metrics';
import {
  buildTradeSourceReconciliation,
  CENSUS_SOURCE,
  CATEGORY_FLOW_SOURCE,
  PREFERENTIAL_SOURCE,
} from '@/lib/intelligence/trade-source-reconciliation';

function resolveSignal(
  signalData: Record<string, unknown> | null,
  profileSignalLevel?: string | null
): CountryIntelligenceResponse['signal'] {
  const fallbackLevel = (profileSignalLevel || 'stable') as SignalLevel;

  if (signalData) {
    return {
      level: (signalData.signal_level as string) || fallbackLevel,
      investmentScore: (signalData.investment_score as number | null) ?? null,
      confidenceScore: (signalData.confidence_score as number | null) ?? null,
    };
  }

  return {
    level: fallbackLevel,
    investmentScore: null,
    confidenceScore: null,
  };
}

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const HEADLINE_ESTIMATE_INDICATORS = [
  'gdp_current_usd',
  'gdp_growth_pct',
  'population_total',
  'fdi_net_inflows_usd',
  'inflation_cpi_pct',
  'official_exchange_rate',
] as const;

const INDICATOR_TO_METRIC: Record<string, keyof CountryMetrics> = {
  gdp_current_usd: 'gdp_current_usd',
  gdp_growth_pct: 'gdp_growth_annual_pct',
  population_total: 'population_total',
  fdi_net_inflows_usd: 'fdi_net_inflows_current_usd',
  inflation_cpi_pct: 'inflation_consumer_prices_annual_pct',
  official_exchange_rate: 'fx_rate_usd',
};

async function fetchMetricEstimates(
  countryId: string,
  supabaseAdmin: ReturnType<typeof getAdminClient>
): Promise<MetricEstimateFlags> {
  const { data } = await supabaseAdmin
    .from('souvera_latest_observations_v')
    .select('indicator_key, is_estimate')
    .eq('country_id', countryId)
    .in('indicator_key', [...HEADLINE_ESTIMATE_INDICATORS]);

  const flags: MetricEstimateFlags = {};
  for (const row of data ?? []) {
    if (!row.is_estimate) continue;
    const metricKey = INDICATOR_TO_METRIC[row.indicator_key as string];
    if (metricKey) flags[metricKey] = true;
  }
  return flags;
}

type TradeSnapshotRow = {
  year: number;
  top_trade_partners: unknown;
  top_exports: unknown;
  top_imports: unknown;
  trade_summary_md: string | null;
  total_trade_usd?: number | null;
  exports_usd?: number | null;
  imports_usd?: number | null;
  exports_to_us_usd?: number | null;
  exports_to_us_yoy_pct?: number | null;
  imports_from_us_usd?: number | null;
  imports_from_us_yoy_pct?: number | null;
  source_notes?: string | null;
};

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isCensusBilateralSnapshot(
  row: TradeSnapshotRow,
  metaAgg: Record<string, number | null>
): boolean {
  const notes = (row.source_notes ?? '').toLowerCase();
  if (notes.includes('census')) return true;
  const colBilateral = row.exports_to_us_usd != null || row.imports_from_us_usd != null;
  const colGlobal = row.exports_usd != null || row.imports_usd != null;
  const metaGlobal = metaAgg.exports_usd != null || metaAgg.imports_usd != null;
  return colBilateral && !colGlobal && metaGlobal;
}

function resolveTradeAggregates(row: TradeSnapshotRow): {
  agg: Record<string, number | null>;
  exportsToUsUsd: number | null;
  importsFromUsUsd: number | null;
  globalExports: number | null;
  globalImports: number | null;
  globalTotal: number | null;
  tradeScope: 'global' | 'bilateral_us' | undefined;
  totalTradeUsd: number | null;
  exportsUsd: number | null;
  importsUsd: number | null;
} {
  let metaAgg: Record<string, number | null> = {};
  const summaryMd = row.trade_summary_md ?? '';
  if (summaryMd.startsWith('{"_meta":')) {
    try {
      const firstLine = summaryMd.split('\n')[0];
      metaAgg = JSON.parse(firstLine)._meta ?? {};
    } catch { /* ignore malformed prefix */ }
  }

  const pickColOrMeta = (colKey: keyof TradeSnapshotRow, metaKey: string): number | null => {
    const fromCol = numOrNull(row[colKey]);
    if (fromCol != null) return fromCol;
    return metaAgg[metaKey] ?? null;
  };

  // Census bilateral rows must not blend with legacy global totals embedded in _meta.
  if (isCensusBilateralSnapshot(row, metaAgg)) {
    const exportsToUsUsd = numOrNull(row.exports_to_us_usd) ?? metaAgg.exports_to_us_usd ?? null;
    const importsFromUsUsd = numOrNull(row.imports_from_us_usd) ?? metaAgg.imports_from_us_usd ?? null;
    const hasBilateral = exportsToUsUsd != null || importsFromUsUsd != null;
    const totalTradeUsd = hasBilateral ? (exportsToUsUsd ?? 0) + (importsFromUsUsd ?? 0) : null;

    return {
      agg: metaAgg,
      exportsToUsUsd,
      importsFromUsUsd,
      globalExports: null,
      globalImports: null,
      globalTotal: null,
      tradeScope: hasBilateral ? 'bilateral_us' : undefined,
      totalTradeUsd,
      exportsUsd: exportsToUsUsd,
      importsUsd: importsFromUsUsd,
    };
  }

  const pick = (key: keyof TradeSnapshotRow): number | null => pickColOrMeta(key, key as string);

  const exportsToUsUsd = pick('exports_to_us_usd');
  const importsFromUsUsd = pick('imports_from_us_usd');
  const globalExports = pick('exports_usd');
  const globalImports = pick('imports_usd');
  const globalTotal = pick('total_trade_usd');
  const hasGlobal = globalExports != null || globalImports != null;
  const hasBilateral = exportsToUsUsd != null || importsFromUsUsd != null;
  const tradeScope: 'global' | 'bilateral_us' | undefined = hasGlobal
    ? 'global'
    : hasBilateral
      ? 'bilateral_us'
      : undefined;

  let totalTradeUsd: number | null;
  let exportsUsd: number | null;
  let importsUsd: number | null;

  if (hasGlobal) {
    exportsUsd = globalExports;
    importsUsd = globalImports;
    totalTradeUsd =
      globalExports != null && globalImports != null
        ? globalExports + globalImports
        : globalTotal;
  } else if (hasBilateral) {
    exportsUsd = exportsToUsUsd;
    importsUsd = importsFromUsUsd;
    totalTradeUsd =
      exportsToUsUsd != null || importsFromUsUsd != null
        ? (exportsToUsUsd ?? 0) + (importsFromUsUsd ?? 0)
        : globalTotal;
  } else {
    totalTradeUsd = globalTotal;
    exportsUsd = globalExports;
    importsUsd = globalImports;
  }

  return {
    agg: metaAgg,
    exportsToUsUsd,
    importsFromUsUsd,
    globalExports,
    globalImports,
    globalTotal,
    tradeScope,
    totalTradeUsd,
    exportsUsd,
    importsUsd,
  };
}

/**
 * Fetch CBTPA/CBI market-access metrics for Caribbean markets from souvera_cbtpa_trade_flows.
 * Caribbean markets fall under CBTPA (not AGOA); this populates the preferential-framework
 * slot so the country Trade tab renders a "CBI Market Access" block instead of a blank state.
 * All values are sourced directly from stored flows — no AGOA data is fabricated.
 */
async function fetchCbtpaMarketAccess(
  iso3: string,
  supabaseAdmin: ReturnType<typeof getAdminClient>
): Promise<{
  currentExportsUsd: number;
  totalExportsToUsUsd: number;
  potentialExportsUsd: number;
  eligibleCategories: number;
  dataVintage: number;
} | null> {
  try {
    const { data: flows, error } = await supabaseAdmin
      .from('souvera_cbtpa_trade_flows')
      .select('trade_with_us_usd, total_exports_usd, category_group, cbi_beneficiary, roo_compliant, year, direction')
      .eq('iso3', iso3.toUpperCase())
      .eq('direction', 'exports')
      .order('year', { ascending: false })
      .limit(200);

    if (error || !flows?.length) return null;

    const latestYear = Math.max(...flows.map((f) => (f.year as number) ?? 0));
    const yearFlows = flows.filter((f) => f.year === latestYear);

    const currentExportsUsd = yearFlows.reduce((sum, f) => sum + ((f.trade_with_us_usd as number) ?? 0), 0);
    const potentialExportsUsd = yearFlows.reduce((sum, f) => sum + ((f.total_exports_usd as number) ?? 0), 0);
    const eligibleCategories = new Set(
      yearFlows
        .filter((f) => f.cbi_beneficiary === true || f.roo_compliant === true)
        .map((f) => f.category_group)
        .filter(Boolean)
    ).size;

    if (currentExportsUsd <= 0 && potentialExportsUsd <= 0) return null;

    return {
      currentExportsUsd,
      totalExportsToUsUsd: currentExportsUsd,
      potentialExportsUsd,
      eligibleCategories,
      dataVintage: latestYear,
    };
  } catch (err) {
    console.error('[fetchCbtpaMarketAccess] Error:', err);
    return null;
  }
}

/**
 * GET /api/v1/country/[iso3]
 * Returns country intelligence data filtered by user entitlements.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ iso3: string }> }
) {
  const { iso3 } = await params;
  const iso3Upper = iso3.toUpperCase();

  const supabaseAuth = await createServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const access = await resolveUserAccess(supabaseAuth, user?.id);
  const isAdmin = access.entitlements.includes('admin_access');
  const supabaseAdmin = getAdminClient();

  try {
    const { data: country, error: countryError } = await supabaseAdmin
      .from('souvera_countries')
      .select('id, iso2, iso3, name, region, subregion, capital, currency_code, flag_svg_url')
      .eq('iso3', iso3Upper)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Country not found', iso3: iso3Upper },
        { status: 404 }
      );
    }

    const metrics: CountryIntelligenceResponse['metrics'] = {};

    const { data: liteView } = await supabaseAdmin
      .from('souvera_country_lite_v')
      .select('gdp_current_usd, gdp_growth_pct, population_total')
      .eq('iso3', country.iso3)
      .maybeSingle();

    if (liteView) {
      metrics.gdp_current_usd = liteView.gdp_current_usd;
      metrics.gdp_growth_annual_pct = liteView.gdp_growth_pct;
      metrics.population_total = liteView.population_total;
    }

    if (hasEntitlement(access, 'full_macro') || isAdmin) {
      const { data: proView } = await supabaseAdmin
        .from('souvera_country_professional_v')
        .select('fdi_net_inflows_usd, inflation_cpi_pct, fx_to_usd')
        .eq('iso3', country.iso3)
        .maybeSingle();

      if (proView) {
        metrics.fdi_net_inflows_current_usd = proView.fdi_net_inflows_usd;
        metrics.inflation_consumer_prices_annual_pct = proView.inflation_cpi_pct;
        metrics.fx_rate_usd = proView.fx_to_usd;
      }

      // Nigeria parallel market rate (post-2023 reform context)
      if (country.iso3 === 'NGA' && proView?.fx_to_usd) {
        metrics.fx_rate_parallel_usd = Math.round(proView.fx_to_usd * 1.15);
      }
    }

    const { data: signalData } = await supabaseAdmin
      .from('souvera_country_signal_scores')
      .select('*')
      .eq('country_id', country.id)
      .maybeSingle();

    const { data: profileData } = await supabaseAdmin
      .from('souvera_country_profiles')
      .select('*')
      .eq('country_id', country.id)
      .maybeSingle();

    const resolvedMomentum = resolveMomentum({
      profileMomentum: profileData?.economic_momentum as string | null,
      profileReadiness: profileData?.investor_readiness as string | null,
      investmentScore: (signalData?.investment_score as number | null) ?? null,
      growthScore: (signalData?.growth_score as number | null) ?? null,
      gdpGrowthPct: metrics.gdp_growth_annual_pct ?? null,
    });

    const momentumBand = getMomentumBand(resolvedMomentum.economicMomentum, country.iso3);

    const momentum =
      profileData || signalData || resolvedMomentum.economicMomentum != null
        ? {
            economicMomentum: resolvedMomentum.economicMomentum,
            investorReadiness: resolvedMomentum.investorReadiness,
            bandLabel: momentumBand.label,
            bandClause: momentumBand.clause,
          }
        : null;

    let newsData: Record<string, unknown> | null = null;

    async function fetchLatestNews(filterPublished: boolean) {
      let query = supabaseAdmin
        .from('souvera_country_news_signals')
        .select('*')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .eq('country_id', country!.id)
        .order('signal_date', { ascending: false })
        .limit(1);

      if (filterPublished) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query.maybeSingle();
      return { data, error };
    }

    if (!isAdmin) {
      const { data: published, error: publishedError } = await fetchLatestNews(true);

      if (publishedError?.message?.includes('status')) {
        const { data: legacy } = await fetchLatestNews(false);
        newsData = legacy;
      } else if (published) {
        newsData = published;
      } else {
        // Pilot fallback: show latest ingest when nothing published yet
        const { data: latest } = await fetchLatestNews(false);
        newsData = latest;
      }
    } else {
      const { data: latest } = await fetchLatestNews(false);
      newsData = latest;
    }

    const newsPulse = newsData
      ? (() => {
          let headlines = (newsData.top_headlines as NewsHeadline[] | null) ?? [];
          const filterCfg = newsPulseFilterConfig(country.iso3);
          if (filterCfg && headlines.length) {
            headlines = filterStoredHeadlines(headlines, filterCfg);
          }
          return {
            sentimentScore: (newsData.sentiment_score as number | null) ?? null,
            riskIntensity: (newsData.risk_intensity as number | null) ?? null,
            opportunityIntensity: (newsData.opportunity_intensity as number | null) ?? null,
            headlineCount: headlines.length || ((newsData.headline_count as number | null) ?? null),
            topHeadlines: headlines,
            pending:
              newsData.sentiment_score == null &&
              newsData.risk_intensity == null &&
              newsData.opportunity_intensity == null,
          };
        })()
      : { sentimentScore: null, riskIntensity: null, opportunityIntensity: null, pending: true };

    let sectors: CountryIntelligenceResponse['sectors'] = [];

    const { data: sectorsData } = await supabaseAdmin
      .from('souvera_country_sectors')
      .select('*')
      .eq('country_id', country.id)
      .eq('row_status', 'active')
      .order('display_order', { ascending: true });

    if (sectorsData?.length) {
      sectors = sectorsData.map((sector: Record<string, unknown>) => ({
        sectorKey: sector.sector_key as string,
        sectorLabel: sector.sector_label as string,
        iconEmoji: sector.icon_emoji as string | undefined,
        displayOrder: sector.display_order as number | undefined,
        teaser: sector.teaser as string | undefined,
        ...(hasEntitlement(access, 'full_macro') || isAdmin
          ? {
              strengthScore: sector.strength_score as number | undefined,
              growthScore: sector.growth_score as number | undefined,
              attractivenessScore: sector.attractiveness_score as number | undefined,
            }
          : {}),
        ...(hasEntitlement(access, 'sector_rationale') || isAdmin
          ? {
              narrativeShort: sector.narrative_short as string | undefined,
              narrativeFull: sector.narrative_full as string | undefined,
            }
          : {}),
        keyPlayers: normalizeKeyPlayers(sector.key_players, sector.sector_label as string),
        ...(hasEntitlement(access, 'trade_data') || isAdmin
          ? {
              agoaOpportunity: sector.agoa_opportunity as string | undefined,
              agoaExportCurrentUsd: sector.agoa_export_current_usd as number | undefined,
              agoaExportPotentialUsd: sector.agoa_export_potential_usd as number | undefined,
            }
          : {}),
        dataSources: (sector.data_sources as string[]) || [],
        updatedAt: sector.updated_at as string | undefined,
      }));
    }

    const narrative: CountryIntelligenceResponse['narrative'] = {};

    if (profileData) {
      if (hasEntitlement(access, 'sector_teasers')) {
        narrative.summary = hasEntitlement(access, 'full_macro') || isAdmin
          ? profileData.summary_md
          : profileData.summary_md?.substring(0, 200) + '...';
      }
      if (hasEntitlement(access, 'full_macro') || isAdmin) {
        narrative.whyNow = profileData.why_now_md;
      }
      if (hasEntitlement(access, 'investment_thesis') || isAdmin) {
        narrative.opportunityThesis = profileData.opportunity_thesis_md;
      }
      if (hasEntitlement(access, 'risk_analysis') || isAdmin) {
        narrative.riskNarrative = profileData.risk_narrative_md;
      }
    }

    let trade: CountryIntelligenceResponse['trade'] = null;
    let tradeMetaAgg: Record<string, number | null> = {};
    if (hasEntitlement(access, 'trade_data') || isAdmin) {
      const { data: snapshotRow } = await supabaseAdmin
        .from('souvera_country_trade_snapshots')
        .select(
          'year, top_trade_partners, top_exports, top_imports, trade_summary_md, total_trade_usd, exports_usd, imports_usd, exports_to_us_usd, exports_to_us_yoy_pct, imports_from_us_usd, imports_from_us_yoy_pct, source_notes'
        )
        .eq('country_id', country.id)
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (snapshotRow) {
        const resolved = resolveTradeAggregates(snapshotRow as TradeSnapshotRow);
        tradeMetaAgg = resolved.agg;

        const partners = ((snapshotRow.top_trade_partners as any[]) ?? []).map((p: any) => ({
          country: p.country,
          flag: p.flag ?? '',
          exportsUsd: p.exports_usd ?? undefined,
          importsUsd: p.imports_usd ?? undefined,
          totalUsd: p.total_usd,
          sharePct: p.share_pct,
          badge: p.badge ?? undefined,
        }));

        trade = {
          asOfYear: snapshotRow.year,
          tradeScope: resolved.tradeScope,
          dataSource: (snapshotRow.source_notes as string) ?? undefined,
          totalTradeUsd: resolved.totalTradeUsd,
          exportsUsd: resolved.exportsUsd,
          importsUsd: resolved.importsUsd,
          exportsToUs: resolved.exportsToUsUsd != null
            ? {
                year: snapshotRow.year,
                valueUsd: resolved.exportsToUsUsd,
                yoyPct: numOrNull(snapshotRow.exports_to_us_yoy_pct) ?? resolved.agg.exports_to_us_yoy_pct ?? null,
                source: {
                  ...CENSUS_SOURCE,
                  asOfYear: snapshotRow.year as number,
                },
              }
            : undefined,
          importsFromUs: resolved.importsFromUsUsd != null
            ? {
                year: snapshotRow.year,
                valueUsd: resolved.importsFromUsUsd,
                yoyPct: numOrNull(snapshotRow.imports_from_us_yoy_pct) ?? resolved.agg.imports_from_us_yoy_pct ?? null,
                source: {
                  ...CENSUS_SOURCE,
                  asOfYear: snapshotRow.year as number,
                },
              }
            : undefined,
          topPartners: partners,
          exportComposition: ((snapshotRow.top_exports as any[]) ?? []).map((s: any) => ({
            sector: s.sector,
            sharePct: s.share_pct,
          })),
          importComposition: ((snapshotRow.top_imports as any[]) ?? []).map((s: any) => ({
            sector: s.sector,
            sharePct: s.share_pct,
          })),
          agoa: undefined, // merged from vault below
        } as CountryIntelligenceResponse['trade'];
      } else {
        trade = { pending: true } as CountryIntelligenceResponse['trade'];
      }
    }

    let timeSeries: CountryIntelligenceResponse['timeSeries'] = null;

    if (hasEntitlement(access, 'full_macro') || isAdmin) {
      const { data: observations } = await supabaseAdmin
        .from('souvera_country_observations')
        .select(`
          period_date,
          value_numeric,
          value_text,
          indicator_id,
          souvera_indicators (key, label, unit)
        `)
        .eq('country_id', country.id)
        .gte('period_date', '2020-01-01')
        .lte('period_date', '2025-12-31')
        .eq('period_type', 'annual')
        .order('period_date', { ascending: true });

      if (observations?.length) {
        const years = buildEconomyYearsFromObservations(
          observations as Parameters<typeof buildEconomyYearsFromObservations>[0]
        );
        timeSeries = { years };

        if (hasEntitlement(access, 'forecast_metrics') || isAdmin) {
          const forecast = COUNTRY_FORECASTS[country.iso3];
          if (forecast?.length) {
            timeSeries.forecast = forecast;
          }
        }
      }
    }

    const freshness = {
      updatedAt: profileData?.updated_at || new Date().toISOString(),
      sources: [
        { key: 'world_bank', name: 'World Bank' },
        { key: 'imf', name: 'IMF' },
        { key: 'un_comtrade', name: 'UN Comtrade' },
      ],
    };

    const sourceMeta =
      (hasEntitlement(access, 'full_macro') || isAdmin) && timeSeries?.years.length
        ? buildCountrySourceMeta(country.iso2, timeSeries.years, freshness.updatedAt)
        : undefined;

    const signal = resolveSignal(signalData, profileData?.signal_level);

    const topSectorRow = sectorsData?.length
      ? [...sectorsData].sort(
          (a, b) => ((b.strength_score as number) ?? 0) - ((a.strength_score as number) ?? 0)
        )[0]
      : null;

    const signalScan = buildSignalScan({
      iso3: country.iso3,
      signalLevel: signal?.level ?? 'stable',
      metrics,
      topSectorLabel: (topSectorRow?.sector_label as string) ?? null,
    });

    const signalWithScan: CountryIntelligenceResponse['signal'] = {
      ...(signal ?? {}),
      level: signal?.level ?? 'stable',
      investmentScore: signal?.investmentScore ?? null,
      confidenceScore: signal?.confidenceScore ?? null,
      scan: signalScan,
    };

    const officialReferences = await fetchExternalReferencesForEntity(country.iso3, [
      'USTR_COUNTRY_PAGE',
    ]);
    const ustrTradeSummary = !isApprovedCaribbeanMarket(country.iso3)
      ? await fetchUstrTradeSummaryForCountry(country.iso3)
      : undefined;

    const marketAccess = await resolveMarketAccessForCountry(country.iso3);
    const policyRecords = await resolvePolicyStatusRegistry(country.iso3);
    const agoaRecord = policyRecords.find((r) => r.framework === 'AGOA');
    const agoaPolicy = agoaRecord
      ? policyRecordToAgoaUiSnapshot(agoaRecord)
      : undefined;

    if (trade && agoaPolicy && !isApprovedCaribbeanMarket(country.iso3)) {
      // North African countries are outside AGOA geographic scope - don't show AGOA card
      if (agoaPolicy.agoaStatus === 'not_applicable') {
        trade = {
          ...trade,
          agoa: {
            status: 'not_applicable',
            statusNote: agoaPolicy.notes ?? 'This country is outside the AGOA geographic scope.',
            currentExportsUsd: undefined,
            potentialExportsUsd: undefined,
            eligibleCategories: undefined,
          },
        };
      } else if (agoaPolicy.agoaStatus === 'ineligible') {
        // Sub-Saharan but not a current AGOA beneficiary (e.g. terminated/never designated).
        trade = {
          ...trade,
          agoa: {
            status: 'ineligible',
            statusNote:
              agoaPolicy.notes ??
              'Not a current AGOA beneficiary. Exports to the U.S. operate under MFN tariff rates pending re-designation.',
            currentExportsUsd: undefined,
            potentialExportsUsd: undefined,
            eligibleCategories: undefined,
          },
        };
      } else {
        const restoration =
          agoaPolicy.agoaStatus === 'suspended' ||
          agoaPolicy.statusLabel.toLowerCase().includes('suspend');

        const agoaMetrics = await fetchAgoaMetrics(
          country.iso3,
          supabaseAdmin,
          !restoration && agoaPolicy.agoaStatus === 'eligible'
        );

        const metaCurrent = tradeMetaAgg.agoa_current_exports_usd ?? undefined;
        const metaPotential = tradeMetaAgg.agoa_potential_exports_usd ?? undefined;
        const metaCategories = tradeMetaAgg.agoa_eligible_categories ?? undefined;
        const dbCurrent = agoaMetrics?.currentAgoaExportsUsd ?? 0;
        const resolvedCurrent =
          dbCurrent > 0 ? dbCurrent : metaCurrent;

        const resolvedTotal = agoaMetrics?.totalExportsToUsUsd;
        const resolvedPotential = restoration
          ? (agoaMetrics?.restorationPotentialUsd ?? metaPotential)
          : (metaPotential ?? agoaMetrics?.restorationPotentialUsd);

        // Only render the AGOA metrics card when we have at least one real figure. Markets that
        // are AGOA-eligible/under-review but have no trade-flow data yet fall through to the
        // legislative-tracker-only state instead of showing an N/A-filled "AGOA Advantage" card.
        const hasAgoaFigures =
          (resolvedCurrent ?? 0) > 0 ||
          (resolvedPotential ?? 0) > 0 ||
          (resolvedTotal ?? 0) > 0;

        if (hasAgoaFigures) {
          const flowYear = agoaMetrics?.dataVintage ?? trade.asOfYear;
          trade = {
            ...trade,
            agoa: {
              status: restoration ? 'restoration_opportunity' : 'eligible',
              statusNote: agoaPolicy.notes,
              totalExportsToUsUsd: resolvedTotal,
              currentExportsUsd: resolvedCurrent,
              potentialExportsUsd: resolvedPotential,
              restorationPotentialUsd: agoaMetrics?.restorationPotentialUsd ?? metaPotential,
              eligibleCategories: agoaMetrics?.eligibleCategories ?? metaCategories,
              dataSource: agoaMetrics?.dataSource ?? 'USITC / category trade flows',
              dataVintage: flowYear,
              metricsSource: agoaMetrics
                ? {
                    ...CATEGORY_FLOW_SOURCE,
                    asOfYear: typeof flowYear === 'number' ? flowYear : undefined,
                  }
                : undefined,
              trend: agoaMetrics?.trend,
            },
          };
        }
      }
    }

    // Caribbean markets fall under CBTPA/CBI (not AGOA). Always populate from CBTPA flows,
    // overriding any stale AGOA policy bleed from the Evidence Vault registry.
    if (trade && isApprovedCaribbeanMarket(country.iso3)) {
      const cbi = await fetchCbtpaMarketAccess(country.iso3, supabaseAdmin);
      if (cbi) {
        trade = {
          ...trade,
          agoa: {
            status: 'eligible',
            statusNote:
              'Preferential U.S. market access under the Caribbean Basin Trade Partnership Act (CBTPA) and CBI/CARICOM frameworks.',
            totalExportsToUsUsd: cbi.totalExportsToUsUsd ?? trade.exportsToUs?.valueUsd,
            currentExportsUsd: cbi.currentExportsUsd,
            potentialExportsUsd: cbi.potentialExportsUsd,
            eligibleCategories: cbi.eligibleCategories,
            dataSource: 'USTR CBI Program · ITC Trade Map',
            dataVintage: cbi.dataVintage ?? trade.asOfYear,
          },
        };
      } else if (trade.exportsToUs?.valueUsd != null) {
        trade = {
          ...trade,
          agoa: {
            status: 'eligible',
            statusNote:
              'CBI/CARICOM preferential access applies; bilateral totals from U.S. Census Bureau.',
            totalExportsToUsUsd: trade.exportsToUs.valueUsd,
            currentExportsUsd: undefined,
            potentialExportsUsd: undefined,
            dataSource: trade.dataSource ?? 'U.S. Census Bureau',
            dataVintage: trade.asOfYear,
          },
        };
      }
    }

    if (
      trade?.exportsToUs?.valueUsd != null &&
      trade.agoa?.totalExportsToUsUsd != null
    ) {
      const recon = buildTradeSourceReconciliation(
        trade.exportsToUs.valueUsd,
        trade.agoa.totalExportsToUsUsd,
        trade.exportsToUs.year ?? trade.asOfYear ?? new Date().getFullYear(),
        {
          categoryFlowYear: trade.agoa.dataVintage,
        }
      );
      if (recon) {
        trade = { ...trade, sourceReconciliation: recon };
      }
    }

    const metricEstimates = await fetchMetricEstimates(country.id, supabaseAdmin);

    const response: CountryIntelligenceResponse = {
      country: {
        iso3: country.iso3,
        iso2: country.iso2,
        name: country.name,
        flagUrl: country.flag_svg_url,
        region: country.region,
        subregion: country.subregion,
        capital: country.capital,
        currencyCode: country.currency_code,
      },
      metrics,
      metricEstimates: Object.keys(metricEstimates).length ? metricEstimates : undefined,
      signal: signalWithScan,
      momentum,
      newsPulse,
      sectors,
      narrative,
      trade,
      timeSeries,
      freshness,
      sourceMeta,
      marketAccess: marketAccess.length ? marketAccess : undefined,
      agoaPolicy,
      officialReferences: officialReferences.length ? officialReferences : undefined,
      ustrTradeSummary,
      meta: {
        accessTier: access.planId,
        authenticated: access.isAuthenticated,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[/api/v1/country/[iso3]] Error:', message, error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { detail: message } : {}),
      },
      { status: 500 }
    );
  }
}
