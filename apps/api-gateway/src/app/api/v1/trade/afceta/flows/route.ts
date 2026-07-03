/**
 * GET /api/v1/trade/afceta/flows
 * AfCETA corridor opportunity signals.
 *
 * Query params:
 *   direction — africa_to_caribbean | caribbean_to_africa
 *   group     — category_group filter (comma-separated)
 *   origin    — origin ISO3
 *   dest      — destination ISO3
 *   spotlight — true for Tier-A spotlights only
 *   tier      — comma-separated A,B,C
 *   pillar    — pillar_key filter
 *   min_score — minimum opportunity_score
 *   year      — data year (default 2023)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEntitlement } from '@/lib/access/server-entitlements';
import { AFCETA_METHODOLOGY_NOTE } from '@/lib/intelligence/afceta-types';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function parseCsvParam(value: string | null): string[] | null {
  if (!value?.trim()) return null;
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    await requireEntitlement('trade_data');

    const { searchParams } = new URL(request.url);
    const direction = searchParams.get('direction');
    const groupParam = searchParams.get('group');
    const origin = searchParams.get('origin')?.toUpperCase();
    const dest = searchParams.get('dest')?.toUpperCase();
    const spotlightOnly = searchParams.get('spotlight') === 'true';
    const pillar = searchParams.get('pillar');
    const minScore = parseFloat(searchParams.get('min_score') || '0');
    const tierParam = parseCsvParam(searchParams.get('tier'));
    const groups = parseCsvParam(groupParam);
    const year = parseInt(searchParams.get('year') || '2023', 10);

    const supabase = getServiceClient();

    let query = supabase
      .from('souvera_afceta_corridor_signals')
      .select('*')
      .eq('data_year', year)
      .order('opportunity_score', { ascending: false });

    if (direction) query = query.eq('direction', direction);
    if (groups?.length === 1) query = query.eq('category_group', groups[0]);
    else if (groups && groups.length > 1) query = query.in('category_group', groups);
    if (origin) query = query.eq('origin_iso3', origin);
    if (dest) query = query.eq('dest_iso3', dest);
    if (spotlightOnly) query = query.eq('is_spotlight', true);
    if (pillar) query = query.eq('pillar_key', pillar);
    if (tierParam?.length) query = query.in('data_quality_tier', tierParam);
    if (minScore > 0) query = query.gte('opportunity_score', minScore);

    const { data, error } = await query;

    if (error) {
      console.error('[afceta-flows] Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    const rows = data ?? [];

    const categoryTotals: Record<string, { count: number; avg_score: number; total_capacity: number; total_demand: number }> = {};
    for (const r of rows) {
      if (!categoryTotals[r.category_group]) {
        categoryTotals[r.category_group] = { count: 0, avg_score: 0, total_capacity: 0, total_demand: 0 };
      }
      const t = categoryTotals[r.category_group];
      t.count += 1;
      t.avg_score += r.opportunity_score;
      t.total_capacity += r.origin_capacity_usd ?? 0;
      t.total_demand += r.dest_demand_usd ?? 0;
    }
    for (const k of Object.keys(categoryTotals)) {
      const t = categoryTotals[k];
      t.avg_score = t.count > 0 ? Math.round((t.avg_score / t.count) * 10) / 10 : 0;
    }

    const spotlightCount = rows.filter((r) => r.is_spotlight).length;
    const pairs = new Set(rows.map((r) => `${r.origin_iso3}-${r.dest_iso3}`));

    return NextResponse.json({
      rows,
      summary: {
        record_count: rows.length,
        corridor_pairs: pairs.size,
        spotlight_count: spotlightCount,
        category_totals: categoryTotals,
        data_vintage: `${year}`,
        direction: direction ?? 'all',
      },
      attribution: {
        sources: ['AfCFTA Trade Flows', 'CBTPA Flows', 'Import Demand Signals'],
        note: AFCETA_METHODOLOGY_NOTE,
      },
      evaluation_mode: 'platform',
    });
  } catch (e) {
    console.error('[afceta-flows] Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
