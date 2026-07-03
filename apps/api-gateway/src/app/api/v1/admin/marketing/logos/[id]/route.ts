// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Logo Individual API
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

    const { data: logo, error } = await supabase
      .from('souvera_trust_logos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ logo });
  } catch (error) {
    console.error('[AdminLogo] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 });
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

    const { data: oldLogo } = await supabase
      .from('souvera_trust_logos')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldLogo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    const { data: logo, error } = await supabase
      .from('souvera_trust_logos')
      .update({
        ...body,
        updated_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[AdminLogo] Update error:', error);
      return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_trust_logos',
      record_id: id,
      action: 'update',
      old_values: oldLogo,
      new_values: logo,
      changed_by: userId,
    });

    return NextResponse.json({ logo });
  } catch (error) {
    console.error('[AdminLogo] Error:', error);
    return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 });
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

    const { data: oldLogo } = await supabase
      .from('souvera_trust_logos')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldLogo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('souvera_trust_logos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[AdminLogo] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 });
    }

    await supabase.from('souvera_marketing_audit_log').insert({
      table_name: 'souvera_trust_logos',
      record_id: id,
      action: 'delete',
      old_values: oldLogo,
      changed_by: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminLogo] Error:', error);
    return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 });
  }
}
