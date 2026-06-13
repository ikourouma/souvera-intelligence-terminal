/**
 * Process a queued report request: fetch country data, render PDF, upload to storage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ensureReportsBucket } from './ensure-reports-bucket';
import { formatPreflightErrorsMessage, logReportGeneration } from './reports-v2-api';
import { formatReportDownloadFilename } from './format-report-download-filename';
import { buildReportDownloadProxyUrl } from './report-download';
import {
  generateReportFromTemplate,
  resolveTemplateIdFromRequestRow,
  type TemplateId,
} from './template-registry';
import type { PreflightReport } from '@/types/report-integrity';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface ReportProcessOptions {
  correlationId?: string;
  templateId?: TemplateId;
  strict?: boolean;
  proofLayout?: boolean;
  /**
   * When true, a row already marked completed returns cached signed URL (idempotent retry).
   * Default false — user-initiated flows always create a new request id and render fresh.
   */
  allowCachedCompleted?: boolean;
}

export type ReportProcessResult =
  | {
      status: 'completed';
      downloadUrl: string;
      downloadProxyUrl: string;
      downloadFilename: string;
      templateId: TemplateId;
      generatorUsed: string;
      pdfBytes: Uint8Array;
      preflight?: PreflightReport;
    }
  | {
      status: 'preflight_failed';
      preflight: PreflightReport;
      iso3: string;
      generatedAt: string;
      templateId: TemplateId;
    }
  | {
      status: 'failed';
      errorMessage: string;
      templateId: TemplateId;
    };

async function patchCompletedRow(
  supabase: SupabaseClient,
  requestId: string,
  patch: Record<string, unknown>
) {
  const { error } = await supabase
    .from('souvera_report_requests')
    .update(patch)
    .eq('id', requestId);
  if (error?.message?.match(/template_id|report_filename|generator_used|generated_at_utc/)) {
    const { template_id, report_filename, generator_used, generated_at_utc, ...legacy } = patch;
    await supabase.from('souvera_report_requests').update(legacy).eq('id', requestId);
  } else if (error) {
    throw new Error(`Failed to update report request: ${error.message}`);
  }
}

export async function processReportRequest(
  requestId: string,
  options: ReportProcessOptions = {}
): Promise<ReportProcessResult> {
  const strict = options.strict !== false;
  const allowCachedCompleted = options.allowCachedCompleted === true;
  const correlationId = options.correlationId ?? requestId;
  const supabase = getServiceClient();

  const { data: request, error: fetchError } = await supabase
    .from('souvera_report_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    throw new Error(fetchError?.message ?? 'Report request not found');
  }

  const templateId =
    options.templateId ?? resolveTemplateIdFromRequestRow(request);

  if (
    allowCachedCompleted &&
    request.status === 'completed' &&
    request.download_url &&
    request.file_path
  ) {
    const reportFilename =
      (request.report_filename as string) ??
      `${requestId}.pdf`;
    return {
      status: 'completed',
      downloadUrl: request.download_url,
      downloadProxyUrl: buildReportDownloadProxyUrl(requestId),
      downloadFilename: reportFilename,
      templateId,
      generatorUsed: (request.generator_used as string) ?? 'cached',
      pdfBytes: new Uint8Array(0),
    };
  }

  await supabase
    .from('souvera_report_requests')
    .update({ status: 'processing' })
    .eq('id', requestId);

  const generatedAtUtc = new Date();
  const generatedAtIso = generatedAtUtc.toISOString();
  const iso3 = (request.iso3 as string).toUpperCase();

  try {
    const { data: country } = await supabase
      .from('souvera_countries')
      .select('id, name, iso3')
      .eq('iso3', iso3)
      .maybeSingle();

    let summary: string | undefined;
    let opportunityThesis: string | undefined;
    let riskNarrative: string | undefined;

    if (country) {
      const { data: profile } = await supabase
        .from('souvera_country_profiles')
        .select('summary_md, opportunity_thesis_md, risk_narrative_md')
        .eq('country_id', country.id)
        .maybeSingle();

      summary = profile?.summary_md ?? undefined;
      opportunityThesis = profile?.opportunity_thesis_md ?? undefined;
      riskNarrative = profile?.risk_narrative_md ?? undefined;
    }

    const metadata = (request.metadata as Record<string, string> | null) ?? {};
    const sectorKey =
      metadata.sectorKey ??
      (request.sector_key as string | null | undefined) ??
      undefined;

    const reportFilename = formatReportDownloadFilename({
      countryName: country?.name ?? iso3,
      iso3,
      templateId,
      sectorKey,
      generatedAtUtc: generatedAtIso,
    });

    const renderStart = Date.now();
    const genResult = await generateReportFromTemplate(templateId, {
      iso3,
      sectorKey,
      query: request.query_text ?? undefined,
      summary,
      opportunityThesis,
      riskNarrative,
      countryName: country?.name ?? iso3,
      strict,
      proofLayout: options.proofLayout,
    });

    if (!genResult.ok) {
      logReportGeneration({
        correlationId,
        iso3,
        templateId,
        strict,
        preflightErrors: genResult.preflight.errors.length,
        preflightWarnings: genResult.preflight.warnings.length,
        outcome: 'preflight_failed',
      });

      const preflightDetail = formatPreflightErrorsMessage(genResult.preflight).slice(0, 480);

      await patchCompletedRow(supabase, requestId, {
        status: 'failed',
        error_message: preflightDetail,
        template_id: templateId,
        generator_used: genResult.generatorUsed,
        generated_at_utc: generatedAtIso,
        completed_at: generatedAtIso,
      });

      return {
        status: 'preflight_failed',
        preflight: genResult.preflight,
        iso3,
        generatedAt: generatedAtIso,
        templateId,
      };
    }

    const pdfBytes = genResult.pdf;
    const renderMs = Date.now() - renderStart;

    await ensureReportsBucket(supabase);

    const storagePath = `${request.user_id}/${requestId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('reports')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    if (signError || !signed?.signedUrl) {
      throw new Error(signError?.message ?? 'Failed to create download URL');
    }

    await patchCompletedRow(supabase, requestId, {
      status: 'completed',
      file_path: storagePath,
      download_url: signed.signedUrl,
      template_id: templateId,
      report_filename: reportFilename,
      generator_used: genResult.generatorUsed,
      generated_at_utc: generatedAtIso,
      completed_at: generatedAtIso,
    });

    logReportGeneration({
      correlationId,
      iso3,
      templateId,
      strict,
      preflightErrors: genResult.preflight?.errors.length ?? 0,
      preflightWarnings: genResult.preflight?.warnings.length ?? 0,
      renderMs,
      pdfBytes: pdfBytes.length,
      outcome: 'pdf',
    });

    return {
      status: 'completed',
      downloadUrl: signed.signedUrl,
      downloadProxyUrl: buildReportDownloadProxyUrl(requestId),
      downloadFilename: reportFilename,
      templateId,
      generatorUsed: genResult.generatorUsed,
      pdfBytes,
      preflight: genResult.preflight,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF generation failed';
    await supabase
      .from('souvera_report_requests')
      .update({ status: 'failed', error_message: message })
      .eq('id', requestId);

    logReportGeneration({
      correlationId,
      iso3,
      templateId,
      strict,
      preflightErrors: 0,
      preflightWarnings: 0,
      outcome: 'failed',
    });

    return { status: 'failed', errorMessage: message, templateId };
  }
}

export { getServiceClient };
