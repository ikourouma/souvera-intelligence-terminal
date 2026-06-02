import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';
import { handleReportGenerate } from '@/lib/reports/report-generate-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * POST /api/v1/reports/generate
 *
 * Default templateVersion: v1 (JSON response with downloadUrl).
 * Pass templateVersion: "v2" for Country Profile with preflight + JSON (or use /api/v2/reports/generate for raw PDF).
 *
 * Body: { reportType, iso3, query?, templateVersion?, strict?, proofLayout? }
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
    defaultTemplateVersion: 'v1',
    responseMode: 'json',
  });
}
