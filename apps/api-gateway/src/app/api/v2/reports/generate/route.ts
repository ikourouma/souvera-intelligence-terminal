import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';
import { handleReportGenerate } from '@/lib/reports/report-generate-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * POST /api/v2/reports/generate
 *
 * Country Profile v2 — returns application/pdf on success, 422 JSON on preflight failure.
 * Requires REPORTS_V2_ENABLED=true.
 *
 * Body: { reportType: "Country Profile", iso3, query?, strict?, proofLayout? }
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

  return handleReportGenerate(request, user, access, isAdmin, {
    defaultTemplateVersion: 'v2',
    responseMode: 'pdf',
  });
}
