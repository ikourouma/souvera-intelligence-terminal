// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AGOA Eligibility API
// GET /api/v1/trade/agoa - Get AGOA status for countries
// Owner: Afronovation, Inc.
// Access: Public (teaser) / Entitled (full)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  resolveUserAccess,
  type UserAccess,
} from '@souvera/entitlements';
import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';
import { AGOA_LEGISLATIVE_EVENTS } from '@/data/agoa-legislative-tracker';
import { fetchAgoaApiRowsFromVault } from '@/lib/intelligence/trade-policy-vault';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iso3 = searchParams.get('iso3')?.toUpperCase();
    const statusFilter = searchParams.get('status')?.toLowerCase() || '';

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

    if (iso3 && !APPROVED_AFRICA_ISO3.includes(iso3)) {
      return NextResponse.json({
        error: 'AGOA status is only available for sub-Saharan African countries',
      }, { status: 400 });
    }

    const isProfessionalPlus = access.planRank >= 2;
    const { rows: responseData, source: vaultSource } = await fetchAgoaApiRowsFromVault(
      iso3 ?? undefined,
      statusFilter,
      isProfessionalPlus
    );
    const dataSource: 'evidence_vault' | 'registry_fallback' = vaultSource;

    const eligibleCount = responseData.filter((s) => s.agoa_status === 'eligible').length;
    const suspendedCount = responseData.filter((s) => s.agoa_status === 'suspended').length;
    const underReviewCount = responseData.filter((s) => s.agoa_status === 'under_review').length;
    const graduatedCount = responseData.filter((s) => s.agoa_status === 'graduated').length;
    const ineligibleCount = responseData.filter((s) => s.agoa_status === 'ineligible').length;

    const legislativeEvents = iso3
      ? AGOA_LEGISLATIVE_EVENTS.filter(
          (e) => !e.affected_iso3 || e.affected_iso3.includes(iso3)
        )
      : AGOA_LEGISLATIVE_EVENTS;

    return NextResponse.json({
      statuses: responseData,
      legislative_events: legislativeEvents,
      summary: {
        total_tracked: responseData.length,
        eligible_count: eligibleCount,
        suspended_count: suspendedCount,
        under_review_count: underReviewCount,
        graduated_count: graduatedCount,
        ineligible_count: ineligibleCount,
        note: 'AGOA eligibility is subject to annual Presidential review. Reauthorization extended through December 31, 2026. Under review = vault row pending definitive USTR list match.',
      },
      attribution: {
        source_name: 'Office of the U.S. Trade Representative',
        source_type: dataSource,
        data_label:
          dataSource === 'evidence_vault' ? 'USTR · Evidence Vault' : 'Registry · Under review',
        confidence_level: 'high',
      },
      entitlement: {
        plan_id: access.planId,
        is_full_access: isProfessionalPlus,
      },
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/v1/trade/agoa:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
