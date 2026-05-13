import type { Metadata } from 'next';
import { FlashBanner } from '@/components/ui/FlashBanner';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraHero } from '@/components/landing/SouveraHero';
import { TopEconomiesSection } from '@/components/landing/TopEconomiesSection';
import { PricingTiersSection } from '@/components/landing/PricingTiersSection';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { CommandCentersSection } from '@/components/landing/CommandCentersSection';
import { SectorShowcase } from '@/components/landing/SectorShowcase';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { SystemTickerStrip } from '@/components/landing/SystemTickerStrip';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { WhySouveraSection } from '@/components/landing/WhySouveraSection';
import { IntelligenceInfographic } from '@/components/visuals/IntelligenceInfographic';
import { ProductSuiteSection } from '@/components/landing/ProductSuiteSection';
import { InsightsShowcase } from '@/components/landing/InsightsShowcase';
import { ComplianceBanner } from '@/components/ui/ComplianceBanner';
import { organizationSchema, webSiteSchema, generateJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Souvera Intelligence Terminal | Macroeconomic Intelligence for Africa & Caribbean',
  description: 'Institutional-grade macroeconomic intelligence for African and Caribbean markets. Country profiles, sector analysis, and market data for governments, investors, and enterprises.',
  openGraph: {
    title: 'Souvera Intelligence Terminal',
    description: 'Institutional-grade macroeconomic intelligence for African and Caribbean markets.',
    url: 'https://souvera.vercel.app',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#0B0F14' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(webSiteSchema) }}
      />

      {/* Global announcement banner — admin managed via Supabase */}
      <FlashBanner />

      {/* Mega navigation */}
      <SouveraMegaNav />

      {/* Hero — admin-managed slides (Supabase hero_slides table) */}
      <SouveraHero />

      {/* Live macro ticker strip */}
      <SystemTickerStrip />
      
      {/* Why Souvera Section — Bloomberg Intelligence inspired */}
      <WhySouveraSection />

      {/* Intelligence Pipeline Infographic */}
      <IntelligenceInfographic />

      {/* Product Suite — Institutional Solutions */}
      <ProductSuiteSection />

      {/* Strategic Insights — Research & Briefings */}
      <InsightsShowcase />

      {/* Africa & Caribbean Command Centers */}
      <CommandCentersSection />

      {/* Top Economies — Africa Top 10 + Caribbean Top 5 */}
      <TopEconomiesSection />

      {/* Sector Intelligence — 6 sectors */}
      <SectorShowcase />

      {/* Pricing Tiers — no dollar amounts, Supabase-managed */}
      <PricingTiersSection />

      {/* Trust / Data Sources strip */}
      <TrustStrip />

      {/* Newsletter + final CTA */}
      <NewsletterSection />

      {/* Footer — same structure as AfDEC */}
      <SouveraFooter />

      {/* Persistent Compliance Disclosure */}
      <ComplianceBanner />
    </main>
  );
}
