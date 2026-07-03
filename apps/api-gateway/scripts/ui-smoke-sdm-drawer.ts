/**
 * UI smoke test for SDM drawer data — mirrors API + product builder output.
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/ui-smoke-sdm-drawer.ts
 */
import { createClient } from '@supabase/supabase-js';
import { attachSdmExportProducts } from '../src/lib/intelligence/sdm-export-products';
import { attachSdmCountryImportVolume } from '../src/lib/intelligence/sdm-import-volume';
import {
  buildCountrySupplyProducts,
  buildUsSectorDemandProducts,
  countryImportVolumeLabel,
  SDM_TOP_EXPORT_PRODUCT_COUNT,
} from '../src/lib/intelligence/sdm-sector-products';
import { buildSupplyDemandCardAnalysis } from '../src/lib/intelligence/supply-demand-card-analysis';
import type { MatrixCell } from '../src/lib/intelligence/supply-demand-types';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

function rowToCell(r: Record<string, unknown>): MatrixCell {
  return {
    id: r.id as string,
    iso3: r.iso3 as string,
    country_name: r.country_name as string,
    region: r.region as 'Africa' | 'Caribbean',
    sector_key: r.sector_key as string,
    sector_label: r.sector_label as string,
    supply_score: parseFloat(String(r.supply_score)) || 0,
    supply_confidence: r.supply_confidence as MatrixCell['supply_confidence'],
    supply_components: (r.supply_components as MatrixCell['supply_components']) ?? {},
    supply_notes: r.supply_notes as string | null,
    export_volume_usd: parseInt(String(r.export_volume_usd)) || 0,
    manufacturing_capacity_index: parseFloat(String(r.manufacturing_capacity_index)) || 0,
    fdi_inflows_usd: parseInt(String(r.fdi_inflows_usd)) || 0,
    infrastructure_score: parseFloat(String(r.infrastructure_score)) || 0,
    labor_quality_index: parseFloat(String(r.labor_quality_index)) || 0,
    regulatory_score: parseFloat(String(r.regulatory_score)) || 0,
    demand_score: parseFloat(String(r.demand_score)) || 0,
    demand_confidence: r.demand_confidence as MatrixCell['demand_confidence'],
    demand_components: (r.demand_components as MatrixCell['demand_components']) ?? {},
    demand_notes: r.demand_notes as string | null,
    us_import_volume_usd: parseInt(String(r.us_import_volume_usd)) || 0,
    us_import_growth_pct: parseFloat(String(r.us_import_growth_pct)) || 0,
    us_diversification_pressure: parseFloat(String(r.us_diversification_pressure)) || 0,
    policy_incentive_score: parseFloat(String(r.policy_incentive_score)) || 0,
    china_market_share_pct: parseFloat(String(r.china_market_share_pct)) || 0,
    opportunity_score: parseFloat(String(r.opportunity_score)) || 0,
    opportunity_tier: r.opportunity_tier as MatrixCell['opportunity_tier'],
    opportunity_rationale: String(r.opportunity_rationale ?? ''),
    current_trade_usd: parseInt(String(r.current_trade_usd)) || 0,
    tariff_preference_margin_pct: parseFloat(String(r.tariff_preference_margin_pct)) || 0,
    top_competitors: (r.top_competitors as MatrixCell['top_competitors']) ?? [],
    agoa_eligible: Boolean(r.agoa_eligible),
    cbtpa_eligible: Boolean(r.cbtpa_eligible),
    afcfta_member: Boolean(r.afcfta_member),
    us_fta: Boolean(r.us_fta),
    data_year: r.data_year as number,
    data_quality_tier: r.data_quality_tier as MatrixCell['data_quality_tier'],
    source_notes: r.source_notes as string | null,
  };
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const checks: Array<{ label: string; ok: boolean }> = [];

  const { data: ustrRefs } = await sb
    .from('souvera_external_reference_links')
    .select('entity_key, url')
    .eq('ref_type', 'USTR_COUNTRY_PAGE')
    .in('entity_key', ['KEN', 'ZAF', 'COD']);

  for (const iso of ['KEN', 'ZAF']) {
    const ref = ustrRefs?.find((r) => r.entity_key === iso);
    checks.push({ label: `${iso} USTR link seeded`, ok: Boolean(ref?.url?.includes('ustr.gov')) });
  }

  const { data, error } = await sb
    .from('souvera_supply_demand_signals')
    .select('*')
    .eq('data_year', 2023)
    .eq('iso3', 'KEN')
    .eq('sector_key', 'agriculture_food')
    .maybeSingle();

  if (error || !data) throw new Error(error?.message ?? 'KEN agriculture cell missing');

  let cell = rowToCell(data);
  cell = (await attachSdmExportProducts([cell], sb, 2023))[0];
  cell = (await attachSdmCountryImportVolume([cell], sb, 2023))[0];

  const exports = buildCountrySupplyProducts(cell);
  const usImports = buildUsSectorDemandProducts(cell);
  const execSummary = buildSupplyDemandCardAnalysis('executive_summary', cell, {
    flowDirection: 'africa_to_us',
    countryDemandScore: 55,
  });

  checks.push({ label: 'KEN agriculture: 3 export products', ok: exports.length === SDM_TOP_EXPORT_PRODUCT_COUNT });
  checks.push({ label: 'KEN agriculture: 3 US sector import products', ok: usImports.length === 3 });
  checks.push({ label: 'KEN lead export ≠ Forest Products', ok: exports[0]?.name !== 'Forest Products' });
  checks.push({ label: 'Country import volume present', ok: (cell.country_imports_from_us_usd ?? 0) > 0 });
  checks.push({ label: 'Executive summary mentions country import volume', ok: execSummary.includes('country import volume') });

  console.log('\n=== SDM Drawer UI Smoke (KEN agriculture) ===\n');
  console.log('Top Export Products:');
  exports.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} — ${p.value} (${p.share})`));
  console.log('\nTop U.S. Sector Import Products:');
  usImports.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} — ${p.value}`));
  console.log(`\nCountry import volume: ${countryImportVolumeLabel(cell)}`);
  console.log('\nExecutive summary (excerpt):');
  console.log(execSummary.split('\n\n')[1]?.slice(0, 200) + '...');

  console.log('\n--- Checks ---');
  let fail = 0;
  for (const c of checks) {
    console.log(c.ok ? `  ✓ ${c.label}` : `  ✗ ${c.label}`);
    if (!c.ok) fail++;
  }

  const pageUrl = 'http://localhost:3010/intelligence/trade/supply-demand';
  try {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(5000) });
    checks.push({ label: `SDM page reachable (${res.status})`, ok: res.status === 200 });
    console.log(res.status === 200 ? `  ✓ SDM page reachable (${res.status})` : `  ✗ SDM page HTTP ${res.status}`);
    if (res.status !== 200) fail++;
  } catch {
    console.log(`  ℹ SDM page not reachable at ${pageUrl} (dev server may require login)`);
  }

  console.log(fail === 0 ? '\n✅ UI smoke PASS\n' : `\n❌ ${fail} check(s) failed\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
