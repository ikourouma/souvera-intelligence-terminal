'use client';

import { useSearchParams } from 'next/navigation';
import { isValidRegion, type RegionFilter } from '@/lib/market-coverage';

interface HeroContent {
  title: string;
  subtitle: string;
}

const HERO_CONTENT: Record<RegionFilter, HeroContent> = {
  africa: {
    title: 'Africa Intelligence Terminal',
    subtitle: 'Explore economic intelligence across 54 African markets. Select any country for detailed profiles, key metrics, and sector insights.',
  },
  caribbean: {
    title: 'Caribbean Intelligence Terminal',
    subtitle: 'Explore market intelligence across 20 Caribbean territories. Select any market for detailed profiles, key metrics, and sector insights.',
  },
  all: {
    title: 'Souvera Intelligence Terminal',
    subtitle: 'Explore economic intelligence across Africa and the Caribbean. Search, filter, and compare markets across both regions.',
  },
};

export function RegionAwareMapHero() {
  const searchParams = useSearchParams();
  const urlRegion = searchParams.get('region');
  
  // Validate and default to africa if invalid
  const region: RegionFilter = urlRegion && isValidRegion(urlRegion) ? urlRegion : 'africa';
  const content = HERO_CONTENT[region];

  return (
    <section className="pt-24 pb-10 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Intelligence Map
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {content.title}
          </h1>
          <p className="text-base lg:text-lg text-zinc-400 leading-relaxed">
            {content.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
