// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AfCFTA Status API
// GET /api/v1/trade/afcfta - Get AfCFTA implementation status
// Owner: Afronovation, Inc.
// Access: Public (teaser) / Entitled (full)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import {
  resolveUserAccess,
  type UserAccess,
} from '@souvera/entitlements';
import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iso3 = searchParams.get('iso3')?.toUpperCase();
    const status = searchParams.get('status'); // Filter by AfCFTA status

    // Resolve user access
    let access: UserAccess;
    try {
      const authSupabase = await createServerClient();
      const { data: { user } } = await authSupabase.auth.getUser();
      access = await resolveUserAccess(authSupabase, user?.id);
    } catch {
      access = {
        userId: '',
        email: null,
        planRank: 0,
        planId: 'public',
        entitlements: [],
        organizationId: null,
        organizationRole: null,
        isAuthenticated: false,
      };
    }

    const supabase = getServiceClient();
    const isProfessionalPlus = access.planRank >= 2;

    // Build query
    let query = supabase
      .from('souvera_trade_policy_statuses')
      .select(`
        id,
        country_id,
        afcfta_status,
        afcfta_signed_date,
        afcfta_ratified_date,
        afcfta_deposited_date,
        afcfta_trading_since,
        afcfta_tariff_offers_submitted,
        afcfta_services_offers_submitted,
        afcfta_notes,
        afcfta_source_url,
        afcfta_as_of_date,
        afcfta_last_reviewed_at,
        country:souvera_countries!inner(
          iso3,
          name,
          region
        )
      `)
      .not('afcfta_status', 'is', null);

    // Filter by status if provided
    if (status) {
      query = query.eq('afcfta_status', status);
    }

    // Filter by country if provided
    if (iso3) {
      if (!APPROVED_AFRICA_ISO3.includes(iso3)) {
        return NextResponse.json({
          error: 'AfCFTA status is only available for African countries'
        }, { status: 400 });
      }
      query = query.eq('country.iso3', iso3);
    }

    const { data: statuses, error } = await query;

    if (error) {
      console.error('Error fetching AfCFTA statuses:', error);
      return NextResponse.json({ error: 'Failed to fetch AfCFTA statuses' }, { status: 500 });
    }

    // Apply entitlement-based filtering
    const responseData = (statuses || []).map(item => {
      const baseData = {
        country_iso3: (item.country as any)?.iso3,
        country_name: (item.country as any)?.name,
        afcfta_status: item.afcfta_status,
        // Always show source attribution
        source_type: 'manual' as const,
        data_label: 'Curated Preview Data',
      };

      if (!isProfessionalPlus) {
        // Explorer/Public: teaser only
        return {
          ...baseData,
          is_full_access: false,
          upgrade_message: 'Upgrade to Professional for full AfCFTA intelligence'
        };
      }

      // Professional+: full data
      return {
        ...baseData,
        afcfta_signed_date: item.afcfta_signed_date,
        afcfta_ratified_date: item.afcfta_ratified_date,
        afcfta_deposited_date: item.afcfta_deposited_date,
        afcfta_trading_since: item.afcfta_trading_since,
        afcfta_tariff_offers_submitted: item.afcfta_tariff_offers_submitted,
        afcfta_services_offers_submitted: item.afcfta_services_offers_submitted,
        afcfta_notes: item.afcfta_notes,
        afcfta_source_url: item.afcfta_source_url,
        afcfta_as_of_date: item.afcfta_as_of_date,
        afcfta_last_reviewed_at: item.afcfta_last_reviewed_at,
        is_full_access: true,
      };
    });

    // Calculate summary stats
    const signedCount = responseData.filter(s => s.afcfta_status === 'signed').length;
    const ratifiedCount = responseData.filter(s => s.afcfta_status === 'ratified').length;
    const depositedCount = responseData.filter(s => s.afcfta_status === 'deposited').length;
    const tradingCount = responseData.filter(s => s.afcfta_status === 'trading').length;
    const totalTracked = responseData.length;

    return NextResponse.json({
      statuses: responseData,
      summary: {
        total_tracked: totalTracked,
        signed_count: signedCount,
        ratified_count: ratifiedCount,
        deposited_count: depositedCount,
        trading_count: tradingCount,
        note: 'AfCFTA implementation status is based on official AU communications. Status may change as implementation progresses.',
      },
      attribution: {
        source_name: 'AfCFTA Secretariat / tralac',
        source_type: 'manual',
        data_label: 'Curated Preview Data',
        confidence_level: 'high',
      },
      entitlement: {
        plan_id: access.planId,
        is_full_access: isProfessionalPlus,
      }
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/v1/trade/afcfta:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
