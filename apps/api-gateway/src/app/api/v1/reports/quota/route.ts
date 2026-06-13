import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';
import { getReportQuotaStatus } from '@/lib/reports/quota';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * GET /api/v1/reports/quota
 * Returns the authenticated user's monthly report quota usage and limits.
 */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const access = await resolveUserAccess(supabase, user.id);
  const isAdmin = access.entitlements.includes('admin_access');
  const quotaClient = getServiceClient() ?? supabase;

  const quota = await getReportQuotaStatus(quotaClient, access, isAdmin);

  return NextResponse.json({ quota });
}
