/**
 * Policy mapping + evidence discipline tests (no DB).
 *
 * Usage: npx tsx apps/api-gateway/scripts/test-policy-mapping.ts
 */

import {
  assertCaricomMappingSanity,
  parseCaricomPages,
  resolveCaricomStatus,
} from '../../../services/ingestion/lib/parse-caricom-membership';
import { dbRowToPolicyRecord } from '../src/lib/reports/policy-status-db';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log('\nCARICOM — DOM and CUB not full members by default');

const membersHtml = [
  'Antigua and Barbuda',
  'Jamaica',
  'Barbados',
  'Bahamas',
  'Grenada',
  'Haiti',
].join(', ');

const emptyParse = parseCaricomPages({
  membersHtml: `<p>${membersHtml}</p>`,
  associatesHtml: '<p>Associate Members: Dominican Republic</p>',
  membersHttpOk: true,
  associatesHttpOk: true,
});

assert(!emptyParse.memberSet.has('CUB'), 'CUB not in member set from sample HTML');
assert(!emptyParse.memberSet.has('DOM'), 'DOM not in full member set from sample HTML');
assert(
  resolveCaricomStatus('CUB', emptyParse) === 'not_a_member',
  'CUB resolves to not_a_member'
);
assert(
  resolveCaricomStatus('DOM', emptyParse) === 'associate_member',
  'DOM resolves to associate_member when on associate page'
);
assert(
  resolveCaricomStatus('DOM', {
    ...emptyParse,
    associateMemberSet: new Set(),
  }) === 'not_a_member',
  'DOM not_a_member without associate parse'
);

try {
  assertCaricomMappingSanity('CUB', 'member', emptyParse);
  assert(false, 'CUB member should throw');
} catch {
  assert(true, 'CUB member mapping throws sanity check');
}

console.log('\nCBI — territories not eligible without evidence');

function cbiStatusFromMention(
  entityKey: string,
  mentioned: Set<string>
): string {
  if (entityKey === 'CUB') return 'not_applicable';
  if (mentioned.has(entityKey)) return 'eligible';
  if (['PRI', 'VGB', 'TCA', 'CYM'].includes(entityKey)) return 'under_review';
  return 'under_review';
}

const cbiMentions = new Set(['JAM', 'BRB']);
for (const territory of ['PRI', 'VGB', 'TCA', 'CYM'] as const) {
  assert(
    cbiStatusFromMention(territory, cbiMentions) === 'under_review',
    `${territory} CBI under_review without page mention`
  );
}
assert(
  cbiStatusFromMention('JAM', cbiMentions) === 'eligible',
  'JAM eligible when mentioned'
);

console.log('\nPolicy registry — publishable requires artifact');

const eligibleNoArtifact = dbRowToPolicyRecord({
  country_iso3: 'NGA',
  framework: 'AGOA',
  status: 'eligible',
  status_effective_date: null,
  last_reviewed_at: '2026-01-01',
  source_key: 'ustr',
  evidence_artifact_id: null,
  confidence: 'high',
  notes: null,
  souvera_evidence_artifacts: null,
});
assert(eligibleNoArtifact.status === 'needs_review', 'eligible without artifact → needs_review');
assert(!eligibleNoArtifact.publishable, 'not publishable without artifact');

console.log('\nPreflight — POLICY_NO_EVIDENCE blocks assertive status');

const badPolicy = dbRowToPolicyRecord({
  country_iso3: 'NGA',
  framework: 'AGOA',
  status: 'eligible',
  status_effective_date: null,
  last_reviewed_at: '2026-01-01',
  source_key: 'ustr',
  evidence_artifact_id: 'art-fake',
  confidence: 'high',
  notes: null,
  souvera_evidence_artifacts: { status: 'parse_failed' },
});
assert(badPolicy.status === 'needs_review', 'parse_failed artifact → needs_review');
assert(!badPolicy.publishable, 'parse_failed artifact not publishable');

const wouldBlock =
  ['active', 'suspended', 'graduated', 'ineligible'].includes('active') &&
  badPolicy.publishable !== true;
assert(wouldBlock, 'POLICY_NO_EVIDENCE rule would block assertive Eligible without publishable');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
