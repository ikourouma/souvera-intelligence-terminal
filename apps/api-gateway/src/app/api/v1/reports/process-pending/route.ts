import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { processReportRequest } from '@/lib/reports/process-report-request';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * POST /api/v1/reports/process-pending
 * Completes queued/processing report requests for the authenticated user.
 * Used to recover jobs interrupted when the serverless handler returned early.
 */
export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ error: 'Report service unavailable' }, { status: 503 });
  }

  const { data: pending, error } = await service
    .from('souvera_report_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['queued', 'processing'])
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('[reports/process-pending] fetch error:', error);
    return NextResponse.json({ error: 'Failed to load pending reports' }, { status: 500 });
  }

  const results: Array<{ id: string; status: string; downloadUrl?: string; errorMessage?: string }> = [];

  for (const row of pending ?? []) {
    const result = await processReportRequest(row.id);
    results.push({
      id: row.id,
      status: result.status,
      downloadUrl: result.downloadUrl,
      errorMessage: result.errorMessage,
    });
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
