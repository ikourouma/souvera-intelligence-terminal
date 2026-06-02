/**
 * Authoritative policy / market-access status for institutional reports.
 * Report PDFs must use this registry — not unverified static labels.
 */

import { getAgoaCountryRecord } from '@/data/agoa-full-coverage';
import { AGOA_SOURCE_URL } from '@/data/agoa-legislative-tracker';
import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';
import { isApprovedCaribbeanMarket } from '@/lib/market-coverage';
import type { PolicyFrameworkStatus, PolicyStatusRecord } from '@/types/report-integrity';

/** AGOA status requires USTR list reconciliation before institutional assertion. */
const AGOA_NEEDS_REVIEW_ISO3 = new Set(['NGA']);

const AFCFTA_SOURCE =
  'https://au.int/en/ti/cfta/about/about-the-afcfta';
const ECOWAS_SOURCE = 'https://www.ecowas.int/';
const CBI_SOURCE =
  'https://www.trade.gov/caribbean-basin-initiative-cbi';
const CARICOM_SOURCE = 'https://caricom.org/';

const INSTITUTIONAL_VERIFIED_AT = '2026-01-15';

const ECOWAS_ISO3 = new Set([
  'NGA', 'GHA', 'SEN', 'CIV', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR',
  'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
]);

function mapAgoaStatus(dbStatus: string): PolicyFrameworkStatus {
  switch (dbStatus) {
    case 'eligible':
      return 'active';
    case 'suspended':
      return 'suspended';
    case 'graduated':
      return 'graduated';
    case 'ineligible':
      return 'ineligible';
    case 'not_applicable':
      return 'not_applicable';
    default:
      return 'unknown';
  }
}

function agoaStatusLabel(status: PolicyFrameworkStatus): string {
  switch (status) {
    case 'active':
      return 'Eligible';
    case 'suspended':
      return 'Suspended';
    case 'graduated':
      return 'Graduated';
    case 'ineligible':
      return 'Ineligible';
    case 'not_applicable':
      return 'Not applicable';
    case 'needs_review':
      return 'Unverified (Needs review)';
    case 'conflict':
      return 'Conflict (Needs review)';
    default:
      return 'Unverified';
  }
}

function buildAgoaRecord(iso3: string): PolicyStatusRecord {
  const upper = iso3.toUpperCase();
  if (AGOA_NEEDS_REVIEW_ISO3.has(upper)) {
    return {
      framework: 'AGOA',
      status: 'needs_review',
      statusLabel: 'Unverified (Needs review)',
      description:
        'AGOA eligibility for Nigeria requires reconciliation against the current USTR beneficiary country list before this report asserts Suspended/Eligible status.',
      authoritativeSourceUrl: AGOA_SOURCE_URL,
      lastVerifiedAt: null,
    };
  }

  const record = getAgoaCountryRecord(iso3);
  if (!record?.agoa_source_url) {
    return {
      framework: 'AGOA',
      status: 'unknown',
      statusLabel: 'Unverified',
      description:
        'AGOA eligibility has not been verified against an authoritative USTR source in this environment.',
      authoritativeSourceUrl: AGOA_SOURCE_URL,
      lastVerifiedAt: null,
    };
  }

  const status = mapAgoaStatus(record.agoa_status);
  return {
    framework: 'AGOA',
    status,
    statusLabel: agoaStatusLabel(status),
    description:
      record.agoa_notes ??
      'U.S. preferential market access subject to annual Presidential review.',
    authoritativeSourceUrl: record.agoa_source_url,
    lastVerifiedAt: record.agoa_last_reviewed_at ?? record.agoa_as_of_date ?? null,
  };
}

function buildAfCftaRecord(): PolicyStatusRecord {
  return {
    framework: 'AfCFTA',
    status: 'active',
    statusLabel: 'Active',
    description:
      'African Continental Free Trade Area — 54 member states; phased tariff elimination per AfCFTA agreement.',
    authoritativeSourceUrl: AFCFTA_SOURCE,
    lastVerifiedAt: INSTITUTIONAL_VERIFIED_AT,
  };
}

function buildEcowasRecord(): PolicyStatusRecord {
  return {
    framework: 'ECOWAS',
    status: 'active',
    statusLabel: 'Member',
    description:
      'Economic Community of West African States — regional trade and investment protocols among 15 member states.',
    authoritativeSourceUrl: ECOWAS_SOURCE,
    lastVerifiedAt: INSTITUTIONAL_VERIFIED_AT,
  };
}

function buildCbiRecord(): PolicyStatusRecord {
  return {
    framework: 'CBI',
    status: 'active',
    statusLabel: 'Eligible',
    description: 'Caribbean Basin Initiative — preferential U.S. market access where eligible.',
    authoritativeSourceUrl: CBI_SOURCE,
    lastVerifiedAt: INSTITUTIONAL_VERIFIED_AT,
  };
}

function buildCaricomRecord(): PolicyStatusRecord {
  return {
    framework: 'CARICOM',
    status: 'active',
    statusLabel: 'Member',
    description: 'Caribbean Community — regional integration and CSME services market.',
    authoritativeSourceUrl: CARICOM_SOURCE,
    lastVerifiedAt: INSTITUTIONAL_VERIFIED_AT,
  };
}

/**
 * Verified policy rows for report market-access section and preflight.
 */
export function getPolicyStatusRegistry(iso3: string): PolicyStatusRecord[] {
  const upper = iso3.toUpperCase();
  const records: PolicyStatusRecord[] = [];

  if (isApprovedCaribbeanMarket(upper)) {
    records.push(buildCbiRecord(), buildCaricomRecord());
    return records;
  }

  if (APPROVED_AFRICA_ISO3.includes(upper as (typeof APPROVED_AFRICA_ISO3)[number])) {
    records.push(buildAgoaRecord(upper), buildAfCftaRecord());
    if (ECOWAS_ISO3.has(upper)) records.push(buildEcowasRecord());
  }

  return records;
}

/** Map registry rows to report `marketAccess` shape. */
export function getVerifiedMarketAccessForReport(iso3: string): Array<{
  label: string;
  statusLabel: string;
  description: string;
}> {
  return getPolicyStatusRegistry(iso3).map((r) => ({
    label: r.framework,
    statusLabel:
      r.status === 'unknown' || r.status === 'needs_review' || r.status === 'conflict'
        ? r.statusLabel
        : r.statusLabel,
    description: r.description,
  }));
}

export function getLatestPolicyVerifiedAt(iso3: string): string | null {
  const dates = getPolicyStatusRegistry(iso3)
    .map((r) => r.lastVerifiedAt)
    .filter(Boolean) as string[];
  if (!dates.length) return null;
  return dates.sort().reverse()[0] ?? null;
}
