/**
 * verify:ustr:cbi — CBI beneficiary reconciliation (evidence-derived only).
 */

import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { storeEvidenceArtifact, upsertPolicyStatus, markAllFrameworkUnderReview } from './evidence-vault';
import { USTR_CBI_PAGE_URL, USTR_CBI_PROGRAM_URL } from './config/verification-sources';
import { extractPdfText } from './lib/extract-pdf-text';
import { discoverPdfLinksFromHtml, filterCbiReportPdfs } from './lib/discover-ustr-pdf-links';
import { matchIso3InBlob } from './lib/country-name-iso3';
import { entityKeysForRegion, isTerritoryEntity } from '../../apps/api-gateway/src/lib/entity-registry';

export async function verifyUstrCbi(): Promise<void> {
  console.log('\n[verify:ustr:cbi] Starting CBI reconciliation...\n');
  const { jobId, sourceId } = await createIngestionJob('ustr_cbi', 'verify_ustr_cbi');
  const start = Date.now();
  let processed = 0;
  const caribbeanKeys = entityKeysForRegion('caribbean');

  try {
    const programRes = await fetch(USTR_CBI_PROGRAM_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const programHtml = await programRes.text();
    await storeEvidenceArtifact({
      sourceKey: 'ustr_cbi_program',
      artifactType: 'html',
      url: USTR_CBI_PROGRAM_URL,
      body: programHtml,
      status: programRes.ok ? 'ok' : 'parse_failed',
      notes: 'USTR CBI program anchor',
    });

    let mentioned = matchIso3InBlob(programHtml, 'caribbean');
    let artifact = await storeEvidenceArtifact({
      sourceKey: 'ustr_cbi',
      artifactType: 'html',
      url: USTR_CBI_PROGRAM_URL,
      body: programHtml,
      status: programRes.ok ? 'ok' : 'parse_failed',
      notes: 'CBI parse from USTR program page',
    });
    let parseOk = programRes.ok && mentioned.size >= 3;

    if (!parseOk) {
      const tradeRes = await fetch(USTR_CBI_PAGE_URL, {
        headers: { 'User-Agent': 'SouveraVerification/1.0' },
      });
      const tradeHtml = await tradeRes.text();
      const tradeMentions = matchIso3InBlob(tradeHtml, 'caribbean');
      if (tradeRes.ok && tradeMentions.size >= 3) {
        mentioned = tradeMentions;
        artifact = await storeEvidenceArtifact({
          sourceKey: 'ustr_cbi',
          artifactType: 'html',
          url: USTR_CBI_PAGE_URL,
          body: tradeHtml,
          status: 'ok',
          notes: 'CBI beneficiary list parse (trade.gov fallback)',
        });
        parseOk = true;
      }
    }

    if (!parseOk) {
      const pdfUrls = filterCbiReportPdfs(
        discoverPdfLinksFromHtml(programHtml, USTR_CBI_PROGRAM_URL)
      );
      for (const pdfUrl of pdfUrls.slice(0, 2)) {
        const pdfRes = await fetch(pdfUrl, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
        if (!pdfRes.ok) continue;
        const buf = Buffer.from(await pdfRes.arrayBuffer());
        const text = await extractPdfText(buf);
        const pdfMentions = matchIso3InBlob(text, 'caribbean');
        if (pdfMentions.size >= 3) {
          mentioned = pdfMentions;
          artifact = await storeEvidenceArtifact({
            sourceKey: 'ustr_cbi',
            artifactType: 'pdf',
            url: pdfUrl,
            body: buf,
            status: 'ok',
            notes: 'CBI parse from USTR CBERA report PDF',
          });
          parseOk = true;
          break;
        }
      }
    }
    const reviewedAt = new Date().toISOString();

    if (!parseOk) {
      await markAllFrameworkUnderReview(
        caribbeanKeys,
        'CBI',
        'ustr_cbi',
        'CBI page parse failed or beneficiary list not machine-readable'
      );
      await updateSourceHealth(sourceId, false, Date.now() - start);
      await closeIngestionJob(jobId, 'failed', 0, caribbeanKeys.length, 'CBI parse_failed');
      return;
    }

    for (const entityKey of caribbeanKeys) {
      let status: string;
      if (entityKey === 'CUB') {
        status = 'not_applicable';
      } else if (mentioned.has(entityKey)) {
        status = 'eligible';
      } else if (isTerritoryEntity(entityKey)) {
        status = 'under_review';
      } else {
        status = 'under_review';
      }

      const publishableStatus =
        status === 'eligible' || status === 'ineligible' || status === 'not_applicable';

      await upsertPolicyStatus({
        countryIso3: entityKey,
        framework: 'CBI',
        status: publishableStatus ? status : 'under_review',
        sourceKey: 'ustr_cbi',
        evidenceArtifactId: artifact.id,
        confidence: mentioned.has(entityKey) ? 'high' : 'low',
        lastReviewedAt: reviewedAt,
        notes: mentioned.has(entityKey)
          ? 'Named on trade.gov CBI page parse'
          : isTerritoryEntity(entityKey)
            ? 'Territory — CBI eligibility requires explicit beneficiary list evidence'
            : 'Not named on CBI page parse',
      });
      processed++;
    }

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, 'succeeded', processed, 0);
    console.log(`[verify:ustr:cbi] Updated ${processed} rows`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, 1, msg);
    throw err;
  }
}
