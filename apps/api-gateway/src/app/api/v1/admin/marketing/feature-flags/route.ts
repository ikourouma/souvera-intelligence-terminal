// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Feature Flags CRUD API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
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

    const { data: flags, error } = await supabase
      .from('souvera_feature_flags')
      .select('*')
      .order('flag_key', { ascending: true });

    if (error) {
      console.error('[AdminFeatureFlags] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
    }

    return NextResponse.json({ flags: flags || [] });
  } catch (error) {
    console.error('[AdminFeatureFlags] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
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
    const { flag_key, description, is_enabled, scope, tier_restriction, metadata } = body;

    if (!flag_key) {
      return NextResponse.json({ error: 'flag_key is required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Check if flag already exists
    const { data: existing } = await supabase
      .from('souvera_feature_flags')
      .select('flag_key')
      .eq('flag_key', flag_key)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Flag key already exists' }, { status: 400 });
    }

    const { data: flag, error } = await supabase
      .from('souvera_feature_flags')
      .insert({
        flag_key,
        description: description || null,
        is_enabled: is_enabled ?? false,
        scope: scope || 'global',
        tier_restriction: tier_restriction || null,
        metadata: metadata || {},
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[AdminFeatureFlags] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_feature_flags',
      record_id: flag_key,
      action: 'create',
      new_values: flag,
      changed_by: userId,
    });

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error) {
    console.error('[AdminFeatureFlags] Error:', error);
    return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
  }
}
