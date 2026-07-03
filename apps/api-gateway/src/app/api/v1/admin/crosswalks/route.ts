// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Crosswalks API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

export async function GET() {
  const { isAdmin } = await verifyAdminAccess();

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceClient();

    const { data: countries, error } = await supabase
      .from('souvera_countries')
      .select('iso3, name, region, census_code, comtrade_code, wdi_code, imf_code, is_excluded')
      .order('name');

    if (error) {
      console.error('[Crosswalks] Error:', error);
      return NextResponse.json({ crosswalks: [] });
    }

    const crosswalks = (countries || []).map(c => ({
      iso3: c.iso3,
      name: c.name,
      region: c.region || 'africa',
      censusCode: c.census_code,
      comtradeCode: c.comtrade_code,
      wdiCode: c.wdi_code,
      imfCode: c.imf_code,
      excluded: c.is_excluded || false,
    }));

    return NextResponse.json({ crosswalks });
  } catch (error) {
    console.error('[Crosswalks] Error:', error);
    return NextResponse.json({ crosswalks: [] });
  }
}

export async function POST(request: NextRequest) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { iso3, name, region, censusCode, comtradeCode, wdiCode, imfCode } = body;

    if (!iso3 || !name) {
      return NextResponse.json(
        { error: 'ISO3 code and country name are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from('souvera_countries')
      .select('iso3')
      .eq('iso3', iso3.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A country with this ISO3 code already exists' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('souvera_countries')
      .insert({
        iso3: iso3.toUpperCase(),
        name,
        region: region || 'africa',
        census_code: censusCode || null,
        comtrade_code: comtradeCode || null,
        wdi_code: wdiCode || null,
        imf_code: imfCode || null,
        is_excluded: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Crosswalks] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add country mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Country mapping for ${name} (${iso3.toUpperCase()}) added successfully`,
    });
  } catch (error) {
    console.error('[Crosswalks] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add country mapping' },
      { status: 500 }
    );
  }
}
