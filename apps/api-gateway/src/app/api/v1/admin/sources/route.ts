// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Data Sources API
// GET /api/v1/admin/sources - List all data sources
// POST /api/v1/admin/sources - Create new data source
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

async function verifyAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const authSupabase = await createServerClient();
    const { data: { user }, error } = await authSupabase.auth.getUser();
    
    if (error || !user) {
      return { isAdmin: false, error: 'Authentication required' };
    }

    const supabase = getServiceClient();
    
    // Check if user has admin role in any organization
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error: authError } = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const status = searchParams.get('status');
    const sourceType = searchParams.get('source_type');
    const domain = searchParams.get('domain');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('souvera_data_sources')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('source_status', status);
    }
    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }
    if (domain) {
      query = query.eq('domain', domain);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: sources, count, error } = await query;

    if (error) {
      console.error('Error fetching data sources:', error);
      return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 });
    }

    return NextResponse.json({
      sources,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      }
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/sources:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, userId, error: authError } = await verifyAdminAccess(request);
    if (!isAdmin || !userId) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const body = await request.json();

    // Validate required fields
    const { key, name, domain, source_type } = body;
    if (!key || !name || !domain || !source_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: key, name, domain, source_type' 
      }, { status: 400 });
    }

    // Validate source_type
    if (!['api', 'file', 'manual'].includes(source_type)) {
      return NextResponse.json({ 
        error: 'Invalid source_type. Must be: api, file, or manual' 
      }, { status: 400 });
    }

    // Check for duplicate key
    const { data: existing } = await supabase
      .from('souvera_data_sources')
      .select('id')
      .eq('key', key)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: `Data source with key '${key}' already exists` 
      }, { status: 409 });
    }

    // Create the data source
    const { data: source, error } = await supabase
      .from('souvera_data_sources')
      .insert({
        key,
        name,
        domain,
        source_type,
        provider_url: body.provider_url,
        api_base_url: body.api_base_url,
        api_docs_url: body.api_docs_url,
        confidence_level: body.confidence_level || 'medium',
        attribution_template: body.attribution_template,
        requires_credential: body.requires_credential || false,
        source_status: body.source_status || 'testing',
        is_active: body.is_active ?? true,
        refresh_cadence: body.refresh_cadence,
        priority_rank: body.priority_rank || 100,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating data source:', error);
      return NextResponse.json({ error: 'Failed to create data source' }, { status: 500 });
    }

    return NextResponse.json({ source }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/sources:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
