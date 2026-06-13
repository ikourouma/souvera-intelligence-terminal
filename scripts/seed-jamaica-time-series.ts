/**
 * Seed Jamaica time series (2020–2025).
 * Run: npx tsx scripts/seed-jamaica-time-series.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedCountryTimeSeries } from './lib/seed-time-series';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const JAMAICA_TIME_SERIES = [
  // 2020 — COVID tourism shock
  { year: 2020, indicator: 'gdp_current_usd', value: 14_200_000_000 },
  { year: 2020, indicator: 'gdp_growth_pct', value: -10.0 },
  { year: 2020, indicator: 'population_total', value: 2_730_000 },
  { year: 2020, indicator: 'fdi_net_inflows_usd', value: 580_000_000 },
  { year: 2020, indicator: 'inflation_cpi_pct', value: 5.6 },
  { year: 2020, indicator: 'fx_to_usd', value: 142.0 },
  { year: 2020, indicator: 'debt_to_gdp_pct', value: 94.0 },
  // 2021 — recovery begins
  { year: 2021, indicator: 'gdp_current_usd', value: 14_800_000_000 },
  { year: 2021, indicator: 'gdp_growth_pct', value: 4.6 },
  { year: 2021, indicator: 'population_total', value: 2_740_000 },
  { year: 2021, indicator: 'fdi_net_inflows_usd', value: 680_000_000 },
  { year: 2021, indicator: 'inflation_cpi_pct', value: 6.6 },
  { year: 2021, indicator: 'fx_to_usd', value: 145.0 },
  { year: 2021, indicator: 'debt_to_gdp_pct', value: 95.0 },
  // 2022
  { year: 2022, indicator: 'gdp_current_usd', value: 15_800_000_000 },
  { year: 2022, indicator: 'gdp_growth_pct', value: 5.3 },
  { year: 2022, indicator: 'population_total', value: 2_750_000 },
  { year: 2022, indicator: 'fdi_net_inflows_usd', value: 780_000_000 },
  { year: 2022, indicator: 'inflation_cpi_pct', value: 10.3 },
  { year: 2022, indicator: 'fx_to_usd', value: 152.0 },
  { year: 2022, indicator: 'debt_to_gdp_pct', value: 92.0 },
  // 2023
  { year: 2023, indicator: 'gdp_current_usd', value: 16_500_000_000 },
  { year: 2023, indicator: 'gdp_growth_pct', value: 2.6 },
  { year: 2023, indicator: 'population_total', value: 2_760_000 },
  { year: 2023, indicator: 'fdi_net_inflows_usd', value: 820_000_000 },
  { year: 2023, indicator: 'inflation_cpi_pct', value: 6.5 },
  { year: 2023, indicator: 'fx_to_usd', value: 155.0 },
  { year: 2023, indicator: 'debt_to_gdp_pct', value: 88.0 },
  // 2024
  { year: 2024, indicator: 'gdp_current_usd', value: 17_800_000_000 },
  { year: 2024, indicator: 'gdp_growth_pct', value: 3.1 },
  { year: 2024, indicator: 'population_total', value: 2_780_000 },
  { year: 2024, indicator: 'fdi_net_inflows_usd', value: 900_000_000 },
  { year: 2024, indicator: 'inflation_cpi_pct', value: 7.0 },
  { year: 2024, indicator: 'fx_to_usd', value: 157.0 },
  { year: 2024, indicator: 'debt_to_gdp_pct', value: 85.0 },
  // 2025 estimate
  { year: 2025, indicator: 'gdp_current_usd', value: 19_000_000_000 },
  { year: 2025, indicator: 'gdp_growth_pct', value: 2.8 },
  { year: 2025, indicator: 'population_total', value: 2_800_000 },
  { year: 2025, indicator: 'fdi_net_inflows_usd', value: 950_000_000 },
  { year: 2025, indicator: 'inflation_cpi_pct', value: 6.2 },
  { year: 2025, indicator: 'fx_to_usd', value: 159.0 },
  { year: 2025, indicator: 'debt_to_gdp_pct', value: 82.0 },
];

async function main() {
  console.log('🚀 Seeding Jamaica time series (2020–2025)...\n');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  await seedCountryTimeSeries(supabase, 'JAM', JAMAICA_TIME_SERIES);
  console.log('\n✅ Done! Economy tab charts should populate for Jamaica.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
