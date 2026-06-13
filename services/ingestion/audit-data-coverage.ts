/**
 * audit:data-coverage — platform credibility audit → tmp/data-credibility-audit.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseServiceClient } from '@souvera/config';
import { closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';
import { TOP20_INDICATOR_KEYS } from '../../apps/api-gateway/src/lib/indicators/top20';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../../apps/api-gateway/src/lib/market-coverage';
import { FISCAL_COVERAGE_KEYS } from '../../apps/api-gateway/src/lib/indicators/top20';

const ALL_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const STALE_DAYS = 120;

export async function auditDataCoverage(): Promise<void> {
  console.log('\n[audit:data-coverage] Running platform audit...\n');
  const { jobId, sourceId } = await createIngestionJob('world_bank', 'audit_data_coverage');
  const start = Date.now();

  const supabase = getSupabaseServiceClient();
  const lines: string[] = [
    '# Souvera Data Credibility Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  try {
    const { data: policyRows } = await supabase
      .from('souvera_country_policy_status')
      .select(
        'country_iso3, framework, status, last_reviewed_at, evidence_artifact_id, source_key, souvera_evidence_artifacts(status)'
      );

    const underReview = (policyRows ?? []).filter((r) => r.status === 'under_review');
    const noEvidence = (policyRows ?? []).filter(
      (r) =>
        !r.evidence_artifact_id &&
        !['not_applicable', 'under_review'].includes(r.status as string)
    );
    const parseFailed = (policyRows ?? []).filter(
      (r) =>
        (r as { souvera_evidence_artifacts?: { status?: string } }).souvera_evidence_artifacts
          ?.status === 'parse_failed'
    );

    lines.push('## Policy registry', '');
    lines.push(`- Total policy rows: **${policyRows?.length ?? 0}**`);
    lines.push(`- Under review: **${underReview.length}**`);
    lines.push(`- Missing evidence artifact: **${noEvidence.length}**`);
    lines.push(`- Parse-failed artifacts: **${parseFailed.length}**`);
    lines.push('');

    if (underReview.length) {
      lines.push('### Under review (sample)', '');
      for (const r of underReview.slice(0, 25)) {
        lines.push(`- ${r.country_iso3} / ${r.framework}`);
      }
      lines.push('');
    }

    const { data: artifacts } = await supabase
      .from('souvera_evidence_artifacts')
      .select('source_key, url, status, retrieved_at')
      .eq('status', 'parse_failed');
    if (artifacts?.length) {
      lines.push('### Parse failures', '');
      for (const a of artifacts) {
        lines.push(`- ${a.source_key}: ${a.url}`);
      }
      lines.push('');
    }

    const { data: countries } = await supabase
      .from('souvera_countries')
      .select('id, iso3')
      .in('iso3', ALL_ISO3);

    const countryIds = new Map((countries ?? []).map((c) => [c.iso3, c.id]));

    const { data: indicators } = await supabase
      .from('souvera_indicators')
      .select('id, key')
      .in('key', [
        ...TOP20_INDICATOR_KEYS,
        ...FISCAL_COVERAGE_KEYS,
        'fiscal_balance_pct_gdp',
        'population_total',
        'wgi_governance_estimate',
        'fx_regime_category',
      ]);

    const indMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

    lines.push('## Macro / fiscal / governance gaps', '');

    for (const iso3 of ALL_ISO3.slice(0, 74)) {
      const cid = countryIds.get(iso3);
      if (!cid) {
        lines.push(`- **${iso3}**: country row missing`);
        continue;
      }

      const { data: obs } = await supabase
        .from('souvera_country_observations')
        .select('indicator_id, period_date, fetched_at, value_numeric, value_text')
        .eq('country_id', cid)
        .order('period_date', { ascending: false });

      const latestByInd = new Map<string, { year: number; fetched?: string }>();
      for (const o of obs ?? []) {
        const key = [...indMap.entries()].find(([, id]) => id === o.indicator_id)?.[0];
        if (!key) continue;
        const year = new Date(o.period_date as string).getFullYear();
        const prev = latestByInd.get(key);
        if (!prev || year > prev.year) {
          latestByInd.set(key, { year, fetched: o.fetched_at as string | undefined });
        }
      }

      const missingTop20 = TOP20_INDICATOR_KEYS.filter((k) => !latestByInd.has(k));
      const missingFiscal = [...FISCAL_COVERAGE_KEYS, 'fiscal_balance_pct_gdp'].filter(
        (k) => !latestByInd.has(k)
      );
      const stale = [...latestByInd.entries()].filter(([, v]) => {
        if (!v.fetched) return false;
        const age = Date.now() - new Date(v.fetched).getTime();
        return age > STALE_DAYS * 86400000;
      });

      if (
        missingTop20.length ||
        missingFiscal.length ||
        !latestByInd.has('wgi_governance_estimate') ||
        !latestByInd.has('fx_regime_category')
      ) {
        const parts: string[] = [];
        if (missingTop20.length) parts.push(`top20 missing: ${missingTop20.slice(0, 4).join(', ')}`);
        if (missingFiscal.length) parts.push(`fiscal: ${missingFiscal.join(', ')}`);
        if (!latestByInd.has('wgi_governance_estimate')) parts.push('WGI');
        if (!latestByInd.has('fx_regime_category')) parts.push('FX regime');
        if (stale.length) parts.push(`stale: ${stale.map(([k]) => k).join(', ')}`);
        lines.push(`- **${iso3}**: ${parts.join(' · ')}`);
      }
    }

    lines.push('', '## Trade as-of gaps', '');
    lines.push('- Trade summary gaps are tracked per-country in report preflight (`hasTradeSummary`).');
    lines.push('');

    const outPath = path.resolve(process.cwd(), '..', '..', 'tmp', 'data-credibility-audit.md');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, lines.join('\n'));
    console.log(`[audit:data-coverage] Wrote ${outPath}`);

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, 'succeeded', policyRows?.length ?? 0, 0);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await closeIngestionJob(jobId, 'failed', 0, 1, msg);
    throw err;
  }
}
