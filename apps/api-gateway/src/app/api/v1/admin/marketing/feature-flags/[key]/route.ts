// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Feature Flag Individual API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { key } = await params;
    const supabase = getServiceClient();

    const { data: flag, error } = await supabase
      .from('souvera_feature_flags')
      .select('*')
      .eq('flag_key', key)
      .single();

    if (error || !flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    return NextResponse.json({ flag });
  } catch (error) {
    console.error('[AdminFeatureFlags] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch flag' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { key } = await params;
    const body = await request.json();
    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from('souvera_feature_flags')
      .select('*')
      .eq('flag_key', key)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: userId,
    };

    if (body.is_enabled !== undefined) {
      updateData.is_enabled = body.is_enabled;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.scope !== undefined) {
      updateData.scope = body.scope;
    }
    if (body.tier_restriction !== undefined) {
      updateData.tier_restriction = body.tier_restriction;
    }
    if (body.metadata !== undefined) {
      updateData.metadata = body.metadata;
    }

    const { data: flag, error } = await supabase
      .from('souvera_feature_flags')
      .update(updateData)
      .eq('flag_key', key)
      .select()
      .single();

    if (error) {
      console.error('[AdminFeatureFlags] Update error:', error);
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_feature_flags',
      record_id: key,
      action: 'update',
      old_values: existing,
      new_values: flag,
      changed_by: userId,
    });

    return NextResponse.json({ flag });
  } catch (error) {
    console.error('[AdminFeatureFlags] Error:', error);
    return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { key } = await params;
    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from('souvera_feature_flags')
      .select('*')
      .eq('flag_key', key)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('souvera_feature_flags')
      .delete()
      .eq('flag_key', key);

    if (error) {
      console.error('[AdminFeatureFlags] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_feature_flags',
      record_id: key,
      action: 'delete',
      old_values: existing,
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminFeatureFlags] Error:', error);
    return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
  }
}
