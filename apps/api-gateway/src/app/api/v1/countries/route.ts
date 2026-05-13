// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// GET /api/v1/countries?region=africa|caribbean|all&scope=mandate|global
// Owner: Afronovation, Inc.
// Access: Public / Authenticated (tiered)
//
// Returns list of countries for map visualization
// with entitlement-based field filtering.
// Data is served from tiered database views.
//
// Mandate Scope (default):
// - 54 African countries (APPROVED_AFRICA_ISO3)
// - 20 approved Caribbean markets/territories (APPROVED_CARIBBEAN_ISO3)
// - Total: 74 markets
//
// Global Scope (scope=global):
// - All countries in database (~190+)
// - Used by comparison tools that need worldwide coverage
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import {
  resolveUserAccess,
  getDataView,
  type UserAccess,
} from '@souvera/entitlements';
import {
  APPROVED_AFRICA_ISO3,
  APPROVED_CARIBBEAN_ISO3,
  VALID_REGIONS,
  normalizeRegionFilter,
} from '@/lib/market-coverage';

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
    const rawRegion = searchParams.get('region');
    const region = normalizeRegionFilter(rawRegion);
    const scope = searchParams.get('scope'); // 'mandate' (default) or 'global'

    // Validate region parameter
    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json(
        { 
          error: 'Invalid region parameter',
          valid_regions: VALID_REGIONS,
          example: '/api/v1/countries?region=africa'
        },
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

    // Define reusable select fields for consistency
    const selectFields = 'iso2, iso3, name, region, subregion, capital, flag_svg_url, lat, lng, gdp_current_usd, gdp_growth_pct, population_total, signal_level, freshness_at, is_african_country';

    let countries: any[] = [];
    let error: any = null;

    // Check if global scope is requested (for compare tool, etc.)
    if (scope === 'global') {
      // Global scope: Return all countries without mandate filtering
      // Useful for comparison tools that need worldwide coverage
      const { data, error: queryError } = await supabase
        .from(dataView)
        .select(selectFields)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      countries = data || [];
      error = queryError;
    } else {
      // Mandate scope (default): Apply Africa/Caribbean filtering
      // Apply mandate-scoped filters
      if (region === 'africa') {
        // Africa only: countries in approved Africa ISO3 list (54 countries)
        const { data, error: queryError } = await supabase
          .from(dataView)
          .select(selectFields)
          .eq('is_active', true)
          .in('iso3', APPROVED_AFRICA_ISO3 as unknown as string[])
          .order('name', { ascending: true });
        
        countries = data || [];
        error = queryError;

      } else if (region === 'caribbean') {
        // Caribbean only: countries in approved Caribbean ISO3 list
        const { data, error: queryError } = await supabase
          .from(dataView)
          .select(selectFields)
          .eq('is_active', true)
          .in('iso3', APPROVED_CARIBBEAN_ISO3 as unknown as string[])
          .order('name', { ascending: true });
        
        countries = data || [];
        error = queryError;

      } else if (region === 'all') {
        // All Souvera markets: Approved African countries + approved Caribbean markets
        // Create independent query builders to avoid mutation race condition
        
        const [africaResult, caribbeanResult] = await Promise.all([
          // Query 1: Approved African countries (54 countries, fresh query builder)
          supabase
            .from(dataView)
            .select(selectFields)
            .eq('is_active', true)
            .in('iso3', APPROVED_AFRICA_ISO3 as unknown as string[]),
          
          // Query 2: Approved Caribbean markets (20 markets, fresh query builder)
          supabase
            .from(dataView)
            .select(selectFields)
            .eq('is_active', true)
            .in('iso3', APPROVED_CARIBBEAN_ISO3 as unknown as string[])
        ]);

        if (africaResult.error) {
          console.error('[API] Africa query error:', africaResult.error);
          error = africaResult.error;
        } else if (caribbeanResult.error) {
          console.error('[API] Caribbean query error:', caribbeanResult.error);
          error = caribbeanResult.error;
        } else {
          // Merge results, deduplicate by iso3, and sort by name
          const allCountries = [
            ...(africaResult.data || []),
            ...(caribbeanResult.data || [])
          ];
          
          // Deduplicate by iso3 (in case any overlap)
          const uniqueCountries = Array.from(
            new Map(allCountries.map(c => [c.iso3, c])).values()
          );
          
          // Sort by name
          countries = uniqueCountries.sort((a, b) => 
            (a.name || '').localeCompare(b.name || '')
          );
        }
      }
    }

    // Handle errors
    if (error) {
      console.error('[API] countries query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    // Transform response to camelCase and map-friendly format
    const transformedCountries = (countries || []).map((c: Record<string, unknown>) => ({
      iso2: c.iso2,
      iso3: c.iso3,
      name: c.name,
      region: c.region,
      subregion: c.subregion ?? undefined,
      capital: c.capital ?? undefined,
      flagUrl: c.flag_svg_url ?? undefined,
      lat: c.lat ?? undefined,
      lng: c.lng ?? undefined,
      // Only include metrics that exist and are authorized
      ...(c.gdp_current_usd != null && { gdpCurrentUsd: c.gdp_current_usd }),
      ...(c.gdp_growth_pct != null && { gdpGrowthPct: c.gdp_growth_pct }),
      ...(c.population_total != null && { populationTotal: c.population_total }),
      // Signal level only for Explorer+ (part of view selection)
      ...(c.signal_level != null && { signalLevel: c.signal_level }),
      // Freshness
      ...(c.freshness_at != null && { freshnessAt: c.freshness_at }),
      // African country flag (needed for frontend filtering)
      isAfricanCountry: c.is_african_country ?? false,
    }));

    // Return with metadata
    return NextResponse.json({
      countries: transformedCountries,
      meta: {
        product: 'souvera',
        owner: 'Afronovation, Inc.',
        accessTier: access.planId,
        authenticated: access.isAuthenticated,
        generatedAt: new Date().toISOString(),
        region: region,
        scope: scope === 'global' ? 'global' : 'mandate',
        count: transformedCountries.length,
        previewData: true, // This is curated preview data until Phase 4
        sources: [
          { key: 'rest_countries', name: 'REST Countries API' },
          { key: 'world_bank', name: 'World Bank Indicators API' },
        ],
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (err) {
    console.error('[API] countries unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
