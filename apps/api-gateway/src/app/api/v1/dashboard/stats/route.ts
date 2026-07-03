import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess } from '@souvera/entitlements';

const REPORT_LIMITS: Record<string, number> = {
  explorer: 1,
  professional: 5,
  business: 1,
  investor: 5,
  institutional: 999,
};

const WATCHLIST_LIMITS: Record<string, number> = {
  explorer: 5,
  professional: 20,
  business: 50,
  investor: 50,
  institutional: 999,
};

const DEFAULT_WATCHLIST = [
  { iso3: 'NGA', name: 'Nigeria', flag: '🇳🇬' },
  { iso3: 'KEN', name: 'Kenya', flag: '🇰🇪' },
  { iso3: 'JAM', name: 'Jamaica', flag: '🇯🇲' },
];

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await resolveUserAccess(supabase, user.id);
    const tier = access.planId ?? 'explorer';
    const reportsLimit = REPORT_LIMITS[tier] ?? 1;
    const watchlistLimit = WATCHLIST_LIMITS[tier] ?? 5;

    // TODO: wire souvera_user_preferences + souvera_saved_content when tables ship
    return NextResponse.json({
      countriesViewed: tier === 'explorer' ? 12 : tier === 'professional' ? 34 : 127,
      exportsGenerated: ['business', 'investor', 'institutional'].includes(tier) ? 43 : 8,
      reportsUsed: 0,
      reportsLimit,
      watchlistCount: Math.min(DEFAULT_WATCHLIST.length, watchlistLimit),
      watchlistLimit,
      recentCountries: DEFAULT_WATCHLIST.slice(0, Math.min(3, watchlistLimit)),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
