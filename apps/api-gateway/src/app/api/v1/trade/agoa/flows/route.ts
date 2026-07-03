/**
 * GET /api/v1/trade/agoa/flows
 * Query params: group, iso3, year (default 2023), eligible
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEntitlement } from '@/lib/access/server-entitlements';
import { fetchAgoaEligibilityMap } from '@/lib/intelligence/trade-policy-vault';
import { countryDisplayName } from '@/lib/intelligence/country-names';
import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';
import {
  AGOA_FLOW_CATEGORY_GROUPS,
  AGOA_FLOW_CATEGORY_LABELS,
  type AgoaFlowCategoryGroup,
} from '@/lib/trade/agoa-flow-categories';
import {
  buildCountryMetricsFromRows,
  isPreferentialExcludedCategory,
  resolveAgoaExportsUsd,
  resolveTariffSavingsUsd,
  sumPreferentialTariffSavings,
} from '@/lib/trade/agoa-flow-metrics';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase credentials for service client');
  }
  return createClient(url, key);
}

type DataQualityTier = 'A' | 'B' | 'C';

interface AGOAFlowRow {
  id: string;
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  agoa_eligible: boolean;
  agoa_status: 'eligible' | 'suspended' | 'graduated';
  eligibility_since: number | null;
  year: number;
  hs_chapter: string;
  category_group: string;
  category_label: string;
  total_exports_to_us_usd: number | null;
  agoa_exports_usd: number | null;
  agoa_share_pct: number | null;
  non_agoa_exports_usd: number | null;
  mfn_tariff_pct: number | null;
  tariff_savings_usd: number | null;
  is_textile_apparel: boolean;
  third_country_fabric_eligible: boolean;
  yoy_growth_pct: number | null;
  top_products: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number; agoaEligible: boolean }>;
  us_total_imports_usd: number | null;
  country_share_of_us_imports_pct: number | null;
  competitor_suppliers: Array<{ iso3: string; country: string; valueUsd: number; sharePct: number }>;
  source_notes: string | null;
  data_quality_tier: DataQualityTier;
}

interface CountryMeta {
  iso3: string;
  name: string;
  region: string;
  subregion: string;
}

function resolveCountryName(
  iso3: string,
  storedName: string | null | undefined,
  countryMap: Map<string, CountryMeta>,
): string {
  return storedName?.trim()
    || countryMap.get(iso3)?.name
    || countryDisplayName(iso3);
}

function resolveAgoaStatus(
  vault: ReturnType<Awaited<ReturnType<typeof fetchAgoaEligibilityMap>>['get']> extends infer V ? V : never,
  rowStatus: string,
): 'eligible' | 'suspended' | 'graduated' {
  if (!vault) return rowStatus as 'eligible' | 'suspended' | 'graduated';
  if (vault.agoaStatus === 'eligible') return 'eligible';
  if (vault.agoaStatus === 'suspended') return 'suspended';
  return rowStatus as 'eligible' | 'suspended' | 'graduated';
}

function scaffoldMissingCountryRows(
  rows: AGOAFlowRow[],
  countryMap: Map<string, CountryMeta>,
  eligibilityMap: Awaited<ReturnType<typeof fetchAgoaEligibilityMap>>,
  yearFilter: number,
  categoryGroups: readonly string[],
): AGOAFlowRow[] {
  const existingKeys = new Set(rows.map((r) => `${r.iso3}:${r.category_group}`));
  const scaffolded: AGOAFlowRow[] = [];

  for (const iso3 of APPROVED_AFRICA_ISO3) {
    const meta = countryMap.get(iso3);
    const vault = eligibilityMap.get(iso3);
    const agoaEligible = vault ? vault.eligible : true;
    const agoaStatus = resolveAgoaStatus(vault, agoaEligible ? 'eligible' : 'suspended');

    for (const categoryGroup of categoryGroups) {
      if (existingKeys.has(`${iso3}:${categoryGroup}`)) continue;

      scaffolded.push({
        id: `scaffold-${iso3}-${categoryGroup}-${yearFilter}`,
        iso3,
        country_name: meta?.name ?? countryDisplayName(iso3),
        region: meta?.region ?? 'Africa',
        sub_region: meta?.subregion ?? '',
        agoa_eligible: agoaEligible,
        agoa_status: agoaStatus,
        eligibility_since: vault?.eligibilitySince ?? vault?.suspensionSinceYear ?? null,
        year: yearFilter,
        hs_chapter: '',
        category_group: categoryGroup,
        category_label: AGOA_FLOW_CATEGORY_LABELS[categoryGroup as AgoaFlowCategoryGroup] ?? categoryGroup,
        total_exports_to_us_usd: 0,
        agoa_exports_usd: 0,
        agoa_share_pct: 0,
        non_agoa_exports_usd: 0,
        mfn_tariff_pct: null,
        tariff_savings_usd: null,
        is_textile_apparel: categoryGroup === 'textiles_apparel',
        third_country_fabric_eligible: false,
        yoy_growth_pct: null,
        top_products: [],
        us_total_imports_usd: null,
        country_share_of_us_imports_pct: null,
        competitor_suppliers: [],
        source_notes: 'No reported exports in this category for the reference year',
        data_quality_tier: 'C',
      });
    }
  }

  return [...rows, ...scaffolded];
}

function mapDbRow(
  r: Record<string, unknown>,
  countryMap: Map<string, CountryMeta>,
  eligibilityMap: Awaited<ReturnType<typeof fetchAgoaEligibilityMap>>,
): AGOAFlowRow {
  const vault = eligibilityMap.get(r.iso3 as string);
  const agoaEligible = vault ? vault.eligible : r.agoa_eligible === true;
  const agoaStatus = resolveAgoaStatus(vault, r.agoa_status as string);
  const eligibilitySince = vault?.eligibilitySince ?? vault?.suspensionSinceYear ?? r.eligibility_since;
  const categoryGroup = r.category_group as string;
  const storedAgoa = r.agoa_exports_usd as number | null;
  const mfnTariff = r.mfn_tariff_pct as number | null;
  const storedSavings = r.tariff_savings_usd as number | null;

  const agoaExports = resolveAgoaExportsUsd(categoryGroup, agoaEligible, storedAgoa);
  const tariffSavings = resolveTariffSavingsUsd(
    categoryGroup,
    agoaEligible,
    agoaExports,
    mfnTariff,
    storedSavings,
  );

  const totalExports = r.total_exports_to_us_usd as number | null;
  const countryName = resolveCountryName(r.iso3 as string, r.country_name as string, countryMap);

  return {
    id: r.id as string,
    iso3: r.iso3 as string,
    country_name: countryName,
    region: (r.region as string) || countryMap.get(r.iso3 as string)?.region || 'Africa',
    sub_region: (r.sub_region as string) || countryMap.get(r.iso3 as string)?.subregion || '',
    agoa_eligible: agoaEligible,
    agoa_status: agoaStatus,
    eligibility_since: eligibilitySince as number | null,
    year: r.year as number,
    hs_chapter: r.hs_chapter as string,
    category_group: categoryGroup,
    category_label: r.category_label as string,
    total_exports_to_us_usd: totalExports,
    agoa_exports_usd: agoaExports,
    agoa_share_pct: totalExports && agoaExports
      ? Math.round((agoaExports / totalExports) * 1000) / 10
      : (r.agoa_share_pct as number | null) ?? 0,
    non_agoa_exports_usd: totalExports
      ? totalExports - agoaExports
      : (r.non_agoa_exports_usd as number | null),
    mfn_tariff_pct: mfnTariff,
    tariff_savings_usd: tariffSavings,
    is_textile_apparel: r.is_textile_apparel as boolean,
    third_country_fabric_eligible: r.third_country_fabric_eligible as boolean,
    yoy_growth_pct: r.yoy_growth_pct as number | null,
    top_products: (r.top_products as AGOAFlowRow['top_products']) || [],
    us_total_imports_usd: r.us_total_imports_usd as number | null,
    country_share_of_us_imports_pct: r.country_share_of_us_imports_pct as number | null,
    competitor_suppliers: (r.competitor_suppliers as AGOAFlowRow['competitor_suppliers']) || [],
    source_notes: r.source_notes as string | null,
    data_quality_tier: (r.data_quality_tier as DataQualityTier) || 'B',
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireEntitlement('trade_data');

    const { searchParams } = new URL(request.url);
    const groupFilter = searchParams.get('group');
    const iso3Filter = searchParams.get('iso3');
    const yearFilter = parseInt(searchParams.get('year') || '2023', 10);
    const eligibleFilter = searchParams.get('eligible');

    const supabase = getServiceClient();

    const [{ data, error }, { data: countries }] = await Promise.all([
      (async () => {
        let query = supabase
          .from('souvera_agoa_trade_flows')
          .select('*')
          .eq('year', yearFilter)
          .order('total_exports_to_us_usd', { ascending: false, nullsFirst: false });

        if (groupFilter) query = query.eq('category_group', groupFilter);
        if (iso3Filter) query = query.eq('iso3', iso3Filter.toUpperCase());
        if (eligibleFilter === 'true') query = query.eq('agoa_eligible', true);
        else if (eligibleFilter === 'false') query = query.eq('agoa_eligible', false);

        return query;
      })(),
      supabase
        .from('souvera_countries')
        .select('iso3, name, region, subregion')
        .in('iso3', [...APPROVED_AFRICA_ISO3]),
    ]);

    if (error) {
      console.error('[agoa-flows] Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    const countryMap = new Map<string, CountryMeta>(
      (countries ?? []).map((c) => [c.iso3, c as CountryMeta]),
    );
    const eligibilityMap = await fetchAgoaEligibilityMap();

    let rows: AGOAFlowRow[] = (data || []).map((r) => mapDbRow(r, countryMap, eligibilityMap));

    const categoryGroupsFromData = [...new Set(rows.map((r) => r.category_group))];
    const categoryGroups = categoryGroupsFromData.length > 0
      ? categoryGroupsFromData
      : [...AGOA_FLOW_CATEGORY_GROUPS];

    if (!iso3Filter) {
      rows = scaffoldMissingCountryRows(rows, countryMap, eligibilityMap, yearFilter, categoryGroups);
    }

    const preferentialRows = rows.filter((r) => !isPreferentialExcludedCategory(r.category_group));
    const totalExportsToUs = rows.reduce((s, r) => s + (r.total_exports_to_us_usd ?? 0), 0);
    const totalAgoaExports = preferentialRows.reduce((s, r) => s + (r.agoa_exports_usd ?? 0), 0);
    const totalTariffSavings = sumPreferentialTariffSavings(
      rows.map((r) => ({
        ...r,
        tariff_savings_usd: r.tariff_savings_usd,
        category_group: r.category_group,
      })),
    );

    const marketsCount = new Set(rows.map((r) => r.iso3)).size;
    const eligibleCount = new Set(rows.filter((r) => r.agoa_eligible).map((r) => r.iso3)).size;

    const categoryGroupTotals: Record<string, {
      total_exports_usd: number;
      agoa_exports_usd: number;
      tariff_savings_usd: number;
      country_count: number;
    }> = {};

    for (const r of rows) {
      if (!categoryGroupTotals[r.category_group]) {
        categoryGroupTotals[r.category_group] = {
          total_exports_usd: 0,
          agoa_exports_usd: 0,
          tariff_savings_usd: 0,
          country_count: 0,
        };
      }
      categoryGroupTotals[r.category_group].total_exports_usd += r.total_exports_to_us_usd ?? 0;
      categoryGroupTotals[r.category_group].agoa_exports_usd += r.agoa_exports_usd ?? 0;
      categoryGroupTotals[r.category_group].tariff_savings_usd += r.tariff_savings_usd ?? 0;
      categoryGroupTotals[r.category_group].country_count += 1;
    }

    const countryTotals: Record<string, { name: string; total: number; agoa: number }> = {};
    for (const r of rows) {
      if (!countryTotals[r.iso3]) {
        countryTotals[r.iso3] = {
          name: resolveCountryName(r.iso3, r.country_name, countryMap),
          total: 0,
          agoa: 0,
        };
      }
      countryTotals[r.iso3].total += r.total_exports_to_us_usd ?? 0;
      if (!isPreferentialExcludedCategory(r.category_group)) {
        countryTotals[r.iso3].agoa += r.agoa_exports_usd ?? 0;
      }
    }

    const topExporters = Object.entries(countryTotals)
      .filter(([, stats]) => stats.total > 0)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10)
      .map(([iso3, stats]) => ({ iso3, ...stats }));

    const africaMarkets = [...APPROVED_AFRICA_ISO3] as string[];
    const dbRows = rows.filter((r) => !r.id.startsWith('scaffold-'));
    const scaffoldRows = rows.length - dbRows.length;
    const nullMetricMarkets = new Set(
      africaMarkets.filter((iso3) => {
        const marketRows = dbRows.filter((r) => r.iso3 === iso3);
        return marketRows.length === 0 || marketRows.every((r) => (r.total_exports_to_us_usd ?? 0) === 0);
      }),
    );

    const countryMetrics: Record<string, {
      restoration_potential_usd: number;
      current_tariff_savings_usd: number;
      current_agoa_exports_usd: number;
    }> = {};

    const dbRowsForMetrics = rows.filter((r) => !r.id.startsWith('scaffold-'));
    for (const iso3 of new Set(dbRowsForMetrics.map((r) => r.iso3))) {
      const vaultEligible = eligibilityMap.get(iso3)?.eligible ?? false;
      const metrics = buildCountryMetricsFromRows(
        iso3,
        dbRowsForMetrics.map((r) => ({
          iso3: r.iso3,
          year: r.year,
          total_exports_to_us_usd: r.total_exports_to_us_usd,
          agoa_exports_usd: r.agoa_exports_usd,
          agoa_share_pct: r.agoa_share_pct,
          category_group: r.category_group,
          tariff_savings_usd: r.tariff_savings_usd,
          mfn_tariff_pct: r.mfn_tariff_pct,
        })),
        vaultEligible,
        yearFilter,
      );
      countryMetrics[iso3] = {
        restoration_potential_usd: metrics.restorationPotentialUsd,
        current_tariff_savings_usd: metrics.currentTariffSavingsUsd,
        current_agoa_exports_usd: metrics.currentAgoaExportsUsd,
      };
    }

    return NextResponse.json({
      rows,
      summary: {
        record_count: rows.length,
        total_exports_to_us_usd: totalExportsToUs,
        total_agoa_exports_usd: totalAgoaExports,
        agoa_share_pct: totalExportsToUs > 0
          ? Math.round((totalAgoaExports / totalExportsToUs) * 1000) / 10
          : 0,
        total_tariff_savings_usd: totalTariffSavings,
        markets_covered: marketsCount,
        eligible_markets: eligibleCount,
        suspended_markets: marketsCount - eligibleCount,
        category_group_totals: categoryGroupTotals,
        top_exporters: topExporters,
        country_metrics: countryMetrics,
        data_vintage: `${yearFilter}`,
        data_gaps: {
          scaffold_rows: scaffoldRows,
          markets_no_db_data: [...nullMetricMarkets],
          markets_with_db_data: africaMarkets.length - nullMetricMarkets.size,
          expected_markets: africaMarkets.length,
          expected_categories: AGOA_FLOW_CATEGORY_GROUPS.length,
        },
      },
      attribution: {
        sources: ['USITC DataWeb', 'US Census Foreign Trade', 'USTR AGOA Reports'],
        note: 'AGOA trade flow data tracking African exports to the United States under preferential treatment.',
      },
    });
  } catch (e) {
    console.error('[agoa-flows] Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
