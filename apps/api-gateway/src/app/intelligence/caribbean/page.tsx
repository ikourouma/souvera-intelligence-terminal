import type { Metadata } from 'next';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { RegionalHeroCommand } from '@/components/regional/RegionalHeroCommand';
import { StrategicPositionDiagram } from '@/components/regional/StrategicPositionDiagram';
import { SouveraMapWorkspace } from '@/components/intelligence/SouveraMapWorkspace';
import { SectorLandscapeGrid } from '@/components/regional/SectorLandscapeGrid';
import { StrategicContextGrid } from '@/components/regional/StrategicContextGrid';
import { TrustSourceLayer } from '@/components/regional/TrustSourceLayer';
import { AccessCTABlock } from '@/components/regional/AccessCTABlock';

export const metadata: Metadata = {
  title: 'Caribbean Intelligence | Souvera',
  description: 'Market intelligence across 20 Caribbean territories. Tourism, energy, financial services, and CARICOM trade data for institutional decision-makers.',
  keywords: ['Caribbean investment', 'Caribbean markets', 'Caribbean economy', 'CARICOM', 'Caribbean GDP', 'nearshoring Caribbean', 'Caribbean energy'],
  openGraph: {
    title: 'Caribbean Intelligence | Souvera',
    description: 'Institutional-grade intelligence across 20 Caribbean territories. Strategic gateway for tourism, energy, and nearshoring opportunities.',
    url: 'https://souvera.vercel.app/intelligence/caribbean',
    type: 'website',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/intelligence/caribbean',
  },
};

export default function CaribbeanPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      {/* Hero Command Bar */}
      <RegionalHeroCommand
        region="caribbean"
        eyebrow="Caribbean Intelligence"
        headline="Caribbean Intelligence Command."
        body="Institutional-grade intelligence across Caribbean markets and corridors, connecting tourism, energy, trade, financial services, nearshoring, and diaspora-linked economic flows."
        metrics={[
          { value: '20',   label: 'Territories' },
          { value: '$270B', label: 'Combined GDP' },
          { value: '44M',  label: 'Population' },
          { value: '5',    label: 'Key Sectors' },
        ]}
        scrollToGridId="markets"
      />

      {/* Strategic Position Diagram */}
      <StrategicPositionDiagram
        title="Strategic Corridor Positioning"
        description="The Caribbean serves as a strategic gateway connecting the Americas, Europe, and Africa. Geographic positioning enables unique corridor opportunities."
      />

      {/* Caribbean Map Workspace */}
      <section id="markets" className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-8">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-teal-500 mb-4">
              Caribbean
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Explore Caribbean Markets
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl">
              Interactive market intelligence across 20 Caribbean territories. Select any country for detailed profiles, key metrics, and sector insights.
            </p>
          </div>

          <SouveraMapWorkspace 
            region="caribbean" 
            workspaceLabel="Caribbean Intelligence Terminal"
            showTopNav={false}
            embedded={true}
          />
        </div>
      </section>

      {/* Sector Landscape */}
      <SectorLandscapeGrid
        region="caribbean"
        title="Sector Landscape"
        description="Caribbean's key growth sectors from tourism to energy. Market intelligence for strategic sector decisions."
      />

      {/* Strategic Context */}
      <StrategicContextGrid
        region="caribbean"
        title="Why Caribbean Now"
        description="Strategic context for institutional decision-makers. Nearshoring opportunity, energy transition, CARICOM integration, and diaspora economics."
      />

      {/* Trust & Source Layer */}
      <TrustSourceLayer
        region="caribbean"
        title="Data Sources & Credibility"
      />

      {/* Access CTA */}
      <AccessCTABlock
        region="caribbean"
        headline="Access Caribbean Intelligence"
        subheadline="From market screening to investment memos — get the institutional-grade intelligence you need."
      />

      <SouveraFooter />
    </main>
  );
}
