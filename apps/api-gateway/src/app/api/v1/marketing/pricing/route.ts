// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Public Pricing Display API
// Owner: Afronovation, Inc.
// ===========================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeCmsPricingRow } from '@/lib/access-plans';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const FALLBACK_PLANS = [
  {
    plan_id: 'explorer',
    display_name: 'Explorer',
    badge_text: 'Free',
    badge_color: '#22C55E',
    description: 'Get started with public macroeconomic data across Africa and the Caribbean.',
    features: [
      'Country profiles & GDP overview',
      'Market signal indicators',
      'Regional intelligence summaries',
      'Interactive intelligence map',
      'Caribbean overview',
    ],
    cta_text: 'Create free account',
    cta_url: '/signup',
    cta_style: 'outline',
    is_featured: false,
    price_monthly: 0,
  },
  {
    plan_id: 'professional',
    display_name: 'Professional',
    badge_text: 'Most Popular',
    badge_color: '#2563EB',
    description: 'Full macro data, sector intelligence, and expanded analysis for active analysts.',
    features: [
      'Everything in Explorer',
      'Inflation & Debt/GDP metrics',
      'Sector scores & analysis',
      'Expanded market coverage',
      'GDP forecast data',
      'Trade summary data',
      'Country comparison tools',
    ],
    cta_text: 'Request Professional Access',
    cta_url: '/access/request-access?plan=professional',
    cta_style: 'primary',
    is_featured: true,
    price_monthly: 49,
  },
  {
    plan_id: 'business',
    display_name: 'Business',
    badge_text: 'Recommended',
    badge_color: '#F59E0B',
    description: 'Full forecasts, trade data, and downloadable reports for investment teams.',
    features: [
      'Everything in Professional',
      'Full GDP forecasts & scenarios',
      'Full trade data — exports, imports, partners',
      'Sector forecasts',
      'Downloadable country reports',
      'Historical data series',
    ],
    cta_text: 'Contact Sales',
    cta_url: '/contact?plan=business&intent=upgrade',
    cta_style: 'outline',
    is_featured: false,
    price_monthly: 199,
  },
  {
    plan_id: 'institutional',
    display_name: 'Institutional',
    badge_text: 'Enterprise',
    badge_color: '#A78BFA',
    description: 'Full API access, white-label intelligence, and dedicated support for institutions.',
    features: [
      'Everything in Business',
      'Full API access',
      'White-label data feeds',
      'Custom briefings & memos',
      'Methodology documentation',
      'Dedicated account support',
    ],
    cta_text: 'Contact Sales',
    cta_url: '/access/institutional',
    cta_style: 'ghost',
    price_monthly: 1999,
  },
];

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: plans, error } = await supabase
      .from('souvera_pricing_display')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Pricing] Database error:', error);
      return NextResponse.json({
        plans: FALLBACK_PLANS,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({
        plans: FALLBACK_PLANS,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    return NextResponse.json({
      plans: plans.map((row) => normalizeCmsPricingRow(row as Record<string, unknown>)),
      source: 'cms',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Pricing] Error:', error);
    return NextResponse.json({
      plans: FALLBACK_PLANS,
      source: 'fallback',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
