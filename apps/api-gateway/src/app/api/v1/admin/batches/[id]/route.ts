// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Batch Detail API
// GET /api/v1/admin/batches/[id] - Get batch details
// PUT /api/v1/admin/batches/[id] - Update batch status/action
// Owner: Afronovation, Inc.
// Access: Admin only
//
// Supported Actions: approve, reject, publish, rollback, supersede
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import type { BatchStatus } from '@/lib/data/types';

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
    const { id } = params;
    const supabase = getServiceClient();

    // Get batch with related data
    const { data: batch, error } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .select(`
        *,
        source:souvera_data_sources(id, key, name, confidence_level),
        file_asset:souvera_source_file_assets(*),
        created_by_user:souvera_profiles!souvera_source_file_ingestion_batches_created_by_fkey(id, full_name, email),
        reviewed_by_user:souvera_profiles!souvera_source_file_ingestion_batches_reviewed_by_fkey(id, full_name),
        approved_by_user:souvera_profiles!souvera_source_file_ingestion_batches_approved_by_fkey(id, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }
      console.error('Error fetching batch:', error);
      return NextResponse.json({ error: 'Failed to fetch batch' }, { status: 500 });
    }

    // Get row statistics
    const { data: rowStats } = await supabase
      .from('souvera_source_file_ingestion_rows')
      .select('status')
      .eq('batch_id', id);

    const rowCounts = {
      total: rowStats?.length || 0,
      pending: rowStats?.filter(r => r.status === 'pending').length || 0,
      valid: rowStats?.filter(r => r.status === 'valid').length || 0,
      invalid: rowStats?.filter(r => r.status === 'invalid').length || 0,
      warning: rowStats?.filter(r => r.status === 'warning').length || 0,
      approved: rowStats?.filter(r => r.status === 'approved').length || 0,
      published: rowStats?.filter(r => r.status === 'published').length || 0,
    };

    // Get sample rows (first 20)
    const { data: sampleRows } = await supabase
      .from('souvera_source_file_ingestion_rows')
      .select('*')
      .eq('batch_id', id)
      .order('row_number')
      .limit(20);

    return NextResponse.json({
      batch,
      row_statistics: rowCounts,
      sample_rows: sampleRows || [],
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/batches/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const supabase = getServiceClient();
    const body = await request.json();
    const { action, notes, supersedes_batch_id } = body;

    // Validate action
    const validActions = ['review', 'approve', 'reject', 'publish', 'rollback', 'supersede'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ 
        error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
      }, { status: 400 });
    }

    // Get current batch
    const { data: batch, error: fetchError } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Validate state transitions
    const currentStatus = batch.status as BatchStatus;
    let newStatus: BatchStatus;
    const updateData: Record<string, unknown> = {};

    switch (action) {
      case 'review':
        if (!['validated', 'mapped'].includes(currentStatus)) {
          return NextResponse.json({ 
            error: `Cannot review batch in status: ${currentStatus}. Must be validated or mapped.` 
          }, { status: 400 });
        }
        newStatus = 'under_review';
        updateData.reviewed_by = userId;
        updateData.reviewed_at = new Date().toISOString();
        updateData.review_notes = notes;
        break;

      case 'approve':
        if (currentStatus !== 'under_review') {
          return NextResponse.json({ 
            error: `Cannot approve batch in status: ${currentStatus}. Must be under_review.` 
          }, { status: 400 });
        }
        newStatus = 'approved';
        updateData.approved_by = userId;
        updateData.approved_at = new Date().toISOString();
        updateData.approval_notes = notes;
        break;

      case 'reject':
        if (!['under_review', 'validated', 'mapped'].includes(currentStatus)) {
          return NextResponse.json({ 
            error: `Cannot reject batch in status: ${currentStatus}.` 
          }, { status: 400 });
        }
        newStatus = 'rejected';
        updateData.reviewed_by = userId;
        updateData.reviewed_at = new Date().toISOString();
        updateData.review_notes = notes;
        break;

      case 'publish':
        if (currentStatus !== 'approved') {
          return NextResponse.json({ 
            error: `Cannot publish batch in status: ${currentStatus}. Must be approved.` 
          }, { status: 400 });
        }
        newStatus = 'publishing';
        updateData.published_by = userId;
        break;

      case 'rollback':
        if (currentStatus !== 'published') {
          return NextResponse.json({ 
            error: `Cannot rollback batch in status: ${currentStatus}. Must be published.` 
          }, { status: 400 });
        }
        newStatus = 'rolled_back';
        updateData.rolled_back_at = new Date().toISOString();
        updateData.rolled_back_by = userId;
        updateData.rollback_reason = notes;
        break;

      case 'supersede':
        if (currentStatus !== 'published') {
          return NextResponse.json({ 
            error: `Cannot supersede batch in status: ${currentStatus}. Must be published.` 
          }, { status: 400 });
        }
        if (!supersedes_batch_id) {
          return NextResponse.json({ 
            error: 'supersedes_batch_id required for supersede action' 
          }, { status: 400 });
        }
        newStatus = 'superseded';
        updateData.superseded_by_batch_id = supersedes_batch_id;
        updateData.superseded_at = new Date().toISOString();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update batch
    updateData.status = newStatus;
    const { data: updatedBatch, error: updateError } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating batch:', updateError);
      return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
    }

    // If publishing, trigger the publication process (simplified for now)
    if (action === 'publish') {
      // Update batch to published after "publishing" would complete
      // In production, this would be an async job
      await supabase
        .from('souvera_source_file_ingestion_batches')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      action,
      previous_status: currentStatus,
      new_status: newStatus,
      batch: updatedBatch,
    });

  } catch (err) {
    console.error('Unexpected error in PUT /api/v1/admin/batches/[id]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
