/**
 * Canonical narrative placeholders — single source for year/metric claims in reports.
 */

import type { CanonicalCountryPayload } from '@/types/report-integrity';
import type { CountryProfileReportData } from './country-profile-data';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';

export interface NarrativeTemplateVars {
  MACRO_ASOF_YEAR: string;
  GDP_GROWTH: string;
  GDP_NOMINAL_USD: string;
  INFLATION: string;
  FDI: string;
  FX: string;
  TRADE_ASOF_YEAR: string;
}

function fmtUsd(n?: number): string {
  if (n == null) return 'Not covered';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPct(n?: number): string {
  return n != null ? `${n.toFixed(1)}%` : 'Not covered';
}

export function buildNarrativeTemplateVars(
  canonical: CanonicalCountryPayload
): NarrativeTemplateVars {
  const m = canonical.canonicalMetrics;
  const macroYear = canonical.asOf.macroYear;
  return {
    MACRO_ASOF_YEAR: macroYear != null ? String(macroYear) : 'Not covered',
    GDP_GROWTH: fmtPct(m.gdpGrowthPct),
    GDP_NOMINAL_USD: fmtUsd(m.gdpCurrentUsd),
    INFLATION: fmtPct(m.inflationCpiPct),
    FDI: fmtUsd(m.fdiNetInflowsUsd),
    FX: m.fxToUsd != null ? m.fxToUsd.toFixed(2) : 'Not covered',
    TRADE_ASOF_YEAR:
      canonical.asOf.tradeYear != null ? String(canonical.asOf.tradeYear) : 'Not provided',
  };
}

const PLACEHOLDER_RE = /\{\{([A-Z_]+)\}\}/g;

export function renderNarrativeTemplate(
  text: string,
  vars: NarrativeTemplateVars
): string {
  return text.replace(PLACEHOLDER_RE, (_, key: string) => {
    const v = vars[key as keyof NarrativeTemplateVars];
    return v ?? `{{${key}}}`;
  });
}

function hydrateString(text: string, vars: NarrativeTemplateVars): string {
  if (!text.includes('{{')) return text;
  return renderNarrativeTemplate(text, vars);
}

function hydrateDeep<T>(value: T, vars: NarrativeTemplateVars): T {
  if (typeof value === 'string') return hydrateString(value, vars) as T;
  if (Array.isArray(value)) return value.map((v) => hydrateDeep(v, vars)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = hydrateDeep(v, vars);
    }
    return out as T;
  }
  return value;
}

/** Apply canonical placeholders across report payload narratives. */
export function hydrateCountryProfileNarratives(
  payload: CountryProfileReportData,
  canonical?: CanonicalCountryPayload
): CountryProfileReportData {
  const canon = canonical ?? canonicalizeCountryPayload(payload);
  const vars = buildNarrativeTemplateVars(canon);

  const signalBullets = payload.signalScan.bullets.map((b) =>
    hydrateString(
      b.replace(/\(2025\)/g, `({{MACRO_ASOF_YEAR}})`).replace(/\(2024\)/g, `({{MACRO_ASOF_YEAR}})`),
      vars
    )
  ) as [string, string];

  return {
    ...payload,
    summary: payload.summary ? hydrateString(payload.summary, vars) : payload.summary,
    signalScan: {
      ...payload.signalScan,
      bullets: signalBullets,
    },
    sections: hydrateDeep(payload.sections, vars),
  };
}
