/**
 * capture:ustr:anchors — snapshot USTR program pages + Africa directory (Evidence Vault).
 */

import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { storeEvidenceArtifact } from './evidence-vault';
import {
  USTR_AGOA_PROGRAM_URL,
  USTR_CBI_PROGRAM_URL,
  USTR_AFRICA_DIRECTORY_URL,
} from './config/verification-sources';

const ANCHORS: Array<{ sourceKey: string; url: string; label: string }> = [
  { sourceKey: 'ustr_agoa_program', url: USTR_AGOA_PROGRAM_URL, label: 'USTR AGOA program' },
  { sourceKey: 'ustr_cbi_program', url: USTR_CBI_PROGRAM_URL, label: 'USTR CBI program' },
  {
    sourceKey: 'ustr_africa_directory',
    url: USTR_AFRICA_DIRECTORY_URL,
    label: 'USTR Africa directory',
  },
];

export async function captureUstrAnchors(): Promise<void> {
  console.log('\n[capture:ustr:anchors] USTR anchor snapshots...\n');
  let ok = 0;
  let fail = 0;

  for (const anchor of ANCHORS) {
    const { jobId, sourceId } = await createIngestionJob(anchor.sourceKey, 'capture_ustr_anchor');
    const start = Date.now();

    try {
      const res = await fetch(anchor.url, {
        headers: { 'User-Agent': 'SouveraVerification/1.0' },
      });
      const html = await res.text();
      const artifact = await storeEvidenceArtifact({
        sourceKey: anchor.sourceKey,
        artifactType: 'html',
        url: anchor.url,
        body: html,
        status: res.ok ? 'ok' : 'parse_failed',
        notes: anchor.label,
      });

      if (res.ok && artifact.status === 'ok') {
        ok++;
        await updateSourceHealth(sourceId, true, Date.now() - start);
        await closeIngestionJob(jobId, 'succeeded', 1, 0);
        console.log(`  ✓ ${anchor.sourceKey} checksum=${artifact.checksum_sha256.slice(0, 12)}…`);
      } else {
        fail++;
        await updateSourceHealth(sourceId, false, Date.now() - start);
        await closeIngestionJob(jobId, 'failed', 0, 1, `HTTP ${res.status}`);
        console.warn(`  ✗ ${anchor.sourceKey} fetch failed`);
      }
    } catch (err) {
      fail++;
      const msg = err instanceof Error ? err.message : String(err);
      await updateSourceHealth(sourceId, false, Date.now() - start);
      await closeIngestionJob(jobId, 'failed', 0, 1, msg);
      console.warn(`  ✗ ${anchor.sourceKey}: ${msg}`);
    }
  }

  console.log(`[capture:ustr:anchors] ${ok} ok, ${fail} failed`);
  if (fail > 0) {
    throw new Error(`${fail} USTR anchor capture(s) failed`);
  }
}
