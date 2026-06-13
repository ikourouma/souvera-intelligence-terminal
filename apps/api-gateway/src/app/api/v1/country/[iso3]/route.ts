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
import type { CountryIntelligenceResponse, NewsHeadline } from '@/types/country-intelligence';
import { buildEconomyYearsFromObservations } from '@/lib/intelligence/build-economy-years';
import { buildCountrySourceMeta } from '@/lib/intelligence/country-source-meta';
import {
  policyRecordToAgoaUiSnapshot,
  resolveMarketAccessForCountry,
} from '@/lib/intelligence/trade-policy-vault';
import { resolvePolicyStatusRegistry } from '@/lib/reports/policy-status-registry';
import { fetchExternalReferencesForEntity } from '@/lib/external-references';
import type { SignalLevel } from '@/lib/intelligence-entitlements';

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
        keyPlayers: (sector.key_players as CountryIntelligenceResponse['sectors'][0]['keyPlayers']) || [],
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
    if (hasEntitlement(access, 'trade_data') || isAdmin) {
      const { data: snapshotRow } = await supabaseAdmin
        .from('souvera_country_trade_snapshots')
        .select('year, top_trade_partners, top_exports, top_imports, trade_summary_md')
        .eq('country_id', country.id)
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (snapshotRow) {
        // Parse JSON meta prefix embedded by static-trade-migration for aggregate totals
        // (used until alter-trade-snapshots-add-columns migration adds explicit columns)
        let agg: Record<string, number | null> = {};
        const summaryMd = (snapshotRow.trade_summary_md as string) ?? '';
        if (summaryMd.startsWith('{"_meta":')) {
          try {
            const firstLine = summaryMd.split('\n')[0];
            agg = JSON.parse(firstLine)._meta ?? {};
          } catch { /* fall through — agg stays empty */ }
        }

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
          totalTradeUsd: agg.total_trade_usd ?? null,
          exportsUsd: agg.exports_usd ?? null,
          importsUsd: agg.imports_usd ?? null,
          exportsToUs: agg.exports_to_us_usd != null
            ? { year: snapshotRow.year, valueUsd: agg.exports_to_us_usd, yoyPct: agg.exports_to_us_yoy_pct ?? null }
            : undefined,
          importsFromUs: agg.imports_from_us_usd != null
            ? { year: snapshotRow.year, valueUsd: agg.imports_from_us_usd, yoyPct: agg.imports_from_us_yoy_pct ?? null }
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

    const marketAccess = await resolveMarketAccessForCountry(country.iso3);
    const policyRecords = await resolvePolicyStatusRegistry(country.iso3);
    const agoaRecord = policyRecords.find((r) => r.framework === 'AGOA');
    const agoaPolicy = agoaRecord
      ? policyRecordToAgoaUiSnapshot(agoaRecord)
      : undefined;

    if (trade && agoaPolicy) {
      const restoration =
        agoaPolicy.agoaStatus === 'suspended' ||
        agoaPolicy.statusLabel.toLowerCase().includes('suspend');
      trade = {
        ...trade,
        agoa: {
          status: restoration ? 'restoration_opportunity' : 'eligible',
          statusNote: agoaPolicy.notes,
          currentExportsUsd: trade.agoa?.currentExportsUsd,
          potentialExportsUsd: trade.agoa?.potentialExportsUsd,
          eligibleCategories: trade.agoa?.eligibleCategories,
        },
      };
    }

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
