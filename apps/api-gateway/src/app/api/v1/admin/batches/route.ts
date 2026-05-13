// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Batches API
// GET /api/v1/admin/batches - List ingestion batches
// Owner: Afronovation, Inc.
// Access: Admin only
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdminAccess(): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const authSupabase = await createServerClient();
    const { data: { user }, error } = await authSupabase.auth.getUser();
    
    if (error || !user) {
      return { isAdmin: false, error: 'Authentication required' };
    }

    const supabase = getServiceClient();
    
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['org_admin', 'platform_admin'])
      .limit(1);

    if (memberData && memberData.length > 0) {
      return { isAdmin: true, userId: user.id };
    }

    return { isAdmin: false, error: 'Admin access required' };
  } catch {
    return { isAdmin: false, error: 'Authentication failed' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const status = searchParams.get('status');
    const sourceId = searchParams.get('source_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('souvera_source_file_ingestion_batches')
      .select(`
        *,
        source:souvera_data_sources(id, key, name),
        file_asset:souvera_source_file_assets(id, file_name, file_type, file_size_bytes),
        created_by_user:souvera_profiles!souvera_source_file_ingestion_batches_created_by_fkey(id, full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: batches, count, error } = await query;

    if (error) {
      console.error('Error fetching batches:', error);
      return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
    }

    // Calculate status summary
    const { data: statusCounts } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .select('status')
      .then(result => {
        if (!result.data) return { data: null };
        const counts: Record<string, number> = {};
        result.data.forEach((b: { status: string }) => {
          counts[b.status] = (counts[b.status] || 0) + 1;
        });
        return { data: counts };
      });

    return NextResponse.json({
      batches: batches || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      status_summary: statusCounts || {},
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/batches:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
