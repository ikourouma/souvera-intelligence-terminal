// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Hero Slides Reorder API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

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
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Update each slide's display_order
    const updates = orderedIds.map((id: string, index: number) =>
      supabase
        .from('souvera_hero_slides')
        .update({ display_order: index, updated_by: userId })
        .eq('id', id)
    );

    await Promise.all(updates);

    // Log audit
    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_hero_slides',
      record_id: 'batch',
      action: 'reorder',
      new_values: { orderedIds },
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminHeroSlidesReorder] Error:', error);
    return NextResponse.json({ error: 'Failed to reorder slides' }, { status: 500 });
  }
}
