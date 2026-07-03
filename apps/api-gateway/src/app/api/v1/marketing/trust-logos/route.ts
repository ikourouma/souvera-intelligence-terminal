// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Public Trust Logos API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const FALLBACK_LOGOS = [
  { id: 'wb', name: 'World Bank', abbreviation: 'WB', color: '#2563EB', note: 'Macro · Weekly' },
  { id: 'imf', name: 'Intl Monetary Fund', abbreviation: 'IMF', color: '#16A34A', note: 'Forecasts · Monthly' },
  { id: 'unc', name: 'UN Comtrade', abbreviation: 'UNC', color: '#7C3AED', note: 'Trade · Monthly' },
  { id: 'afdb', name: 'African Dev Bank', abbreviation: 'AfDB', color: '#F59E0B', note: 'Africa · Monthly' },
  { id: 'gdelt', name: 'GDELT Project', abbreviation: 'GDL', color: '#DC2626', note: 'Signals · Hourly' },
  { id: 'oecd', name: 'OECD / DB Nomics', abbreviation: 'OEC', color: '#0891B2', note: 'Macro · Monthly' },
  { id: 'unctad', name: 'UNCTAD', abbreviation: 'UNC', color: '#EA580C', note: 'FDI · Quarterly' },
  { id: 'iea', name: 'Intl Energy Agency', abbreviation: 'IEA', color: '#4F46E5', note: 'Energy · Monthly' },
];

const FALLBACK_KPIS = [
  { value: '74', label: 'Sovereign Markets' },
  { value: '8+', label: 'Data Sources' },
  { value: '<45ms', label: 'Avg Latency' },
  { value: 'Hourly', label: 'Signal Refresh' },
  { value: '2026', label: 'IMF Projections' },
];

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: logos, error } = await supabase
      .from('souvera_trust_logos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[TrustLogos] Database error:', error);
      return NextResponse.json({
        logos: FALLBACK_LOGOS,
        kpis: FALLBACK_KPIS,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    if (!logos || logos.length === 0) {
      return NextResponse.json({
        logos: FALLBACK_LOGOS,
        kpis: FALLBACK_KPIS,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    // Dedupe by name+abbreviation (CMS may contain duplicate seed rows)
    const seen = new Set<string>();
    const uniqueLogos = logos.filter((row) => {
      const key = `${row.abbreviation}|${row.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      logos: uniqueLogos,
      kpis: FALLBACK_KPIS,
      source: 'cms',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[TrustLogos] Error:', error);
    return NextResponse.json({
      logos: FALLBACK_LOGOS,
      kpis: FALLBACK_KPIS,
      source: 'fallback',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
