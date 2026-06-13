/**
 * Preflight validation — blocks PDF generation when data/narrative/policy integrity fails.
 */

import type { CountryProfileReportData } from './country-profile-data';
import type { CanonicalCountryPayload, PreflightIssue, PreflightReport } from '@/types/report-integrity';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';
import { parseDisplayMetrics, parseUsdString, relativeDiff } from './parse-display-metrics';
import {
  checkCopyQualityWarnings,
  checkNarrativeGdpScale,
  checkNarrativeYearDrift,
  checkNumericClaimsGovernance,
  collectRenderableNarrativeTexts,
} from './preflight-narrative-rules';
import { findPlaceholderLeaks } from './placeholder-leak';

const PCT_TOLERANCE = 0.35;
const USD_TOLERANCE = 0.08;

export interface PreflightValidateOptions {
  /** When true (default), year-drift and legacy signal drift are errors, not warnings. */
  strict?: boolean;
}

function economyYearsSet(payload: CountryProfileReportData): Set<number> {
  return new Set(payload.economyYears.map((y) => y.year));
}

function checkMetricConflicts(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const cm = canonical.canonicalMetrics;
  const parsed = parseDisplayMetrics(payload.metrics);

  for (const m of parsed) {
    const label = m.label.toLowerCase();
    if (label.includes('gdp') && label.includes('current') && m.valueUsd != null && cm.gdpCurrentUsd != null) {
      if (relativeDiff(m.valueUsd, cm.gdpCurrentUsd) > USD_TOLERANCE) {
        issues.push({
          code: 'METRIC_CONFLICT_GDP',
          path: `metrics[${m.label}]`,
          message: `Display GDP (${m.raw}) conflicts with canonical $${(cm.gdpCurrentUsd / 1e9).toFixed(1)}B for ${canonical.asOf.macroYear}.`,
          detail: `canonical=${cm.gdpCurrentUsd} parsed=${m.valueUsd}`,
        });
      }
    }
    if (label.includes('gdp') && label.includes('growth') && m.valuePct != null && cm.gdpGrowthPct != null) {
      if (Math.abs(m.valuePct - cm.gdpGrowthPct) > PCT_TOLERANCE) {
        issues.push({
          code: 'METRIC_CONFLICT_GROWTH',
          path: `metrics[${m.label}]`,
          message: `Display GDP growth (${m.raw}) conflicts with canonical ${cm.gdpGrowthPct?.toFixed(1)}% for ${canonical.asOf.macroYear}.`,
        });
      }
    }
    if (label.includes('fdi') && m.valueUsd != null && cm.fdiNetInflowsUsd != null) {
      if (relativeDiff(m.valueUsd, cm.fdiNetInflowsUsd) > USD_TOLERANCE) {
        issues.push({
          code: 'METRIC_CONFLICT_FDI',
          path: `metrics[${m.label}]`,
          message: `Display FDI (${m.raw}) conflicts with canonical series for ${canonical.asOf.macroYear}.`,
        });
      }
    }
    if (label.includes('inflation') && m.valuePct != null && cm.inflationCpiPct != null) {
      if (Math.abs(m.valuePct - cm.inflationCpiPct) > PCT_TOLERANCE) {
        issues.push({
          code: 'METRIC_CONFLICT_INFLATION',
          path: `metrics[${m.label}]`,
          message: `Display inflation (${m.raw}) conflicts with canonical ${cm.inflationCpiPct?.toFixed(1)}%.`,
        });
      }
    }
  }

  return issues;
}

function contextWindow(text: string, index: number, before = 50, after = 50): string {
  return text.slice(Math.max(0, index - before), index + after).toLowerCase();
}

function checkNarrativeContradictions(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const years = economyYearsSet(payload);
  const macroYear = canonical.asOf.macroYear;
  const cm = canonical.canonicalMetrics;
  const texts = collectRenderableNarrativeTexts(payload);

  const pctRegex = /(-?\d+(?:\.\d+)?)\s*%/g;
  const yearRegex = /\b(20\d{2})\b/g;
  const usdRegex = /\$\s*([\d,.]+)\s*([KMB])?/gi;

  for (const { path, text } of texts) {
    if (!text) continue;
    if (
      text.includes('→') &&
      (/\(\d{4}\)/.test(text) || path.includes('indicatorBullets') || /over \d+ years/i.test(text))
    ) {
      continue;
    }

    let match: RegExpExecArray | null;
    pctRegex.lastIndex = 0;
    while ((match = pctRegex.exec(text)) !== null) {
      const pct = parseFloat(match[1]);
      if (Number.isNaN(pct)) continue;
      const ctx = contextWindow(text, match.index);
      const isGdpLevelChange =
        /%\s*change|change\s+over\s+(?:the\s+)?period|expanded\s+from\s+\$|from\s+\$[\d,.]+\s*[bmk]?\s*\(\d{4}\)\s+to\s+\$/i.test(
          ctx
        );
      const isGdpGrowthClaim =
        !isGdpLevelChange &&
        (/gdp\s+growth|growth\s+of|growth\s+reached|gdp\s+growth:/i.test(ctx) ||
          (/gdp\s+expanded/i.test(ctx) && !/\$[\d,.]+\s*[bmk]?/i.test(ctx))) &&
        !/sector|technology|agriculture|services|yoy|inflation|import|export/i.test(ctx);
      if (
        isGdpGrowthClaim &&
        cm.gdpGrowthPct != null &&
        Math.abs(pct - cm.gdpGrowthPct) > PCT_TOLERANCE + 1
      ) {
        issues.push({
          code: 'NARRATIVE_GDP_GROWTH',
          path,
          message: `Narrative claims ${pct}% GDP growth but canonical is ${cm.gdpGrowthPct.toFixed(1)}% (${macroYear}).`,
          detail: text.slice(Math.max(0, match.index - 40), match.index + 60),
        });
      }
    }

    yearRegex.lastIndex = 0;
    while ((match = yearRegex.exec(text)) !== null) {
      const y = parseInt(match[1], 10);
      const ctx = contextWindow(text, match.index);
      if (
        macroYear != null &&
        y > macroYear + 1 &&
        /gdp|inflation|fdi\s+inflow/i.test(ctx) &&
        !/election|pipeline|infrastructure|presidential|forecast|target|treaty|deadline/i.test(ctx)
      ) {
        issues.push({
          code: 'NARRATIVE_FUTURE_YEAR',
          path,
          message: `Narrative references ${y} for macro data but structured series ends at ${macroYear}.`,
          detail: text.slice(Math.max(0, match.index - 40), match.index + 60),
        });
      }
      if (macroYear != null && !years.has(y) && y >= 2019 && y <= 2030 && ctx.includes(`in ${y}`)) {
        if (/gdp\s+growth|growth\s+of\s+\d|inflation\s+at/i.test(ctx)) {
          issues.push({
            code: 'NARRATIVE_UNSCOPED_YEAR',
            path,
            message: `Narrative cites ${y} without a matching row in economyYears (max ${macroYear}).`,
            detail: text.slice(Math.max(0, match.index - 40), match.index + 80),
          });
        }
      }
    }

    if (path.includes('indicatorBullets') || /\$\d+.*→.*\$/i.test(text)) continue;

    usdRegex.lastIndex = 0;
    while ((match = usdRegex.exec(text)) !== null) {
      const raw = `$${match[1]}${match[2] ?? ''}`;
      const usd = parseUsdString(raw);
      const ctx = contextWindow(text, match.index);
      const isGdpScale =
        /\bgdp\b/i.test(ctx) &&
        !/fdi|inflow|export|import|trade|partner|pipeline|economy\s+scale|economic\s+output/i.test(ctx);
      if (
        usd != null &&
        cm.gdpCurrentUsd != null &&
        isGdpScale &&
        (raw.includes('B') || raw.includes('b')) &&
        relativeDiff(usd, cm.gdpCurrentUsd) > 0.25 &&
        !/\(\d{4}\)/.test(ctx.replace(raw.toLowerCase(), ''))
      ) {
        const yearNear = ctx.match(/\((20\d{2})\)/);
        if (yearNear && years.has(parseInt(yearNear[1], 10))) continue;

        issues.push({
          code: 'NARRATIVE_GDP_SCALE',
          path,
          message: `Narrative GDP scale (${raw}) diverges from canonical ${(cm.gdpCurrentUsd / 1e9).toFixed(1)}B (${macroYear}).`,
          detail: text.slice(Math.max(0, match.index - 30), match.index + 50),
        });
      }
    }
  }

  issues.push(...checkNarrativeGdpScale(texts, canonical, years));

  return issues;
}

function checkPolicyVerification(
  canonical: CanonicalCountryPayload
): { errors: PreflightIssue[]; warnings: PreflightIssue[] } {
  const errors: PreflightIssue[] = [];
  const warnings: PreflightIssue[] = [];

  for (const p of canonical.policyRecords) {
    if (p.status === 'needs_review' || p.status === 'conflict') {
      warnings.push({
        code: 'POLICY_NEEDS_REVIEW',
        path: `policyRecords[${p.framework}]`,
        message: `${p.framework}: ${p.statusLabel} — high-impact policy status not fully verified.`,
      });
    }
    const assertive = ['active', 'suspended', 'graduated', 'ineligible'].includes(p.status);
    if (assertive && p.publishable !== true) {
      errors.push({
        code: 'POLICY_NO_EVIDENCE',
        path: `policyRecords[${p.framework}]`,
        message: `${p.framework} asserts "${p.clientStatusLabel ?? p.statusLabel}" without evidence-backed artifact (Evidence Vault).`,
      });
    }
    if (assertive && !p.lastVerifiedAt) {
      errors.push({
        code: 'POLICY_UNVERIFIED_DATE',
        path: `policyRecords[${p.framework}]`,
        message: `${p.framework} status lacks last_reviewed_at.`,
      });
    }
  }

  const unverified = canonical.payload.marketAccess?.filter((m) =>
    /suspended|active|eligible/i.test(m.statusLabel)
  );
  for (const m of unverified ?? []) {
    const reg = canonical.policyRecords.find((r) => r.framework === m.label);
    if (!reg || reg.status === 'unknown') {
      errors.push({
        code: 'POLICY_UNVERIFIED_LABEL',
        path: `marketAccess[${m.label}]`,
        message: `Market access shows "${m.statusLabel}" but registry has no verified status for ${m.label}.`,
      });
    }
  }

  return { errors, warnings };
}

function checkPlaceholderLeaks(
  narrativeTexts: Array<{ path: string; text: string }>
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  for (const { path, text } of narrativeTexts) {
    if (!text) continue;
    const leaks = findPlaceholderLeaks(text);
    for (const token of leaks) {
      issues.push({
        code: 'PLACEHOLDER_LEAK',
        path,
        message: `Unresolved template token ${token} in client-facing text.`,
        detail: text.slice(0, 120),
      });
    }
  }
  return issues;
}

function partitionYearDriftIssues(
  issues: PreflightIssue[],
  strict: boolean
): { errors: PreflightIssue[]; warnings: PreflightIssue[] } {
  if (strict) return { errors: issues, warnings: [] };
  return { errors: [], warnings: issues };
}

export function preflightValidate(
  payload: CountryProfileReportData,
  canonical?: CanonicalCountryPayload,
  options: PreflightValidateOptions = {}
): PreflightReport {
  const strict = options.strict !== false;
  const canon = canonical ?? canonicalizeCountryPayload(payload);
  const narrativeTexts = collectRenderableNarrativeTexts(payload);

  const policy = checkPolicyVerification(canon);
  const yearDrift = checkNarrativeYearDrift(narrativeTexts, canon, strict);
  const yearDriftSplit = partitionYearDriftIssues(yearDrift, strict);
  const numericGov = checkNumericClaimsGovernance(narrativeTexts, payload, canon, strict);

  const errors: PreflightIssue[] = [
    ...checkMetricConflicts(payload, canon),
    ...checkNarrativeContradictions(payload, canon),
    ...yearDriftSplit.errors,
    ...numericGov.errors,
    ...policy.errors,
    ...checkPlaceholderLeaks(narrativeTexts),
  ];

  const warnings: PreflightIssue[] = [
    ...yearDriftSplit.warnings,
    ...numericGov.warnings,
    ...checkCopyQualityWarnings(narrativeTexts),
    ...policy.warnings,
  ];

  if (!canon.asOf.macroYear) {
    errors.push({
      code: 'NO_MACRO_YEAR',
      path: 'economyYears',
      message: 'No structured macro year available — cannot stamp macro as-of.',
    });
  }

  return {
    iso3: payload.country.iso3,
    passed: errors.length === 0,
    errors,
    warnings,
    canonical: canon,
  };
}
