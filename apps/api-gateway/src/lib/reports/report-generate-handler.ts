/**
 * Shared report generation handler — unified request + proxy download flow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { UserAccess } from '@souvera/entitlements';
import { hasEntitlement } from '@souvera/entitlements';
import {
  checkReportQuota,
  getReportQuotaStatus,
  quotaExceededResponse,
  recordReportUsage,
  formatReportQuotaSummary,
} from './quota';
import { processReportRequest } from './process-report-request';
import { assertCountryProfileTemplateAccess, isProofLayoutAllowed } from './reports-v2-config';
import { isCountryProfileV1RollbackEnabled } from './_archived/country-profile-v1';
import {
  isCountryProfileTemplate,
  isTemplateId,
  resolveTemplateId,
  resolveTemplateIdFromRequestRow,
  type TemplateId,
} from './template-registry';
import { validateSectorDeepDiveRequest } from '@/lib/sectors/sector-taxonomy';
import { buildPreflightFailedBody, resolveCorrelationId } from './reports-v2-api';
import {
  isReportGenerationPaused,
  REPORTS_PAUSED_USER_MESSAGE,
} from './report-generation-availability';
import { formatReportDownloadFilename } from './format-report-download-filename';
import { buildReportDownloadProxyUrl } from './report-download';

const BUSINESS_REPORT_TYPES = new Set([
  'Investment Memo',
  'Trade Profile',
  'Sector Deep-Dive',
  'AI Custom Report',
]);

export type ReportGenerateResponseMode = 'json';

export interface ReportGenerateBody {
  templateId?: string;
  reportType?: string;
  iso3?: string;
  sectorKey?: string;
  query?: string;
  strict?: boolean;
  proofLayout?: boolean;
}

function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function validateEntitlements(
  access: UserAccess,
  reportType: string,
  isAdmin: boolean
): NextResponse | null {
  const isBusinessReport = BUSINESS_REPORT_TYPES.has(reportType);

  if (isBusinessReport) {
    if (!hasEntitlement(access, 'investment_thesis') && !isAdmin) {
      return NextResponse.json(
        { error: 'Business+ subscription required for this report type' },
        { status: 403 }
      );
    }
  } else if (!hasEntitlement(access, 'full_macro') && !isAdmin) {
    return NextResponse.json(
      { error: 'Professional+ subscription required for Country Profile reports' },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Each Generate call inserts a new request row (new UUID → new storage path → fresh render).
 */
export async function handleReportGenerate(
  request: NextRequest,
  user: User,
  access: UserAccess,
  isAdmin: boolean
): Promise<NextResponse> {
  const correlationId = resolveCorrelationId(request);

  if (isReportGenerationPaused()) {
    return NextResponse.json(
      {
        error: 'REPORTS_PAUSED',
        message: REPORTS_PAUSED_USER_MESSAGE,
        status: 'paused',
      },
      { status: 503, headers: { 'X-Request-Id': correlationId } }
    );
  }

  const body = (await request.json().catch(() => ({}))) as ReportGenerateBody;
  const {
    templateId: templateIdRaw,
    reportType: reportTypeRaw,
    iso3,
    sectorKey,
    query,
    strict: strictRaw,
    proofLayout: proofLayoutRaw,
  } = body;

  const resolved = resolveTemplateId({
    templateId: templateIdRaw,
    reportType: reportTypeRaw,
  });
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { templateId, reportType } = resolved;

  if (!iso3) {
    return NextResponse.json({ error: 'iso3 is required' }, { status: 400 });
  }

  const sectorValidation = validateSectorDeepDiveRequest(reportType, sectorKey);
  if (!sectorValidation.ok) {
    return NextResponse.json({ error: sectorValidation.error }, { status: sectorValidation.status });
  }
  const resolvedSectorKey =
    templateId === 'sector_deep_dive_template' ? sectorValidation.sectorKey : undefined;

  const strict = strictRaw !== false;
  const proofLayout = proofLayoutRaw === true;

  if (proofLayout && !isProofLayoutAllowed()) {
    return NextResponse.json(
      { error: 'proofLayout is not allowed in this environment' },
      { status: 403 }
    );
  }

  if (isCountryProfileTemplate(templateId) && !isCountryProfileV1RollbackEnabled()) {
    const profileAccess = assertCountryProfileTemplateAccess(user.id);
    if (!profileAccess.allowed) {
      return NextResponse.json({ error: profileAccess.message }, { status: 403 });
    }
  }

  const entitlementError = validateEntitlements(access, reportType, isAdmin);
  if (entitlementError) return entitlementError;

  const { createServerClient } = await import('@/lib/supabase/server');
  const quotaClient = getServiceClient();
  const serverClient = await createServerClient();
  const supabaseForQuota = quotaClient ?? serverClient;

  const quotaCheck = await checkReportQuota(supabaseForQuota, access, reportType, isAdmin);
  if (!quotaCheck.allowed) {
    return NextResponse.json(quotaExceededResponse(quotaCheck), { status: 429 });
  }

  const iso3Upper = iso3.toUpperCase();
  const service = getServiceClient();

  if (!service) {
    return NextResponse.json(
      { error: 'Report generation service unavailable' },
      { status: 503 }
    );
  }

  const { data: country } = await service
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  const metadata: Record<string, string> = { templateId };
  if (resolvedSectorKey) metadata.sectorKey = resolvedSectorKey;

  const insertBase = {
    user_id: user.id,
    country_id: country?.id ?? null,
    iso3: iso3Upper,
    report_type: reportType,
    query_text: query ?? null,
    sector_key: resolvedSectorKey ?? null,
    metadata,
    status: 'queued' as const,
  };

  let row: { id: string } | null = null;
  let insertError: { message: string } | null = null;

  const withTemplateCols = await service
    .from('souvera_report_requests')
    .insert({ ...insertBase, template_id: templateId })
    .select('id')
    .single();

  if (withTemplateCols.error?.message?.includes('template_id')) {
    const legacy = await service
      .from('souvera_report_requests')
      .insert(insertBase)
      .select('id')
      .single();
    row = legacy.data;
    insertError = legacy.error;
  } else {
    row = withTemplateCols.data;
    insertError = withTemplateCols.error;
  }

  if (insertError || !row) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Failed to queue report' },
      { status: 500 }
    );
  }

  const requestId = row.id as string;

  const result = await processReportRequest(requestId, {
    templateId,
    strict,
    proofLayout,
    correlationId,
    allowCachedCompleted: false,
  });

  if (result.status === 'preflight_failed') {
    return NextResponse.json(
      buildPreflightFailedBody(result.preflight, result.generatedAt),
      { status: 422, headers: { 'X-Request-Id': correlationId } }
    );
  }

  if (result.status === 'failed') {
    const quota = await getReportQuotaStatus(supabaseForQuota, access, isAdmin);
    return NextResponse.json(
      {
        status: 'failed',
        requestId,
        error: result.errorMessage,
        message: `${reportType} could not be generated: ${result.errorMessage}`,
        reportType,
        templateId,
        iso3: iso3Upper,
        quota,
      },
      { status: 500, headers: { 'X-Request-Id': correlationId } }
    );
  }

  await recordReportUsage(service, user.id, reportType);

  const quota = await getReportQuotaStatus(supabaseForQuota, access, isAdmin);
  const quotaSummary = formatReportQuotaSummary(quota, reportType);

  const preflightApi = result.preflight
    ? {
        passed: result.preflight.passed,
        warnings: result.preflight.warnings,
        errors: result.preflight.errors,
        macroAsOf: result.preflight.canonical.asOf.macroYear,
      }
    : undefined;

  return NextResponse.json(
    {
      status: 'completed',
      requestId,
      downloadUrl: result.downloadUrl,
      downloadProxyUrl: result.downloadProxyUrl,
      downloadFilename: result.downloadFilename,
      templateId,
      generatorUsed: result.generatorUsed,
      message: `${reportType} for ${iso3Upper} is ready. Download from Report History below.${quotaSummary ? ` ${quotaSummary}` : ''}`,
      reportType,
      iso3: iso3Upper,
      query: query ?? null,
      preflight: preflightApi,
      quota,
    },
    {
      status: 200,
      headers: {
        'X-Request-Id': correlationId,
        'X-Souvera-Template-Id': templateId,
        'X-Souvera-Generator': result.generatorUsed,
        ...(result.preflight
          ? {
              'X-Souvera-Preflight-Warnings': String(result.preflight.warnings.length),
              'X-Souvera-Macro-As-Of': String(
                result.preflight.canonical.asOf.macroYear ?? 'unknown'
              ),
            }
          : {}),
      },
    }
  );
}

export function buildDownloadFilenameForRow(row: {
  iso3: string;
  template_id?: string | null;
  report_type?: string | null;
  sector_key?: string | null;
  report_filename?: string | null;
  created_at?: string;
  generated_at_utc?: string | null;
  country_name?: string;
}): string {
  if (row.report_filename) return row.report_filename;
  const templateId = resolveTemplateIdFromRequestRow(row);
  if (!isTemplateId(templateId)) {
    return `${row.iso3.toLowerCase()}_report.pdf`;
  }
  return formatReportDownloadFilename({
    countryName: row.country_name ?? row.iso3,
    iso3: row.iso3,
    templateId,
    sectorKey: row.sector_key ?? undefined,
    generatedAtUtc: row.generated_at_utc ?? row.created_at ?? new Date().toISOString(),
  });
}
