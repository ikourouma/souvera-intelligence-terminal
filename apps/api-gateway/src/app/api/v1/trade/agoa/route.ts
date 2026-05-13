// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AGOA Eligibility API
// GET /api/v1/trade/agoa - Get AGOA status for countries
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
        agoa_status,
        agoa_eligible_since,
        agoa_apparel_eligible,
        agoa_suspension_date,
        agoa_notes,
        agoa_source_url,
        agoa_as_of_date,
        agoa_last_reviewed_at,
        country:souvera_countries!inner(
          iso3,
          name,
          region
        )
      `)
      .not('agoa_status', 'is', null);

    // Filter to African countries only (AGOA applies to sub-Saharan Africa)
    if (iso3) {
      // Single country lookup
      if (!APPROVED_AFRICA_ISO3.includes(iso3)) {
        return NextResponse.json({
          error: 'AGOA status is only available for sub-Saharan African countries'
        }, { status: 400 });
      }
      query = query.eq('country.iso3', iso3);
    }

    const { data: statuses, error } = await query;

    if (error) {
      console.error('Error fetching AGOA statuses:', error);
      return NextResponse.json({ error: 'Failed to fetch AGOA statuses' }, { status: 500 });
    }

    // Apply entitlement-based filtering
    const responseData = (statuses || []).map(status => {
      const baseData = {
        country_iso3: (status.country as any)?.iso3,
        country_name: (status.country as any)?.name,
        agoa_status: status.agoa_status,
        agoa_apparel_eligible: status.agoa_apparel_eligible,
        // Always show source attribution
        source_type: 'manual' as const,
        data_label: 'Curated Preview Data',
      };

      if (!isProfessionalPlus) {
        // Explorer/Public: teaser only
        return {
          ...baseData,
          is_full_access: false,
          upgrade_message: 'Upgrade to Professional for full AGOA intelligence'
        };
      }

      // Professional+: full data
      return {
        ...baseData,
        agoa_eligible_since: status.agoa_eligible_since,
        agoa_suspension_date: status.agoa_suspension_date,
        agoa_notes: status.agoa_notes,
        agoa_source_url: status.agoa_source_url,
        agoa_as_of_date: status.agoa_as_of_date,
        agoa_last_reviewed_at: status.agoa_last_reviewed_at,
        is_full_access: true,
      };
    });

    // Calculate summary stats (without hardcoding specific counts)
    const eligibleCount = responseData.filter(s => s.agoa_status === 'eligible').length;
    const suspendedCount = responseData.filter(s => s.agoa_status === 'suspended').length;
    const totalTracked = responseData.length;

    return NextResponse.json({
      statuses: responseData,
      summary: {
        total_tracked: totalTracked,
        eligible_count: eligibleCount,
        suspended_count: suspendedCount,
        // Do not hardcode "49 eligible countries" - this is dynamic
        note: 'AGOA eligibility is subject to annual Presidential review. Status may change.',
      },
      attribution: {
        source_name: 'Office of the U.S. Trade Representative',
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
    console.error('Unexpected error in GET /api/v1/trade/agoa:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
