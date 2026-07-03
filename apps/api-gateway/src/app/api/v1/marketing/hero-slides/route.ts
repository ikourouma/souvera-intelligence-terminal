// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Public Hero Slides API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    badge: 'Intelligence Platform',
    title: 'The Africa &\nCaribbean\nDecision Engine.',
    subtitle: 'Institutional-grade macroeconomic intelligence for governments, investors, and enterprises across African and Caribbean markets.',
    cta_primary_label: 'Explore Platform',
    cta_primary_url: '/platform',
    cta_secondary_label: 'Request Access',
    cta_secondary_url: '/access/request-access',
    stat_1_value: '50+',
    stat_1_label: 'Markets Covered',
    stat_2_value: '6',
    stat_2_label: 'Key Sectors',
    ticker_items: ['ZAF ▲ 1.2%', 'NGA ▲ 3.4%', 'KEN ▲ 5.0%', 'ETH ▲ 7.1%'],
    accent_color: '#2563EB',
    background_image_url: null,
  },
  {
    id: 'fallback-2',
    badge: 'Regional Intelligence',
    title: 'Africa-Caribbean\nTrade Intelligence.\nPowered by Data.',
    subtitle: 'Connecting institutional capital with comprehensive intelligence across the transatlantic trade corridor — from Lagos to Kingston.',
    cta_primary_label: 'Africa Intelligence',
    cta_primary_url: '/intelligence/africa',
    cta_secondary_label: 'Caribbean Intelligence',
    cta_secondary_url: '/intelligence/caribbean',
    stat_1_value: '$1.9T',
    stat_1_label: 'Sub-Saharan GDP',
    stat_2_value: '$270B',
    stat_2_label: 'Caribbean GDP',
    ticker_items: ['DOM ▲ 5.1%', 'JAM ▲ 4.2%', 'GUY ▲ 6.2%', 'TTO LNG'],
    accent_color: '#0891B2',
    background_image_url: null,
  },
  {
    id: 'fallback-3',
    badge: 'Sector Intelligence',
    title: 'Strategic Sectors.\nData-Driven\nInsights.',
    subtitle: 'From African fintech to Caribbean energy — Souvera delivers the intelligence institutional investors need to move with conviction.',
    cta_primary_label: 'Explore Sectors',
    cta_primary_url: '/sectors',
    cta_secondary_label: 'Request Demo',
    cta_secondary_url: '/access/request-demo',
    stat_1_value: '$14B',
    stat_1_label: 'Fintech Market',
    stat_2_value: '$320B',
    stat_2_label: 'Mining & Minerals',
    ticker_items: ['Mining ▲ 12.4%', 'Fintech ▲ 28%', 'Energy ▲ 8.1%', 'Agri ▲ 6.5%'],
    accent_color: '#16A34A',
    background_image_url: null,
  },
];

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: slides, error } = await supabase
      .from('souvera_hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[HeroSlides] Database error:', error);
      return NextResponse.json({
        slides: FALLBACK_SLIDES,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    if (!slides || slides.length === 0) {
      return NextResponse.json({
        slides: FALLBACK_SLIDES,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    return NextResponse.json({
      slides,
      source: 'cms',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[HeroSlides] Error:', error);
    return NextResponse.json({
      slides: FALLBACK_SLIDES,
      source: 'fallback',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
