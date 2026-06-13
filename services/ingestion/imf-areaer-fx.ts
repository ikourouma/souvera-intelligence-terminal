/**
 * IMF AREAER — FX regime extraction from AREAER index HTML (no API).
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';
import { storeEvidenceArtifact } from './evidence-vault';
import { IMF_AREAER_INDEX_URL } from './config/verification-sources';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../../apps/api-gateway/src/lib/market-coverage';
import { countryDisplayName } from '../../apps/api-gateway/src/lib/intelligence/country-names';

const COVERAGE_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

const REGIME_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /no separate legal tender/i, label: 'No separate legal tender' },
  { re: /currency board/i, label: 'Currency board' },
  { re: /conventional peg/i, label: 'Conventional peg' },
  { re: /stabilized arrangement/i, label: 'Stabilized arrangement' },
  { re: /crawling peg/i, label: 'Crawling peg' },
  { re: /managed float/i, label: 'Managed float' },
  { re: /free floating/i, label: 'Free floating' },
  { re: /floating/i, label: 'Floating' },
  { re: /multiple exchange rates/i, label: 'Multiple exchange rates' },
];

export async function ingestImfAreaerFx(): Promise<void> {
  console.log('\n[imf-areaer-fx] AREAER FX regime extraction...\n');
  const { jobId, sourceId } = await createIngestionJob('imf_areaer', 'imf_areaer_fx');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    const res = await fetch(IMF_AREAER_INDEX_URL, {
      headers: { 'User-Agent': 'SouveraIngestion/1.0' },
    });
    const html = await res.text();
    await storeEvidenceArtifact({
      sourceKey: 'imf_areaer',
      artifactType: 'html',
      url: IMF_AREAER_INDEX_URL,
      body: html,
      status: res.ok ? 'ok' : 'parse_failed',
      notes: 'AREAER index page',
    });
    await archivePayload(sourceId, IMF_AREAER_INDEX_URL, {}, { length: html.length }, res.status);

    const { data: indicator } = await supabase
      .from('souvera_indicators')
      .select('id')
      .eq('key', 'fx_regime_category')
      .maybeSingle();

    if (!indicator?.id) {
      await supabase.from('souvera_indicators').upsert(
        {
          key: 'fx_regime_category',
          label: 'Exchange rate regime (IMF AREAER)',
          domain: 'fx_regime',
          unit: 'text',
          description: 'IMF AREAER classification',
          preferred_source_key: 'imf_areaer',
          refresh_policy: 'annual',
          is_forecast: false,
          min_plan_id: 'professional',
        },
        { onConflict: 'key' }
      );
    }

    const indicatorId =
      indicator?.id ??
      (
        await supabase.from('souvera_indicators').select('id').eq('key', 'fx_regime_category').single()
      ).data?.id;

    if (!indicatorId) throw new Error('fx_regime_category indicator missing');

    const { data: countries } = await supabase
      .from('souvera_countries')
      .select('id, iso3')
      .in('iso3', COVERAGE_ISO3);

    const year = new Date().getFullYear() - 1;

    for (const c of countries ?? []) {
      const name = countryDisplayName(c.iso3);
      const regime = extractRegimeForCountry(html, name);
      if (!regime) {
        failed++;
        continue;
      }

      const { error } = await supabase.from('souvera_country_observations').upsert(
        {
          country_id: c.id,
          indicator_id: indicatorId,
          period_date: `${year}-01-01`,
          period_type: 'annual',
          value_text: regime,
          source_id: sourceId,
          source_series_key: 'AREAER',
          is_forecast: false,
          is_estimate: false,
          quality_score: 0.75,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: 'country_id,indicator_id,period_date,source_id' }
      );
      if (error) failed++;
      else processed++;
    }

    await updateSourceHealth(sourceId, processed > 0, Date.now() - start);
    await closeIngestionJob(
      jobId,
      failed > processed ? 'partial' : 'succeeded',
      processed,
      failed
    );
    console.log(`[imf-areaer-fx] ${processed} regimes stored, ${failed} gaps`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}

function extractRegimeForCountry(html: string, countryName: string): string | null {
  const idx = html.toLowerCase().indexOf(countryName.toLowerCase());
  if (idx < 0) return null;
  const window = html.slice(idx, idx + 1200);
  for (const { re, label } of REGIME_PATTERNS) {
    if (re.test(window)) return label;
  }
  return null;
}
