/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix API
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 *
 * GET /api/v1/intelligence/supply-demand
 * Query params:
 *   - region: 'Africa' | 'Caribbean' (optional, filters by region)
 *   - sector: sector_key or comma-separated list (optional)
 *   - iso3: country code or comma-separated list (optional)
 *   - min_opportunity_score: number 0-100 (optional)
 *   - tier: 1|2|3|4 or comma-separated list (optional)
 *   - agoa_only: boolean (optional, filters AGOA-eligible only)
 *   - cbtpa_only: boolean (optional, filters CBTPA-eligible only)
 *   - year: data year (default: 2023)
 *   - limit: max results (default: 600)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEntitlement } from '@/lib/access/server-entitlements';
import type {
  MatrixCell,
  MatrixSummary,
  SectorSummary,
  CountrySummary,
  SupplyDemandResponse,
  ConfidenceLevel,
  OpportunityTier,
} from '@/lib/intelligence/supply-demand-types';
import {
  annotateSdmCellPreferentialExclusion,
  filterSdmMatrixForPreferentialView,
  sdmPetroleumFilterStats,
  SDM_PETROLEUM_EXCLUSION_REASON,
} from '@/lib/intelligence/sdm-petroleum-filter';
import { attachSdmExportProducts } from '@/lib/intelligence/sdm-export-products';
import { attachSdmCountryImportVolume } from '@/lib/intelligence/sdm-import-volume';

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
    // Check authentication and entitlement (Investor+ tier required)
    const access = await requireEntitlement('supply_demand_matrix');

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const region = searchParams.get('region') as 'Africa' | 'Caribbean' | null;
    const sectorParam = searchParams.get('sector');
    const iso3Param = searchParams.get('iso3');
    const minOpportunityScore = searchParams.get('min_opportunity_score');
    const tierParam = searchParams.get('tier');
    const agoaOnly = searchParams.get('agoa_only') === 'true';
    const cbtpaOnly = searchParams.get('cbtpa_only') === 'true';
    const excludePetroleum = searchParams.get('exclude_petroleum') === 'true';
    const yearFilter = parseInt(searchParams.get('year') || '2023', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '600', 10), 600);

    const supabase = getServiceClient();

    // Build query
    let query = supabase
      .from('souvera_supply_demand_signals')
      .select('*')
      .eq('data_year', yearFilter)
      .order('opportunity_score', { ascending: false, nullsFirst: false })
      .limit(limit);

    // Apply filters
    if (region) {
      query = query.eq('region', region);
    }

    if (sectorParam) {
      const sectors = sectorParam.split(',').map(s => s.trim());
      if (sectors.length === 1) {
        query = query.eq('sector_key', sectors[0]);
      } else {
        query = query.in('sector_key', sectors);
      }
    }

    if (iso3Param) {
      const iso3s = iso3Param.split(',').map(s => s.trim().toUpperCase());
      if (iso3s.length === 1) {
        query = query.eq('iso3', iso3s[0]);
      } else {
        query = query.in('iso3', iso3s);
      }
    }

    if (minOpportunityScore) {
      query = query.gte('opportunity_score', parseFloat(minOpportunityScore));
    }

    if (tierParam) {
      const tiers = tierParam.split(',').map(t => parseInt(t.trim(), 10));
      if (tiers.length === 1) {
        query = query.eq('opportunity_tier', tiers[0]);
      } else {
        query = query.in('opportunity_tier', tiers);
      }
    }

    if (agoaOnly) {
      query = query.eq('agoa_eligible', true);
    }

    if (cbtpaOnly) {
      query = query.eq('cbtpa_eligible', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[supply-demand] Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    // Transform rows to MatrixCell format + petroleum preferential annotations
    let matrix: MatrixCell[] = (data || []).map((r) =>
      annotateSdmCellPreferentialExclusion({
      id: r.id,
      iso3: r.iso3,
      country_name: r.country_name,
      region: r.region,
      sector_key: r.sector_key,
      sector_label: r.sector_label,
      
      supply_score: parseFloat(r.supply_score) || 0,
      supply_confidence: r.supply_confidence as ConfidenceLevel,
      supply_components: r.supply_components || {},
      supply_notes: r.supply_notes,
      
      export_volume_usd: parseInt(r.export_volume_usd) || 0,
      manufacturing_capacity_index: parseFloat(r.manufacturing_capacity_index) || 0,
      fdi_inflows_usd: parseInt(r.fdi_inflows_usd) || 0,
      infrastructure_score: parseFloat(r.infrastructure_score) || 0,
      labor_quality_index: parseFloat(r.labor_quality_index) || 0,
      regulatory_score: parseFloat(r.regulatory_score) || 0,
      
      demand_score: parseFloat(r.demand_score) || 0,
      demand_confidence: r.demand_confidence as ConfidenceLevel,
      demand_components: r.demand_components || {},
      demand_notes: r.demand_notes,
      
      us_import_volume_usd: parseInt(r.us_import_volume_usd) || 0,
      us_import_growth_pct: parseFloat(r.us_import_growth_pct) || 0,
      us_diversification_pressure: parseFloat(r.us_diversification_pressure) || 0,
      policy_incentive_score: parseFloat(r.policy_incentive_score) || 0,
      china_market_share_pct: parseFloat(r.china_market_share_pct) || 0,
      
      opportunity_score: parseFloat(r.opportunity_score) || 0,
      opportunity_tier: r.opportunity_tier as OpportunityTier,
      opportunity_rationale: r.opportunity_rationale || '',
      
      current_trade_usd: parseInt(r.current_trade_usd) || 0,
      tariff_preference_margin_pct: parseFloat(r.tariff_preference_margin_pct) || 0,
      top_competitors: r.top_competitors || [],
      
      agoa_eligible: r.agoa_eligible || false,
      cbtpa_eligible: r.cbtpa_eligible || false,
      afcfta_member: r.afcfta_member || false,
      us_fta: r.us_fta || false,
      
      data_year: r.data_year,
      data_quality_tier: r.data_quality_tier as ConfidenceLevel,
      source_notes: r.source_notes,
    })
    );

    const petroleumStats = sdmPetroleumFilterStats(matrix);
    if (excludePetroleum) {
      matrix = filterSdmMatrixForPreferentialView(matrix, true);
    }

    matrix = await attachSdmExportProducts(matrix, supabase, yearFilter);
    matrix = await attachSdmCountryImportVolume(matrix, supabase, yearFilter);

    // Calculate summary statistics
    const totalCells = matrix.length;
    const tierDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const qualityBreakdown = { A: 0, B: 0, C: 0 };
    let sumSupply = 0, sumDemand = 0, sumOpportunity = 0;

    for (const cell of matrix) {
      tierDistribution[cell.opportunity_tier]++;
      qualityBreakdown[cell.data_quality_tier]++;
      sumSupply += cell.supply_score;
      sumDemand += cell.demand_score;
      sumOpportunity += cell.opportunity_score;
    }

    const summary: MatrixSummary = {
      total_cells: totalCells,
      tier_distribution: tierDistribution,
      avg_supply_score: totalCells > 0 ? Math.round((sumSupply / totalCells) * 10) / 10 : 0,
      avg_demand_score: totalCells > 0 ? Math.round((sumDemand / totalCells) * 10) / 10 : 0,
      avg_opportunity_score: totalCells > 0 ? Math.round((sumOpportunity / totalCells) * 10) / 10 : 0,
      top_opportunities: matrix.slice(0, 10),
      data_quality_breakdown: qualityBreakdown,
      data_vintage: `${yearFilter} (curated estimate — World Bank · UN Comtrade · UNCTAD)`,
    };

    // Calculate sector summaries
    const sectorMap: Map<string, { 
      label: string; 
      cells: MatrixCell[];
      sumSupply: number;
      sumDemand: number;
      sumOpportunity: number;
      tier1: number;
      tier2: number;
    }> = new Map();

    for (const cell of matrix) {
      const existing = sectorMap.get(cell.sector_key);
      if (existing) {
        existing.cells.push(cell);
        existing.sumSupply += cell.supply_score;
        existing.sumDemand += cell.demand_score;
        existing.sumOpportunity += cell.opportunity_score;
        if (cell.opportunity_tier === 1) existing.tier1++;
        if (cell.opportunity_tier === 2) existing.tier2++;
      } else {
        sectorMap.set(cell.sector_key, {
          label: cell.sector_label,
          cells: [cell],
          sumSupply: cell.supply_score,
          sumDemand: cell.demand_score,
          sumOpportunity: cell.opportunity_score,
          tier1: cell.opportunity_tier === 1 ? 1 : 0,
          tier2: cell.opportunity_tier === 2 ? 1 : 0,
        });
      }
    }

    const sectors: SectorSummary[] = Array.from(sectorMap.entries()).map(([key, data]) => {
      const count = data.cells.length;
      const topCell = data.cells.sort((a, b) => b.opportunity_score - a.opportunity_score)[0];
      return {
        sector_key: key,
        sector_label: data.label,
        cell_count: count,
        avg_supply_score: Math.round((data.sumSupply / count) * 10) / 10,
        avg_demand_score: Math.round((data.sumDemand / count) * 10) / 10,
        avg_opportunity_score: Math.round((data.sumOpportunity / count) * 10) / 10,
        tier_1_count: data.tier1,
        tier_2_count: data.tier2,
        top_market: topCell ? {
          iso3: topCell.iso3,
          name: topCell.country_name,
          opportunity_score: topCell.opportunity_score,
        } : null,
      };
    });

    // Calculate country summaries
    const countryMap: Map<string, {
      name: string;
      region: string;
      cells: MatrixCell[];
      sumSupply: number;
      sumDemand: number;
      sumOpportunity: number;
      agoa_eligible: boolean;
      cbtpa_eligible: boolean;
    }> = new Map();

    for (const cell of matrix) {
      const existing = countryMap.get(cell.iso3);
      if (existing) {
        existing.cells.push(cell);
        existing.sumSupply += cell.supply_score;
        existing.sumDemand += cell.demand_score;
        existing.sumOpportunity += cell.opportunity_score;
      } else {
        countryMap.set(cell.iso3, {
          name: cell.country_name,
          region: cell.region,
          cells: [cell],
          sumSupply: cell.supply_score,
          sumDemand: cell.demand_score,
          sumOpportunity: cell.opportunity_score,
          agoa_eligible: cell.agoa_eligible,
          cbtpa_eligible: cell.cbtpa_eligible,
        });
      }
    }

    const countries: CountrySummary[] = Array.from(countryMap.entries()).map(([iso3, data]) => {
      const count = data.cells.length;
      const bestSector = data.cells.sort((a, b) => b.opportunity_score - a.opportunity_score)[0];
      return {
        iso3,
        country_name: data.name,
        region: data.region,
        cell_count: count,
        avg_supply_score: Math.round((data.sumSupply / count) * 10) / 10,
        avg_demand_score: Math.round((data.sumDemand / count) * 10) / 10,
        avg_opportunity_score: Math.round((data.sumOpportunity / count) * 10) / 10,
        best_sector: bestSector ? {
          sector_key: bestSector.sector_key,
          sector_label: bestSector.sector_label,
          opportunity_score: bestSector.opportunity_score,
        } : null,
        agoa_eligible: data.agoa_eligible,
        cbtpa_eligible: data.cbtpa_eligible,
      };
    }).sort((a, b) => b.avg_opportunity_score - a.avg_opportunity_score);

    const response: SupplyDemandResponse = {
      matrix,
      summary,
      sectors,
      countries,
      attribution: {
        sources: [
          'UN Comtrade',
          'World Bank Development Indicators',
          'UNCTAD FDI Statistics',
          'US Census Bureau',
          'Bureau of Economic Analysis',
          'National Statistics Offices',
        ],
        note: 'Quantified opportunity scoring where African/Caribbean supply meets US demand. Tier A data curated from primary sources; Tier B/C data programmatically estimated. Energy & Power (HTS Ch. 27) cells are flagged as excluded from AGOA/CBI preferential treatment. Methodology available in whitepaper.',
        methodology_url: '/docs/supply-demand-methodology',
        petroleum_exclusion_note: SDM_PETROLEUM_EXCLUSION_REASON,
        petroleum_excluded_cells: petroleumStats.excluded_cells,
      },
    };

    return NextResponse.json(response);
  } catch (e: any) {
    // Handle entitlement errors gracefully
    if (e?.message?.includes('Requires subscription') || e?.message?.includes('entitlement')) {
      return NextResponse.json(
        { 
          error: 'Investor tier required', 
          message: 'The Supply-Demand Matrix is available to Investor and Institutional tier subscribers.',
          upgrade_url: '/access',
        }, 
        { status: 403 }
      );
    }
    
    console.error('[supply-demand] Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
