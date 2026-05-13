// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Review Queue API
// GET /api/v1/admin/review-queue - List review queue items
// POST /api/v1/admin/review-queue - Create review item
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
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const status = searchParams.get('status');
    const policyType = searchParams.get('policy_type');
    const assignedTo = searchParams.get('assigned_to');
    const myItems = searchParams.get('my_items') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('souvera_policy_review_queue')
      .select(`
        *,
        assigned_to_user:souvera_profiles!souvera_policy_review_queue_assigned_to_fkey(id, full_name, email),
        created_by_user:souvera_profiles!souvera_policy_review_queue_created_by_fkey(id, full_name)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default to pending/under_review
      query = query.in('status', ['detected', 'parsed', 'drafted', 'under_review']);
    }

    if (policyType) {
      query = query.eq('policy_type', policyType);
    }

    if (myItems && userId) {
      query = query.eq('assigned_to', userId);
    } else if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    // Apply pagination and ordering (priority desc, created_at asc)
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: items, count, error } = await query;

    if (error) {
      console.error('Error fetching review queue:', error);
      return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 });
    }

    // Get summary counts
    const { data: statusCounts } = await supabase
      .from('souvera_policy_review_queue')
      .select('status, policy_type');

    const summary = {
      total_pending: statusCounts?.filter(i => ['detected', 'parsed', 'drafted', 'under_review'].includes(i.status)).length || 0,
      agoa_pending: statusCounts?.filter(i => i.policy_type === 'agoa' && ['detected', 'parsed', 'drafted', 'under_review'].includes(i.status)).length || 0,
      afcfta_pending: statusCounts?.filter(i => i.policy_type === 'afcfta' && ['detected', 'parsed', 'drafted', 'under_review'].includes(i.status)).length || 0,
      my_assigned: userId ? statusCounts?.filter(i => i.status === 'under_review').length || 0 : 0,
    };

    return NextResponse.json({
      items: items || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      summary,
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/review-queue:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const body = await request.json();

    // Validate required fields
    const { source_type, source_id, title, policy_type, priority } = body;
    if (!source_type || !source_id || !title) {
      return NextResponse.json({ 
        error: 'Missing required fields: source_type, source_id, title' 
      }, { status: 400 });
    }

    // Create review queue item
    const { data: item, error } = await supabase
      .from('souvera_policy_review_queue')
      .insert({
        source_type,
        source_id,
        title,
        description: body.description,
        priority: priority || 50,
        policy_type,
        country_iso3: body.country_iso3,
        status: 'under_review',
        assigned_to: body.assigned_to,
        assigned_at: body.assigned_to ? new Date().toISOString() : null,
        due_at: body.due_at,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review item:', error);
      return NextResponse.json({ error: 'Failed to create review item' }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/review-queue:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
