import type { Metadata } from 'next';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { RegionalHeroCommand } from '@/components/regional/RegionalHeroCommand';
import { EconomicCorridorsGrid } from '@/components/regional/EconomicCorridorsGrid';
import { SouveraMapWorkspace } from '@/components/intelligence/SouveraMapWorkspace';
import { SectorLandscapeGrid } from '@/components/regional/SectorLandscapeGrid';
import { StrategicContextGrid } from '@/components/regional/StrategicContextGrid';
import { TrustSourceLayer } from '@/components/regional/TrustSourceLayer';
import { AccessCTABlock } from '@/components/regional/AccessCTABlock';

export const metadata: Metadata = {
  title: 'Africa Intelligence | Souvera',
  description: 'Comprehensive market intelligence across 54 African nations. GDP data, growth indicators, sector analysis, and investment landscape for institutional decision-makers.',
  keywords: ['Africa investment', 'African markets', 'Africa GDP', 'African economy', 'FDI Africa', 'emerging markets Africa', 'AfCFTA', 'Africa sectors'],
  openGraph: {
    title: 'Africa Intelligence | Souvera',
    description: 'Institutional-grade intelligence across 54 African nations. From market screening to investment memos.',
    url: 'https://souvera.vercel.app/intelligence/africa',
    type: 'website',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/intelligence/africa',
  },
};

export default function AfricaPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      {/* Hero Command Bar */}
      <RegionalHeroCommand
        region="africa"
        eyebrow="Africa Intelligence"
        headline="Africa Intelligence Command."
        body="Institutional-grade intelligence across 54 African markets, combining country profiles, macro indicators, sector signals, and strategic context for investors, governments, and enterprises."
        metrics={[
          { value: '54',   label: 'African Nations' },
          { value: '$3.1T', label: 'Combined GDP' },
          { value: '1.4B', label: 'Population' },
          { value: '6',    label: 'Key Sectors' },
        ]}
        scrollToGridId="markets"
      />

      {/* Five Economic Corridors */}
      <EconomicCorridorsGrid
        title="Five Economic Corridors"
        description="Africa is not monolithic. Each region presents distinct investment profiles, sector strengths, and market access opportunities."
      />

      {/* Africa Map Workspace */}
      <section id="markets" className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-8">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Africa
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Explore Africa Markets
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl">
              Interactive map intelligence across 54 African nations. Select any country for detailed profiles, key metrics, and sector insights.
            </p>
          </div>

          <SouveraMapWorkspace 
            region="africa" 
            workspaceLabel="Africa Intelligence Terminal"
            showTopNav={false}
            embedded={true}
          />
        </div>
      </section>

      {/* Sector Landscape */}
      <SectorLandscapeGrid
        region="africa"
        title="Sector Landscape"
        description="Africa's key growth sectors from fintech to critical minerals. Market intelligence for strategic sector decisions."
      />

      {/* Strategic Context */}
      <StrategicContextGrid
        region="africa"
        title="Why Africa Now"
        description="Strategic context for institutional decision-makers. AfCFTA opportunity, demographic dividend, digital leapfrogging, and energy transition."
      />

      {/* Trust & Source Layer */}
      <TrustSourceLayer
        region="africa"
        title="Data Sources & Credibility"
      />

      {/* Access CTA */}
      <AccessCTABlock
        region="africa"
        headline="Access Africa Intelligence"
        subheadline="From market screening to investment memos — get the institutional-grade intelligence you need."
      />

      <SouveraFooter />
    </main>
  );
}
