/**
 * Evidence-backed policy status from souvera_country_policy_status (Evidence Vault).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PolicyFrameworkStatus, PolicyStatusRecord } from '@/types/report-integrity';
import { formatReportStampDate } from './report-dates';

export interface DbPolicyRow {
  country_iso3: string;
  framework: string;
  status: string;
  status_effective_date: string | null;
  last_reviewed_at: string;
  source_key: string;
  evidence_artifact_id: string | null;
  confidence: string;
  notes: string | null;
  souvera_evidence_artifacts?: { status: string; url?: string } | null;
}

function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function mapPublishStatus(dbStatus: string, artifactOk: boolean): PolicyFrameworkStatus {
  if (!artifactOk || dbStatus === 'under_review') return 'needs_review';
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
    case 'member':
    case 'associate_member':
    case 'active':
      return 'active';
    case 'not_a_member':
      return 'not_applicable';
    default:
      return 'unknown';
  }
}

function clientLabel(status: PolicyFrameworkStatus, raw: string): string {
  if (status === 'needs_review') return 'Under review';
  switch (raw) {
    case 'associate_member':
      return 'Associate member';
    case 'not_a_member':
      return 'Not a member';
    case 'member':
      return 'Member';
    case 'active':
      return 'Active';
    case 'eligible':
      return 'Eligible';
    case 'suspended':
      return 'Suspended';
    case 'graduated':
      return 'Graduated';
    case 'ineligible':
      return 'Ineligible';
    case 'not_applicable':
      return 'Not applicable';
    case 'under_review':
      return 'Under review';
    default:
      break;
  }
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
    default:
      return 'Under review';
  }
}

function sourceDisplayName(sourceKey: string): string {
  const map: Record<string, string> = {
    ustr: 'USTR',
    ustr_cbi: 'USTR',
    au_afcfta: 'AU',
    ecowas: 'ECOWAS',
    caricom: 'CARICOM',
  };
  return map[sourceKey] ?? sourceKey;
}

export function dbRowToPolicyRecord(row: DbPolicyRow): PolicyStatusRecord {
  const artifactOk = row.souvera_evidence_artifacts?.status === 'ok' && !!row.evidence_artifact_id;
  const status = mapPublishStatus(row.status, artifactOk);
  const internalUrl = row.souvera_evidence_artifacts?.url ?? null;

  return {
    framework: row.framework,
    status,
    statusLabel: status === 'needs_review' ? 'needs_review' : clientLabel(status, row.status),
    clientStatusLabel: clientLabel(status, row.status),
    description: row.notes ?? `${row.framework} status from ${sourceDisplayName(row.source_key)} registry.`,
    authoritativeSourceUrl: internalUrl,
    lastVerifiedAt: row.last_reviewed_at,
    sourceDisplayName: sourceDisplayName(row.source_key),
    lastReviewedDisplay: row.status_effective_date
      ? String(row.status_effective_date).slice(0, 4) + ' list'
      : formatReportStampDate(row.last_reviewed_at),
    evidenceArtifactId: row.evidence_artifact_id,
    publishable: artifactOk && status !== 'needs_review' && status !== 'unknown',
  };
}

export async function fetchPolicyStatusFromDb(iso3: string): Promise<PolicyStatusRecord[] | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('souvera_country_policy_status')
    .select(
      `country_iso3, framework, status, status_effective_date, last_reviewed_at, source_key, evidence_artifact_id, confidence, notes,
       souvera_evidence_artifacts (status, url)`
    )
    .eq('country_iso3', iso3.toUpperCase());

  if (error || !data?.length) return null;
  return (data as DbPolicyRow[]).map(dbRowToPolicyRecord);
}

export async function hasEvidenceBackedPolicyDb(iso3: string): Promise<boolean> {
  const rows = await fetchPolicyStatusFromDb(iso3);
  return (rows?.length ?? 0) > 0;
}
