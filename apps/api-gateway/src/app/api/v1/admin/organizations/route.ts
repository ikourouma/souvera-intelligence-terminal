// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Organizations API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(request: NextRequest) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const supabase = getServiceClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('souvera_organizations')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%`);
    }

    const { data: orgs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[AdminOrganizations] Query error:', error);
      return NextResponse.json({
        organizations: [],
        totalPages: 1,
      });
    }

    const orgIds = (orgs || []).map(o => o.id);
    let memberCounts: Record<string, number> = {};

    if (orgIds.length > 0) {
      const { data: members } = await supabase
        .from('souvera_organization_members')
        .select('organization_id')
        .in('organization_id', orgIds);

      if (members) {
        memberCounts = members.reduce((acc, m) => {
          acc[m.organization_id] = (acc[m.organization_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    const organizations = (orgs || []).map(org => ({
      ...org,
      member_count: memberCounts[org.id] || 0,
    }));

    return NextResponse.json({
      organizations,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('[AdminOrganizations] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, slug, domain, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const { data: existing } = await supabase
      .from('souvera_organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'An organization with this slug already exists' }, { status: 400 });
    }

    const { data: org, error } = await supabase
      .from('souvera_organizations')
      .insert({
        name,
        slug: orgSlug,
        domain: domain || null,
        description: description || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[AdminOrganizations] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error('[AdminOrganizations] Error:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
