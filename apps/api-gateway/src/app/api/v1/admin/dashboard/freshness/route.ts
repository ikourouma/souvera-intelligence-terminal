// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard Data Freshness API
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

    const { data: sources, error } = await supabase
      .from('souvera_data_sources')
      .select('source_key, label, last_updated_at')
      .order('label');

    if (error) {
      throw error;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sourcesWithStatus = sources?.map((source) => {
      let status: 'fresh' | 'stale' | 'missing' = 'missing';

      if (source.last_updated_at) {
        const lastUpdated = new Date(source.last_updated_at);
        if (lastUpdated > oneDayAgo) {
          status = 'fresh';
        } else if (lastUpdated > sevenDaysAgo) {
          status = 'stale';
        } else {
          status = 'missing';
        }
      }

      return {
        source_key: source.source_key,
        label: source.label,
        last_updated: source.last_updated_at,
        status,
      };
    }) || [];

    return NextResponse.json({ sources: sourcesWithStatus });
  } catch (error) {
    console.error('[AdminDashboard] Error fetching freshness:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data freshness' },
      { status: 500 }
    );
  }
}
