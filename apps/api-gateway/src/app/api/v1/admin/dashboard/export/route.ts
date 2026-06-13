// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard Export API
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

    const [sourcesResult, jobsResult, reportsResult] = await Promise.all([
      supabase
        .from('souvera_data_sources')
        .select('source_key, label, category, last_updated_at')
        .order('label'),
      
      supabase
        .from('souvera_ingestion_jobs')
        .select('id, source_key, status, created_at, completed_at, error')
        .order('created_at', { ascending: false })
        .limit(100),
      
      supabase
        .from('souvera_report_requests')
        .select('id, country_code, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    const csvRows = [];
    
    csvRows.push('Section,Type,Name,Status,Last Updated,Details');

    if (sourcesResult.data) {
      for (const source of sourcesResult.data) {
        csvRows.push([
          'Data Sources',
          source.category || 'N/A',
          source.label,
          source.last_updated_at ? 'Active' : 'Inactive',
          source.last_updated_at || 'Never',
          source.source_key,
        ].map(escapeCSV).join(','));
      }
    }

    if (jobsResult.data) {
      for (const job of jobsResult.data) {
        csvRows.push([
          'Ingestion Jobs',
          'Job',
          job.source_key,
          job.status,
          job.completed_at || job.created_at,
          job.error || '',
        ].map(escapeCSV).join(','));
      }
    }

    if (reportsResult.data) {
      for (const report of reportsResult.data) {
        csvRows.push([
          'Reports',
          'Country Report',
          report.country_code,
          report.status,
          report.created_at,
          report.id,
        ].map(escapeCSV).join(','));
      }
    }

    const csv = csvRows.join('\n');
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="souvera-dashboard-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[AdminDashboard] Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export dashboard data' },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
