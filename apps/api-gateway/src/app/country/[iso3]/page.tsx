import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { resolveUserAccess } from '@souvera/entitlements';
import { createServerClient } from '@/lib/supabase/server';
import {
  canAccessCountryTerminal,
  requestAccessForCountryHref,
} from '@/lib/intelligence/routing';
import { CountryIntelligencePanelV2 } from '@/components/intelligence/CountryIntelligencePanelV2';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';

interface CountryPageProps {
  params: Promise<{
    iso3: string;
  }>;
}

export const dynamic = 'force-dynamic';

/**
 * Country Intelligence Panel - Full Page Mode
 * Route: /country/[iso3]
 * 
 * Bloomberg-grade terminal with 7-tab system
 * Entitlement-gated for all user tiers
 */
export default async function CountryPage({ params }: CountryPageProps) {
  const { iso3 } = await params;
  const iso3Upper = iso3.toUpperCase();

  if (!iso3 || iso3.length !== 3) {
    notFound();
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const access = await resolveUserAccess(supabase, user?.id);

  if (!canAccessCountryTerminal(access.isAuthenticated, access.planRank)) {
    redirect(
      requestAccessForCountryHref({
        iso3: iso3Upper,
        source: 'country-direct',
      })
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <SouveraMegaNav />

      <div className="pt-20">
        <Suspense fallback={<LoadingState />}>
          <CountryIntelligencePanelV2
            iso3={iso3Upper}
            mode="full-page"
            userEntitlements={access.entitlements}
            planId={access.planId}
            className="max-w-[1600px] mx-auto"
          />
        </Suspense>
      </div>

      <SouveraFooter />
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-zinc-400">Loading intelligence terminal...</p>
      </div>
    </div>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: CountryPageProps) {
  const { iso3 } = await params;
  
  // In production, fetch country name from database
  // For now, use ISO3 as fallback
  const countryName = iso3.toUpperCase();

  return {
    title: `${countryName} Intelligence | Souvera Terminal`,
    description: `Comprehensive intelligence on ${countryName} - economic indicators, sector analysis, investment opportunities, and bilateral trade intelligence.`,
    openGraph: {
      title: `${countryName} Intelligence Terminal`,
      description: `Bloomberg-grade intelligence for ${countryName} - AGOA, AfCFTA, trade flows, and investment analysis.`,
    },
  };
}
