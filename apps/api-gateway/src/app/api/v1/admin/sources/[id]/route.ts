// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Data Source Detail API
// GET /api/v1/admin/sources/[id] - Get source details
// PUT /api/v1/admin/sources/[id] - Update source
// DELETE /api/v1/admin/sources/[id] - Delete source
// Owner: Afronovation, Inc.
// Access: Platform Admin only
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
      .in('role', ['org_admin', 'platform_admin', 'super_admin'])
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
    const { id } = params;
    const supabase = getServiceClient();

    // Get source with related data
    const { data: source, error } = await supabase
      .from('souvera_data_sources')
      .select(`
        *,
        credentials:souvera_source_credentials(
          id, credential_type, credential_key, expires_at, is_active
        ),
        update_policies:souvera_source_update_policies(
          id, policy_name, schedule_cron, schedule_preset, is_enabled, last_run_at, next_run_at
        ),
        indicator_links:souvera_indicator_source_links(
          id, indicator_id, priority_rank, is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
      }
      console.error('Error fetching data source:', error);
      return NextResponse.json({ error: 'Failed to fetch data source' }, { status: 500 });
    }

    // Get recent ingestion runs
    const { data: recentRuns } = await supabase
      .from('souvera_data_ingestion_runs')
      .select('id, run_type, status, started_at, completed_at, rows_fetched, rows_valid, rows_invalid')
      .eq('source_id', id)
      .order('started_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ 
      source,
      recent_ingestion_runs: recentRuns || []
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/sources/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const supabase = getServiceClient();
    const body = await request.json();

    // Fields that can be updated
    const allowedFields = [
      'name',
      'domain',
      'provider_url',
      'api_base_url',
      'api_docs_url',
      'source_type',
      'confidence_level',
      'attribution_template',
      'requires_credential',
      'source_status',
      'is_active',
      'refresh_cadence',
      'priority_rank',
      'fallback_source_keys',
    ];

    // Filter to only allowed fields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: source, error } = await supabase
      .from('souvera_data_sources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
      }
      console.error('Error updating data source:', error);
      return NextResponse.json({ error: 'Failed to update data source' }, { status: 500 });
    }

    return NextResponse.json({ source });
  } catch (err) {
    console.error('Unexpected error in PUT /api/v1/admin/sources/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const supabase = getServiceClient();

    // Check if source has any ingestion runs
    const { data: runs } = await supabase
      .from('souvera_data_ingestion_runs')
      .select('id')
      .eq('source_id', id)
      .limit(1);

    if (runs && runs.length > 0) {
      // Soft delete - mark as retired instead of hard delete
      const { data: source, error } = await supabase
        .from('souvera_data_sources')
        .update({ 
          source_status: 'retired', 
          is_active: false 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error retiring data source:', error);
        return NextResponse.json({ error: 'Failed to retire data source' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'Data source retired (soft delete due to existing ingestion history)',
        source 
      });
    }

    // Hard delete if no ingestion history
    const { error } = await supabase
      .from('souvera_data_sources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting data source:', error);
      return NextResponse.json({ error: 'Failed to delete data source' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Data source deleted' });
  } catch (err) {
    console.error('Unexpected error in DELETE /api/v1/admin/sources/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
