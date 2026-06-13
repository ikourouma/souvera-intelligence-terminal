/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * CBTPA Trade Flows API
 * Owner: Afronovation, Inc.
 * Phase 0.7: CBTPA Import-Export Intelligence
 * =====================================================
 *
 * GET /api/v1/trade/cbtpa/flows
 * Query params:
 *   - direction: 'imports' | 'exports' (default: 'imports')
 *   - group: category group filter (optional)
 *   - iso3: country filter (optional)
 *   - year: data year (default: 2023)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { requireEntitlement } from '@/lib/access/server-entitlements';

type FlowDirection = 'imports' | 'exports';
type DataQualityTier = 'A' | 'B' | 'C';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase credentials for service client');
  }
  return createClient(url, key);
}

interface CBTPAFlowRow {
  id: string;
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  direction: FlowDirection;
  year: number;
  hs_chapter: string;
  category_group: string;
  category_label: string;
  total_imports_usd: number | null;
  total_exports_usd: number | null;
  trade_with_us_usd: number | null;
  trade_with_us_share_pct: number | null;
  intra_caribbean_trade_usd: number | null;
  intra_caribbean_share_pct: number | null;
  trade_with_eu_usd: number | null;
  trade_with_china_usd: number | null;
  cbtpa_tariff_pct: number | null;
  mfn_tariff_pct: number | null;
  preference_margin_pct: number | null;
  roo_compliant: boolean | null;
  cbi_beneficiary: boolean | null;
  caricom_member: boolean | null;
  yoy_growth_pct: number | null;
  top_partners: Array<{ iso3: string; country: string; valueUsd: number; sharePct: number }>;
  top_products: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number }>;
  source_notes: string | null;
  data_quality_tier: DataQualityTier;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and entitlement
    const access = await requireEntitlement('trade_data');

    const { searchParams } = new URL(request.url);
    const direction = (searchParams.get('direction') as FlowDirection) || 'imports';
    const groupFilter = searchParams.get('group');
    const iso3Filter = searchParams.get('iso3');
    const yearFilter = parseInt(searchParams.get('year') || '2023', 10);

    const supabase = getServiceClient();

    // Build query
    let query = supabase
      .from('souvera_cbtpa_trade_flows')
      .select('*')
      .eq('direction', direction)
      .eq('year', yearFilter)
      .order('trade_with_us_usd', { ascending: false, nullsFirst: false });

    if (groupFilter) {
      query = query.eq('category_group', groupFilter);
    }

    if (iso3Filter) {
      query = query.eq('iso3', iso3Filter.toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[cbtpa-flows] Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    const rows: CBTPAFlowRow[] = (data || []).map((r) => ({
      id: r.id,
      iso3: r.iso3,
      country_name: r.country_name,
      region: r.region,
      sub_region: r.sub_region,
      direction: r.direction,
      year: r.year,
      hs_chapter: r.hs_chapter,
      category_group: r.category_group,
      category_label: r.category_label,
      total_imports_usd: r.total_imports_usd,
      total_exports_usd: r.total_exports_usd,
      trade_with_us_usd: r.trade_with_us_usd,
      trade_with_us_share_pct: r.trade_with_us_share_pct,
      intra_caribbean_trade_usd: r.intra_caribbean_trade_usd,
      intra_caribbean_share_pct: r.intra_caribbean_share_pct,
      trade_with_eu_usd: r.trade_with_eu_usd,
      trade_with_china_usd: r.trade_with_china_usd,
      cbtpa_tariff_pct: r.cbtpa_tariff_pct,
      mfn_tariff_pct: r.mfn_tariff_pct,
      preference_margin_pct: r.preference_margin_pct,
      roo_compliant: r.roo_compliant,
      cbi_beneficiary: r.cbi_beneficiary,
      caricom_member: r.caricom_member,
      yoy_growth_pct: r.yoy_growth_pct,
      top_partners: r.top_partners || [],
      top_products: r.top_products || [],
      source_notes: r.source_notes,
      data_quality_tier: (r.data_quality_tier as DataQualityTier) || 'A',
    }));

    // Compute summary statistics
    const totalUsTrade = rows.reduce((s, r) => s + (r.trade_with_us_usd ?? 0), 0);
    const totalIntraCaribbeanTrade = rows.reduce((s, r) => s + (r.intra_caribbean_trade_usd ?? 0), 0);
    const totalTrade = rows.reduce((s, r) => s + (direction === 'imports' ? (r.total_imports_usd ?? 0) : (r.total_exports_usd ?? 0)), 0);
    const marketsCount = new Set(rows.map((r) => r.iso3)).size;
    const cbiCount = rows.filter((r) => r.cbi_beneficiary).length;
    const caricomCount = new Set(rows.filter((r) => r.caricom_member).map((r) => r.iso3)).size;

    // Group totals by category
    const categoryGroupTotals: Record<string, { 
      trade_with_us_usd: number; 
      intra_caribbean_trade_usd: number;
      total_trade_usd: number; 
      country_count: number 
    }> = {};
    
    for (const r of rows) {
      if (!categoryGroupTotals[r.category_group]) {
        categoryGroupTotals[r.category_group] = { 
          trade_with_us_usd: 0, 
          intra_caribbean_trade_usd: 0,
          total_trade_usd: 0, 
          country_count: 0 
        };
      }
      categoryGroupTotals[r.category_group].trade_with_us_usd += r.trade_with_us_usd ?? 0;
      categoryGroupTotals[r.category_group].intra_caribbean_trade_usd += r.intra_caribbean_trade_usd ?? 0;
      categoryGroupTotals[r.category_group].total_trade_usd += direction === 'imports' 
        ? (r.total_imports_usd ?? 0) 
        : (r.total_exports_usd ?? 0);
      categoryGroupTotals[r.category_group].country_count += 1;
    }

    return NextResponse.json({
      rows,
      summary: {
        record_count: rows.length,
        total_us_trade_usd: totalUsTrade,
        total_intra_caribbean_trade_usd: totalIntraCaribbeanTrade,
        total_trade_usd: totalTrade,
        us_trade_share_pct: totalTrade > 0 ? Math.round((totalUsTrade / totalTrade) * 1000) / 10 : 0,
        intra_caribbean_share_pct: totalTrade > 0 ? Math.round((totalIntraCaribbeanTrade / totalTrade) * 1000) / 10 : 0,
        markets_covered: marketsCount,
        cbi_beneficiaries: cbiCount,
        caricom_members: caricomCount,
        category_group_totals: categoryGroupTotals,
        data_vintage: `${yearFilter}`,
        direction,
        legislative_deadline: '2026-12-31', // CBTPA expiration (same as AGOA)
      },
      attribution: {
        sources: ['USTR CBI Program', 'ITC Trade Map', 'UN Comtrade', 'CARICOM Statistics'],
        note: 'Curated estimates for demonstration. Full bilateral flow data via ITC API integration in Phase 1.',
        framework: 'Caribbean Basin Trade Partnership Act (CBTPA)',
      },
    });
  } catch (e) {
    console.error('[cbtpa-flows] Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
