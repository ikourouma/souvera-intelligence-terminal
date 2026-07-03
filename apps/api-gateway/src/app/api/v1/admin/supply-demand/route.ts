/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Admin API
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 *
 * GET /api/v1/admin/supply-demand - List all cells with admin filters
 * POST /api/v1/admin/supply-demand - Bulk upsert cells (CSV import)
 * PATCH /api/v1/admin/supply-demand - Update individual cell
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase credentials for service client');
  }
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const adminAccess = await verifyAdminAccess(request);
    if (!adminAccess.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const sector = searchParams.get('sector');
    const iso3 = searchParams.get('iso3');
    const qualityTier = searchParams.get('quality_tier');
    const year = searchParams.get('year') || '2023';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 600);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = getServiceClient();

    let query = supabase
      .from('souvera_supply_demand_signals')
      .select('*', { count: 'exact' })
      .eq('data_year', parseInt(year, 10))
      .order('country_name', { ascending: true })
      .order('sector_key', { ascending: true })
      .range(offset, offset + limit - 1);

    if (region) query = query.eq('region', region);
    if (sector) query = query.eq('sector_key', sector);
    if (iso3) query = query.eq('iso3', iso3.toUpperCase());
    if (qualityTier) query = query.eq('data_quality_tier', qualityTier.toUpperCase());

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    // Get summary stats
    const statsQuery = await supabase
      .from('souvera_supply_demand_signals')
      .select('data_quality_tier, opportunity_tier')
      .eq('data_year', parseInt(year, 10));
    
    const qualityDistribution = { A: 0, B: 0, C: 0 };
    const tierDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
    
    (statsQuery.data || []).forEach((row: any) => {
      if (row.data_quality_tier) qualityDistribution[row.data_quality_tier as 'A' | 'B' | 'C']++;
      if (row.opportunity_tier) tierDistribution[row.opportunity_tier as 1 | 2 | 3 | 4]++;
    });

    return NextResponse.json({
      cells: data,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: (count ?? 0) > offset + limit,
      },
      summary: {
        total_cells: count,
        quality_distribution: qualityDistribution,
        tier_distribution: tierDistribution,
      },
    });
  } catch (e: any) {
    console.error('[admin/supply-demand] GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminAccess = await verifyAdminAccess(request);
    if (!adminAccess.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Cell ID required' }, { status: 400 });
    }

    // Validate allowed update fields
    const allowedFields = [
      'supply_score', 'supply_confidence', 'supply_notes',
      'demand_score', 'demand_confidence', 'demand_notes',
      'opportunity_score', 'opportunity_tier', 'opportunity_rationale',
      'export_volume_usd', 'fdi_inflows_usd', 'manufacturing_capacity_index',
      'infrastructure_score', 'labor_quality_index', 'regulatory_score',
      'current_trade_usd', 'tariff_preference_margin_pct',
      'agoa_eligible', 'cbtpa_eligible', 'afcfta_member',
      'data_quality_tier', 'source_notes',
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Auto-recalculate opportunity tier if score is updated
    if (sanitizedUpdates.opportunity_score !== undefined) {
      const score = sanitizedUpdates.opportunity_score;
      sanitizedUpdates.opportunity_tier = score >= 80 ? 1 : score >= 60 ? 2 : score >= 40 ? 3 : 4;
    }

    sanitizedUpdates.updated_at = new Date().toISOString();

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('souvera_supply_demand_signals')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ cell: data, message: 'Cell updated successfully' });
  } catch (e: any) {
    console.error('[admin/supply-demand] PATCH error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminAccess = await verifyAdminAccess(request);
    if (!adminAccess.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, cells } = body;

    if (action === 'bulk_upsert') {
      if (!Array.isArray(cells) || cells.length === 0) {
        return NextResponse.json({ error: 'Cells array required for bulk upsert' }, { status: 400 });
      }

      if (cells.length > 100) {
        return NextResponse.json({ error: 'Maximum 100 cells per batch' }, { status: 400 });
      }

      const supabase = getServiceClient();
      
      // Validate and prepare cells
      const preparedCells = cells.map((cell: any) => {
        if (!cell.iso3 || !cell.sector_key || !cell.data_year) {
          throw new Error('Each cell requires iso3, sector_key, and data_year');
        }
        
        // Auto-calculate opportunity tier if score is provided
        if (cell.opportunity_score !== undefined && cell.opportunity_tier === undefined) {
          const score = cell.opportunity_score;
          cell.opportunity_tier = score >= 80 ? 1 : score >= 60 ? 2 : score >= 40 ? 3 : 4;
        }
        
        return {
          ...cell,
          updated_at: new Date().toISOString(),
        };
      });

      const { data, error } = await supabase
        .from('souvera_supply_demand_signals')
        .upsert(preparedCells, { onConflict: 'iso3,sector_key,data_year' })
        .select();

      if (error) {
        return NextResponse.json({ error: 'Bulk upsert failed', details: error.message }, { status: 500 });
      }

      return NextResponse.json({
        message: `Successfully upserted ${data?.length ?? 0} cells`,
        cells: data,
      });
    }

    if (action === 'regenerate') {
      return NextResponse.json(
        { error: 'Regeneration must be triggered via ingestion script', 
          command: 'npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-supply-demand-matrix' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    console.error('[admin/supply-demand] POST error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}
