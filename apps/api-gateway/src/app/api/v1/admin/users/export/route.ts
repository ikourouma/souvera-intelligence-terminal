// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Users Export API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function POST() {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    const { data: users, error } = await supabase
      .from('souvera_profiles')
      .select('id, email, full_name, plan_id, status, last_active_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const csvRows = ['ID,Email,Full Name,Plan,Status,Last Active,Created At'];

    for (const user of users || []) {
      csvRows.push([
        user.id,
        escapeCSV(user.email),
        escapeCSV(user.full_name || ''),
        user.plan_id || 'public',
        user.status || 'active',
        user.last_active_at || '',
        user.created_at,
      ].join(','));
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[AdminUsersExport] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
