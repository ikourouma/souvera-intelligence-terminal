import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/reports/history?iso3=TTO
 * Returns the authenticated user's report requests, optionally filtered by iso3.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const iso3Param = request.nextUrl.searchParams.get('iso3');
  const iso3Upper = iso3Param?.toUpperCase();

  let query = supabase
    .from('souvera_report_requests')
    .select(
      'id, iso3, report_type, template_id, sector_key, status, query_text, file_path, download_url, report_filename, error_message, created_at, completed_at, generated_at_utc'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (iso3Upper) {
    query = query.eq('iso3', iso3Upper);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[/api/v1/reports/history] Error:', error);
    return NextResponse.json({ error: 'Failed to load report history' }, { status: 500 });
  }

  const requests = (data ?? []).map((row) => ({
    id: row.id,
    iso3: row.iso3,
    reportType: row.report_type,
    templateId: row.template_id,
    sectorKey: row.sector_key,
    status: row.status,
    query: row.query_text,
    storagePath: row.file_path,
    downloadUrl: row.download_url,
    downloadFilename: row.report_filename,
    downloadProxyUrl: row.file_path ? `/api/v1/reports/download/${row.id}` : null,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    generatedAtUtc: row.generated_at_utc,
  }));

  return NextResponse.json({ requests, iso3: iso3Upper ?? null });
}
