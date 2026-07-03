// GET /api/v1/trade/demand
// African/Caribbean import demand signals — Phase 0.5A intelligence layer
// Powers the Demand Signal Matrix and country demand drawers.
//
// Query params:
//   iso3       — filter to single country
//   region     — filter by region (Africa|Caribbean)
//   group      — category_group filter (machinery|grains|fertilizers|pharma|cotton|transport|intermediate)
//   year       — year filter (default: latest available)
//   limit      — max records (default 200)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEntitlement } from '@/lib/access/server-entitlements';

export const runtime = 'nodejs';
export const revalidate = 3600; // 1-hour cache

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and entitlement
    const access = await requireEntitlement('trade_data');

    const { searchParams } = new URL(request.url);
    const iso3   = searchParams.get('iso3')?.toUpperCase();
    const region = searchParams.get('region');
    const group  = searchParams.get('group');
    const yearP  = searchParams.get('year');
    const limit  = Math.min(parseInt(searchParams.get('limit') ?? '200', 10), 500);

    const supabase = getServiceClient();

    let query = supabase
      .from('souvera_import_demand_signals')
      .select(`
        id,
        year,
        hs_chapter,
        category_label,
        category_group,
        total_imports_usd,
        imports_from_us_usd,
        imports_from_us_vol_mt,
        imports_from_us_share_pct,
        us_export_potential_usd,
        us_benchmark_share_pct,
        yoy_growth_pct,
        top_suppliers,
        source_notes,
        data_quality_tier,
        souvera_countries!inner (
          iso3,
          name,
          region,
          subregion
        )
      `)
      .limit(limit)
      .order('imports_from_us_usd', { ascending: false });

    if (iso3) {
      query = query.eq('souvera_countries.iso3', iso3);
    }
    if (region) {
      // Normalize region name for filtering
      const normalizedRegion = region.toLowerCase();
      if (normalizedRegion === 'caribbean' || normalizedRegion === 'americas') {
        query = query.eq('souvera_countries.region', 'Americas');
      } else if (normalizedRegion === 'africa') {
        query = query.eq('souvera_countries.region', 'Africa');
      } else {
        query = query.eq('souvera_countries.region', region);
      }
    }
    if (group) {
      query = query.eq('category_group', group);
    }
    if (yearP) {
      query = query.eq('year', parseInt(yearP, 10));
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []).map((r) => {
      const country = (r.souvera_countries as { iso3: string; name: string; region: string; subregion: string } | null);
      return {
        id: r.id,
        year: r.year,
        hs_chapter: r.hs_chapter,
        category_label: r.category_label,
        category_group: r.category_group,
        iso3: country?.iso3 ?? '',
        country_name: country?.name ?? '',
        region: country?.region ?? '',
        sub_region: country?.subregion ?? '',
        total_imports_usd: r.total_imports_usd,
        imports_from_us_usd: r.imports_from_us_usd,
        imports_from_us_vol_mt: r.imports_from_us_vol_mt,
        imports_from_us_share_pct: r.imports_from_us_share_pct,
        us_export_potential_usd: r.us_export_potential_usd,
        us_benchmark_share_pct: r.us_benchmark_share_pct,
        yoy_growth_pct: r.yoy_growth_pct,
        top_suppliers: r.top_suppliers ?? [],
        source_notes: r.source_notes,
        data_quality_tier: r.data_quality_tier ?? 'A', // Default to A for legacy data
      };
    });

    // Aggregate by category group for summary
    const groupTotals: Record<string, { total_imports_usd: number; imports_from_us_usd: number; us_export_potential_usd: number; country_count: number }> = {};
    for (const r of rows) {
      if (!groupTotals[r.category_group]) {
        groupTotals[r.category_group] = { total_imports_usd: 0, imports_from_us_usd: 0, us_export_potential_usd: 0, country_count: 0 };
      }
      groupTotals[r.category_group].total_imports_usd += r.total_imports_usd ?? 0;
      groupTotals[r.category_group].imports_from_us_usd += r.imports_from_us_usd ?? 0;
      groupTotals[r.category_group].us_export_potential_usd += r.us_export_potential_usd ?? 0;
      groupTotals[r.category_group].country_count++;
    }

    const totalUsExports = rows.reduce((s, r) => s + (r.imports_from_us_usd ?? 0), 0);
    const totalUsPotential = rows.reduce((s, r) => s + (r.us_export_potential_usd ?? 0), 0);

    // Top 10 product categories by US export potential
    const categoryTotals: Record<string, { label: string; usExports: number; potential: number; gap: number; markets: number }> = {};
    for (const r of rows) {
      if (!categoryTotals[r.category_group]) {
        categoryTotals[r.category_group] = { label: r.category_label, usExports: 0, potential: 0, gap: 0, markets: 0 };
      }
      categoryTotals[r.category_group].usExports += r.imports_from_us_usd ?? 0;
      categoryTotals[r.category_group].potential += r.us_export_potential_usd ?? 0;
      categoryTotals[r.category_group].markets++;
    }
    const topProducts = Object.entries(categoryTotals)
      .map(([group, data]) => ({
        group,
        label: data.label,
        usExports: data.usExports,
        potential: data.potential,
        gap: data.potential - data.usExports,
        markets: data.markets,
      }))
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 10);

    return NextResponse.json({
      rows,
      summary: {
        record_count: rows.length,
        total_us_exports_usd: totalUsExports,
        total_us_export_potential_usd: totalUsPotential,
        potential_gap_usd: totalUsPotential - totalUsExports,
        markets_covered: [...new Set(rows.map((r) => r.iso3))].length,
        category_group_totals: groupTotals,
        top_products: topProducts,
        data_vintage: '2023 (curated estimate — ITC TDM · UN Comtrade · BEA)',
      },
      attribution: {
        sources: ['ITC Trade Data Monitor', 'UN Comtrade', 'BEA International Trade', 'USDA GATS', 'World Bank WITS'],
        note: 'Curated 2023/2024 averages. Pending full ITC TDM API integration for real-time updates.',
      },
    });
  } catch (err) {
    console.error('[trade/demand]', err);
    return NextResponse.json({ error: 'Failed to load demand signals' }, { status: 500 });
  }
}
