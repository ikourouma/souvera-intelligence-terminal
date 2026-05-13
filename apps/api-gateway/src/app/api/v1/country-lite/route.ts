// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// GET /api/v1/country-lite?iso3=XXX
// Owner: Afronovation, Inc.
// Access: Public / Authenticated (tiered)
//
// Returns controlled teaser data for a single
// country including identity, headline metrics,
// signal info, top sectors, and freshness.
// Authenticated users get data based on their plan.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import {
  resolveUserAccess,
  getDataView,
  hasEntitlement,
  type UserAccess,
} from '@souvera/entitlements';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iso3 = searchParams.get('iso3')?.toUpperCase();

    if (!iso3 || iso3.length !== 3) {
      return NextResponse.json(
        { error: 'Missing or invalid iso3 parameter. Example: ?iso3=ZMB' },
        { status: 400 }
      );
    }

    // Resolve user access (works for both authenticated and public)
    let access: UserAccess;
    try {
      const authSupabase = await createServerClient();
      const { data: { user } } = await authSupabase.auth.getUser();
      access = await resolveUserAccess(authSupabase, user?.id);
    } catch {
      // Default to public access if auth fails
      access = {
        userId: '',
        email: null,
        planRank: 0,
        planId: 'public',
        entitlements: ['country_identity', 'headline_macro', 'sector_teasers', 'news_teasers'],
        organizationId: null,
        organizationRole: null,
        isAuthenticated: false,
      };
    }

    const supabase = getServiceClient();

    // Select appropriate view based on user's plan
    const dataView = getDataView(access);

    // 1. Get country from appropriate view
    const { data: countryData, error: countryError } = await supabase
      .from(dataView)
      .select('*')
      .eq('iso3', iso3)
      .single();

    if (countryError || !countryData) {
      return NextResponse.json(
        { error: `Country not found: ${iso3}` },
        { status: 404 }
      );
    }

    // 2. Get sectors - full rationale for higher tiers, teasers for others
    // Sector count by entitlement:
    // - Public/Explorer: 1 sector (teaser only)
    // - Professional+: up to 7 sectors (with rationale if entitled)
    const hasSectorRationale = hasEntitlement(access, 'sector_rationale');
    const sectorSelect = hasSectorRationale
      ? 'sector_label, teaser_md, rationale_md, strength_score, growth_score'
      : 'sector_label, teaser_md';
    
    // Determine sector limit based on access tier
    // Public and Explorer get 1 sector; Professional+ get all 7 sectors
    const sectorLimit = hasSectorRationale ? 7 : 1;

    const { data: sectorData } = await supabase
      .from('souvera_country_sectors')
      .select(sectorSelect)
      .eq('country_id', countryData.country_id)
      .order('display_order', { ascending: true })
      .limit(sectorLimit);

    // 3. Build response per API Binding Map spec with entitlement-based filtering
    const response: Record<string, unknown> = {
      country: {
        iso2: countryData.iso2,
        iso3: countryData.iso3,
        name: countryData.name,
        region: countryData.region,
        subregion: countryData.subregion ?? undefined,
        capital: countryData.capital ?? undefined,
        currencyCode: countryData.currency_code ?? undefined,
        flagUrl: countryData.flag_svg_url ?? countryData.flag_png_url ?? undefined,
      },
      metrics: {
        gdpCurrentUsd: countryData.gdp_current_usd ?? undefined,
        gdpGrowthPct: countryData.gdp_growth_pct ?? undefined,
        populationTotal: countryData.population_total ?? undefined,
        // Include additional metrics for higher tiers
        ...(hasEntitlement(access, 'full_macro') && {
          fdiNetInflowsUsd: countryData.fdi_net_inflows_usd ?? undefined,
          inflationCpiPct: countryData.inflation_cpi_pct ?? undefined,
        }),
        ...(hasEntitlement(access, 'fx_metrics') && {
          fxToUsd: countryData.fx_to_usd ?? undefined,
        }),
        ...(hasEntitlement(access, 'forecast_metrics') && {
          gdpForecastPct: countryData.gdp_forecast_pct ?? undefined,
          remittancesReceivedUsd: countryData.remittances_received_usd ?? undefined,
        }),
      },
      signal: {
        level: countryData.signal_level ?? undefined,
        investmentScore: countryData.investment_score ?? undefined,
        confidenceScore: countryData.confidence_score ?? undefined,
      },
      sectors: (sectorData ?? []).map((s: Record<string, unknown>) => ({
        label: s.sector_label,
        teaser: s.teaser_md ?? undefined,
        ...(hasSectorRationale && {
          rationale: s.rationale_md ?? undefined,
          strengthScore: s.strength_score ?? undefined,
          growthScore: s.growth_score ?? undefined,
        }),
      })),
      teaser: {
        afdecTeaser: countryData.afdec_teaser_md ?? undefined,
      },
      // Include narrative fields for professional+ tiers
      ...(hasEntitlement(access, 'full_macro') && {
        narrative: {
          summary: countryData.summary_md ?? undefined,
          whyNow: countryData.why_now_md ?? undefined,
          economicMomentum: countryData.economic_momentum ?? undefined,
          investorReadiness: countryData.investor_readiness ?? undefined,
        },
      }),
      // Include thesis for business+ tiers
      ...(hasEntitlement(access, 'forecast_metrics') && {
        thesis: {
          opportunityThesis: countryData.opportunity_thesis_md ?? undefined,
          riskNarrative: countryData.risk_narrative_md ?? undefined,
        },
      }),
      freshness: {
        updatedAt: countryData.freshness_at ?? undefined,
      },
      meta: {
        product: 'souvera',
        owner: 'Afronovation, Inc.',
        accessTier: access.planId,
        authenticated: access.isAuthenticated,
        generatedAt: new Date().toISOString(),
        sources: [
          { key: 'rest_countries', name: 'REST Countries API' },
          { key: 'world_bank', name: 'World Bank Indicators API' },
        ],
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[API] country-lite unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
