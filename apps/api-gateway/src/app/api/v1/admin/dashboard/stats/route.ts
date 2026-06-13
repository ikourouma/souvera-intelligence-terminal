// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard Stats API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = await createServerClient();

    const [
      sourcesResult,
      uploadsResult,
      usersResult,
      reportsResult,
      ingestionResult,
    ] = await Promise.all([
      supabase
        .from('souvera_data_sources')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('souvera_ingestion_jobs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('souvera_profiles')
        .select('id', { count: 'exact', head: true })
        .not('plan_id', 'is', null),
      
      supabase
        .from('souvera_report_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      supabase
        .from('souvera_ingestion_jobs')
        .select('completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    const stats = {
      totalSources: sourcesResult.count || 0,
      recentUploads: uploadsResult.count || 0,
      activeUsers: usersResult.count || 0,
      pendingReports: reportsResult.count || 0,
      lastIngestionTime: ingestionResult.data?.completed_at || null,
      systemErrors: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[AdminDashboard] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
