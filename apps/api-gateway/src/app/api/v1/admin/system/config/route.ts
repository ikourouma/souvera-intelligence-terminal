// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin System Configuration API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET() {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    let databaseHealth: 'healthy' | 'degraded' | 'down' = 'healthy';
    try {
      const { error } = await supabase.from('souvera_profiles').select('id').limit(1);
      if (error) {
        databaseHealth = 'degraded';
      }
    } catch {
      databaseHealth = 'down';
    }

    const config = {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      nextVersion: '15.x',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      deploymentRegion: process.env.VERCEL_REGION || 'local',
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    };

    const health = {
      database: databaseHealth,
      api: 'healthy' as const,
      auth: databaseHealth === 'healthy' ? 'healthy' as const : 'degraded' as const,
    };

    return NextResponse.json({ config, health });
  } catch (error) {
    console.error('[AdminSystemConfig] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
