// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Mark Notification as Read API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { error } = await supabase
      .from('souvera_admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .or(`recipient_id.eq.${userId},recipient_id.is.null`);

    if (error) {
      console.warn('[Notifications] Mark as read failed:', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
