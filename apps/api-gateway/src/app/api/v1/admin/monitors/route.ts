// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Policy Monitors API
// GET /api/v1/admin/monitors - List policy monitors
// POST /api/v1/admin/monitors - Create monitor
// Owner: Afronovation, Inc.
// Access: Admin only
//
// Monitors: Federal Register, Regulations.gov, USTR, AfCFTA, tralac
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import type { MonitorType } from '@/lib/data/types';

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
    const sourceId = searchParams.get('source_id');
    const monitorType = searchParams.get('monitor_type');
    const activeOnly = searchParams.get('active_only') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('souvera_policy_source_monitors')
      .select(`
        *,
        source:souvera_data_sources(id, key, name)
      `, { count: 'exact' });

    // Apply filters
    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }
    if (monitorType) {
      query = query.eq('monitor_type', monitorType);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    // Apply pagination and ordering
    query = query
      .order('monitor_name')
      .range(offset, offset + limit - 1);

    const { data: monitors, count, error } = await query;

    if (error) {
      console.error('Error fetching monitors:', error);
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 });
    }

    // Get recent change events count
    const { data: eventCounts } = await supabase
      .from('souvera_policy_change_events')
      .select('monitor_id, status')
      .in('status', ['detected', 'parsed', 'drafted', 'under_review']);

    const eventCountMap: Record<string, number> = {};
    eventCounts?.forEach((e) => {
      eventCountMap[e.monitor_id] = (eventCountMap[e.monitor_id] || 0) + 1;
    });

    // Enrich monitors with event counts
    const enrichedMonitors = (monitors || []).map((m) => ({
      ...m,
      pending_events: eventCountMap[m.id] || 0,
    }));

    return NextResponse.json({
      monitors: enrichedMonitors,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/monitors:', err);
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
    const { 
      source_id, 
      monitor_name, 
      monitor_type, 
      monitor_url,
      check_interval_minutes,
      keywords 
    } = body;

    if (!source_id || !monitor_name || !monitor_type || !monitor_url) {
      return NextResponse.json({ 
        error: 'Missing required fields: source_id, monitor_name, monitor_type, monitor_url' 
      }, { status: 400 });
    }

    // Validate monitor type
    const validTypes: MonitorType[] = ['api_poll', 'page_hash', 'link_detection', 'rss_feed', 'file_link', 'document_detection'];
    if (!validTypes.includes(monitor_type)) {
      return NextResponse.json({ 
        error: `Invalid monitor_type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Create monitor
    const { data: monitor, error } = await supabase
      .from('souvera_policy_source_monitors')
      .insert({
        source_id,
        monitor_name,
        monitor_type,
        monitor_url,
        api_endpoint: body.api_endpoint,
        api_params: body.api_params,
        api_headers: body.api_headers,
        page_selector: body.page_selector,
        link_patterns: body.link_patterns,
        feed_url: body.feed_url,
        check_interval_minutes: check_interval_minutes || 60,
        keywords: keywords || [],
        is_active: body.is_active !== false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating monitor:', error);
      return NextResponse.json({ error: 'Failed to create monitor' }, { status: 500 });
    }

    return NextResponse.json({ monitor }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/monitors:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
