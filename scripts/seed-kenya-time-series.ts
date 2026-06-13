/**
 * Seed Kenya time series (2020–2025).
 * Run: npx tsx scripts/seed-kenya-time-series.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedCountryTimeSeries } from './lib/seed-time-series';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const KENYA_TIME_SERIES = [
  // 2020 — COVID slowdown
  { year: 2020, indicator: 'gdp_current_usd', value: 98_500_000_000 },
  { year: 2020, indicator: 'gdp_growth_pct', value: -0.3 },
  { year: 2020, indicator: 'population_total', value: 53_700_000 },
  { year: 2020, indicator: 'fdi_net_inflows_usd', value: 717_000_000 },
  { year: 2020, indicator: 'inflation_cpi_pct', value: 5.7 },
  { year: 2020, indicator: 'fx_to_usd', value: 108.0 },
  { year: 2020, indicator: 'debt_to_gdp_pct', value: 68.0 },
  // 2021 — strong rebound
  { year: 2021, indicator: 'gdp_current_usd', value: 106_000_000_000 },
  { year: 2021, indicator: 'gdp_growth_pct', value: 7.5 },
  { year: 2021, indicator: 'population_total', value: 54_400_000 },
  { year: 2021, indicator: 'fdi_net_inflows_usd', value: 448_000_000 },
  { year: 2021, indicator: 'inflation_cpi_pct', value: 6.1 },
  { year: 2021, indicator: 'fx_to_usd', value: 110.0 },
  { year: 2021, indicator: 'debt_to_gdp_pct', value: 69.0 },
  // 2022
  { year: 2022, indicator: 'gdp_current_usd', value: 113_000_000_000 },
  { year: 2022, indicator: 'gdp_growth_pct', value: 4.8 },
  { year: 2022, indicator: 'population_total', value: 55_100_000 },
  { year: 2022, indicator: 'fdi_net_inflows_usd', value: 759_000_000 },
  { year: 2022, indicator: 'inflation_cpi_pct', value: 7.9 },
  { year: 2022, indicator: 'fx_to_usd', value: 117.0 },
  { year: 2022, indicator: 'debt_to_gdp_pct', value: 70.0 },
  // 2023 — shilling pressure
  { year: 2023, indicator: 'gdp_current_usd', value: 107_000_000_000 },
  { year: 2023, indicator: 'gdp_growth_pct', value: 5.6 },
  { year: 2023, indicator: 'population_total', value: 55_600_000 },
  { year: 2023, indicator: 'fdi_net_inflows_usd', value: 1_100_000_000 },
  { year: 2023, indicator: 'inflation_cpi_pct', value: 7.7 },
  { year: 2023, indicator: 'fx_to_usd', value: 140.0 },
  { year: 2023, indicator: 'debt_to_gdp_pct', value: 70.5 },
  // 2024
  { year: 2024, indicator: 'gdp_current_usd', value: 112_000_000_000 },
  { year: 2024, indicator: 'gdp_growth_pct', value: 4.9 },
  { year: 2024, indicator: 'population_total', value: 55_800_000 },
  { year: 2024, indicator: 'fdi_net_inflows_usd', value: 1_250_000_000 },
  { year: 2024, indicator: 'inflation_cpi_pct', value: 6.8 },
  { year: 2024, indicator: 'fx_to_usd', value: 129.0 },
  { year: 2024, indicator: 'debt_to_gdp_pct', value: 69.0 },
  // 2025 estimate
  { year: 2025, indicator: 'gdp_current_usd', value: 115_000_000_000 },
  { year: 2025, indicator: 'gdp_growth_pct', value: 5.0 },
  { year: 2025, indicator: 'population_total', value: 56_000_000 },
  { year: 2025, indicator: 'fdi_net_inflows_usd', value: 1_400_000_000 },
  { year: 2025, indicator: 'inflation_cpi_pct', value: 6.2 },
  { year: 2025, indicator: 'fx_to_usd', value: 130.0 },
  { year: 2025, indicator: 'debt_to_gdp_pct', value: 68.0 },
];

async function main() {
  console.log('🚀 Seeding Kenya time series (2020–2025)...\n');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  await seedCountryTimeSeries(supabase, 'KEN', KENYA_TIME_SERIES);
  console.log('\n✅ Done! Economy tab charts should populate for Kenya.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
