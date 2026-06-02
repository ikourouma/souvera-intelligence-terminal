/**
 * Shared report generation handler for v1 (JSON) and v2 (PDF) API routes.
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
import {
  assertReportsV2Access,
  isCountryProfileReport,
  parseTemplateVersion,
  type ReportTemplateVersion,
} from './reports-v2-config';
import { isProofLayoutAllowed } from './reports-v2-config';
import {
  buildPreflightFailedBody,
  buildV2PdfResponseHeaders,
  resolveCorrelationId,
} from './reports-v2-api';

const BUSINESS_REPORT_TYPES = new Set([
  'Investment Memo',
  'Trade Profile',
  'Sector Deep-Dive',
  'AI Custom Report',
]);

export type ReportGenerateResponseMode = 'json' | 'pdf';

export interface ReportGenerateBody {
  reportType?: string;
  iso3?: string;
  query?: string;
  templateVersion?: string;
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

export async function handleReportGenerate(
  request: NextRequest,
  user: User,
  access: UserAccess,
  isAdmin: boolean,
  options: {
    defaultTemplateVersion: ReportTemplateVersion;
    responseMode: ReportGenerateResponseMode;
  }
): Promise<NextResponse> {
  const correlationId = resolveCorrelationId(request);
  const body = (await request.json().catch(() => ({}))) as ReportGenerateBody;
  const {
    reportType,
    iso3,
    query,
    templateVersion: templateVersionRaw,
    strict: strictRaw,
    proofLayout: proofLayoutRaw,
  } = body;

  if (!reportType || !iso3) {
    return NextResponse.json({ error: 'reportType and iso3 are required' }, { status: 400 });
  }

  const templateVersion = parseTemplateVersion(
    templateVersionRaw,
    options.defaultTemplateVersion
  );
  const strict = strictRaw !== false;
  const proofLayout = proofLayoutRaw === true;

  if (proofLayout && !isProofLayoutAllowed()) {
    return NextResponse.json(
      { error: 'proofLayout is not allowed in this environment' },
      { status: 403 }
    );
  }

  if (templateVersion === 'v2' && !isCountryProfileReport(reportType)) {
    return NextResponse.json(
      { error: 'templateVersion v2 is only supported for Country Profile reports' },
      { status: 400 }
    );
  }

  const v2Access = assertReportsV2Access({ templateVersion }, user.id);
  if (!v2Access.allowed) {
    return NextResponse.json({ error: v2Access.message }, { status: 403 });
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
  const generatedAt = new Date().toISOString();
  const service = getServiceClient();

  if (!service) {
    return NextResponse.json(
      { error: 'Report generation service unavailable' },
      { status: 503 }
    );
  }

  const { data: country } = await service
    .from('souvera_countries')
    .select('id')
    .eq('iso3', iso3Upper)
    .maybeSingle();

  const { data: row, error: insertError } = await service
    .from('souvera_report_requests')
    .insert({
      user_id: user.id,
      country_id: country?.id ?? null,
      iso3: iso3Upper,
      report_type: reportType,
      query_text: query ?? null,
      status: 'queued',
    })
    .select('id')
    .single();

  if (insertError || !row) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Failed to queue report' },
      { status: 500 }
    );
  }

  const requestId = row.id as string;

  const result = await processReportRequest(requestId, {
    templateVersion,
    strict,
    proofLayout,
    correlationId,
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
        iso3: iso3Upper,
        templateVersion,
        quota,
      },
      { status: 500, headers: { 'X-Request-Id': correlationId } }
    );
  }

  await recordReportUsage(service, user.id, reportType);

  if (
    options.responseMode === 'pdf' &&
    templateVersion === 'v2' &&
    result.preflight
  ) {
    const headers = buildV2PdfResponseHeaders(result.preflight.canonical, result.preflight);
    headers['X-Request-Id'] = correlationId;
    return new NextResponse(Buffer.from(result.pdfBytes), { status: 200, headers });
  }

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
      message: `${reportType} for ${iso3Upper} is ready. Download from Report History below.${quotaSummary ? ` ${quotaSummary}` : ''}`,
      reportType,
      iso3: iso3Upper,
      query: query ?? null,
      templateVersion,
      preflight: preflightApi,
      quota,
    },
    {
      status: 200,
      headers: {
        'X-Request-Id': correlationId,
        'X-Souvera-Template-Version': templateVersion,
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
