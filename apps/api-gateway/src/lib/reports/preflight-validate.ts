/**
 * Preflight validation — blocks PDF generation when data/narrative/policy integrity fails.
 */

import type { CountryProfileReportData } from './country-profile-data';
import type { CanonicalCountryPayload, PreflightIssue, PreflightReport } from '@/types/report-integrity';
import { canonicalizeCountryPayload } from './canonicalize-country-payload';
import { parseDisplayMetrics, parseUsdString, relativeDiff } from './parse-display-metrics';

const PCT_TOLERANCE = 0.35;
const USD_TOLERANCE = 0.08;

function collectTextLeaves(obj: unknown, prefix = ''): Array<{ path: string; text: string }> {
  const out: Array<{ path: string; text: string }> = [];
  if (typeof obj === 'string' && obj.trim().length > 20) {
    out.push({ path: prefix || 'text', text: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      out.push(...collectTextLeaves(item, `${prefix}[${i}]`));
    });
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (k === 'glossary' || k === 'capabilities' || k === 'terms') continue;
      out.push(...collectTextLeaves(v, p));
    }
  }
  return out;
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

function checkNarrativeContradictions(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const years = economyYearsSet(payload);
  const macroYear = canonical.asOf.macroYear;
  const cm = canonical.canonicalMetrics;

  const texts = [
    { path: 'summary', text: payload.summary },
    ...collectTextLeaves(payload.sections, 'sections'),
  ].filter((t) => t.text);

  const pctRegex = /(-?\d+(?:\.\d+)?)\s*%/g;
  const yearRegex = /\b(20\d{2})\b/g;
  const usdRegex = /\$\s*([\d,.]+)\s*([KMB])?/gi;

  function contextWindow(text: string, index: number, before = 50, after = 50): string {
    return text.slice(Math.max(0, index - before), index + after).toLowerCase();
  }

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
      const isGdpGrowthClaim =
        /gdp\s+growth|growth\s+of|growth\s+reached|gdp\s+expanded|gdp\s+growth:/i.test(ctx) &&
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
        !/election|pipeline|infrastructure|presidential|forecast/i.test(ctx)
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

    usdRegex.lastIndex = 0;
    while ((match = usdRegex.exec(text)) !== null) {
      const raw = `$${match[1]}${match[2] ?? ''}`;
      const usd = parseUsdString(raw);
      const ctx = contextWindow(text, match.index);
      const isGdpScale =
        /\bgdp\b/i.test(ctx) &&
        !/fdi|inflow|export|import|trade|partner|pipeline/i.test(ctx);
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

  return issues;
}

function checkPolicyVerification(canonical: CanonicalCountryPayload): PreflightIssue[] {
  const issues: PreflightIssue[] = [];

  for (const p of canonical.policyRecords) {
    if (p.framework === 'AGOA' && p.status !== 'unknown' && !p.authoritativeSourceUrl) {
      issues.push({
        code: 'POLICY_NO_SOURCE',
        path: `policyRecords[AGOA]`,
        message: 'AGOA status asserted without authoritative_source_url.',
      });
    }
    if (p.status !== 'unknown' && !p.lastVerifiedAt) {
      issues.push({
        code: 'POLICY_UNVERIFIED_DATE',
        path: `policyRecords[${p.framework}]`,
        message: `${p.framework} status "${p.statusLabel}" lacks last_verified_at.`,
      });
    }
  }

  const unverified = canonical.payload.marketAccess?.filter((m) =>
    /suspended|active|eligible/i.test(m.statusLabel)
  );
  for (const m of unverified ?? []) {
    const reg = canonical.policyRecords.find((r) => r.framework === m.label);
    if (!reg || reg.status === 'unknown') {
      issues.push({
        code: 'POLICY_UNVERIFIED_LABEL',
        path: `marketAccess[${m.label}]`,
        message: `Market access shows "${m.statusLabel}" but registry has no verified status for ${m.label}.`,
      });
    }
  }

  return issues;
}

function checkSignalDrift(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): PreflightIssue[] {
  const warnings: PreflightIssue[] = [];
  const scanText = `${payload.signalScan.badge} ${payload.signalScan.bullets.join(' ')}`;

  if (scanText.includes('(2025)') && canonical.asOf.macroYear != null && canonical.asOf.macroYear < 2025) {
    warnings.push({
      code: 'SIGNAL_YEAR_DRIFT',
      path: 'signalScan.bullets',
      message: `Signal bullets reference 2025 but macro as-of is ${canonical.asOf.macroYear}.`,
    });
  }

  return warnings;
}

export function preflightValidate(
  payload: CountryProfileReportData,
  canonical?: CanonicalCountryPayload
): PreflightReport {
  const canon = canonical ?? canonicalizeCountryPayload(payload);

  const errors: PreflightIssue[] = [
    ...checkMetricConflicts(payload, canon),
    ...checkNarrativeContradictions(payload, canon),
    ...checkPolicyVerification(canon),
  ];

  const warnings: PreflightIssue[] = [...checkSignalDrift(payload, canon)];

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
