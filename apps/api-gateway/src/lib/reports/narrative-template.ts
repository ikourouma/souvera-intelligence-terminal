/**
 * Canonical narrative placeholders — single source for year/metric claims in reports.
 */

import type { CanonicalCountryPayload } from '@/types/report-integrity';
import type { CountryProfileReportData } from './country-profile-data';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';
import { neutralizeClientNumericClaims } from './narrative-client-safe';

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
      canonical.asOf.tradeYear != null ? String(canonical.asOf.tradeYear) : 'Not covered',
  };
}

const PLACEHOLDER_RE = /\{\{([A-Z_]+)\}\}/g;

export function renderNarrativeTemplate(
  text: string,
  vars: NarrativeTemplateVars
): string {
  return text.replace(PLACEHOLDER_RE, (_, key: string) => {
    const v = vars[key as keyof NarrativeTemplateVars];
    return v ?? 'Not covered';
  });
}

/** Safe copy fixes applied to all narrative strings before hydration. */
export function autoCorrectInstitutionalCopy(text: string): string {
  return text.replace(/(-\d+(?:\.\d+)?)\s*%\s+increase/gi, (_, n) => `${n}% decrease`);
}

function hydrateString(text: string, vars: NarrativeTemplateVars): string {
  let t = autoCorrectInstitutionalCopy(text);
  if (!t.includes('{{')) return t;
  return renderNarrativeTemplate(t, vars);
}

/** Deep-replace `{{TOKEN}}` placeholders in strings, arrays, and plain objects. */
export function hydrateContentTree<T>(value: T, vars: NarrativeTemplateVars): T {
  if (typeof value === 'string') return hydrateString(value, vars) as T;
  if (Array.isArray(value)) return value.map((v) => hydrateContentTree(v, vars)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = hydrateContentTree(v, vars);
    }
    return out as T;
  }
  return value;
}

/** Programmatic executive summary from canonical metrics and signal drivers (post-canonicalization). */
export function buildCanonicalExecutiveSummary(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): string {
  const name = payload.country.name;
  const m = canonical.canonicalMetrics;
  const y = canonical.asOf.macroYear;
  const topSector = payload.sectors?.[0]?.label;
  const drivers = canonical.signalDrivers;

  const parts = [
    `${name} is profiled in Souvera's institutional intelligence coverage.`,
  ];
  if (drivers[0]) parts.push(`${drivers[0]}.`);
  if (drivers[1]) parts.push(`${drivers[1]}.`);
  if (m.gdpGrowthPct != null && y != null) {
    parts.push(`GDP growth is tracking at ${fmtPct(m.gdpGrowthPct)} (${y}).`);
  }
  if (topSector) {
    parts.push(`${topSector} leads the sector scorecard by attractiveness.`);
  }
  parts.push(
    'This document synthesizes macro indicators, sector positioning, market-access frameworks, and bilateral trade data for professional due diligence.'
  );
  return parts.join(' ');
}

function canonicalSignalBullets(
  canonical: CanonicalCountryPayload
): [string, string] {
  const drivers = canonical.signalDrivers;
  return [drivers[0] ?? 'Macro drivers pending', drivers[1] ?? drivers[0] ?? 'Coverage expanding'];
}

function summaryUsesPlaceholders(summary: string): boolean {
  return summary.includes('{{');
}

function summaryHasStaleYearDrift(summary: string, macroYear: number | null): boolean {
  if (macroYear == null) return false;
  const drift = macroYear + 1;
  return summary.includes(`(${drift})`) || new RegExp(`\\bin\\s+${drift}\\b`, 'i').test(summary);
}

/** Apply canonical placeholders and institutional summary/signal alignment. */
export function hydrateCountryProfileNarratives(
  payload: CountryProfileReportData,
  canonical?: CanonicalCountryPayload
): CountryProfileReportData {
  const canon = canonical ?? canonicalizeCountryPayload(payload);
  const vars = buildNarrativeTemplateVars(canon);
  const signalBullets = canonicalSignalBullets(canon);

  const profileSummary = payload.summary?.trim();
  let summary: string;
  if (profileSummary && summaryUsesPlaceholders(profileSummary)) {
    summary = hydrateString(profileSummary, vars);
  } else if (profileSummary && !summaryHasStaleYearDrift(profileSummary, canon.asOf.macroYear)) {
    summary = hydrateString(
      profileSummary
        .replace(/\(2025\)/g, `({{MACRO_ASOF_YEAR}})`)
        .replace(/\(2024\)/g, `({{MACRO_ASOF_YEAR}})`),
      vars
    );
  } else {
    summary = buildCanonicalExecutiveSummary(payload, canon);
  }

  const sectionsHydrated = hydrateContentTree(payload.sections, vars);

  const sectors = payload.sectors?.map((s) => ({
    ...s,
    teaser: s.teaser ? neutralizeClientNumericClaims(hydrateString(s.teaser, vars)) : s.teaser,
  }));

  const opportunity = sectionsHydrated.opportunity;
  const pillars = opportunity.pillars?.map((p) => ({
    ...p,
    title: neutralizeClientNumericClaims(p.title),
    subtitle: p.subtitle ? neutralizeClientNumericClaims(p.subtitle) : p.subtitle,
  }));

  const introduction = sectionsHydrated.introduction;
  const introBullets = introduction.bullets?.map((b) => neutralizeClientNumericClaims(b));

  return {
    ...payload,
    summary,
    sectors,
    signalScan: {
      ...payload.signalScan,
      bullets: signalBullets,
    },
    sections: {
      ...sectionsHydrated,
      introduction: { ...introduction, bullets: introBullets },
      opportunity: { ...opportunity, pillars },
      signalAndDifferentiation: {
        ...sectionsHydrated.signalAndDifferentiation,
        signalBullets,
      },
    },
  };
}
