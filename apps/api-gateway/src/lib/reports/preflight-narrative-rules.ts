/**
 * Narrative integrity rules — year drift, GDP scale, copy-quality warnings.
 */

import type { CountryProfileReportData } from './country-profile-data';
import type { CanonicalCountryPayload, PreflightIssue } from '@/types/report-integrity';
import { parseUsdString, relativeDiff } from './parse-display-metrics';

export const GDP_SCALE_TOLERANCE = 0.12;
export const GDP_SCALE_CONTEXT_CHARS = 90;

/** Categories exempt from NARRATIVE_YEAR_DRIFT (macroYear + 1). */
export const YEAR_DRIFT_ALLOWLIST: ReadonlyArray<{ id: string; pattern: RegExp }> = [
  { id: 'elections', pattern: /election|electoral|presidential|general\s+election|polls?\b/i },
  { id: 'targets', pattern: /\btarget\b|\bgoal\b|\bobjective\b|\bby\s+20\d{2}\b|\b2030\b|\b2040\b|\b2050\b/i },
  {
    id: 'treaty_deadlines',
    pattern: /\btreaty\b|\bdeadline\b|\bimplementation\b|\bafcfta\b|\bphase\s+(?:ii|2|iii|3)\b/i,
  },
];

const PROMOTIONAL_WORDS = /\b(premier|successfully|unlocked|record)\b/i;
const SOURCE_MARKER = /\b(source:|according to|benchmark|world bank|imf|unctad|verified|data:)\b/i;

export interface CollectTextOptions {
  minLength?: number;
  skipKeys?: Set<string>;
}

export function collectTextLeaves(
  obj: unknown,
  prefix = '',
  options: CollectTextOptions = {}
): Array<{ path: string; text: string }> {
  const minLength = options.minLength ?? 8;
  const skipKeys = options.skipKeys ?? new Set(['terms']);

  const out: Array<{ path: string; text: string }> = [];
  if (typeof obj === 'string' && obj.trim().length >= minLength) {
    out.push({ path: prefix || 'text', text: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      out.push(...collectTextLeaves(item, `${prefix}[${i}]`, options));
    });
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (skipKeys.has(k)) continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (k === 'capabilities') continue;
      out.push(...collectTextLeaves(v, p, options));
    }
  }
  return out;
}

/** All narrative strings that render into the v2 PDF body. */
export function collectRenderableNarrativeTexts(
  payload: CountryProfileReportData
): Array<{ path: string; text: string }> {
  const out: Array<{ path: string; text: string }> = [];

  if (payload.summary?.trim()) {
    out.push({ path: 'summary', text: payload.summary });
  }
  if (payload.whyNow?.trim()) {
    out.push({ path: 'whyNow', text: payload.whyNow });
  }
  if (payload.riskNarrative?.trim()) {
    out.push({ path: 'riskNarrative', text: payload.riskNarrative });
  }
  if (payload.opportunityThesis?.trim()) {
    out.push({ path: 'opportunityThesis', text: payload.opportunityThesis });
  }

  out.push({ path: 'signalScan.badge', text: payload.signalScan.badge });
  payload.signalScan.bullets.forEach((b, i) => {
    if (b?.trim()) out.push({ path: `signalScan.bullets[${i}]`, text: b });
  });

  payload.sectors?.forEach((s, i) => {
    if (s.teaser?.trim()) out.push({ path: `sectors[${i}].teaser`, text: s.teaser });
  });

  const sections = payload.sections;
  if (sections) {
    const intro = sections.introduction;
    if (intro) {
      if (intro.intro?.trim()) out.push({ path: 'sections.introduction.intro', text: intro.intro });
      intro.paragraphs?.forEach((p, i) => {
        if (p?.trim()) out.push({ path: `sections.introduction.paragraphs[${i}]`, text: p });
      });
      intro.bullets?.forEach((b, i) => {
        if (b?.trim()) out.push({ path: `sections.introduction.bullets[${i}]`, text: b });
      });
    }
    if (sections.risk?.closingSummary?.trim()) {
      out.push({ path: 'sections.risk.closingSummary', text: sections.risk.closingSummary });
    }
    const signalBullets = sections.signalAndDifferentiation?.signalBullets;
    signalBullets?.forEach((b, i) => {
      if (b?.trim()) {
        out.push({ path: `sections.signalAndDifferentiation.signalBullets[${i}]`, text: b });
      }
    });
    out.push(
      ...collectTextLeaves(sections, 'sections', {
        minLength: 8,
        skipKeys: new Set(['terms']),
      })
    );
  }

  const seen = new Set<string>();
  return out.filter(({ path, text }) => {
    const key = `${path}::${text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function contextWindow(text: string, index: number, before = 50, after = 50): string {
  return text.slice(Math.max(0, index - before), index + after);
}

function yearDriftAllowlisted(ctx: string): boolean {
  return YEAR_DRIFT_ALLOWLIST.some((entry) => entry.pattern.test(ctx));
}

function isSeriesComparisonText(text: string, path: string): boolean {
  return (
    path.includes('indicatorBullets') ||
    (text.includes('→') && /\(\d{4}\)/.test(text)) ||
    /over \d+ years/i.test(text)
  );
}

export function checkNarrativeYearDrift(
  texts: Array<{ path: string; text: string }>,
  canonical: CanonicalCountryPayload,
  _strict: boolean
): PreflightIssue[] {
  const macroYear = canonical.asOf.macroYear;
  if (macroYear == null) return [];

  const issues: PreflightIssue[] = [];
  const code = 'NARRATIVE_YEAR_DRIFT';

  for (const { path, text } of texts) {
    if (isSeriesComparisonText(text, path)) continue;

    const parenYearRe = /\((20\d{2})\)/g;
    let match: RegExpExecArray | null;
    while ((match = parenYearRe.exec(text)) !== null) {
      const y = parseInt(match[1], 10);
      if (y <= macroYear) continue;
      const ctx = contextWindow(text, match.index, 60, 60);
      if (yearDriftAllowlisted(ctx)) continue;
      issues.push({
        code,
        path,
        message: `Narrative references (${y}) but macro as-of is ${macroYear}.`,
        detail: text.slice(Math.max(0, match.index - 40), match.index + 60),
      });
    }

    const bareYearRe = /\b(20\d{2})\b/g;
    while ((match = bareYearRe.exec(text)) !== null) {
      const y = parseInt(match[1], 10);
      if (y <= macroYear) continue;
      const ctx = contextWindow(text, match.index, 60, 60);
      if (yearDriftAllowlisted(ctx)) continue;
      if (/gdp|inflation|fdi|macro|growth\s+of|inflation\s+at/i.test(ctx)) {
        issues.push({
          code,
          path,
          message: `Narrative cites year ${y} beyond structured macro end ${macroYear}.`,
          detail: text.slice(Math.max(0, match.index - 40), match.index + 80),
        });
      }
    }

    const inYearRe = /\bin\s+(20\d{2})\b/gi;
    while ((match = inYearRe.exec(text)) !== null) {
      const y = parseInt(match[1], 10);
      if (y <= macroYear) continue;
      const ctx = contextWindow(text, match.index, 60, 60);
      if (yearDriftAllowlisted(ctx)) continue;
      if (/gdp\s+growth|growth\s+of|inflation\s+at|fdi\s+inflow/i.test(ctx)) {
        issues.push({
          code,
          path,
          message: `Narrative cites macro year ${y} but structured series ends at ${macroYear}.`,
          detail: text.slice(Math.max(0, match.index - 40), match.index + 80),
        });
      }
    }
  }

  return issues;
}

export function checkNarrativeGdpScale(
  texts: Array<{ path: string; text: string }>,
  canonical: CanonicalCountryPayload,
  economyYears: Set<number>
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const cm = canonical.canonicalMetrics;
  const macroYear = canonical.asOf.macroYear;
  if (cm.gdpCurrentUsd == null) return [];

  const usdRegex = /\$\s*([\d,.]+)\s*(B|bn|billion)\b/gi;
  const gdpCtxRe =
    /gdp|economy|economic\s+output|economy\s+scale|economic\s+scale/i;

  for (const { path, text } of texts) {
    if (path.includes('indicatorBullets') || /\$\d+.*→.*\$/i.test(text)) continue;

    let match: RegExpExecArray | null;
    usdRegex.lastIndex = 0;
    while ((match = usdRegex.exec(text)) !== null) {
      const raw = `$${match[1]}${match[2] ?? ''}`;
      const usd = parseUsdString(raw.replace(/\s+/g, ''));
      if (usd == null) continue;

      const start = Math.max(0, match.index - GDP_SCALE_CONTEXT_CHARS);
      const end = Math.min(text.length, match.index + raw.length + GDP_SCALE_CONTEXT_CHARS);
      const ctx = text.slice(start, end);
      if (!gdpCtxRe.test(ctx)) continue;
      if (/fdi|inflow|export|import|trade|partner|pipeline|revenue/i.test(ctx)) continue;

      if (relativeDiff(usd, cm.gdpCurrentUsd) <= GDP_SCALE_TOLERANCE) continue;

      const yearNear = ctx.match(/\((20\d{2})\)/);
      if (yearNear && economyYears.has(parseInt(yearNear[1], 10))) continue;

      issues.push({
        code: 'NARRATIVE_GDP_SCALE',
        path,
        message: `Narrative economy scale (${raw}) diverges from canonical ${(cm.gdpCurrentUsd / 1e9).toFixed(1)}B (${macroYear}).`,
        detail: ctx.trim(),
      });
    }
  }

  return issues;
}

function buildAllowedNumericSets(
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload
): { usd: number[]; pct: number[] } {
  const usd: number[] = [];
  const pct: number[] = [];
  const cm = canonical.canonicalMetrics;
  if (cm.gdpCurrentUsd != null) usd.push(cm.gdpCurrentUsd);
  if (cm.fdiNetInflowsUsd != null) usd.push(cm.fdiNetInflowsUsd);
  if (cm.gdpGrowthPct != null) pct.push(cm.gdpGrowthPct);
  if (cm.inflationCpiPct != null) pct.push(cm.inflationCpiPct);
  for (const row of payload.economyYears) {
    if (row.gdp_current_usd != null) usd.push(row.gdp_current_usd);
    if (row.fdi_net_inflows_usd != null) usd.push(row.fdi_net_inflows_usd);
    if (row.gdp_growth_pct != null) pct.push(row.gdp_growth_pct);
    if (row.inflation_cpi_pct != null) pct.push(row.inflation_cpi_pct);
  }
  const trade = payload.tradeSummary;
  for (const raw of [trade?.exportsUsd, trade?.importsUsd]) {
    if (!raw) continue;
    const v = parseUsdString(raw.replace(/\s+/g, ''));
    if (v != null) usd.push(v);
  }
  return { usd, pct };
}

/** Paths where unsourced numerics block strict PDF generation. */
function isHighTrustNumericPath(path: string): boolean {
  return /^(summary|signalScan|sections\.(introduction|risk\.closingSummary|signalAndDifferentiation))/.test(
    path
  );
}

function nearAllowedUsd(value: number, allowed: number[]): boolean {
  return allowed.some((a) => relativeDiff(value, a) <= GDP_SCALE_TOLERANCE);
}

function nearAllowedPct(value: number, allowed: number[]): boolean {
  return allowed.some((a) => Math.abs(value - a) <= 0.5);
}

const ESTIMATE_MARKER = /\bestimate\b/i;

export function checkNumericClaimsGovernance(
  texts: Array<{ path: string; text: string }>,
  payload: CountryProfileReportData,
  canonical: CanonicalCountryPayload,
  strict: boolean
): { errors: PreflightIssue[]; warnings: PreflightIssue[] } {
  const errors: PreflightIssue[] = [];
  const warnings: PreflightIssue[] = [];
  const allowed = buildAllowedNumericSets(payload, canonical);
  const usdRe = /\$\s*([\d,.]+)\s*([KMB]|bn|billion)?/gi;
  const pctRe = /(-?\d+(?:\.\d+)?)\s*%/g;

  for (const { path, text } of texts) {
    if (isSeriesComparisonText(text, path)) continue;
    if (text.includes('{{')) continue;

    const hasEstimate = ESTIMATE_MARKER.test(text) && SOURCE_MARKER.test(text);
    const sectorTeaser = path.includes('sectors') && path.includes('teaser');
    const highTrust = isHighTrustNumericPath(path);

    let match: RegExpExecArray | null;
    usdRe.lastIndex = 0;
    while ((match = usdRe.exec(text)) !== null) {
      const raw = `$${match[1]}${match[2] ?? ''}`;
      const val = parseUsdString(raw.replace(/\s+/g, ''));
      if (val == null) continue;
      if (nearAllowedUsd(val, allowed.usd) || hasEstimate) continue;

      const issue: PreflightIssue = {
        code: 'NARRATIVE_UNSOURCED_NUMERIC',
        path,
        message: `USD claim (${raw}) is not backed by canonical metrics, economyYears, tradeSummary, or a cited estimate.`,
        detail: text.slice(Math.max(0, match.index - 30), match.index + 40),
      };
      if (sectorTeaser || !highTrust || !strict) warnings.push(issue);
      else errors.push(issue);
    }

    pctRe.lastIndex = 0;
    while ((match = pctRe.exec(text)) !== null) {
      const val = parseFloat(match[1]);
      if (Number.isNaN(val)) continue;
      if (nearAllowedPct(val, allowed.pct) || hasEstimate) continue;
      const ctx = contextWindow(text, match.index);
      if (!/gdp|growth|inflation|fdi/i.test(ctx)) continue;
      if (/yoy|sector|technology|agriculture|services|oil|fintech|share|penetration/i.test(ctx)) continue;

      const issue: PreflightIssue = {
        code: 'NARRATIVE_UNSOURCED_NUMERIC',
        path,
        message: `Percent claim (${val}%) is not backed by canonical metrics or economyYears.`,
        detail: text.slice(Math.max(0, match.index - 30), match.index + 40),
      };
      if (sectorTeaser || !highTrust || !strict) warnings.push(issue);
      else errors.push(issue);
    }
  }

  return { errors, warnings };
}

export function checkCopyQualityWarnings(
  texts: Array<{ path: string; text: string }>
): PreflightIssue[] {
  const warnings: PreflightIssue[] = [];

  for (const { path, text } of texts) {
    const negIncrease = text.match(/(-\d+(?:\.\d+)?)\s*%\s+increase/gi);
    if (negIncrease) {
      for (const m of negIncrease) {
        warnings.push({
          code: 'COPY_CONTRADICTORY_CHANGE',
          path,
          message: `Contradictory phrasing "${m}" — use "decrease" for negative values.`,
          detail: m,
        });
      }
    }

    if (PROMOTIONAL_WORDS.test(text) && !SOURCE_MARKER.test(text)) {
      const word = text.match(PROMOTIONAL_WORDS)?.[0];
      warnings.push({
        code: 'COPY_PROMOTIONAL_TONE',
        path,
        message: `Promotional tone ("${word}") without source or benchmark context.`,
        detail: text.slice(0, 120),
      });
    }
  }

  return warnings;
}
