// Evidence Vault — artifact capture + policy status upserts

import { createHash } from 'crypto';
import { getSupabaseServiceClient } from '@souvera/config';

export type ArtifactType = 'pdf' | 'html' | 'json' | 'csv';
export type ArtifactStatus = 'ok' | 'parse_failed';

export interface StoredArtifact {
  id: string;
  status: ArtifactStatus;
  checksum_sha256: string;
}

export function sha256Hex(buffer: Buffer | string): string {
  const data = typeof buffer === 'string' ? Buffer.from(buffer, 'utf8') : buffer;
  return createHash('sha256').update(data).digest('hex');
}

export async function storeEvidenceArtifact(params: {
  sourceKey: string;
  artifactType: ArtifactType;
  url: string;
  body: Buffer | string;
  effectiveDate?: string | null;
  notes?: string;
  status?: ArtifactStatus;
}): Promise<StoredArtifact> {
  const supabase = getSupabaseServiceClient();
  const checksum = sha256Hex(params.body);
  const preview =
    typeof params.body === 'string'
      ? params.body.slice(0, 4000)
      : `[binary ${params.body.length} bytes · sha256 ${checksum.slice(0, 16)}…]`;

  const { data, error } = await supabase
    .from('souvera_evidence_artifacts')
    .upsert(
      {
        source_key: params.sourceKey,
        artifact_type: params.artifactType,
        url: params.url,
        retrieved_at: new Date().toISOString(),
        checksum_sha256: checksum,
        effective_date: params.effectiveDate ?? null,
        notes: params.notes ?? null,
        status: params.status ?? 'ok',
        content_preview: preview,
      },
      { onConflict: 'source_key,url,checksum_sha256' }
    )
    .select('id, status, checksum_sha256')
    .single();

  if (error || !data) {
    throw new Error(`Failed to store evidence artifact: ${error?.message}`);
  }

  return {
    id: data.id as string,
    status: data.status as ArtifactStatus,
    checksum_sha256: data.checksum_sha256 as string,
  };
}

/** Definitive statuses require evidence_artifact_id + artifact parse_status=ok (checked on read). */
const DEFINITIVE_POLICY_STATUSES = new Set([
  'eligible',
  'suspended',
  'graduated',
  'ineligible',
  'not_applicable',
  'member',
  'associate_member',
  'not_a_member',
  'active',
]);

export async function upsertPolicyStatus(params: {
  /** Entity key (ISO3 for covered markets). */
  countryIso3: string;
  framework: 'AGOA' | 'CBI' | 'AfCFTA' | 'ECOWAS' | 'CARICOM';
  status: string;
  sourceKey: string;
  evidenceArtifactId: string | null;
  confidence: 'high' | 'med' | 'low';
  lastReviewedAt?: string;
  statusEffectiveDate?: string | null;
  notes?: string;
}): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const entityKey = params.countryIso3.toUpperCase();
  const wantsDefinitive = DEFINITIVE_POLICY_STATUSES.has(params.status);
  const storedStatus =
    params.status === 'under_review' ||
    !params.evidenceArtifactId ||
    !wantsDefinitive
      ? 'under_review'
      : params.status;

  const { error } = await supabase.from('souvera_country_policy_status').upsert(
    {
      country_iso3: entityKey,
      framework: params.framework,
      status: storedStatus,
      status_effective_date: params.statusEffectiveDate ?? null,
      last_reviewed_at: params.lastReviewedAt ?? new Date().toISOString(),
      source_key: params.sourceKey,
      evidence_artifact_id: params.evidenceArtifactId,
      confidence: params.confidence,
      notes: params.notes ?? null,
    },
    { onConflict: 'country_iso3,framework' }
  );

  if (error) {
    throw new Error(`Policy status upsert ${params.countryIso3}/${params.framework}: ${error.message}`);
  }
}

export async function markAllFrameworkUnderReview(
  iso3List: string[],
  framework: 'AGOA' | 'CBI' | 'AfCFTA' | 'ECOWAS' | 'CARICOM',
  sourceKey: string,
  notes: string
): Promise<void> {
  for (const iso3 of iso3List) {
    await upsertPolicyStatus({
      countryIso3: iso3,
      framework,
      status: 'under_review',
      sourceKey,
      evidenceArtifactId: null,
      confidence: 'low',
      notes,
    });
  }
}
