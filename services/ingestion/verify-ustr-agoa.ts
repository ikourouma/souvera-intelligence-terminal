/**
 * verify:ustr:agoa — archive USTR AGOA lists + update souvera_country_policy_status (all Africa coverage).
 */

import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { storeEvidenceArtifact, upsertPolicyStatus, markAllFrameworkUnderReview } from './evidence-vault';
import {
  USTR_AGOA_LIST_ARTIFACTS,
  USTR_AGOA_PROGRAM_URL,
} from './config/verification-sources';
import { allAfricaIso3 } from './lib/country-name-iso3';
import { extractPdfText } from './lib/extract-pdf-text';
import { discoverPdfLinksFromHtml, filterAgoaListPdfs } from './lib/discover-ustr-pdf-links';
import { parseAgoaPdfText } from './lib/parse-agoa-pdf-text';
import { APPROVED_AFRICA_ISO3 } from '../../apps/api-gateway/src/lib/market-coverage';

const NOT_APPLICABLE_AGOA = new Set(['MAR', 'DZA', 'TUN', 'LBY', 'EGY']);

/** Long-term USTR ineligible countries — always suspended regardless of PDF parse edge cases. */
const FORCE_SUSPENDED_AGOA = new Set(['ZWE']);

export async function verifyUstrAgoa(): Promise<void> {
  console.log('\n[verify:ustr:agoa] Starting USTR AGOA reconciliation...\n');
  const { jobId, sourceId } = await createIngestionJob('ustr', 'verify_ustr_agoa');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  try {
    const programRes = await fetch(USTR_AGOA_PROGRAM_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const programHtml = await programRes.text();
    await storeEvidenceArtifact({
      sourceKey: 'ustr',
      artifactType: 'html',
      url: USTR_AGOA_PROGRAM_URL,
      body: programHtml,
      status: programRes.ok ? 'ok' : 'parse_failed',
      notes: 'AGOA program landing page',
    });

    let primaryArtifactId: string | null = null;
    let eligible = new Set<string>();
    let ineligible = new Set<string>();
    let parseOk = false;

    const discovered = filterAgoaListPdfs(
      discoverPdfLinksFromHtml(programHtml, USTR_AGOA_PROGRAM_URL)
    );
    const candidateUrls = [
      ...USTR_AGOA_LIST_ARTIFACTS.map((a) => ({ label: a.label, url: a.url, year: a.effectiveYear })),
      ...discovered.map((url) => ({ label: 'Discovered from program page', url, year: 2024 })),
    ];

    for (const artifact of candidateUrls) {
      try {
        const res = await fetch(artifact.url, {
          headers: { 'User-Agent': 'SouveraVerification/1.0' },
        });
        const buf = Buffer.from(await res.arrayBuffer());
        const isPdf = res.headers.get('content-type')?.includes('pdf') || artifact.url.endsWith('.pdf');
        const text = isPdf ? await extractPdfText(buf) : buf.toString('utf8');
        const stored = await storeEvidenceArtifact({
          sourceKey: 'ustr',
          artifactType: isPdf ? 'pdf' : 'html',
          url: artifact.url,
          body: buf,
          effectiveDate: `${artifact.year}-01-01`,
          status: res.ok && text.length > 200 ? 'ok' : 'parse_failed',
          notes: artifact.label,
        });

        if (!res.ok || stored.status !== 'ok') continue;

        const parsed = parseAgoaPdfText(text);
        if (parsed.parseOk) {
          primaryArtifactId = stored.id;
          eligible = parsed.eligible;
          ineligible = parsed.ineligible;
          parseOk = true;
          console.log(
            `[verify:ustr:agoa] Parsed ${artifact.label}: ${eligible.size} eligible, ${ineligible.size} ineligible`
          );
          break;
        }
      } catch (e) {
        console.warn(`[verify:ustr:agoa] Artifact failed: ${artifact.url}`, e);
        failed++;
      }
    }

    const reviewedAt = new Date().toISOString();
    const allAfrica = allAfricaIso3();

    if (!parseOk || !primaryArtifactId) {
      console.error('[verify:ustr:agoa] Parse failed — marking AGOA under_review for all Africa');
      await markAllFrameworkUnderReview(
        allAfrica,
        'AGOA',
        'ustr',
        'USTR AGOA list parse failed; do not guess eligibility'
      );
      await updateSourceHealth(sourceId, false, Date.now() - start);
      await closeIngestionJob(jobId, 'failed', 0, allAfrica.length, 'AGOA parse_failed');
      return;
    }

    for (const iso3 of APPROVED_AFRICA_ISO3) {
      let status: string;
      if (NOT_APPLICABLE_AGOA.has(iso3)) {
        status = 'not_applicable';
      } else if (FORCE_SUSPENDED_AGOA.has(iso3) || ineligible.has(iso3)) {
        status = 'suspended';
      } else if (eligible.has(iso3)) {
        status = 'eligible';
      } else {
        status = 'under_review';
      }

      await upsertPolicyStatus({
        countryIso3: iso3,
        framework: 'AGOA',
        status,
        sourceKey: 'ustr',
        evidenceArtifactId: primaryArtifactId,
        confidence: status === 'under_review' ? 'low' : 'high',
        lastReviewedAt: reviewedAt,
        statusEffectiveDate: `${USTR_AGOA_LIST_ARTIFACTS[0]?.effectiveYear ?? 2025}-01-01`,
        notes:
          status === 'eligible'
            ? 'USTR AGOA beneficiary list'
            : status === 'suspended'
              ? 'Listed ineligible/suspended on USTR AGOA list'
              : undefined,
      });
      processed++;
    }

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, 'succeeded', processed, failed);
    console.log(`[verify:ustr:agoa] Updated ${processed} policy rows`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}
