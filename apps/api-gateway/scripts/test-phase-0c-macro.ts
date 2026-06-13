/**
 * Phase 0C — macro completeness: economy builder, source meta, dynamic Economy tab rows.
 * Run from apps/api-gateway: npm run test:phase-0c
 * Or: npx tsx scripts/test-phase-0c-macro.ts
 */

import { TOP20_INDICATORS } from '../src/lib/indicators/top20';
import { buildEconomyYearsFromObservations } from '../src/lib/intelligence/build-economy-years';
import { buildCountrySourceMeta } from '../src/lib/intelligence/country-source-meta';
import { economyIndicatorRowsForYears } from '../src/lib/intelligence/economy-indicator-rows';

let failed = 0;

function assert(label: string, condition: boolean) {
  if (!condition) {
    console.error(`❌ ${label}`);
    failed++;
  } else {
    console.log(`✅ ${label}`);
  }
}

function main() {
  const observations = [
    {
      period_date: '2023-01-01',
      value_numeric: 500_000_000_000,
      souvera_indicators: { key: 'gdp_current_usd' },
    },
    {
      period_date: '2023-01-01',
      value_numeric: 3.2,
      souvera_indicators: { key: 'gdp_growth_pct' },
    },
    {
      period_date: '2023-01-01',
      value_numeric: 450,
      souvera_indicators: { key: 'official_exchange_rate' },
    },
    {
      period_date: '2023-01-01',
      value_text: 'Managed float',
      souvera_indicators: { key: 'fx_regime_category' },
    },
  ];

  const years = buildEconomyYearsFromObservations(observations);
  assert('buildEconomyYearsFromObservations returns annual rows', years.length === 1);
  assert('maps gdp_current_usd', years[0].gdp_current_usd === 500_000_000_000);
  assert('maps official_exchange_rate → fx_to_usd', years[0].fx_to_usd === 450);
  assert('maps fx_regime_category text', years[0].fx_regime_category === 'Managed float');

  const sourceMeta = buildCountrySourceMeta('NG', years, '2026-01-01T00:00:00Z');
  assert('sourceMeta has defaultSource', !!sourceMeta.defaultSource);
  assert('sourceMeta has macroYear', sourceMeta.macroYear === 2023);
  assert('sourceMeta includes gdp metric attribution', !!sourceMeta.metrics.gdp_current_usd);

  const rows = economyIndicatorRowsForYears(years);
  assert('economy rows include GDP when data present', rows.some((r) => r.label === 'GDP ($B)'));
  assert('economy rows omit series with no data', !rows.some((r) => r.label === 'Debt/GDP (%)'));

  assert('TOP20_INDICATORS defines 20 keys', TOP20_INDICATORS.length === 20);

  console.log(failed ? `\n${failed} assertion(s) failed` : '\nPhase 0C macro checks passed.');
  process.exit(failed ? 1 : 0);
}

main();
