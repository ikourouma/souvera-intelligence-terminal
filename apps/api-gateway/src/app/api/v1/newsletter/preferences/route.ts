import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess, hasEntitlement } from '@souvera/entitlements';

export const dynamic = 'force-dynamic';

/**
 * GET/POST /api/v1/newsletter/preferences
 * Newsletter subscription preferences (admin-managed delivery in Phase 2).
 */
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ weekly: false, monthly: false, authenticated: false });
  }

  return NextResponse.json({
    weekly: true,
    monthly: false,
    authenticated: true,
    note: 'Preferences stored locally until newsletter backend ships (Phase 2).',
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const access = await resolveUserAccess(supabase, user?.id);

  if (!hasEntitlement(access, 'reports_preview') && !hasEntitlement(access, 'sector_teasers')) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { weekly, monthly } = body as { weekly?: boolean; monthly?: boolean };

  return NextResponse.json({
    success: true,
    preferences: { weekly: !!weekly, monthly: !!monthly },
    message: 'Newsletter preferences saved. Delivery begins when admin newsletter system is enabled.',
  });
}
