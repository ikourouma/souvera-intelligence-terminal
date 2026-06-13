// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard Alerts API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';

export async function GET() {
  const { isAdmin } = await verifyAdminAccess();

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const alerts = [];

    const { data: failedJobs, error: jobsError } = await supabase
      .from('souvera_ingestion_jobs')
      .select('id, source_key, error, created_at')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (!jobsError && failedJobs) {
      for (const job of failedJobs) {
        alerts.push({
          id: `job-error-${job.id}`,
          type: 'error' as const,
          message: `Ingestion failed for ${job.source_key}: ${job.error || 'Unknown error'}`,
          timestamp: job.created_at,
        });
      }
    }

    const { data: staleSources, error: sourcesError } = await supabase
      .from('souvera_data_sources')
      .select('source_key, label, last_updated_at')
      .lt('last_updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('last_updated_at')
      .limit(5);

    if (!sourcesError && staleSources) {
      for (const source of staleSources) {
        alerts.push({
          id: `stale-${source.source_key}`,
          type: 'warning' as const,
          message: `Data source "${source.label}" hasn't been updated in over 30 days`,
          timestamp: source.last_updated_at || new Date().toISOString(),
        });
      }
    }

    const { data: pendingReports, error: reportsError } = await supabase
      .from('souvera_report_requests')
      .select('id, created_at', { count: 'exact' })
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!reportsError && pendingReports && pendingReports.length > 10) {
      alerts.push({
        id: 'pending-reports-high',
        type: 'info' as const,
        message: `${pendingReports.length} report requests pending in the last 24 hours`,
        timestamp: new Date().toISOString(),
      });
    }

    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ alerts: alerts.slice(0, 10) });
  } catch (error) {
    console.error('[AdminDashboard] Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
