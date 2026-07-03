// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Flash Banners CRUD API
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

    const { data: banners, error } = await supabase
      .from('souvera_flash_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[AdminBanners] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }

    return NextResponse.json({ banners: banners || [] });
  } catch (error) {
    console.error('[AdminBanners] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
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
    const supabase = getServiceClient();

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('souvera_flash_banners')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data: banner, error } = await supabase
      .from('souvera_flash_banners')
      .insert({
        ...body,
        display_order: newOrder,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[AdminBanners] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }

    // Log audit
    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_flash_banners',
      record_id: banner.id,
      action: 'create',
      new_values: banner,
      changed_by: userId,
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('[AdminBanners] Error:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
