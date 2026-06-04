/**
 * Process a queued report request: fetch country data, render PDF, upload to storage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fetchCountryProfileReportData } from './country-profile-data';
import { generateCountryProfileFullV2 } from './generate-country-profile-v2';
import { renderReportPdfBytes } from './render-report';
import { ensureReportsBucket } from './ensure-reports-bucket';
import { logReportGeneration } from './reports-v2-api';
import type { ReportTemplateVersion, ReportsV2RequestOptions } from './reports-v2-config';
import { generateSectorDeepDiveV2 } from './generate-sector-deep-dive-v2';
import { isCountryProfileReport, isSectorDeepDiveReport } from './reports-v2-config';
import type { PreflightReport } from '@/types/report-integrity';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface ReportProcessOptions extends ReportsV2RequestOptions {
  correlationId?: string;
}

export type ReportProcessResult =
  | {
      status: 'completed';
      downloadUrl: string;
      templateVersion: ReportTemplateVersion;
      pdfBytes: Uint8Array;
      preflight?: PreflightReport;
    }
  | {
      status: 'preflight_failed';
      preflight: PreflightReport;
      iso3: string;
      generatedAt: string;
      templateVersion: 'v2';
    }
  | {
      status: 'failed';
      errorMessage: string;
      templateVersion: ReportTemplateVersion;
    };

export async function processReportRequest(
  requestId: string,
  options: ReportProcessOptions = {}
): Promise<ReportProcessResult> {
  const templateVersion = options.templateVersion ?? 'v1';
  const strict = options.strict !== false;
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

  if (request.status === 'completed' && request.download_url) {
    return {
      status: 'completed',
      downloadUrl: request.download_url,
      templateVersion,
      pdfBytes: new Uint8Array(0),
    };
  }

  await supabase
    .from('souvera_report_requests')
    .update({ status: 'processing' })
    .eq('id', requestId);

  const generatedAt = new Date().toISOString();
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

    const renderStart = Date.now();
    let pdfBytes: Uint8Array;
    let preflight: PreflightReport | undefined;

    const reportType = request.report_type as string;
    const metadata = (request.metadata as Record<string, string> | null) ?? {};
    const sectorKey =
      metadata.sectorKey ??
      (request.sector_key as string | null | undefined) ??
      undefined;

    const useCountryV2 = templateVersion === 'v2' && isCountryProfileReport(reportType);

    if (isSectorDeepDiveReport(reportType)) {
      if (!sectorKey) {
        throw new Error('sectorKey missing on Sector Deep-Dive request (metadata.sectorKey)');
      }
      pdfBytes = await generateSectorDeepDiveV2(iso3, sectorKey);
    } else if (useCountryV2) {
      const payload = await fetchCountryProfileReportData(iso3);
      if (summary) payload.summary = summary;
      if (opportunityThesis) payload.opportunityThesis = opportunityThesis;
      if (riskNarrative) payload.riskNarrative = riskNarrative;

      const v2Result = await generateCountryProfileFullV2(payload, {
        strict,
        proofLayout: options.proofLayout,
      });

      preflight = v2Result.preflight;

      if (!v2Result.ok) {
        logReportGeneration({
          correlationId,
          iso3,
          templateVersion: 'v2',
          strict,
          preflightErrors: v2Result.preflight.errors.length,
          preflightWarnings: v2Result.preflight.warnings.length,
          outcome: 'preflight_failed',
        });

        await supabase
          .from('souvera_report_requests')
          .update({
            status: 'failed',
            error_message: 'PREFLIGHT_FAILED',
            completed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        return {
          status: 'preflight_failed',
          preflight: v2Result.preflight,
          iso3,
          generatedAt,
          templateVersion: 'v2',
        };
      }

      pdfBytes = v2Result.pdf;
    } else {
      pdfBytes = await renderReportPdfBytes({
        countryName: country?.name ?? iso3,
        iso3,
        reportType,
        generatedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        summary,
        opportunityThesis,
        riskNarrative,
        query: request.query_text ?? undefined,
      });
    }

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

    await supabase
      .from('souvera_report_requests')
      .update({
        status: 'completed',
        file_path: storagePath,
        download_url: signed.signedUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    logReportGeneration({
      correlationId,
      iso3,
      templateVersion,
      strict,
      preflightErrors: preflight?.errors.length ?? 0,
      preflightWarnings: preflight?.warnings.length ?? 0,
      renderMs,
      pdfBytes: pdfBytes.length,
      outcome: templateVersion === 'v2' ? 'pdf' : 'v1_json',
    });

    return {
      status: 'completed',
      downloadUrl: signed.signedUrl,
      templateVersion,
      pdfBytes,
      preflight,
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
      templateVersion,
      strict,
      preflightErrors: 0,
      preflightWarnings: 0,
      outcome: 'failed',
    });

    return { status: 'failed', errorMessage: message, templateVersion };
  }
}

export { getServiceClient };
