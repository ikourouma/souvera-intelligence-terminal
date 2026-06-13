/**
 * Phase 0C — Source attribution for country intelligence API responses.
 */

import { buildTop20SourceMeta } from '@/lib/reports/source-meta-top20';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';

export type CountrySourceMeta = {
  defaultSource: string;
  macroYear: number | null;
  metrics: Record<
    string,
    {
      source_name: string;
      source_url?: string;
      as_of?: string;
      retrieved_at?: string;
    }
  >;
};

export function buildCountrySourceMeta(
  iso2: string | undefined,
  economyYears: EconomyYearPoint[],
  fetchedAt?: string
): CountrySourceMeta {
  const macroYear = economyYears.length
    ? economyYears[economyYears.length - 1].year
    : null;
  const base = buildTop20SourceMeta(iso2, macroYear, fetchedAt);
  return {
    defaultSource: base.defaultSource,
    macroYear,
    metrics: base.metrics ?? {},
  };
}
