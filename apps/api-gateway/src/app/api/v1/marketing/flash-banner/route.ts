// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Public Flash Banner API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const FALLBACK_BANNER = {
  id: 'fallback-banner',
  label: 'Now Live',
  message: 'Souvera Intelligence Terminal — Africa & Caribbean market intelligence now available.',
  banner_type: 'info',
  link_text: 'Explore Platform',
  link_url: '/platform',
  background_gradient: 'linear-gradient(90deg, #1d4ed8 0%, #1e3a8a 40%, #166534 100%)',
};

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const now = new Date().toISOString();

    const { data: banners, error } = await supabase
      .from('souvera_flash_banners')
      .select('*')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('display_order', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[FlashBanner] Database error:', error);
      return NextResponse.json({
        banner: FALLBACK_BANNER,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    if (!banners || banners.length === 0) {
      return NextResponse.json({
        banner: FALLBACK_BANNER,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    return NextResponse.json({
      banner: banners[0],
      source: 'cms',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[FlashBanner] Error:', error);
    return NextResponse.json({
      banner: FALLBACK_BANNER,
      source: 'fallback',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
