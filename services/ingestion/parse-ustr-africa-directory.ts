/**
 * parse:ustr:africa_directory — USTR Africa directory → external reference links table.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { getSupabaseServiceClient } from '@souvera/config';
import { storeEvidenceArtifact } from './evidence-vault';
import { USTR_AFRICA_DIRECTORY_URL } from './config/verification-sources';
import { parseUstrAfricaDirectoryHtml } from './lib/parse-ustr-africa-directory';
import { APPROVED_AFRICA_ISO3 } from '../../apps/api-gateway/src/lib/market-coverage';

const REF_TYPE = 'USTR_COUNTRY_PAGE';

export async function parseUstrAfricaDirectory(): Promise<void> {
  console.log('\n[parse:ustr:africa_directory] Parsing USTR Africa directory...\n');
  const { jobId, sourceId } = await createIngestionJob(
    'ustr_africa_directory',
    'parse_ustr_africa_directory'
  );
  const start = Date.now();
  const supabase = getSupabaseServiceClient();

  try {
    const res = await fetch(USTR_AFRICA_DIRECTORY_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const html = await res.text();
    const artifact = await storeEvidenceArtifact({
      sourceKey: 'ustr_africa_directory',
      artifactType: 'html',
      url: USTR_AFRICA_DIRECTORY_URL,
      body: html,
      status: res.ok ? 'ok' : 'parse_failed',
      notes: 'USTR Africa countries directory',
    });

    if (!res.ok || artifact.status !== 'ok') {
      await updateSourceHealth(sourceId, false, Date.now() - start);
      await closeIngestionJob(jobId, 'failed', 0, 1, 'Directory fetch failed');
      throw new Error('USTR Africa directory fetch failed');
    }

    const entries = parseUstrAfricaDirectoryHtml(html);
    const reviewedAt = new Date().toISOString();
    const unmatched: Array<{ slug: string; label: string; url: string }> = [];
    let upserted = 0;

    for (const entry of entries) {
      if (!entry.entityKey) {
        unmatched.push({ slug: entry.slug, label: entry.label, url: entry.url });
        await supabase.from('souvera_external_reference_links').upsert(
          {
            entity_key: null,
            ref_type: REF_TYPE,
            url: entry.url,
            label: entry.label,
            slug: entry.slug,
            unmatched_name: entry.label,
            source_key: 'ustr_africa_directory',
            evidence_artifact_id: artifact.id,
            last_reviewed_at: reviewedAt,
          },
          { onConflict: 'ref_type,url' }
        );
        continue;
      }

      const { error } = await supabase.from('souvera_external_reference_links').upsert(
        {
          entity_key: entry.entityKey,
          ref_type: REF_TYPE,
          url: entry.url,
          label: entry.label || `USTR — ${entry.entityKey}`,
          slug: entry.slug,
          unmatched_name: null,
          source_key: 'ustr_africa_directory',
          evidence_artifact_id: artifact.id,
          last_reviewed_at: reviewedAt,
        },
        { onConflict: 'ref_type,url' }
      );
      if (error) throw new Error(error.message);
      upserted++;
    }

    const ustrIso3 = new Set(
      entries.filter((e) => e.entityKey).map((e) => e.entityKey as string)
    );
    const missingInUstr = APPROVED_AFRICA_ISO3.filter((iso) => !ustrIso3.has(iso));
    const missingInSouvera = entries
      .filter((e) => e.entityKey && !APPROVED_AFRICA_ISO3.includes(e.entityKey as never))
      .map((e) => e.entityKey);

    const tmpDir = path.resolve(process.cwd(), 'tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'ustr-africa-unmatched.json'),
      JSON.stringify(
        {
          generatedAt: reviewedAt,
          parsedCount: entries.length,
          matchedCount: upserted,
          unmatched,
          missingInUstr,
          extraInUstrNotInSouvera: missingInSouvera,
        },
        null,
        2
      ),
      'utf8'
    );

    console.log(
      `[parse:ustr:africa_directory] ${entries.length} links, ${upserted} matched ISO3, ${unmatched.length} unmatched`
    );

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, 'succeeded', upserted, unmatched.length);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', 0, 1, msg);
    throw err;
  }
}
