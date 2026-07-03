// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Mark All Notifications as Read API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function POST() {
  const { isAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    const { error } = await supabase
      .from('souvera_admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .or(`recipient_id.eq.${userId},recipient_id.is.null`)
      .eq('is_read', false);

    if (error) {
      console.warn('[Notifications] Mark all as read failed:', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
