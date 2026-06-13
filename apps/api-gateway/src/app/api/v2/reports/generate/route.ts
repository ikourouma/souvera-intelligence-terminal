import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';
import { handleReportGenerate } from '@/lib/reports/report-generate-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * POST /api/v2/reports/generate
 *
 * Same flow as v1: new request row → template registry → JSON with downloadProxyUrl.
 * Raw inline PDF deprecated; use download proxy for correct filenames.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const access = await resolveUserAccess(supabase, user.id);
  const isAdmin = access.entitlements.includes('admin_access');

  return handleReportGenerate(request, user, access, isAdmin);
}
