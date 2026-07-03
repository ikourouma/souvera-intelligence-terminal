// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Hero Slides CRUD API
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

    const { data: slides, error } = await supabase
      .from('souvera_hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[AdminHeroSlides] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
    }

    return NextResponse.json({ slides: slides || [] });
  } catch (error) {
    console.error('[AdminHeroSlides] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
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
      .from('souvera_hero_slides')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data: slide, error } = await supabase
      .from('souvera_hero_slides')
      .insert({
        ...body,
        display_order: newOrder,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[AdminHeroSlides] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
    }

    // Log audit
    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_hero_slides',
      record_id: slide.id,
      action: 'create',
      new_values: slide,
      changed_by: userId,
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error('[AdminHeroSlides] Error:', error);
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}
