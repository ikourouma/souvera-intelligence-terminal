// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Notifications API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET() {
  const { isAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    const { data: notifications, error } = await supabase
      .from('souvera_admin_notifications')
      .select('*')
      .or(`recipient_id.eq.${userId},recipient_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[Notifications] Table may not exist yet:', error.message);
      const fallbackNotifications = await generateFallbackNotifications(supabase);
      return NextResponse.json({
        notifications: fallbackNotifications,
        unreadCount: fallbackNotifications.filter(n => !n.isRead).length,
      });
    }

    const formattedNotifications = (notifications || []).map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      severity: n.severity,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    const unreadCount = formattedNotifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

async function generateFallbackNotifications(supabase: ReturnType<typeof getServiceClient>) {
  const notifications = [];

  try {
    const { data: failedJobs } = await supabase
      .from('souvera_ingestion_jobs')
      .select('id, source_key, error, created_at')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (failedJobs) {
      for (const job of failedJobs) {
        notifications.push({
          id: `job-${job.id}`,
          type: 'data',
          title: 'Ingestion Failed',
          message: `Data ingestion failed for ${job.source_key}`,
          severity: 'critical',
          isRead: false,
          createdAt: job.created_at,
        });
      }
    }
  } catch {}

  try {
    const { data: staleSources } = await supabase
      .from('souvera_data_sources')
      .select('source_key, label, last_updated_at')
      .lt('last_updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('last_updated_at')
      .limit(3);

    if (staleSources) {
      for (const source of staleSources) {
        notifications.push({
          id: `stale-${source.source_key}`,
          type: 'data',
          title: 'Stale Data Source',
          message: `${source.label} hasn't been updated in over 30 days`,
          severity: 'warning',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch {}

  try {
    const { count: pendingCount } = await supabase
      .from('souvera_report_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingCount && pendingCount > 10) {
      notifications.push({
        id: 'pending-reports',
        type: 'system',
        title: 'High Report Queue',
        message: `${pendingCount} report requests pending`,
        severity: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  } catch {}

  return notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
