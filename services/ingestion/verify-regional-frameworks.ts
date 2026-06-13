/**
 * Evidence-backed AfCFTA / ECOWAS reconciliation (CARICOM → verify:caricom).
 */

import { createIngestionJob, closeIngestionJob, updateSourceHealth } from './shared';
import { storeEvidenceArtifact, upsertPolicyStatus } from './evidence-vault';
import { AU_AFCFTA_URL, ECOWAS_MEMBERS_URL } from './config/verification-sources';
import { matchIso3InBlob } from './lib/country-name-iso3';
import { entityKeysForRegion } from '../../apps/api-gateway/src/lib/entity-registry';

const AFCFTA_EXCLUDED = new Set(['MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'ESH']);

/** West Africa countries that may have an ECOWAS policy row (scope only — not membership proof). */
const ECOWAS_SCOPE = new Set([
  'BEN', 'BFA', 'CPV', 'CIV', 'GMB', 'GHA', 'GIN', 'GNB', 'LBR', 'MLI', 'NER', 'NGA', 'SEN',
  'SLE', 'TGO',
]);

export async function verifyRegionalFrameworks(): Promise<void> {
  console.log('\n[verify:regional] AfCFTA / ECOWAS...\n');
  const { jobId, sourceId } = await createIngestionJob('au_afcfta', 'verify_regional_frameworks');
  const start = Date.now();
  let processed = 0;
  const africaKeys = entityKeysForRegion('africa');

  try {
    const reviewedAt = new Date().toISOString();

    const afcRes = await fetch(AU_AFCFTA_URL, { headers: { 'User-Agent': 'SouveraVerification/1.0' } });
    const afcHtml = await afcRes.text();
    const afcArtifact = await storeEvidenceArtifact({
      sourceKey: 'au_afcfta',
      artifactType: 'html',
      url: AU_AFCFTA_URL,
      body: afcHtml,
      status: afcRes.ok ? 'ok' : 'parse_failed',
    });
    const afcMentioned = matchIso3InBlob(afcHtml, 'africa');
    const afcParseOk = afcRes.ok && afcArtifact.status === 'ok';

    for (const entityKey of africaKeys) {
      if (AFCFTA_EXCLUDED.has(entityKey)) {
        await upsertPolicyStatus({
          countryIso3: entityKey,
          framework: 'AfCFTA',
          status: 'not_applicable',
          sourceKey: 'au_afcfta',
          evidenceArtifactId: afcArtifact.id,
          confidence: 'med',
          lastReviewedAt: reviewedAt,
          notes: 'Outside AfCFTA continental scope',
        });
      } else if (afcParseOk && afcMentioned.has(entityKey)) {
        await upsertPolicyStatus({
          countryIso3: entityKey,
          framework: 'AfCFTA',
          status: 'active',
          sourceKey: 'au_afcfta',
          evidenceArtifactId: afcArtifact.id,
          confidence: 'high',
          lastReviewedAt: reviewedAt,
          notes: 'Named on AfCFTA evidence page',
        });
      } else {
        await upsertPolicyStatus({
          countryIso3: entityKey,
          framework: 'AfCFTA',
          status: 'under_review',
          sourceKey: 'au_afcfta',
          evidenceArtifactId: afcParseOk ? afcArtifact.id : null,
          confidence: 'low',
          lastReviewedAt: reviewedAt,
          notes: 'AfCFTA membership not confirmed from page parse',
        });
      }
      processed++;
    }

    const ecowasRes = await fetch(ECOWAS_MEMBERS_URL, {
      headers: { 'User-Agent': 'SouveraVerification/1.0' },
    });
    const ecowasHtml = await ecowasRes.text();
    const ecowasArtifact = await storeEvidenceArtifact({
      sourceKey: 'ecowas',
      artifactType: 'html',
      url: ECOWAS_MEMBERS_URL,
      body: ecowasHtml,
      status: ecowasRes.ok ? 'ok' : 'parse_failed',
    });
    const ecowasMentioned = matchIso3InBlob(ecowasHtml, 'africa');
    const ecowasParseOk = ecowasRes.ok && ecowasArtifact.status === 'ok';

    for (const entityKey of africaKeys) {
      if (!ECOWAS_SCOPE.has(entityKey)) continue;

      const isMember = ecowasParseOk && ecowasMentioned.has(entityKey);
      await upsertPolicyStatus({
        countryIso3: entityKey,
        framework: 'ECOWAS',
        status: isMember ? 'member' : 'under_review',
        sourceKey: 'ecowas',
        evidenceArtifactId: ecowasArtifact.id,
        confidence: ecowasMentioned.has(entityKey) ? 'high' : 'low',
        lastReviewedAt: reviewedAt,
        notes: isMember
          ? 'Named on ECOWAS evidence page'
          : 'ECOWAS membership not confirmed from page parse',
      });
      processed++;
    }

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, 'succeeded', processed, 0);
    console.log(`[verify:regional] ${processed} policy rows upserted`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, 1, msg);
    throw err;
  }
}
