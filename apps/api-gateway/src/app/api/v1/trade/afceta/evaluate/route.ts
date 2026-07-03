/**
 * GET /api/v1/trade/afceta/evaluate
 * Live Corridor Lab evaluation — any origin×destination pair, no DB write.
 *
 * Query params:
 *   direction — africa_to_caribbean | caribbean_to_africa (required)
 *   origin    — origin ISO3 (required)
 *   dest      — destination ISO3 (required)
 *   groups    — comma-separated category_group keys (default: all 8)
 *   year      — data year (default 2023)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEntitlement } from '@/lib/access/server-entitlements';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '@/lib/market-coverage';
import { loadAfcetaSourceMaps } from '@/lib/intelligence/afceta-corridor-data-loader';
import {
  buildCorridorRow,
  capacityKey,
  demandForCategory,
} from '@/lib/intelligence/afceta-corridor-engine';
import { AFCETA_METHODOLOGY_NOTE, AFCETA_SHARED_CATEGORIES } from '@/lib/intelligence/afceta-types';
import type { AfcetaDirection } from '@/lib/intelligence/afceta-types';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

const LAB_METHODOLOGY =
  'Corridor Lab — live evaluation from source capacity and demand maps. Not persisted.';

export async function GET(request: NextRequest) {
  try {
    await requireEntitlement('trade_data');

    const { searchParams } = new URL(request.url);
    const direction = searchParams.get('direction') as AfcetaDirection | null;
    const origin = searchParams.get('origin')?.toUpperCase();
    const dest = searchParams.get('dest')?.toUpperCase();
    const year = parseInt(searchParams.get('year') || '2023', 10);
    const groupsParam = searchParams.get('groups');
    const categories = groupsParam
      ? groupsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : Object.keys(AFCETA_SHARED_CATEGORIES);

    if (!direction || (direction !== 'africa_to_caribbean' && direction !== 'caribbean_to_africa')) {
      return NextResponse.json({ error: 'direction is required (africa_to_caribbean | caribbean_to_africa)' }, { status: 400 });
    }
    if (!origin || !dest) {
      return NextResponse.json({ error: 'origin and dest ISO3 codes are required' }, { status: 400 });
    }

    const africaSet = new Set(APPROVED_AFRICA_ISO3);
    const caribbeanSet = new Set(APPROVED_CARIBBEAN_ISO3);

    if (direction === 'africa_to_caribbean') {
      if (!africaSet.has(origin as typeof APPROVED_AFRICA_ISO3[number])) {
        return NextResponse.json({ error: 'origin must be an approved African market for africa_to_caribbean' }, { status: 400 });
      }
      if (!caribbeanSet.has(dest as typeof APPROVED_CARIBBEAN_ISO3[number])) {
        return NextResponse.json({ error: 'dest must be an approved Caribbean market for africa_to_caribbean' }, { status: 400 });
      }
    } else {
      if (!caribbeanSet.has(origin as typeof APPROVED_CARIBBEAN_ISO3[number])) {
        return NextResponse.json({ error: 'origin must be an approved Caribbean market for caribbean_to_africa' }, { status: 400 });
      }
      if (!africaSet.has(dest as typeof APPROVED_AFRICA_ISO3[number])) {
        return NextResponse.json({ error: 'dest must be an approved African market for caribbean_to_africa' }, { status: 400 });
      }
    }

    const supabase = getServiceClient();
    const { africaCapacity, caribbeanCapacity, demandByIsoGroup } = await loadAfcetaSourceMaps(supabase, year);
    const capacityMap = direction === 'africa_to_caribbean' ? africaCapacity : caribbeanCapacity;

    const { data: dbRows } = await supabase
      .from('souvera_afceta_corridor_signals')
      .select('origin_iso3, dest_iso3, direction, category_group, is_spotlight, data_quality_tier')
      .eq('data_year', year)
      .eq('origin_iso3', origin)
      .eq('dest_iso3', dest)
      .eq('direction', direction);

    const dbIndex = new Map<string, { is_spotlight: boolean; data_quality_tier: string }>();
    for (const r of dbRows ?? []) {
      dbIndex.set(r.category_group, {
        is_spotlight: r.is_spotlight,
        data_quality_tier: r.data_quality_tier,
      });
    }

    const rows = categories.map((category) => {
      const capacity = capacityMap.get(capacityKey(origin, category)) ?? 0;
      const demand = demandForCategory(demandByIsoGroup, dest, category);
      const dbMatch = dbIndex.get(category);

      const row = buildCorridorRow({
        origin_iso3: origin,
        dest_iso3: dest,
        direction,
        category_group: category,
        origin_capacity_usd: capacity,
        dest_demand_usd: demand,
        data_quality_tier: dbMatch?.is_spotlight ? 'A' : dbMatch ? (dbMatch.data_quality_tier as 'A' | 'B' | 'C') : 'B',
        is_spotlight: dbMatch?.is_spotlight ?? false,
        methodology_note: LAB_METHODOLOGY,
        data_year: year,
      });

      return {
        ...row,
        id: `lab-${origin}-${dest}-${direction}-${category}`,
        platform_index_match: !!dbMatch,
        evaluation_mode: 'custom' as const,
      };
    });

    rows.sort((a, b) => b.opportunity_score - a.opportunity_score);

    const pairs = new Set([`${origin}-${dest}`]);
    const spotlightCount = rows.filter((r) => r.is_spotlight).length;

    return NextResponse.json({
      rows,
      summary: {
        record_count: rows.length,
        corridor_pairs: pairs.size,
        spotlight_count: spotlightCount,
        data_vintage: `${year}`,
        direction,
        origin,
        dest,
      },
      attribution: {
        sources: ['AfCFTA Trade Flows', 'CBTPA Flows', 'Import Demand Signals'],
        note: AFCETA_METHODOLOGY_NOTE,
      },
      evaluation_mode: 'custom',
    });
  } catch (e) {
    console.error('[afceta-evaluate] Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
