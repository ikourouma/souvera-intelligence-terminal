// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin User Status API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, isSuperAdmin, userId: adminId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { error } = await supabase
      .from('souvera_profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('[AdminUserStatus] Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      );
    }

    try {
      await supabase.from('souvera_matrix_audit_log').insert({
        admin_id: adminId,
        admin_email: '',
        persona: 'user',
        entitlement_key: 'status',
        old_value: null,
        new_value: { status },
        change_type: status === 'suspended' ? 'disable' : 'enable',
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminUserStatus] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
