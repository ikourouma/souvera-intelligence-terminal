// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Access Control Matrix API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';
import { PLAN_ENTITLEMENTS, type AccessTier, type EntitlementKey } from '@souvera/entitlements';

export async function GET() {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const tiers: AccessTier[] = ['public', 'explorer', 'professional', 'business', 'investor', 'institutional'];
    
    const matrix: Record<string, Record<string, { value: boolean | number | string }>> = {};

    for (const tier of tiers) {
      matrix[tier] = {};
      const entitlements = PLAN_ENTITLEMENTS[tier] || [];
      
      const allEntitlements: EntitlementKey[] = [
        'country_identity',
        'headline_macro',
        'full_macro',
        'sector_teasers',
        'sector_rationale',
        'trade_data',
        'risk_analysis',
        'investment_thesis',
        'forecast_metrics',
        'supply_demand_matrix',
        'reports_preview',
        'export_access',
        'api_access',
      ];

      for (const ent of allEntitlements) {
        matrix[tier][ent] = { value: entitlements.includes(ent) };
      }

      const quotas: Record<AccessTier, number | 'unlimited'> = {
        public: 0,
        explorer: 1,
        professional: 5,
        business: 20,
        investor: 50,
        institutional: 'unlimited',
        platform_admin: 'unlimited',
        super_admin: 'unlimited',
      };

      matrix[tier]['report_quota'] = { value: quotas[tier] };
    }

    return NextResponse.json({ matrix });
  } catch (error) {
    console.error('[AdminMatrix] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matrix' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { isAdmin, isSuperAdmin, userId, userInfo } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { matrix } = body;

    if (!matrix) {
      return NextResponse.json(
        { error: 'Matrix data required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    for (const [persona, entitlements] of Object.entries(matrix)) {
      for (const [key, cell] of Object.entries(entitlements as Record<string, { value: unknown }>)) {
        try {
          await supabase.from('souvera_matrix_audit_log').insert({
            admin_id: userId,
            admin_email: userInfo?.email || '',
            persona,
            entitlement_key: key,
            old_value: null,
            new_value: cell,
            change_type: 'update',
          });
        } catch {
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Matrix updated successfully. Note: Changes to PLAN_ENTITLEMENTS require code deployment to take effect.',
    });
  } catch (error) {
    console.error('[AdminMatrix] Error saving matrix:', error);
    return NextResponse.json(
      { error: 'Failed to save matrix' },
      { status: 500 }
    );
  }
}
