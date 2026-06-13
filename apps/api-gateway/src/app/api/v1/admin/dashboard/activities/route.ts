// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard Activities API
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

    const { data: ingestionJobs, error: ingestionError } = await supabase
      .from('souvera_ingestion_jobs')
      .select('id, source_key, status, created_at, completed_at, error')
      .order('created_at', { ascending: false })
      .limit(20);

    if (ingestionError) {
      throw ingestionError;
    }

    const { data: reportRequests, error: reportsError } = await supabase
      .from('souvera_report_requests')
      .select('id, country_code, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reportsError) {
      throw reportsError;
    }

    const activities = [];

    if (ingestionJobs) {
      for (const job of ingestionJobs) {
        if (job.status === 'completed') {
          activities.push({
            id: `ingestion-${job.id}`,
            type: 'success' as const,
            message: `Data ingestion completed for ${job.source_key}`,
            timestamp: job.completed_at || job.created_at,
          });
        } else if (job.status === 'failed') {
          activities.push({
            id: `ingestion-${job.id}`,
            type: 'error' as const,
            message: `Data ingestion failed for ${job.source_key}: ${job.error || 'Unknown error'}`,
            timestamp: job.created_at,
          });
        } else if (job.status === 'running') {
          activities.push({
            id: `ingestion-${job.id}`,
            type: 'ingestion' as const,
            message: `Data ingestion in progress for ${job.source_key}`,
            timestamp: job.created_at,
          });
        }
      }
    }

    if (reportRequests) {
      for (const report of reportRequests) {
        if (report.status === 'completed') {
          activities.push({
            id: `report-${report.id}`,
            type: 'success' as const,
            message: `Country report generated for ${report.country_code}`,
            timestamp: report.created_at,
          });
        } else if (report.status === 'pending') {
          activities.push({
            id: `report-${report.id}`,
            type: 'report' as const,
            message: `Country report requested for ${report.country_code}`,
            timestamp: report.created_at,
          });
        }
      }
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      activities: activities.slice(0, 50),
    });
  } catch (error) {
    console.error('[AdminDashboard] Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
