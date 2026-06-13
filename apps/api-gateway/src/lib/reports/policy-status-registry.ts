/**
 * Policy / market-access status for institutional reports.
 * Primary: Evidence Vault (souvera_country_policy_status). Fallback: static under_review (no hardcoded suspension sets).
 */

import { APPROVED_AFRICA_ISO3, isApprovedCaribbeanMarket } from '@/lib/market-coverage';
import { formatReportStampDate } from './report-dates';
import { dbRowToPolicyRecord, fetchPolicyStatusFromDb, type DbPolicyRow } from './policy-status-db';
import type { PolicyFrameworkStatus, PolicyStatusRecord } from '@/types/report-integrity';

const ECOWAS_ISO3 = new Set([
  'NGA', 'GHA', 'SEN', 'CIV', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR',
  'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
]);

function underReviewRecord(framework: string, sourceKey: string, notes: string): PolicyStatusRecord {
  return {
    framework,
    status: 'needs_review',
    statusLabel: 'needs_review',
    clientStatusLabel: 'Under review',
    description: notes,
    authoritativeSourceUrl: null,
    lastVerifiedAt: null,
    sourceDisplayName: sourceKey,
    lastReviewedDisplay: null,
    evidenceArtifactId: null,
    publishable: false,
  };
}

/** Static fallback when Evidence Vault has no rows — never asserts Eligible/Suspended without artifacts. */
function buildStaticFallbackRegistry(iso3: string): PolicyStatusRecord[] {
  const upper = iso3.toUpperCase();
  const records: PolicyStatusRecord[] = [];

  if (isApprovedCaribbeanMarket(upper)) {
    records.push(
      underReviewRecord('CBI', 'USTR', 'Run verify:ustr:cbi to populate Evidence Vault.'),
      underReviewRecord('CARICOM', 'CARICOM', 'Run verify:regional to populate Evidence Vault.')
    );
    return records;
  }

  if (APPROVED_AFRICA_ISO3.includes(upper as (typeof APPROVED_AFRICA_ISO3)[number])) {
    records.push(
      underReviewRecord('AGOA', 'USTR', 'Run verify:ustr:agoa to populate Evidence Vault.'),
      underReviewRecord('AfCFTA', 'AU', 'Run verify:regional to populate Evidence Vault.')
    );
    if (ECOWAS_ISO3.has(upper)) {
      records.push(
        underReviewRecord('ECOWAS', 'ECOWAS', 'Run verify:regional to populate Evidence Vault.')
      );
    }
  }

  return records;
}

let policyCache: Map<string, { at: number; rows: PolicyStatusRecord[] }> = new Map();
const CACHE_MS = 60_000;

export async function resolvePolicyStatusRegistry(iso3: string): Promise<PolicyStatusRecord[]> {
  const key = iso3.toUpperCase();
  const cached = policyCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rows;

  const dbRows = await fetchPolicyStatusFromDb(key);
  const rows = dbRows?.length ? dbRows : buildStaticFallbackRegistry(key);
  policyCache.set(key, { at: Date.now(), rows });
  return rows;
}

/** Sync read — uses cache populated by resolvePolicyStatusRegistry, else static fallback. */
export function getPolicyStatusRegistry(iso3: string): PolicyStatusRecord[] {
  const key = iso3.toUpperCase();
  const cached = policyCache.get(key);
  if (cached) return cached.rows;
  return buildStaticFallbackRegistry(key);
}

export function primePolicyStatusCache(iso3: string, rows: PolicyStatusRecord[]): void {
  policyCache.set(iso3.toUpperCase(), { at: Date.now(), rows });
}

/** All frameworks for client PDF — includes neutral "Under review" rows; never Verified/Unverified. */
export function getClientPolicyRecords(iso3: string): PolicyStatusRecord[] {
  return getPolicyStatusRegistry(iso3).filter(
    (r) => r.status !== 'conflict' && r.status !== 'unknown'
  );
}

export function getVerifiedMarketAccessForReport(iso3: string): Array<{
  label: string;
  statusLabel: string;
  description: string;
}> {
  return getClientPolicyRecords(iso3).map((r) => ({
    label: r.framework,
    statusLabel: r.clientStatusLabel ?? r.statusLabel,
    description: r.description,
  }));
}

export async function getVerifiedMarketAccessForReportAsync(iso3: string) {
  const rows = await resolvePolicyStatusRegistry(iso3);
  return rows
    .filter((r) => r.status !== 'conflict' && r.status !== 'unknown')
    .map((r) => ({
      label: r.framework,
      statusLabel: r.clientStatusLabel ?? r.statusLabel,
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

/** Test helper — simulate evidence-backed NGA AGOA row. */
export function policyRecordFromDbRow(row: DbPolicyRow): PolicyStatusRecord {
  return dbRowToPolicyRecord(row);
}
