// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Public Feature Flags API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const DEFAULT_FLAGS: Record<string, boolean> = {
  enable_new_homepage_hero: true,
  enable_caribbean_intelligence: true,
  enable_api_access: true,
  maintenance_mode: false,
  enable_reports_download: true,
  enable_trade_intelligence: true,
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flagKey = searchParams.get('key');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('souvera_feature_flags')
      .select('flag_key, description, is_enabled, scope')
      .eq('scope', 'global');

    if (flagKey) {
      query = query.eq('flag_key', flagKey);
    }

    const { data: flags, error } = await query;

    if (error) {
      console.error('[FeatureFlags] Database error:', error);
      return NextResponse.json({
        flags: DEFAULT_FLAGS,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      });
    }

    if (!flags || flags.length === 0) {
      if (flagKey) {
        return NextResponse.json({
          enabled: DEFAULT_FLAGS[flagKey] ?? false,
          source: 'fallback',
        }, {
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
          },
        });
      }

      return NextResponse.json({
        flags: DEFAULT_FLAGS,
        source: 'fallback',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      });
    }

    if (flagKey) {
      const flag = flags.find((f) => f.flag_key === flagKey);
      return NextResponse.json({
        enabled: flag?.is_enabled ?? DEFAULT_FLAGS[flagKey] ?? false,
        source: 'cms',
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      });
    }

    const flagsMap = flags.reduce((acc, flag) => {
      acc[flag.flag_key] = flag.is_enabled;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      flags: { ...DEFAULT_FLAGS, ...flagsMap },
      source: 'cms',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[FeatureFlags] Error:', error);
    return NextResponse.json({
      flags: DEFAULT_FLAGS,
      source: 'fallback',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30',
      },
    });
  }
}
