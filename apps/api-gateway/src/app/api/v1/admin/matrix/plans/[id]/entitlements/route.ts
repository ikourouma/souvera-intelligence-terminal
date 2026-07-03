// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Plan Entitlements API Route
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, error } = await verifyAdminAccess();

    if (!isAdmin) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = getServiceClient();

    const { data: planEntitlements, error: fetchError } = await supabase
      .from('souvera_plan_entitlements')
      .select(`
        entitlement_key,
        souvera_entitlements (
          key,
          label,
          description
        )
      `)
      .eq('plan_id', id);

    if (fetchError) {
      console.error('[Plan Entitlements API] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 });
    }

    const entitlements = planEntitlements?.map(pe => ({
      key: pe.entitlement_key,
      label: (pe.souvera_entitlements as { label: string } | null)?.label || pe.entitlement_key,
      description: (pe.souvera_entitlements as { description: string | null } | null)?.description || null,
    })) || [];

    return NextResponse.json({ entitlements });
  } catch (err) {
    console.error('[Plan Entitlements API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
