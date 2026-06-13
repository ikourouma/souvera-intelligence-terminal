/**
 * verify:caricom — evidence-backed CARICOM member / associate / not_a_member.
 */

import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { storeEvidenceArtifact, upsertPolicyStatus, markAllFrameworkUnderReview } from './evidence-vault';
import {
  CARICOM_ASSOCIATE_MEMBERS_URL,
  CARICOM_HOME_URL,
  CARICOM_MEMBERS_URL,
} from './config/verification-sources';
import { entityKeysForRegion } from '../../apps/api-gateway/src/lib/entity-registry';
import {
  assertCaricomMappingSanity,
  parseCaricomPages,
  resolveCaricomStatus,
} from './lib/parse-caricom-membership';

export async function verifyCaricom(): Promise<void> {
  console.log('\n[verify:caricom] CARICOM membership reconciliation...\n');
  const { jobId, sourceId } = await createIngestionJob('caricom', 'verify_caricom');
  const start = Date.now();
  let processed = 0;
  const caribbeanKeys = entityKeysForRegion('caribbean');

  try {
    const homeRes = await fetch(CARICOM_HOME_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const homeHtml = await homeRes.text();
    await storeEvidenceArtifact({
      sourceKey: 'caricom',
      artifactType: 'html',
      url: CARICOM_HOME_URL,
      body: homeHtml,
      status: homeRes.ok ? 'ok' : 'parse_failed',
      notes: 'CARICOM portal home',
    });

    const membersRes = await fetch(CARICOM_MEMBERS_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const membersHtml = await membersRes.text();
    const membersArtifact = await storeEvidenceArtifact({
      sourceKey: 'caricom',
      artifactType: 'html',
      url: CARICOM_MEMBERS_URL,
      body: membersHtml,
      status: membersRes.ok ? 'ok' : 'parse_failed',
      notes: 'CARICOM member states page',
    });

    const assocRes = await fetch(CARICOM_ASSOCIATE_MEMBERS_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const associatesHtml = await assocRes.text();
    const associatesArtifact = await storeEvidenceArtifact({
      sourceKey: 'caricom',
      artifactType: 'html',
      url: CARICOM_ASSOCIATE_MEMBERS_URL,
      body: associatesHtml,
      status: assocRes.ok ? 'ok' : 'parse_failed',
      notes: 'CARICOM associate members page',
    });

    const parsed = parseCaricomPages({
      membersHtml,
      associatesHtml,
      membersHttpOk: membersRes.ok,
      associatesHttpOk: assocRes.ok,
    });

    const primaryArtifactId = membersArtifact.id;
    const reviewedAt = new Date().toISOString();

    if (!parsed.membersPageOk) {
      await markAllFrameworkUnderReview(
        caribbeanKeys,
        'CARICOM',
        'caricom',
        'CARICOM member page parse failed; do not guess membership'
      );
      await updateSourceHealth(sourceId, false, Date.now() - start);
      await closeIngestionJob(jobId, 'failed', 0, caribbeanKeys.length, 'CARICOM parse_failed');
      return;
    }

    for (const entityKey of caribbeanKeys) {
      const status = resolveCaricomStatus(entityKey, parsed);
      assertCaricomMappingSanity(entityKey, status, parsed);

      const artifactId =
        status === 'associate_member' && parsed.associatesPageOk
          ? associatesArtifact.id
          : primaryArtifactId;

      await upsertPolicyStatus({
        countryIso3: entityKey,
        framework: 'CARICOM',
        status,
        sourceKey: 'caricom',
        evidenceArtifactId: artifactId,
        confidence:
          parsed.memberSet.has(entityKey) || parsed.associateMemberSet.has(entityKey)
            ? 'high'
            : 'med',
        lastReviewedAt: reviewedAt,
        notes:
          status === 'member'
            ? 'CARICOM full member (evidence page parse)'
            : status === 'associate_member'
              ? 'CARICOM associate member (evidence page parse)'
              : status === 'not_a_member'
                ? 'Not listed on CARICOM member/associate pages'
                : undefined,
      });
      processed++;
    }

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, 'succeeded', processed, 0);
    console.log(`[verify:caricom] Updated ${processed} rows`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, 1, msg);
    throw err;
  }
}
