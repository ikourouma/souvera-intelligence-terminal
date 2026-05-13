// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Batch Rows API
// GET /api/v1/admin/batches/[id]/rows - List batch rows
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const params = await context.params;
    const { id: batchId } = params;
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const status = searchParams.get('status');
    const showInvalid = searchParams.get('show_invalid') === 'true';
    const showExcluded = searchParams.get('show_excluded') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('souvera_source_file_ingestion_rows')
      .select('*', { count: 'exact' })
      .eq('batch_id', batchId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (showInvalid) {
      query = query.eq('status', 'invalid');
    }
    if (showExcluded) {
      query = query.eq('is_excluded', true);
    }

    // Apply pagination and ordering
    query = query
      .order('row_number')
      .range(offset, offset + limit - 1);

    const { data: rows, count, error } = await query;

    if (error) {
      console.error('Error fetching rows:', error);
      return NextResponse.json({ error: 'Failed to fetch rows' }, { status: 500 });
    }

    // Get status summary
    const { data: statusSummary } = await supabase
      .from('souvera_source_file_ingestion_rows')
      .select('status, is_excluded')
      .eq('batch_id', batchId);

    const summary = {
      total: statusSummary?.length || 0,
      pending: statusSummary?.filter(r => r.status === 'pending').length || 0,
      valid: statusSummary?.filter(r => r.status === 'valid').length || 0,
      invalid: statusSummary?.filter(r => r.status === 'invalid' && !r.is_excluded).length || 0,
      warning: statusSummary?.filter(r => r.status === 'warning').length || 0,
      excluded: statusSummary?.filter(r => r.is_excluded).length || 0,
    };

    // Extract column headers from first row
    let columns: string[] = [];
    if (rows && rows.length > 0) {
      const firstRow = rows[0].mapped_data || rows[0].raw_data;
      columns = Object.keys(firstRow as Record<string, unknown>);
    }

    return NextResponse.json({
      rows: rows || [],
      columns,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      summary,
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/batches/[id]/rows:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
