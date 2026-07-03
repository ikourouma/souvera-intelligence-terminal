/**
 * parse:ustr:africa_country_summaries — fetch USTR Africa country pages and store trade summaries.
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts parse:ustr:africa_country_summaries
 */
import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { getSupabaseServiceClient } from '@souvera/config';
import { storeEvidenceArtifact } from './evidence-vault';
import { parseUstrCountryTradePageHtml } from './lib/parse-ustr-country-trade-page';

/** Ingestion job source — must exist in souvera_data_sources (seeded by create-external-reference-links migration). */
const INGESTION_SOURCE_KEY = 'ustr_africa_directory';
/** Evidence artifact tag for country-page HTML captures. */
const ARTIFACT_SOURCE_KEY = 'ustr_africa_directory';
const DELAY_MS = 400;

async function assertUstrTradeSummariesTable(): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from('souvera_ustr_trade_summaries').select('iso3').limit(1);
  if (error?.message?.includes('does not exist') || error?.code === '42P01') {
    throw new Error(
      'Table souvera_ustr_trade_summaries not found. Apply migration first:\n' +
        '  infra/supabase/migrations/create-ustr-trade-summaries.sql\n' +
        '(Supabase SQL Editor → paste & run, or supabase db push)'
    );
  }
  if (error) {
    throw new Error(`Cannot read souvera_ustr_trade_summaries: ${error.message}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllUstrCountryLinks(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Array<{ entity_key: string; url: string; label: string | null }>> {
  const rows: Array<{ entity_key: string; url: string; label: string | null }> = [];
  const PAGE = 500;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('souvera_external_reference_links')
      .select('entity_key, url, label')
      .eq('ref_type', 'USTR_COUNTRY_PAGE')
      .not('entity_key', 'is', null)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as typeof rows));
    if (data.length < PAGE) break;
  }
  return rows;
}

export async function parseUstrAfricaCountrySummaries(): Promise<void> {
  console.log('\n[parse:ustr:africa_country_summaries] Fetching USTR country trade pages...\n');
  await assertUstrTradeSummariesTable();
  const { jobId, sourceId } = await createIngestionJob(
    INGESTION_SOURCE_KEY,
    'parse_ustr_africa_country_summaries'
  );
  const start = Date.now();
  const supabase = getSupabaseServiceClient();

  let links: Array<{ entity_key: string; url: string; label: string | null }>;
  try {
    links = await fetchAllUstrCountryLinks(supabase);
  } catch (linkErr) {
    const msg = linkErr instanceof Error ? linkErr.message : String(linkErr);
    await closeIngestionJob(jobId, 'failed', 0, 1, msg);
    throw linkErr;
  }

  if (!links.length) {
    await closeIngestionJob(jobId, 'failed', 0, 1, 'No USTR country links — run parse:ustr:africa_directory first');
    throw new Error('No USTR country page links found');
  }

  console.log(`Found ${links.length} USTR country page link(s) to fetch.\n`);

  let processed = 0;
  let failed = 0;
  const reviewedAt = new Date().toISOString();

  for (const link of links) {
    const iso3 = (link.entity_key as string).toUpperCase();
    const url = link.url as string;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
      const html = await res.text();
      const artifact = await storeEvidenceArtifact({
        sourceKey: ARTIFACT_SOURCE_KEY,
        artifactType: 'html',
        url,
        body: html,
        status: res.ok ? 'ok' : 'parse_failed',
        notes: `USTR country trade page — ${iso3}`,
      });

      if (!res.ok) {
        failed++;
        console.warn(`  ${iso3}: fetch failed (${res.status})`);
        continue;
      }

      const parsed = parseUstrCountryTradePageHtml(html);
      if (!parsed.metrics.length) {
        failed++;
        console.warn(`  ${iso3}: no trade summary metrics parsed`);
        continue;
      }

      const { error: upsertErr } = await supabase.from('souvera_ustr_trade_summaries').upsert(
        {
          iso3,
          source_url: url,
          agoa_status_text: parsed.agoa_status_text,
          trade_agreement_text: parsed.trade_agreement_text,
          metrics: parsed.metrics,
          evidence_artifact_id: artifact.id,
          last_reviewed_at: reviewedAt,
        },
        { onConflict: 'iso3' }
      );

      if (upsertErr) {
        failed++;
        console.warn(`  ${iso3}: upsert error`, upsertErr.message);
        continue;
      }

      processed++;
      console.log(`  ${iso3}: ${parsed.metrics.length} metrics`);
      await sleep(DELAY_MS);
    } catch (e) {
      failed++;
      console.warn(`  ${iso3}:`, e);
    }
  }

  await updateSourceHealth(sourceId, failed === 0, Date.now() - start);
  const jobStatus = failed === 0 ? 'succeeded' : processed > 0 ? 'partial' : 'failed';
  await closeIngestionJob(jobId, jobStatus, processed, failed);
  console.log(`\n[parse:ustr:africa_country_summaries] Done — ${processed}/${links.length} ok, ${failed} failed\n`);
}
