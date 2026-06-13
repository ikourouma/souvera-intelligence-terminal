/**
 * GET  /api/v1/admin/reports — usage stats
 * POST /api/v1/admin/reports/reset — reset quota / history / storage (platform admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminAccess,
  verifyPlatformAdminAccess,
  getServiceClient,
} from '@/lib/admin/verify-admin';
import {
  getReportAdminStats,
  resetReports,
  resetReportsForEmail,
} from '@/lib/reports/reset-reports';
import { writeAuditLog } from '@/lib/admin/audit-log';

export async function GET() {
  try {
    const { isAdmin, error } = await verifyAdminAccess();
    if (!isAdmin) return NextResponse.json({ error }, { status: 403 });

    const supabase = getServiceClient();
    const stats = await getReportAdminStats(supabase);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error('[admin/reports GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isPlatformAdmin, userId: adminUserId, error } = await verifyPlatformAdminAccess();
    if (!isPlatformAdmin) return NextResponse.json({ error }, { status: 403 });

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      allUsers?: boolean;
      period?: string;
      usageOnly?: boolean;
      keepStorage?: boolean;
      keepHistory?: boolean;
      confirm?: string;
    };

    if (body.confirm !== 'RESET_REPORTS') {
      return NextResponse.json(
        { error: 'Confirmation required. Send confirm: "RESET_REPORTS"' },
        { status: 400 }
      );
    }

    if (!body.email && !body.allUsers) {
      return NextResponse.json({ error: 'email or allUsers required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const options = {
      period: body.period,
      resetUsage: true,
      deleteRequests: !body.usageOnly && !body.keepHistory,
      deleteStorage: !body.usageOnly && !body.keepStorage,
      dryRun: false,
    };

    const result = body.allUsers
      ? await resetReports(supabase, options)
      : await resetReportsForEmail(supabase, body.email!, options);

    if (result.errors.length) {
      return NextResponse.json({ error: result.errors.join('; '), result }, { status: 500 });
    }

    await writeAuditLog({
      actorId: adminUserId,
      action: 'reports.reset',
      resourceType: 'reports',
      resourceId: body.allUsers ? 'all_users' : body.email!,
      metadata: result,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error('[admin/reports POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
