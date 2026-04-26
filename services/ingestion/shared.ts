// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Ingestion Shared Utilities
// Owner: Afronovation, Inc.
// ===========================================

import { getSupabaseServiceClient } from '@souvera/config';

/**
 * Create a new ingestion job record.
 * Must be called at the start of every ingestion run.
 */
export async function createIngestionJob(
  sourceKey: string,
  jobType: string
): Promise<{ jobId: string; sourceId: string }> {
  const supabase = getSupabaseServiceClient();

  // Resolve source ID
  const { data: source, error: sourceError } = await supabase
    .from('souvera_data_sources')
    .select('id')
    .eq('key', sourceKey)
    .single();

  if (sourceError || !source) {
    throw new Error(`Source not found: ${sourceKey} — ${sourceError?.message}`);
  }

  // Create job
  const { data: job, error: jobError } = await supabase
    .from('souvera_ingestion_jobs')
    .insert({
      source_id: source.id,
      job_type: jobType,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (jobError || !job) {
    throw new Error(`Failed to create ingestion job: ${jobError?.message}`);
  }

  console.log(`[INGESTION] Job created: ${job.id} (source: ${sourceKey}, type: ${jobType})`);
  return { jobId: job.id, sourceId: source.id };
}

/**
 * Close an ingestion job with final status and counts.
 */
export async function closeIngestionJob(
  jobId: string,
  status: 'succeeded' | 'failed' | 'partial',
  recordsProcessed: number,
  recordsFailed: number,
  errorMessage?: string
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from('souvera_ingestion_jobs')
    .update({
      status,
      records_processed: recordsProcessed,
      records_failed: recordsFailed,
      finished_at: new Date().toISOString(),
      error_message: errorMessage ?? null,
    })
    .eq('id', jobId);

  if (error) {
    console.error(`[INGESTION] Failed to close job ${jobId}: ${error.message}`);
  } else {
    console.log(
      `[INGESTION] Job ${jobId} closed: ${status} (processed: ${recordsProcessed}, failed: ${recordsFailed})`
    );
  }
}

/**
 * Archive the raw response payload from a data provider.
 */
export async function archivePayload(
  sourceId: string,
  endpoint: string,
  requestParams: Record<string, unknown>,
  responsePayload: unknown,
  httpStatus: number
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  // Truncate large payloads to avoid storage bloat
  const payload =
    typeof responsePayload === 'string'
      ? responsePayload.substring(0, 500000)
      : responsePayload;

  const { error } = await supabase.from('souvera_source_payload_archive').insert({
    source_id: sourceId,
    endpoint,
    request_params: requestParams,
    response_payload: payload as Record<string, unknown>,
    http_status: httpStatus,
    fetched_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`[INGESTION] Failed to archive payload: ${error.message}`);
  }
}

/**
 * Update source health after an ingestion run.
 */
export async function updateSourceHealth(
  sourceId: string,
  success: boolean,
  latencyMs?: number
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  if (success) {
    const { error } = await supabase
      .from('souvera_source_health')
      .upsert(
        {
          source_id: sourceId,
          last_success_at: new Date().toISOString(),
          failure_count: 0,
          latency_ms: latencyMs ?? null,
          status: 'healthy',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'source_id' }
      );

    if (error) {
      console.error(`[INGESTION] Failed to update source health: ${error.message}`);
    }
  } else {
    // Increment failure count
    const { data: existing } = await supabase
      .from('souvera_source_health')
      .select('failure_count')
      .eq('source_id', sourceId)
      .single();

    const failureCount = (existing?.failure_count ?? 0) + 1;
    const status = failureCount >= 3 ? 'down' : 'degraded';

    const { error } = await supabase
      .from('souvera_source_health')
      .upsert(
        {
          source_id: sourceId,
          last_failure_at: new Date().toISOString(),
          failure_count: failureCount,
          latency_ms: latencyMs ?? null,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'source_id' }
      );

    if (error) {
      console.error(`[INGESTION] Failed to update source health: ${error.message}`);
    }
  }
}
