// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// GET /api/v1/countries-lite
// Owner: Afronovation, Inc.
// Access: Public / AfDEC
//
// Returns list of all active countries with
// headline metrics (GDP, population, growth),
// signal info, and freshness metadata.
// ===========================================

import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const supabase = getServiceClient();

    // Query the lite view which aggregates countries + latest observations + signals
    const { data, error } = await supabase
      .from('souvera_country_lite_v')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[API] countries-lite error:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch countries', detail: error.message },
        { status: 500 }
      );
    }

    // Transform to API response shape
    const countries = (data ?? []).map((row) => ({
      iso2: row.iso2,
      iso3: row.iso3,
      name: row.name,
      region: row.region,
      subregion: row.subregion ?? undefined,
      capital: row.capital ?? undefined,
      flagUrl: row.flag_svg_url ?? row.flag_png_url ?? undefined,
      gdpCurrentUsd: row.gdp_current_usd ?? undefined,
      gdpGrowthPct: row.gdp_growth_pct ?? undefined,
      populationTotal: row.population_total ?? undefined,
      signalLevel: row.signal_level ?? undefined,
      investmentScore: row.investment_score ?? undefined,
    }));

    // Build response with mandatory metadata
    const response = {
      countries,
      meta: {
        product: 'souvera',
        owner: 'Afronovation, Inc.',
        accessTier: 'public',
        generatedAt: new Date().toISOString(),
        totalCountries: countries.length,
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
    console.error('[API] countries-lite unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
