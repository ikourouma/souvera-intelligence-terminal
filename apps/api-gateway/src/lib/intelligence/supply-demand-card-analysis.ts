/**
 * Curated executive Souvera analysis for Supply-Demand Matrix card exports.
 */

import { formatUsdCompact } from '@/lib/intelligence/format-usd';
import { formatTradeCountryLabel } from '@/lib/intelligence/export-branding';
import {
  preferentialLabelForCell,
  SDM_PRODUCT_MIX_FOOTNOTE,
  SDM_IMPORT_NEEDS_PENDING_NOTE,
  computeCountryImportDemandScore,
  capacityCorridorBridge,
  countryImportVolumeLabel,
  buildCountrySupplyProducts,
} from '@/lib/intelligence/sdm-sector-products';
import type { MatrixCell } from '@/lib/intelligence/supply-demand-types';
export type SupplyDemandCardType =
  | 'matrix_summary'
  | 'opportunity_score'
  | 'quick_stats'
  | 'supply_analysis'
  | 'us_import_demand'
  | 'country_import_needs'
  | 'competitive_landscape'
  | 'executive_summary';

function demandScoreExplainer(score: number, sector: string): string {
  if (score >= 70) {
    return `An Import Demand Score of ${score}/100 signals strong structural need for ${sector.toLowerCase()} imports — U.S. suppliers face favourable market depth and diversification pressure from incumbent exporters.`;
  }
  if (score >= 40) {
    return `An Import Demand Score of ${score}/100 indicates moderate import need for ${sector.toLowerCase()} — demand exists but competitive intensity and infrastructure gaps require targeted market entry.`;
  }
  return `An Import Demand Score of ${score}/100 reflects constrained near-term import pull for ${sector.toLowerCase()} — opportunities are niche or require longer capacity-building horizons.`;
}

export function buildSupplyDemandCardAnalysis(
  cardType: SupplyDemandCardType,
  cell: MatrixCell,
  extras?: {
    flowDirection?: 'africa_to_us' | 'us_to_africa';
    countryDemandScore?: number;
    reverseImportNeeds?: string;
  }
): string {
  const { country_name: name, sector_label: sector, iso3 } = cell;
  const flow = extras?.flowDirection ?? 'africa_to_us';

  switch (cardType) {
    case 'matrix_summary': {
      const p1 = `The Supply-Demand Matrix maps ${cell.region} export capacity against U.S. import demand by sector, enabling cross-market comparison of opportunity tiers, tariff advantages, and competitive positioning.`;
      const p2 = `${formatTradeCountryLabel(iso3, name)} in ${sector} registers an opportunity score of ${Math.round(cell.opportunity_score)} with supply confidence ${cell.supply_confidence} and demand confidence ${cell.demand_confidence}.`;
      const p3 = `SOUVERA integrates World Bank, UN Comtrade, and census-derived demand signals to surface actionable export corridors ahead of policy reauthorisation cycles. Data vintage: ${cell.data_year}.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'opportunity_score': {
      const score = flow === 'africa_to_us' ? Math.round(cell.opportunity_score) : (extras?.countryDemandScore ?? 0);
      const p1 = `${name}'s ${flow === 'africa_to_us' ? 'Export' : 'Import'} Opportunity Score of ${score}/100 synthesises supply capacity, U.S. demand intensity, preferential eligibility, and policy incentives into a single investor-ready signal for ${sector}.`;
      const p2 = `Tier ${cell.opportunity_tier} classification reflects ${cell.opportunity_tier <= 2 ? 'near-term deployability with established infrastructure' : 'longer-horizon capital with capacity-building requirements'}. Supply score ${Math.round(cell.supply_score)}/100 and demand score ${Math.round(cell.demand_score)}/100 anchor the composite.`;
      const p3 = `Scores above 60 typically warrant due diligence on rules-of-origin compliance, logistics corridors, and trade-finance availability before contract structuring.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'us_import_demand': {
      const p1 = `${name}'s U.S. Import Demand profile for ${sector} shows demand score ${Math.round(cell.demand_score)}/100 with ${formatUsdCompact(cell.us_import_volume_usd)} in related U.S. import volume and ${cell.us_import_growth_pct >= 0 ? '+' : ''}${cell.us_import_growth_pct.toFixed(1)}% five-year CAGR.`;
      const p2 = demandScoreExplainer(Math.round(cell.demand_score), sector);
      const p3 = `Diversification pressure score ${Math.round(cell.us_diversification_pressure)}/100 and policy incentive score ${Math.round(cell.policy_incentive_score)}/100 indicate whether U.S. buyers are actively seeking alternative suppliers beyond incumbent markets. Confidence: ${cell.demand_confidence}.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'country_import_needs': {
      const score = extras?.countryDemandScore ?? computeCountryImportDemandScore(cell);
      const p1 = `${name}'s Import Needs index for ${sector} scores ${score}/100 — a modeled pull signal based on supply gaps and infrastructure capacity, not customs-reported import totals.`;
      const p2 = demandScoreExplainer(score, sector);
      const p3 = `${SDM_IMPORT_NEEDS_PENDING_NOTE} U.S. sector reference market: ${formatUsdCompact(cell.us_import_volume_usd)}/yr total imports (shared baseline across all suppliers in this sector).`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'supply_analysis': {
      const bridge = capacityCorridorBridge(cell);
      const p1 = `${name}'s supply-side score of ${Math.round(cell.supply_score)}/100 for ${sector} reflects sector export capacity (${formatUsdCompact(cell.export_volume_usd)} all destinations), manufacturing capacity index ${cell.manufacturing_capacity_index}, and FDI inflows of ${formatUsdCompact(cell.fdi_inflows_usd)}.`;
      const p2 = `Infrastructure (${Math.round(cell.infrastructure_score)}/100) and labor quality (${Math.round(cell.labor_quality_index)}/100) determine execution risk. Current bilateral exports to the U.S.: ${formatUsdCompact(cell.current_trade_usd)}/year.${bridge ? ` ${bridge}` : ''}`;
      const prefLabel = preferentialLabelForCell(cell);
      const reauth = cell.region === 'Caribbean' ? 'CBI/CBTPA' : 'AGOA';
      const p3 = `${prefLabel} status under preferential rules of origin — duty-free entry subject to product-specific HTS qualification and ${reauth} reauthorisation cycles. ${SDM_PRODUCT_MIX_FOOTNOTE}`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'quick_stats': {
      const prefNote = cell.agoa_eligible || cell.cbtpa_eligible
        ? `${cell.agoa_eligible ? 'AGOA' : 'CBTPA'} preferential eligibility`
        : 'MFN tariff schedule';
      const p1 = `${name}'s ${sector} quick stats summarise bilateral trade (${formatUsdCompact(cell.current_trade_usd)}/year to the U.S.), preferential status (${prefNote}), and U.S. import growth (${cell.us_import_growth_pct >= 0 ? '+' : ''}${cell.us_import_growth_pct.toFixed(1)}% five-year CAGR).`;
      const p2 = demandScoreExplainer(Math.round(cell.demand_score), sector);
      const p3 = `Policy badges (${cell.agoa_eligible ? 'AGOA eligible' : 'AGOA not active'}, ${cell.cbtpa_eligible ? 'CBTPA eligible' : 'CBTPA n/a'}) and data tier ${cell.data_quality_tier} should anchor any export corridor thesis.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'competitive_landscape': {
      const p1 = `China controls ${cell.china_market_share_pct.toFixed(1)}% of U.S. imports in ${sector.toLowerCase()} — ${cell.china_market_share_pct > 30 ? 'creating high diversification pressure for alternative suppliers' : 'leaving room for niche supplier entry'}.`;
      const topComp = cell.top_competitors?.[0];
      const p2 = topComp
        ? `Top incumbent ${topComp.country} holds ${topComp.sharePct?.toFixed(1) ?? '—'}% share; ${name} must differentiate on rules-of-origin compliance, logistics cost, or specification quality to capture share.`
        : `${name} competes against established suppliers on landed cost, rules-of-origin compliance, and logistics reliability.`;
      const p3 = `Diversification pressure score ${Math.round(cell.us_diversification_pressure)}/100 signals whether U.S. buyers are actively seeking non-incumbent sources in this sector.`;
      return [p1, p2, p3].join('\n\n');
    }
    case 'executive_summary': {
      const pref = preferentialLabelForCell(cell);
      const importScore = extras?.countryDemandScore ?? computeCountryImportDemandScore(cell);
      const bridge = capacityCorridorBridge(cell);
      const topExport = buildCountrySupplyProducts(cell)[0]?.name;
      const exportProductNote = topExport ? ` (lead product: ${topExport})` : '';
      const countryImportVol = countryImportVolumeLabel(cell);
      const exportLane = `**Region → U.S. (export):** ${name} ${sector} — opportunity ${Math.round(cell.opportunity_score)}/100; sector capacity ${formatUsdCompact(cell.export_volume_usd)}; U.S. corridor ${formatUsdCompact(cell.current_trade_usd)}/yr${exportProductNote}; supply ${Math.round(cell.supply_score)}/100; U.S. sector demand ${Math.round(cell.demand_score)}/100 (${formatUsdCompact(cell.us_import_volume_usd)}/yr market).${bridge ? ` ${bridge}` : ''}`;
      const importLane = `**U.S. → ${cell.region} (import):** country import volume ${countryImportVol}; import demand index ${importScore}/100; preferential framing ${pref}.`;
      const p1 = exportLane;
      const p2 = importLane;
      const p3 = `Supply confidence ${cell.supply_confidence} · demand confidence ${cell.demand_confidence} · data vintage ${cell.data_year} · tier ${cell.data_quality_tier}. China ${cell.china_market_share_pct.toFixed(1)}% of U.S. sector imports; diversification pressure ${Math.round(cell.us_diversification_pressure)}/100. ${SDM_PRODUCT_MIX_FOOTNOTE}`;
      return [p1, p2, p3].join('\n\n');
    }
    default: {
      const p1 = `${name} ${sector} supply-demand intelligence from SOUVERA's cross-market matrix.`;
      const p2 = `Opportunity score ${Math.round(cell.opportunity_score)}/100 · Supply ${Math.round(cell.supply_score)}/100 · Demand ${Math.round(cell.demand_score)}/100.`;
      const p3 = `Data vintage ${cell.data_year} · Tier ${cell.data_quality_tier} quality.`;
      return [p1, p2, p3].join('\n\n');
    }
  }
}

/** Matrix-wide export when no single cell is selected */
export function buildSupplyDemandMatrixSummaryAnalysis(
  cellCount: number,
  dataVintage?: string,
  topCell?: MatrixCell
): string {
  const p1 = `The Supply-Demand Matrix maps export capacity across 74 African and Caribbean markets against U.S. import demand by sector — enabling cross-market comparison of opportunity tiers, tariff advantages, and competitive positioning.`;
  const p2 = topCell
    ? `${topCell.country_name} leads the current view in ${topCell.sector_label} with opportunity score ${Math.round(topCell.opportunity_score)}/100 across ${cellCount} tracked country-sector cells.`
    : `${cellCount} country-sector cells are tracked with composite supply, demand, and opportunity scoring.`;
  const p3 = `SOUVERA integrates World Bank, UN Comtrade, and census-derived demand signals. Data vintage: ${dataVintage ?? 'current'}.`;
  return [p1, p2, p3].join('\n\n');
}
