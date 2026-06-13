// AfCFTA Status API — Full 54 African country coverage
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess, type UserAccess } from '@souvera/entitlements';
import { APPROVED_AFRICA_ISO3 } from '@/lib/market-coverage';
import {
  getAllAfCftaCountryData,
  getAfCftaCountryData,
  type AfCftaCountryData,
} from '@/data/afcfta-full-coverage';

interface AfCftaApiRow {
  country_iso3: string;
  country_name: string;
  afcfta_status: string;
  afcfta_signed_date?: string;
  afcfta_ratified_date?: string;
  afcfta_deposited_date?: string;
  afcfta_trading_since?: string;
  afcfta_tariff_offers_submitted?: boolean;
  afcfta_services_offers_submitted?: boolean;
  afcfta_notes?: string;
  afcfta_source_url?: string;
  afcfta_as_of_date?: string;
  is_full_access: boolean;
  upgrade_message?: string;
  data_label?: string;
  // Trade data (for full access)
  intra_africa_exports_usd?: number;
  intra_africa_imports_usd?: number;
  top_export_partners?: Array<{ iso3: string; name: string; trade_value_usd: number; share_pct: number }>;
  top_import_partners?: Array<{ iso3: string; name: string; trade_value_usd: number; share_pct: number }>;
  top_export_products?: Array<{ hs_code: string; description: string; trade_value_usd: number; share_pct: number }>;
  top_import_products?: Array<{ hs_code: string; description: string; trade_value_usd: number; share_pct: number }>;
}

function mapToApiRow(data: AfCftaCountryData, isFullAccess: boolean): AfCftaApiRow {
  const row: AfCftaApiRow = {
    country_iso3: data.iso3,
    country_name: data.name,
    afcfta_status: data.status,
    afcfta_signed_date: data.signedDate,
    afcfta_ratified_date: data.ratifiedDate,
    afcfta_deposited_date: data.depositedDate,
    afcfta_trading_since: data.tradingSince,
    afcfta_tariff_offers_submitted: data.tariffOffersSubmitted,
    afcfta_services_offers_submitted: data.servicesOffersSubmitted,
    afcfta_notes: data.notes,
    afcfta_source_url: data.sourceUrl,
    afcfta_as_of_date: data.asOfDate,
    is_full_access: isFullAccess,
    data_label: 'Souvera Curated Intelligence',
  };

  if (!isFullAccess) {
    row.upgrade_message = 'Upgrade to Business+ for full AfCFTA intelligence including trade data.';
  } else {
    // Include trade data for full access users
    row.intra_africa_exports_usd = data.intraAfricaExportsUSD;
    row.intra_africa_imports_usd = data.intraAfricaImportsUSD;
    row.top_export_partners = data.topExportPartners?.map(p => ({
      iso3: p.iso3,
      name: p.name,
      trade_value_usd: p.tradeValueUSD,
      share_pct: p.shareOfTotal,
    }));
    row.top_import_partners = data.topImportPartners?.map(p => ({
      iso3: p.iso3,
      name: p.name,
      trade_value_usd: p.tradeValueUSD,
      share_pct: p.shareOfTotal,
    }));
    row.top_export_products = data.topExportProducts?.map(p => ({
      hs_code: p.hsCode,
      description: p.description,
      trade_value_usd: p.tradeValueUSD,
      share_pct: p.shareOfTotal,
    }));
    row.top_import_products = data.topImportProducts?.map(p => ({
      hs_code: p.hsCode,
      description: p.description,
      trade_value_usd: p.tradeValueUSD,
      share_pct: p.shareOfTotal,
    }));
  }

  return row;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iso3 = searchParams.get('iso3')?.toUpperCase();
    const statusFilter = searchParams.get('status')?.toLowerCase();
    
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

    if (iso3 && !APPROVED_AFRICA_ISO3.includes(iso3 as typeof APPROVED_AFRICA_ISO3[number])) {
      return NextResponse.json({ error: 'AfCFTA status is only available for African countries' }, { status: 400 });
    }

    const isProfessionalPlus = access.planRank >= 2;

    // Get data — either single country or all
    let data: AfCftaCountryData[];
    if (iso3) {
      const single = getAfCftaCountryData(iso3);
      data = single ? [single] : [];
    } else {
      data = getAllAfCftaCountryData();
    }

    // Apply status filter if provided
    if (statusFilter) {
      data = data.filter(d => d.status === statusFilter);
    }

    // Map to API response format
    const rows = data.map(d => mapToApiRow(d, isProfessionalPlus));

    // Calculate summary counts
    const tradingCount = rows.filter(r => r.afcfta_status === 'trading').length;
    const depositedCount = rows.filter(r => r.afcfta_status === 'deposited').length;
    const ratifiedCount = rows.filter(r => r.afcfta_status === 'ratified').length;
    const signedCount = rows.filter(r => r.afcfta_status === 'signed').length;
    const notSignedCount = rows.filter(r => r.afcfta_status === 'not_signed').length;

    return NextResponse.json({
      statuses: rows,
      summary: {
        total_tracked: rows.length,
        trading_count: tradingCount,
        deposited_count: depositedCount,
        ratified_count: ratifiedCount,
        signed_count: signedCount,
        not_signed_count: notSignedCount,
        note: `All 54 African Union member states. ${tradingCount} countries actively trading under AfCFTA protocols.`,
      },
      attribution: {
        source_name: 'AfCFTA Secretariat / AU Commission',
        source_type: 'curated',
        data_label: 'Souvera Curated Intelligence',
        confidence_level: 'high',
      },
      entitlement: {
        plan_id: access.planId,
        is_full_access: isProfessionalPlus,
      },
    });
  } catch (err) {
    console.error('GET /api/v1/trade/afcfta:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
