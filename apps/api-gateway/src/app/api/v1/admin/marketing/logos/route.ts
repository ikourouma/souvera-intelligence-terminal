// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Trust Logos CRUD API
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

    const { data: logos, error } = await supabase
      .from('souvera_trust_logos')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[AdminLogos] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch logos' }, { status: 500 });
    }

    return NextResponse.json({ logos: logos || [] });
  } catch (error) {
    console.error('[AdminLogos] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logos' }, { status: 500 });
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
      .from('souvera_trust_logos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data: logo, error } = await supabase
      .from('souvera_trust_logos')
      .insert({
        ...body,
        display_order: newOrder,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[AdminLogos] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create logo' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_trust_logos',
      record_id: logo.id,
      action: 'create',
      new_values: logo,
      changed_by: userId,
    });

    return NextResponse.json({ logo }, { status: 201 });
  } catch (error) {
    console.error('[AdminLogos] Error:', error);
    return NextResponse.json({ error: 'Failed to create logo' }, { status: 500 });
  }
}
