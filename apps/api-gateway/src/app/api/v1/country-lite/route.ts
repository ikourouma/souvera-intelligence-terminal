// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// GET /api/v1/country-lite?iso3=XXX
// Owner: Afronovation, Inc.
// Access: Public / AfDEC
//
// Returns controlled teaser data for a single
// country including identity, headline metrics,
// signal info, top sectors, and freshness.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const supabase = getServiceClient();

    // 1. Get country from lite view
    const { data: countryData, error: countryError } = await supabase
      .from('souvera_country_lite_v')
      .select('*')
      .eq('iso3', iso3)
      .single();

    if (countryError || !countryData) {
      return NextResponse.json(
        { error: `Country not found: ${iso3}` },
        { status: 404 }
      );
    }

    // 2. Get top sectors (teaser only — labels + teaser_md)
    const { data: sectorData } = await supabase
      .from('souvera_country_sectors')
      .select('sector_label, teaser_md')
      .eq('country_id', countryData.country_id)
      .order('display_order', { ascending: true })
      .limit(5);

    // 3. Build response per API Binding Map spec
    const response = {
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
      },
      signal: {
        level: countryData.signal_level ?? undefined,
        investmentScore: countryData.investment_score ?? undefined,
        confidenceScore: countryData.confidence_score ?? undefined,
      },
      sectors: (sectorData ?? []).map((s) => ({
        label: s.sector_label,
        teaser: s.teaser_md ?? undefined,
      })),
      teaser: {
        afdecTeaser: countryData.afdec_teaser_md ?? undefined,
      },
      freshness: {
        updatedAt: countryData.freshness_at ?? undefined,
      },
      meta: {
        product: 'souvera',
        owner: 'Afronovation, Inc.',
        accessTier: 'public',
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
