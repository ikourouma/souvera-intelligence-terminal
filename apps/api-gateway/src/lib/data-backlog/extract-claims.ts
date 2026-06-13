/**
 * Extract numeric claims from report payloads for Option 2 backlog.
 */

import type { CountryProfileReportData } from '@/lib/reports/country-profile-data';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';
import { TOP20_INDICATORS } from '@/lib/indicators/top20';
import { classifyClaim, candidateSourcesForClaim, CLAIM_CATEGORY_SOURCES } from './candidate-sources';
import { getDeepDiveSectorOptions } from '@/lib/sectors/sector-taxonomy';

export type BacklogRiskLevel = 'High' | 'Med' | 'Low';

export interface BacklogItem {
  claimText: string;
  path: string;
  iso3: string;
  riskLevel: BacklogRiskLevel;
  category: string;
  status: 'unverified';
  candidateSources: ReturnType<typeof candidateSourcesForClaim>;
}

const NUMERIC_CLAIM_RE =
  /\$[\d,.]+\s*[BMK]?|\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*(?:TCF|GW|MW|barrels?|million|billion)/i;

function riskForPath(path: string): BacklogRiskLevel {
  if (/risk|fiscal|fx|fdi|gdp|macro|closingSummary/i.test(path)) return 'High';
  if (/opportunity|pillar|trade|sector/i.test(path)) return 'Med';
  return 'Low';
}

function collectLeaves(
  obj: unknown,
  prefix: string,
  iso3: string,
  out: BacklogItem[]
): void {
  if (typeof obj === 'string' && NUMERIC_CLAIM_RE.test(obj)) {
    const category = classifyClaim(obj);
    out.push({
      claimText: obj.trim().slice(0, 280),
      path: prefix,
      iso3,
      riskLevel: riskForPath(prefix),
      category,
      status: 'unverified',
      candidateSources: candidateSourcesForClaim(obj),
    });
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectLeaves(item, `${prefix}[${i}]`, iso3, out));
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'terms' || k === 'capabilities') continue;
      collectLeaves(v, prefix ? `${prefix}.${k}` : k, iso3, out);
    }
  }
}

const TOP20_KEYS = new Set(TOP20_INDICATORS.map((i) => i.indicatorKey));

const BACKLOG_EXCLUDED_PATH_RE =
  /sections\.economic\.indicatorBullets|canonical\.|signalScan\.bullets|sourceMeta/i;

function latestEconomyRow(years: EconomyYearPoint[]): EconomyYearPoint | undefined {
  if (!years.length) return undefined;
  const y = Math.max(...years.map((r) => r.year));
  return years.find((r) => r.year === y);
}

function fmtUsdForMatch(n: number): string[] {
  const out: string[] = [];
  if (n >= 1e12) out.push(`${(n / 1e12).toFixed(2)}T`, `${(n / 1e12).toFixed(1)}T`);
  if (n >= 1e9) out.push(`${(n / 1e9).toFixed(1)}B`, `${(n / 1e9).toFixed(0)}B`, `${Math.round(n / 1e9)}B`);
  if (n >= 1e6) out.push(`${(n / 1e6).toFixed(0)}M`);
  return out;
}

function claimMatchesTop20Series(text: string, row: EconomyYearPoint): boolean {
  const t = text.replace(/\s/g, '');
  for (const key of TOP20_KEYS) {
    const val = (row as Record<string, number | undefined>)[key];
    if (val == null) continue;
    if (key.includes('pct') || key.includes('growth') || key.includes('inflation')) {
      const pct = val.toFixed(1);
      if (t.includes(`${pct}%`) || t.includes(`${Math.round(val)}%`)) return true;
    }
    if (typeof val === 'number' && val >= 1e6) {
      for (const token of fmtUsdForMatch(val)) {
        if (t.includes(token.replace(/\s/g, '')) || text.includes(`$${token}`)) return true;
      }
    }
  }
  if (row.gdp_current_usd != null) {
    const b = row.gdp_current_usd / 1e9;
    if (text.includes(`${b.toFixed(1)}B`) || text.includes(`${Math.round(b)}B`)) return true;
  }
  return false;
}

function isBackedByTop20Canonical(payload: CountryProfileReportData, item: BacklogItem): boolean {
  if (BACKLOG_EXCLUDED_PATH_RE.test(item.path)) return true;
  const row = latestEconomyRow(payload.economyYears ?? []);
  if (!row) return false;
  if (claimMatchesTop20Series(item.claimText, row)) return true;
  const metaKeys = Object.keys(payload.sourceMeta?.metrics ?? {});
  if (metaKeys.some((k) => TOP20_KEYS.has(k)) && /gdp|fdi|inflation|growth|population/i.test(item.claimText)) {
    return true;
  }
  return false;
}

export function extractBacklogFromPayload(payload: CountryProfileReportData): BacklogItem[] {
  const iso3 = payload.country.iso3;
  const items: BacklogItem[] = [];

  if (payload.summary) collectLeaves(payload.summary, 'summary', iso3, items);
  if (payload.whyNow) collectLeaves(payload.whyNow, 'whyNow', iso3, items);
  collectLeaves(payload.sections, 'sections', iso3, items);
  payload.sectors?.forEach((s, i) => {
    if (s.teaser) collectLeaves(s.teaser, `sectors[${i}].teaser`, iso3, items);
  });

  const sectorLabels = new Set(
    (payload.sectors ?? []).map((s) => s.label.toLowerCase())
  );
  for (const opt of getDeepDiveSectorOptions(iso3, payload.country.region)) {
    if (opt.sectorKey !== 'tourism-hospitality') continue;
    const hasTourismRow =
      sectorLabels.has('tourism') ||
      [...sectorLabels].some((l) => l.includes('tourism') || l.includes('hospitality'));
    if (!hasTourismRow) {
      items.push({
        claimText: 'Tourism & Hospitality sector scorecard and structured arrivals/receipts series',
        path: 'sectors.tourism-hospitality',
        iso3,
        riskLevel: 'Med',
        category: 'tourism_hospitality',
        status: 'unverified',
        candidateSources: CLAIM_CATEGORY_SOURCES.tourism_hospitality,
      });
    }
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    if (isBackedByTop20Canonical(payload, item)) return false;
    const key = `${item.path}::${item.claimText.slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function renderBacklogMarkdown(items: BacklogItem[], generatedAt: string): string {
  const lines: string[] = [
    '# Souvera Sourced Data Backlog',
    '',
    `Generated: ${generatedAt}`,
    '',
    'Numeric claims in narratives/teasers that are **not** backed by structured observations or `sourceMeta` URLs. Status: `unverified` until ingested or rewritten.',
    '',
    `Total items: **${items.length}**`,
    '',
  ];

  const byIso = new Map<string, BacklogItem[]>();
  for (const item of items) {
    const list = byIso.get(item.iso3) ?? [];
    list.push(item);
    byIso.set(item.iso3, list);
  }

  for (const [iso3, group] of [...byIso.entries()].sort()) {
    lines.push(`## ${iso3}`, '');
    for (const item of group) {
      lines.push(`### ${item.path}`, '');
      lines.push(`- **Claim:** ${item.claimText.replace(/\n/g, ' ')}`);
      lines.push(`- **Risk:** ${item.riskLevel}`);
      lines.push(`- **Category:** ${item.category}`);
      lines.push(`- **Status:** ${item.status}`);
      lines.push('- **Candidate sources:**');
      for (const src of item.candidateSources) {
        const paid = src.type === 'paid' ? ' (Paid/Review)' : '';
        lines.push(`  - [${src.name}](${src.url})${paid} — ${src.type}, ${src.authModel}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
