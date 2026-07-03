// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Audit Logs API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(request: NextRequest) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const actionFilter = searchParams.get('action');
    const tableFilter = searchParams.get('table');

    const supabase = getServiceClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('souvera_marketing_audit_log')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`record_id.ilike.%${search}%,changed_by.ilike.%${search}%`);
    }

    if (actionFilter && actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }

    if (tableFilter && tableFilter !== 'all') {
      query = query.eq('table_name', tableFilter);
    }

    const { data: logs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[AdminAuditLogs] Query error:', error);
      return NextResponse.json({
        logs: [],
        totalPages: 1,
        totalCount: 0,
        tables: [],
      });
    }

    const { data: tablesList } = await supabase
      .from('souvera_marketing_audit_log')
      .select('table_name')
      .order('table_name');

    const uniqueTables = [...new Set((tablesList || []).map(t => t.table_name))];

    const userIds = [...new Set((logs || []).map(l => l.changed_by).filter(Boolean))];
    let userEmails: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('souvera_profiles')
        .select('id, email')
        .in('id', userIds);

      if (profiles) {
        userEmails = Object.fromEntries(profiles.map(p => [p.id, p.email]));
      }
    }

    const logsWithEmails = (logs || []).map(log => ({
      ...log,
      user_email: log.changed_by ? userEmails[log.changed_by] : null,
    }));

    return NextResponse.json({
      logs: logsWithEmails,
      totalPages: Math.ceil((count || 0) / limit),
      totalCount: count || 0,
      tables: uniqueTables,
    });
  } catch (error) {
    console.error('[AdminAuditLogs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
