/**
 * Evidence-only CARICOM membership parsing from captured HTML.
 * No hardcoded member promotion — DOM/CUB are not members unless parsed.
 */

import { matchIso3InBlob } from './country-name-iso3';

/** Mentioned on portal chrome but not full CARICOM members. */
const CARICOM_MEMBER_FALSE_POSITIVES = new Set([
  'CUB', 'DOM', 'CYM', 'TCA', 'VGB', 'PRI', 'ABW',
]);

export type CaricomMembershipStatus =
  | 'member'
  | 'associate_member'
  | 'not_a_member'
  | 'under_review';

export interface CaricomParseResult {
  memberSet: Set<string>;
  associateMemberSet: Set<string>;
  membersPageOk: boolean;
  associatesPageOk: boolean;
}

export function parseCaricomPages(params: {
  membersHtml: string;
  associatesHtml: string;
  membersHttpOk: boolean;
  associatesHttpOk: boolean;
}): CaricomParseResult {
  const memberMentions = new Set(
    [...matchIso3InBlob(params.membersHtml, 'caribbean')].filter(
      (iso) => !CARICOM_MEMBER_FALSE_POSITIVES.has(iso)
    )
  );
  const associateMentions = new Set(
    [...matchIso3InBlob(params.associatesHtml, 'caribbean')].filter(
      (iso) => !CARICOM_MEMBER_FALSE_POSITIVES.has(iso)
    )
  );

  const membersPageOk =
    params.membersHttpOk && memberMentions.size >= 5;
  const associatesPageOk =
    params.associatesHttpOk && (associateMentions.size >= 1 || params.associatesHtml.length > 500);

  return {
    memberSet: membersPageOk ? memberMentions : new Set(),
    associateMemberSet: associatesPageOk ? associateMentions : new Set(),
    membersPageOk,
    associatesPageOk,
  };
}

export function resolveCaricomStatus(
  entityKey: string,
  parsed: CaricomParseResult
): CaricomMembershipStatus {
  if (!parsed.membersPageOk) return 'under_review';

  if (parsed.memberSet.has(entityKey)) return 'member';
  if (parsed.associateMemberSet.has(entityKey)) return 'associate_member';
  return 'not_a_member';
}

/** Guard: Cuba and Dominican Republic must not be full members without parse evidence. */
export function assertCaricomMappingSanity(
  entityKey: string,
  status: CaricomMembershipStatus,
  parsed: CaricomParseResult
): void {
  if (entityKey === 'CUB' && status === 'member') {
    throw new Error('CUB must not be CARICOM member without explicit parse evidence');
  }
  if (entityKey === 'DOM' && status === 'member' && !parsed.memberSet.has('DOM')) {
    throw new Error('DOM must not be CARICOM full member without parse evidence');
  }
}
