/**
 * Spot-check SDM export products — 3 lines per cell, KEN ≠ SEN agriculture.
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/spot-check-sdm-export-products.ts
 */
import { createClient } from '@supabase/supabase-js';
import { attachSdmExportProducts } from '../src/lib/intelligence/sdm-export-products';
import { attachSdmCountryImportVolume } from '../src/lib/intelligence/sdm-import-volume';
import {
  buildCountrySupplyProducts,
  countryImportVolumeLabel,
  SDM_TOP_EXPORT_PRODUCT_COUNT,
} from '../src/lib/intelligence/sdm-sector-products';
import type { MatrixCell } from '../src/lib/intelligence/supply-demand-types';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const iso3s = ['KEN', 'SEN', 'JAM', 'GUY', 'GIN'];
  const { data, error } = await sb
    .from('souvera_supply_demand_signals')
    .select('*')
    .eq('data_year', 2023)
    .in('iso3', iso3s)
    .eq('sector_key', 'agriculture_food');

  if (error) throw new Error(error.message);

  let matrix: MatrixCell[] = (data ?? []).map((r) => ({
    id: r.id,
    iso3: r.iso3,
    country_name: r.country_name,
    region: r.region,
    sector_key: r.sector_key,
    sector_label: r.sector_label,
    supply_score: parseFloat(r.supply_score) || 0,
    supply_confidence: r.supply_confidence,
    supply_components: r.supply_components ?? {},
    supply_notes: r.supply_notes,
    export_volume_usd: parseInt(r.export_volume_usd) || 0,
    manufacturing_capacity_index: parseFloat(r.manufacturing_capacity_index) || 0,
    fdi_inflows_usd: parseInt(r.fdi_inflows_usd) || 0,
    infrastructure_score: parseFloat(r.infrastructure_score) || 0,
    labor_quality_index: parseFloat(r.labor_quality_index) || 0,
    regulatory_score: parseFloat(r.regulatory_score) || 0,
    demand_score: parseFloat(r.demand_score) || 0,
    demand_confidence: r.demand_confidence,
    demand_components: r.demand_components ?? {},
    demand_notes: r.demand_notes,
    us_import_volume_usd: parseInt(r.us_import_volume_usd) || 0,
    us_import_growth_pct: parseFloat(r.us_import_growth_pct) || 0,
    us_diversification_pressure: parseFloat(r.us_diversification_pressure) || 0,
    policy_incentive_score: parseFloat(r.policy_incentive_score) || 0,
    china_market_share_pct: parseFloat(r.china_market_share_pct) || 0,
    opportunity_score: parseFloat(r.opportunity_score) || 0,
    opportunity_tier: r.opportunity_tier,
    opportunity_rationale: r.opportunity_rationale ?? '',
    current_trade_usd: parseInt(r.current_trade_usd) || 0,
    tariff_preference_margin_pct: parseFloat(r.tariff_preference_margin_pct) || 0,
    top_competitors: r.top_competitors ?? [],
    agoa_eligible: Boolean(r.agoa_eligible),
    cbtpa_eligible: Boolean(r.cbtpa_eligible),
    afcfta_member: Boolean(r.afcfta_member),
    us_fta: Boolean(r.us_fta),
    data_year: r.data_year,
    data_quality_tier: r.data_quality_tier,
    source_notes: r.source_notes,
  }));

  matrix = await attachSdmExportProducts(matrix, sb, 2023);
  matrix = await attachSdmCountryImportVolume(matrix, sb, 2023);

  console.log('\n=== SDM Export Products Spot-Check ===\n');
  let pass = 0;
  let fail = 0;

  for (const cell of matrix) {
    const products = buildCountrySupplyProducts(cell);
    const okCount = products.length === SDM_TOP_EXPORT_PRODUCT_COUNT;
    console.log(`\n${cell.iso3} agriculture_food (${okCount} products):`);
    products.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} — ${p.value} (${p.share})`));
    console.log(`  Country import volume: ${countryImportVolumeLabel(cell)}`);
    if (okCount) pass++;
    else fail++;
  }

  const ken = buildCountrySupplyProducts(matrix.find((c) => c.iso3 === 'KEN')!);
  const sen = buildCountrySupplyProducts(matrix.find((c) => c.iso3 === 'SEN')!);
  const gin = buildCountrySupplyProducts(matrix.find((c) => c.iso3 === 'GIN')!);
  const namesDistinct = ken[0]?.name !== sen[0]?.name;
  const ginOk = !gin.some((p) => p.name === 'Beverages & Rum');
  console.log(`\nKEN lead: ${ken[0]?.name}`);
  console.log(`SEN lead: ${sen[0]?.name}`);
  console.log(`GIN lead: ${gin[0]?.name} (${gin[0]?.value})`);
  console.log(namesDistinct ? '✅ KEN ≠ SEN product names' : '❌ KEN = SEN product names');
  console.log(ginOk ? '✅ GIN has no Caribbean rum label' : '❌ GIN shows Beverages & Rum');

  process.exit(fail > 0 || !namesDistinct || !ginOk ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
