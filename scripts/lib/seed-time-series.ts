/**
 * Shared helper for seeding souvera_country_observations time series.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface TimeSeriesRow {
  year: number;
  indicator: string;
  value: number;
  notes?: string;
}

const STANDARD_INDICATORS: Array<{
  key: string;
  label: string;
  unit: string;
  category: string;
  description: string;
}> = [
  {
    key: 'gdp_current_usd',
    label: 'GDP Current USD',
    unit: 'USD',
    category: 'macro',
    description: 'Gross domestic product at current USD',
  },
  {
    key: 'gdp_growth_pct',
    label: 'GDP Growth %',
    unit: 'percent',
    category: 'macro',
    description: 'Annual GDP growth rate',
  },
  {
    key: 'population_total',
    label: 'Population Total',
    unit: 'count',
    category: 'demographics',
    description: 'Total population',
  },
  {
    key: 'fdi_net_inflows_usd',
    label: 'FDI Net Inflows US$',
    unit: 'USD',
    category: 'investment',
    description: 'Foreign direct investment net inflows',
  },
  {
    key: 'inflation_cpi_pct',
    label: 'Inflation CPI %',
    unit: 'percent',
    category: 'macro',
    description: 'Consumer price inflation',
  },
  {
    key: 'fx_to_usd',
    label: 'FX to USD',
    unit: 'rate',
    category: 'fx',
    description: 'Local currency units per USD',
  },
  {
    key: 'debt_to_gdp_pct',
    label: 'Debt-to-GDP Ratio',
    unit: 'percentage',
    category: 'fiscal',
    description: 'Central government debt as percentage of GDP',
  },
];

async function ensureStandardIndicators(
  supabase: SupabaseClient,
  indicatorMap: Map<string, string>
): Promise<void> {
  for (const ind of STANDARD_INDICATORS) {
    if (indicatorMap.has(ind.key)) continue;

    const { data: existing } = await supabase
      .from('souvera_indicators')
      .select('id')
      .eq('key', ind.key)
      .maybeSingle();

    if (existing) {
      indicatorMap.set(ind.key, existing.id);
      continue;
    }

    const { data: created, error } = await supabase
      .from('souvera_indicators')
      .insert({
        key: ind.key,
        label: ind.label,
        description: ind.description,
        unit: ind.unit,
        category: ind.category,
        is_public: false,
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`  ⚠ Could not create indicator ${ind.key}: ${error.message}`);
      continue;
    }
    if (created) indicatorMap.set(ind.key, created.id);
  }
}

function fillYearGaps(rows: TimeSeriesRow[]): TimeSeriesRow[] {
  const byIndicator = new Map<string, TimeSeriesRow[]>();
  for (const r of rows) {
    if (!byIndicator.has(r.indicator)) byIndicator.set(r.indicator, []);
    byIndicator.get(r.indicator)!.push(r);
  }

  const filled: TimeSeriesRow[] = [...rows];
  for (const [indicator, items] of byIndicator) {
    const sorted = [...items].sort((a, b) => a.year - b.year);
    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      for (let year = start.year + 1; year < end.year; year++) {
        const t = (year - start.year) / (end.year - start.year);
        filled.push({
          year,
          indicator,
          value: start.value + t * (end.value - start.value),
        });
      }
    }
  }
  return filled;
}

export async function seedCountryTimeSeries(
  supabase: SupabaseClient,
  iso3: string,
  rows: TimeSeriesRow[]
): Promise<void> {
  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', iso3.toUpperCase())
    .single();

  if (countryError || !country) {
    throw new Error(`${iso3} not found in souvera_countries`);
  }

  const { data: source } = await supabase
    .from('souvera_data_sources')
    .select('id')
    .eq('key', 'world_bank')
    .single();

  if (!source) {
    throw new Error('World Bank source not found');
  }

  const indicatorKeys = [...new Set(rows.map((r) => r.indicator))];
  const { data: indicators } = await supabase
    .from('souvera_indicators')
    .select('id, key')
    .in('key', indicatorKeys);

  const indicatorMap = new Map(indicators?.map((i) => [i.key, i.id]) || []);

  await ensureStandardIndicators(supabase, indicatorMap);

  const skipped = rows.filter((item) => !indicatorMap.has(item.indicator));
  if (skipped.length > 0) {
    const keys = [...new Set(skipped.map((s) => s.indicator))];
    console.warn(`  ⚠ ${iso3}: skipping unknown indicators: ${keys.join(', ')}`);
  }

  const expandedRows = fillYearGaps(rows);
  const observations = expandedRows
    .filter((item) => indicatorMap.has(item.indicator))
    .map((item) => ({
      country_id: country.id,
      indicator_id: indicatorMap.get(item.indicator)!,
      value_numeric: item.value,
      period_date: `${item.year}-12-31`,
      period_type: 'annual',
      source_id: source.id,
      quality_score: item.year <= 2023 ? 0.95 : item.year === 2024 ? 0.9 : 0.85,
      is_forecast: false,
      is_estimate: item.year >= 2025,
    }));

  const batchSize = 20;
  for (let i = 0; i < observations.length; i += batchSize) {
    const batch = observations.slice(i, i + batchSize);
    const { error } = await supabase.from('souvera_country_observations').upsert(batch, {
      onConflict: 'country_id,indicator_id,period_date,source_id',
    });
    if (error) throw new Error(`Insert failed: ${error.message}`);
  }

  console.log(`✅ ${country.name}: ${observations.length} observations upserted`);
}
