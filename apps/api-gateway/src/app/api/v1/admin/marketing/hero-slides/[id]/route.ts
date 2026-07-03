// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Hero Slide Individual API
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

    const { data: slide, error } = await supabase
      .from('souvera_hero_slides')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    return NextResponse.json({ slide });
  } catch (error) {
    console.error('[AdminHeroSlide] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch slide' }, { status: 500 });
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

    // Get old values for audit
    const { data: oldSlide } = await supabase
      .from('souvera_hero_slides')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldSlide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    const { data: slide, error } = await supabase
      .from('souvera_hero_slides')
      .update({
        ...body,
        updated_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[AdminHeroSlide] Update error:', error);
      return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
    }

    // Log audit
    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_hero_slides',
      record_id: id,
      action: 'update',
      old_values: oldSlide,
      new_values: slide,
      changed_by: userId,
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error('[AdminHeroSlide] Error:', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
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

    // Get old values for audit
    const { data: oldSlide } = await supabase
      .from('souvera_hero_slides')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldSlide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('souvera_hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[AdminHeroSlide] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
    }

    // Log audit
    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_hero_slides',
      record_id: id,
      action: 'delete',
      old_values: oldSlide,
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminHeroSlide] Error:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
