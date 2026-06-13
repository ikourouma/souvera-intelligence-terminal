import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/reports/process-report-request';
import { buildDownloadFilenameForRow } from '@/lib/reports/report-generate-handler';
import { buildContentDispositionAttachment } from '@/lib/reports/report-download';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/reports/download/[requestId]
 * Streams stored PDF with Content-Disposition (storage path unchanged).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const service = getServiceClient();
  const { data: row, error } = await service
    .from('souvera_report_requests')
    .select(
      'id, user_id, iso3, report_type, template_id, sector_key, file_path, status, report_filename, generated_at_utc, created_at'
    )
    .eq('id', requestId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (row.status !== 'completed' || !row.file_path) {
    return NextResponse.json({ error: 'Report not ready' }, { status: 409 });
  }

  const { data: country } = await service
    .from('souvera_countries')
    .select('name')
    .eq('iso3', row.iso3)
    .maybeSingle();

  const { data: blob, error: dlError } = await service.storage
    .from('reports')
    .download(row.file_path as string);

  if (dlError || !blob) {
    return NextResponse.json(
      { error: dlError?.message ?? 'Download failed' },
      { status: 500 }
    );
  }

  const filename = buildDownloadFilenameForRow({
    iso3: row.iso3 as string,
    template_id: row.template_id as string | null,
    report_type: row.report_type as string | null,
    sector_key: row.sector_key as string | null,
    report_filename: row.report_filename as string | null,
    generated_at_utc: row.generated_at_utc as string | null,
    created_at: row.created_at as string,
    country_name: country?.name as string | undefined,
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': buildContentDispositionAttachment(filename),
      'Cache-Control': 'private, no-store',
    },
  });
}
