import { createClient } from '@supabase/supabase-js';
import {
  APPROVED_AFRICA_ISO3,
  APPROVED_CARIBBEAN_ISO3,
  EXPECTED_MARKET_COUNTS,
  type RegionFilter,
} from '@/lib/market-coverage';
import { isFullTerminalPilot } from '@/lib/intelligence/country-names';
import { resolveMarketSignal, type ResolvedSignal } from '@/lib/insights/signal-display';

/** Rankings display plan — aligned to 74 mandate markets */
export const RANKINGS_DISPLAY = {
  combinedTop: 10,
  regionalPreview: 5,
  africaTotal: EXPECTED_MARKET_COUNTS.africa,
  caribbeanTotal: EXPECTED_MARKET_COUNTS.caribbean,
  mandateTotal: EXPECTED_MARKET_COUNTS.all,
} as const;

export interface MarketRankingRow {
  rank: number;
  iso3: string;
  name: string;
  region: 'africa' | 'caribbean';
  subregion?: string;
  capital?: string;
  gdpCurrentUsd: number | null;
  gdpGrowthPct: number | null;
  populationTotal: number | null;
  gdpPerCapitaUsd: number | null;
  signal: ResolvedSignal;
  flagUrl?: string;
  isPilot: boolean;
}

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function regionForIso3(iso3: string): 'africa' | 'caribbean' | null {
  const code = iso3.toUpperCase();
  if ((APPROVED_AFRICA_ISO3 as readonly string[]).includes(code)) return 'africa';
  if ((APPROVED_CARIBBEAN_ISO3 as readonly string[]).includes(code)) return 'caribbean';
  return null;
}

async function fetchSignalByIso3(): Promise<Map<string, string>> {
  const supabase = getAnonClient();
  const map = new Map<string, string>();

  const { data: countries } = await supabase.from('souvera_countries').select('id, iso3');
  if (!countries?.length) return map;

  const idToIso3 = new Map(countries.map((c) => [c.id as string, String(c.iso3).toUpperCase()]));

  const { data: scores } = await supabase
    .from('souvera_country_signal_scores')
    .select('country_id, signal_level');

  for (const row of scores ?? []) {
    const iso3 = idToIso3.get(row.country_id as string);
    if (iso3 && row.signal_level) {
      map.set(iso3, String(row.signal_level));
    }
  }

  return map;
}

function mapRow(
  row: Record<string, unknown>,
  scoreByIso3: Map<string, string>
): Omit<MarketRankingRow, 'rank'> | null {
  const iso3 = String(row.iso3 ?? '').toUpperCase();
  const region = regionForIso3(iso3);
  if (!region) return null;

  const gdp = row.gdp_current_usd != null ? Number(row.gdp_current_usd) : null;
  const population = row.population_total != null ? Number(row.population_total) : null;
  const gdpGrowthPct = row.gdp_growth_pct != null ? Number(row.gdp_growth_pct) : null;

  return {
    iso3,
    name: String(row.name ?? iso3),
    region,
    subregion: row.subregion ? String(row.subregion) : undefined,
    capital: row.capital ? String(row.capital) : undefined,
    gdpCurrentUsd: gdp,
    gdpGrowthPct,
    populationTotal: population,
    gdpPerCapitaUsd:
      gdp != null && population != null && population > 0 ? gdp / population : null,
    signal: resolveMarketSignal({
      profileSignal: row.signal_level ? String(row.signal_level) : null,
      scoreSignal: scoreByIso3.get(iso3),
      gdpGrowthPct,
    }),
    flagUrl: row.flag_svg_url ? String(row.flag_svg_url) : undefined,
    isPilot: isFullTerminalPilot(iso3),
  };
}

async function fetchAllMandateRows(): Promise<Omit<MarketRankingRow, 'rank'>[]> {
  const supabase = getAnonClient();
  const scoreByIso3 = await fetchSignalByIso3();

  const { data, error } = await supabase
    .from('souvera_country_lite_v')
    .select(
      'iso3, name, subregion, capital, gdp_current_usd, gdp_growth_pct, population_total, flag_svg_url, signal_level'
    )
    .limit(250);

  if (error) {
    console.error('fetchMarketRankings:', error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => mapRow(row as Record<string, unknown>, scoreByIso3))
    .filter(Boolean)
    .sort((a, b) => {
      const gdpA = a!.gdpCurrentUsd ?? -1;
      const gdpB = b!.gdpCurrentUsd ?? -1;
      return gdpB - gdpA;
    }) as Omit<MarketRankingRow, 'rank'>[];
}

function withRanks(rows: Omit<MarketRankingRow, 'rank'>[]): MarketRankingRow[] {
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function fetchMarketRankings(options?: {
  region?: RegionFilter;
  limit?: number;
}): Promise<MarketRankingRow[]> {
  const regionFilter = options?.region ?? 'all';
  const limit = options?.limit ?? RANKINGS_DISPLAY.mandateTotal;

  const all = await fetchAllMandateRows();
  const filtered =
    regionFilter === 'all' ? all : all.filter((row) => row.region === regionFilter);

  return withRanks(filtered.slice(0, limit));
}
