/**
 * IMF DataMapper API client (v1) — replaces unreachable dataservices.imf.org SDMX 2.1.
 * @see https://www.imf.org/external/datamapper/api/
 */

const IMF_DATAMAPPER_BASE = 'https://www.imf.org/external/datamapper/api/v1';

export type ImfDataMapperYearValue = { year: number; value: number };

export async function fetchImfDataMapperSeries(
  indicatorId: string,
  iso3: string,
  minYear = 2018,
  maxYear = 2025
): Promise<ImfDataMapperYearValue[]> {
  const periods = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).join(',');
  const url = `${IMF_DATAMAPPER_BASE}/${indicatorId}/${iso3}?periods=${periods}`;

  const res = await fetch(url, { headers: { 'User-Agent': 'SouveraIngestion/1.0' } });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    values?: Record<string, Record<string, Record<string, string | number | null>>>;
  };

  const byYear = json.values?.[indicatorId]?.[iso3];
  if (!byYear) return [];

  return Object.entries(byYear)
    .map(([year, value]) => ({ year: Number(year), value: Number(value) }))
    .filter((row) => row.year >= minYear && row.year <= maxYear && Number.isFinite(row.value))
    .sort((a, b) => a.year - b.year);
}
