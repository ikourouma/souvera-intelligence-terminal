/**
 * SDM data consistency audit — all 592 cells (74 markets × 8 sectors).
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-sdm-data-consistency.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { SECTOR_DEFINITIONS } from '../src/lib/intelligence/supply-demand-types';
import { attachSdmExportProducts } from '../src/lib/intelligence/sdm-export-products';
import { attachSdmCountryImportVolume } from '../src/lib/intelligence/sdm-import-volume';
import { buildCountrySupplyProducts, SDM_TOP_EXPORT_PRODUCT_COUNT } from '../src/lib/intelligence/sdm-sector-products';
import { isRegionInappropriateProduct } from '../src/lib/intelligence/sdm-country-export-profiles';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const ALL74 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const SECTORS = Object.keys(SECTOR_DEFINITIONS);
const DATA_YEAR = 2023;

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: rows, error } = await sb
    .from('souvera_supply_demand_signals')
    .select('*')
    .eq('data_year', DATA_YEAR);

  if (error) throw new Error(error.message);

  let matrix = (rows ?? []).map((r) => ({
    id: r.id as string,
    iso3: r.iso3 as string,
    country_name: r.country_name as string,
    region: r.region as 'Africa' | 'Caribbean',
    sector_key: r.sector_key as string,
    sector_label: r.sector_label as string,
    supply_score: parseFloat(r.supply_score) || 0,
    supply_confidence: r.supply_confidence as 'A' | 'B' | 'C',
    supply_components: r.supply_components ?? {},
    supply_notes: r.supply_notes as string | null,
    export_volume_usd: parseInt(r.export_volume_usd) || 0,
    manufacturing_capacity_index: parseFloat(r.manufacturing_capacity_index) || 0,
    fdi_inflows_usd: parseInt(r.fdi_inflows_usd) || 0,
    infrastructure_score: parseFloat(r.infrastructure_score) || 0,
    labor_quality_index: parseFloat(r.labor_quality_index) || 0,
    regulatory_score: parseFloat(r.regulatory_score) || 0,
    demand_score: parseFloat(r.demand_score) || 0,
    demand_confidence: r.demand_confidence as 'A' | 'B' | 'C',
    demand_components: r.demand_components ?? {},
    demand_notes: r.demand_notes as string | null,
    us_import_volume_usd: parseInt(r.us_import_volume_usd) || 0,
    us_import_growth_pct: parseFloat(r.us_import_growth_pct) || 0,
    us_diversification_pressure: parseFloat(r.us_diversification_pressure) || 0,
    policy_incentive_score: parseFloat(r.policy_incentive_score) || 0,
    china_market_share_pct: parseFloat(r.china_market_share_pct) || 0,
    opportunity_score: parseFloat(r.opportunity_score) || 0,
    opportunity_tier: r.opportunity_tier as 1 | 2 | 3 | 4,
    opportunity_rationale: (r.opportunity_rationale as string) ?? '',
    current_trade_usd: parseInt(r.current_trade_usd) || 0,
    tariff_preference_margin_pct: parseFloat(r.tariff_preference_margin_pct) || 0,
    top_competitors: r.top_competitors ?? [],
    agoa_eligible: Boolean(r.agoa_eligible),
    cbtpa_eligible: Boolean(r.cbtpa_eligible),
    afcfta_member: Boolean(r.afcfta_member),
    us_fta: Boolean(r.us_fta),
    data_year: r.data_year as number,
    data_quality_tier: r.data_quality_tier as 'A' | 'B' | 'C',
    source_notes: r.source_notes as string | null,
  }));

  matrix = await attachSdmExportProducts(matrix, sb, DATA_YEAR);
  matrix = await attachSdmCountryImportVolume(matrix, sb, DATA_YEAR);

  const missingCells: string[] = [];
  const notThreeProducts: string[] = [];
  const duplicateKenSen: string[] = [];
  const regionInappropriate: string[] = [];
  const cellKeys = new Set(matrix.map((c) => `${c.iso3}:${c.sector_key}`));
  for (const iso of ALL74) {
    for (const sec of SECTORS) {
      if (!cellKeys.has(`${iso}:${sec}`)) missingCells.push(`${iso}/${sec}`);
    }
  }

  const productSumMismatch: string[] = [];
  let flowBacked = 0;
  let templateBacked = 0;

  for (const cell of matrix) {
    const products = buildCountrySupplyProducts(cell);
    if (products.length !== SDM_TOP_EXPORT_PRODUCT_COUNT) {
      notThreeProducts.push(`${cell.iso3}/${cell.sector_key}: ${products.length} products`);
    }
    for (const p of products) {
      if (isRegionInappropriateProduct(p.name, cell.region)) {
        regionInappropriate.push(`${cell.iso3}/${cell.sector_key}: "${p.name}" on ${cell.region}`);
      }
    }
    const sum = products.reduce((s, p) => s + p.valueUsd, 0);
    const base = cell.export_products?.length
      ? cell.export_products.reduce((s, p) => s + p.valueUsd, 0)
      : cell.export_volume_usd > 0
        ? cell.export_volume_usd
        : cell.current_trade_usd;

    if (cell.export_products?.length) flowBacked++;
    else if (products.length && base > 0) templateBacked++;

    if (base > 0 && sum > 0) {
      const delta = Math.abs(sum - base);
      const tol = Math.max(base * 0.05, 10_000);
      if (delta > tol && !cell.export_products?.length) {
        productSumMismatch.push(
          `${cell.iso3}/${cell.sector_key}: products=${sum} base=${base} (template scale)`,
        );
      }
    }
  }

  const kenAg = matrix.find((c) => c.iso3 === 'KEN' && c.sector_key === 'agriculture_food');
  const senAg = matrix.find((c) => c.iso3 === 'SEN' && c.sector_key === 'agriculture_food');
  if (kenAg && senAg) {
    const kenNames = buildCountrySupplyProducts(kenAg).map((p) => p.name).join('|');
    const senNames = buildCountrySupplyProducts(senAg).map((p) => p.name).join('|');
    if (kenNames === senNames) duplicateKenSen.push(`KEN and SEN agriculture share identical product names: ${kenNames}`);
  }

  console.log('\n=== SDM Data Consistency Audit (592 cells) ===\n');
  console.log(`Cells loaded: ${matrix.length}/592`);
  console.log(`Missing cells: ${missingCells.length}`);
  console.log(`Cells without 3 export products: ${notThreeProducts.length}`);
  console.log(`Export products from flows: ${flowBacked}`);
  console.log(`Export products from template: ${templateBacked}`);
  console.log(`Template sum mismatches: ${productSumMismatch.length}`);
  console.log(`KEN/SEN agriculture duplicate check: ${duplicateKenSen.length ? 'FAIL' : 'PASS'}`);
  console.log(`Region-inappropriate product labels: ${regionInappropriate.length}`);

  if (missingCells.length) {
    console.log('\n--- Missing ---');
    missingCells.slice(0, 20).forEach((l) => console.log(' ', l));
  }
  if (productSumMismatch.length) {
    console.log('\n--- Product sum mismatches (sample) ---');
    productSumMismatch.slice(0, 15).forEach((l) => console.log(' ', l));
  }

  if (duplicateKenSen.length) {
    console.log('\n--- KEN/SEN duplicate ---');
    duplicateKenSen.forEach((l) => console.log(' ', l));
  }

  if (regionInappropriate.length) {
    console.log('\n--- Region-inappropriate labels (sample) ---');
    regionInappropriate.slice(0, 15).forEach((l) => console.log(' ', l));
  }

  const exitCode =
    missingCells.length > 0 || notThreeProducts.length > 0 || duplicateKenSen.length > 0 || regionInappropriate.length > 0
      ? 1
      : 0;
  process.exit(exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
