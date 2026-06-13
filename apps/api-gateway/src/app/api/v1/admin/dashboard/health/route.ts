// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard Health Check API
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

    const checks = {
      database: false,
      api: false,
      storage: false,
    };

    try {
      const { error: dbError } = await supabase
        .from('souvera_data_sources')
        .select('id')
        .limit(1)
        .single();
      
      checks.database = !dbError || dbError.code === 'PGRST116';
    } catch {
      checks.database = false;
    }

    checks.api = true;

    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      checks.storage = !storageError;
    } catch {
      checks.storage = false;
    }

    const allHealthy = checks.database && checks.api && checks.storage;
    const anyUnhealthy = !checks.database || !checks.api || !checks.storage;

    return NextResponse.json({
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'warning' : 'error',
      message: allHealthy
        ? 'All systems operational'
        : anyUnhealthy
        ? 'Some systems degraded'
        : 'System error detected',
      checks,
    });
  } catch (error) {
    console.error('[AdminDashboard] Error checking system health:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      checks: {
        database: false,
        api: false,
        storage: false,
      },
    });
  }
}
