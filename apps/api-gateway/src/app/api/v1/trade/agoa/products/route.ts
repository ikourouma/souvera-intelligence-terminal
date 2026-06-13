import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';
import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';
import { fetchAgoaApiRowsFromVault } from '@/lib/intelligence/trade-policy-vault';
import {
  AGOA_PRIORITY_PRODUCTS,
  PRODUCT_ENRICHMENT,
  MFN_RATE_LOOKUP,
  filterPriorityProducts,
  PRIORITY_CATALOG_SECTORS,
  type AgoaStrategicType,
} from '@/lib/trade/agoa-priority-products';
import { SECTOR_TAXONOMY } from '@/lib/sectors/sector-taxonomy';

const SECTOR_LABEL_MAP = Object.fromEntries(
  SECTOR_TAXONOMY.map((e) => [e.sectorKey, e.label])
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iso3 = searchParams.get('iso3')?.toUpperCase();
    const sectorKey = searchParams.get('sector') ?? '';
    const strategicType = searchParams.get('strategic_type') as AgoaStrategicType | null;
    const apparelOnly = searchParams.get('apparel_only') === 'true';
    const query = searchParams.get('q') ?? '';

    if (iso3 && !(APPROVED_AFRICA_ISO3 as readonly string[]).includes(iso3)) {
      return NextResponse.json(
        { error: 'AGOA Product Finder is only available for sub-Saharan African countries' },
        { status: 400 }
      );
    }

    let access;
    try {
      const authSupabase = await createServerClient();
      const { data: { user } } = await authSupabase.auth.getUser();
      access = await resolveUserAccess(authSupabase, user?.id);
    } catch {
      access = {
        userId: '', email: null, planRank: 0, planId: 'public',
        entitlements: [], organizationId: null, organizationRole: null, isAuthenticated: false,
      };
    }

    const isProfessionalPlus = access.planRank >= 2;

    // Apply smart filter
    let filtered = filterPriorityProducts({
      sectorKey: sectorKey || undefined,
      strategicType: strategicType ?? undefined,
      query,
      regionScope: 'all',
    });

    if (apparelOnly) {
      filtered = filtered.filter((p) => p.isApparelProvision);
    }

    // Map to API shape — wire in enrichment trade volumes and MFN rates
    const products = filtered.map((p) => {
      const enrichment = PRODUCT_ENRICHMENT[p.code] ?? null;
      const mfn = MFN_RATE_LOOKUP[p.code] ?? null;

      // Trade flow values from enrichment (real curated data until Comtrade ingest replaces them)
      const topCountriesTotal = enrichment?.topTradeCountries.reduce((s, c) => s + c.annualVolumeUSD, 0) ?? null;
      const exportToUsUsd = p.strategicType === 'africa_export' ? (topCountriesTotal ?? null) : null;
      const usImportDemandUsd = p.strategicType === 'us_reciprocal'
        ? (enrichment?.usExportVolumeToAfricaUSD ?? topCountriesTotal ?? null)
        : null;

      // AGOA preference rate: 0% for AGOA/CBTPA eligible; null for non-covered products
      const agoaPreferenceRatePct = (p.isAgoaSpecific || p.isCbtpaSpecific) ? 0 : null;

      // Data status: if enrichment provides at least some volume data, mark as curated
      const dataStatus = enrichment?.topTradeCountries.length ? 'curated_estimate' : 'catalog_only';

      return {
        code: p.code,
        classification: p.classification,
        chapter: p.chapter,
        description: p.description,
        sector_key: p.sectorKey,
        sector_label: SECTOR_LABEL_MAP[p.sectorKey] ?? p.sectorKey,
        strategic_type: p.strategicType,
        is_apparel_provision: p.isApparelProvision,
        is_agoa_specific: p.isAgoaSpecific,
        is_cbtpa_specific: p.isCbtpaSpecific,
        us_export_states: isProfessionalPlus ? p.usExportStates : [],
        rules_of_origin_summary: p.rulesOfOriginSummary,
        // AGOA preference rate: null = not covered; 0 = duty-free under AGOA/CBTPA
        agoa_preference_rate_pct: agoaPreferenceRatePct,
        // MFN rate: what buyers would pay WITHOUT AGOA — shows the preference VALUE
        mfn_rate_pct: mfn?.ratePct ?? null,
        mfn_rate_display: mfn?.display ?? null,
        // Trade flow: from enrichment curated data; null = pending Comtrade ingest
        export_to_us_usd: exportToUsUsd,
        us_import_demand_usd: usImportDemandUsd,
        net_position_usd: (exportToUsUsd != null && usImportDemandUsd != null)
          ? exportToUsUsd - usImportDemandUsd
          : null,
        opportunity_score: null as number | null,
        // Top trading countries from enrichment (used in drawer and demand heatmap)
        top_trade_countries: enrichment?.topTradeCountries.slice(0, 5) ?? [],
        cliff_risk_note: enrichment?.cliffRiskNote ?? null,
        data_status: dataStatus,
      };
    });

    // Group by sector for the UI
    const grouped: Record<string, typeof products> = {};
    for (const p of products) {
      if (!grouped[p.sector_key]) grouped[p.sector_key] = [];
      grouped[p.sector_key].push(p);
    }

    // Country context from vault
    let countryContext = null;
    if (iso3) {
      const { rows } = await fetchAgoaApiRowsFromVault(iso3, '', isProfessionalPlus);
      const row = rows[0];
      if (row) {
        countryContext = {
          iso3: row.country_iso3,
          name: row.country_name,
          agoa_status: row.agoa_status,
          agoa_apparel_eligible: row.agoa_apparel_eligible,
        };
      }
    }

    const coveredWithData = products.filter((p) => p.data_status === 'curated_estimate').length;

    return NextResponse.json({
      products,
      country: countryContext,
      grouped_by_sector: grouped,
      filters: {
        iso3: iso3 ?? null,
        sector: sectorKey || null,
        strategic_type: strategicType ?? null,
        apparel_only: apparelOnly,
        query: query || null,
      },
      summary: {
        total_products: products.length,
        catalog_total: AGOA_PRIORITY_PRODUCTS.length,
        africa_export_count: products.filter((p) => p.strategic_type === 'africa_export').length,
        us_reciprocal_count: products.filter((p) => p.strategic_type === 'us_reciprocal').length,
        apparel_count: products.filter((p) => p.is_apparel_provision).length,
        products_with_trade_data: coveredWithData,
        sectors: PRIORITY_CATALOG_SECTORS,
        trade_flows_status: coveredWithData > 0 ? 'partial_curated' : 'pending_ingest',
        note: `Priority catalog (~${products.length} products across 8 sectors). ${coveredWithData} products have curated trade volume data. Remaining flows populate after Comtrade/Census ingest.`,
      },
      attribution: {
        source_name: 'WCO HS classification · USTR AGOA framework · UN Comtrade · ITA State Export Data · USITC HTS',
        source_type: 'curated_reference_catalog',
        data_label: 'Priority catalog · Curated trade estimates 2021–2024 · Full Comtrade ingest pending',
      },
      entitlement: {
        plan_id: access.planId,
        is_full_access: isProfessionalPlus,
      },
    });
  } catch (err) {
    console.error('[trade/agoa/products]', err);
    return NextResponse.json({ error: 'Failed to load AGOA product catalog' }, { status: 500 });
  }
}
