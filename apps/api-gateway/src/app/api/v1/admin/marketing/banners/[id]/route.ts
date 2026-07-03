// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Banner Individual API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: banner, error } = await supabase
      .from('souvera_flash_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('[AdminBanner] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getServiceClient();

    const { data: oldBanner } = await supabase
      .from('souvera_flash_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const { data: banner, error } = await supabase
      .from('souvera_flash_banners')
      .update({
        ...body,
        updated_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[AdminBanner] Update error:', error);
      return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_flash_banners',
      record_id: id,
      action: 'update',
      old_values: oldBanner,
      new_values: banner,
      changed_by: userId,
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('[AdminBanner] Error:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, isSuperAdmin, userId } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: oldBanner } = await supabase
      .from('souvera_flash_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('souvera_flash_banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[AdminBanner] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_flash_banners',
      record_id: id,
      action: 'delete',
      old_values: oldBanner,
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminBanner] Error:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
