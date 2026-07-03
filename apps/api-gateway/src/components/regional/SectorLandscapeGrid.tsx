'use client';

import Link from 'next/link';
import { TrendingUp, Zap, Gem, Sprout, Ship, Plane } from 'lucide-react';

interface Sector {
  key: string;
  name: string;
  description: string;
  keyCountries: string[];
  signal: 'high_growth' | 'emerging' | 'stable' | 'developing';
  icon: React.ComponentType<any>;
  link?: string;
}

interface SectorLandscapeGridProps {
  region: 'africa' | 'caribbean';
  title?: string;
  description?: string;
}

const AFRICA_SECTORS: Sector[] = [
  {
    key: 'fintech',
    name: 'Fintech',
    description: 'Mobile money platforms, digital banking, and pan-African payment systems driving financial inclusion.',
    keyCountries: ['Nigeria', 'Kenya', 'South Africa'],
    signal: 'high_growth',
    icon: TrendingUp,
    link: '/sectors/fintech',
  },
  {
    key: 'energy',
    name: 'Energy',
    description: 'Oil & gas production, renewable energy development, and grid infrastructure expansion across the continent.',
    keyCountries: ['Nigeria', 'Angola', 'South Africa'],
    signal: 'emerging',
    icon: Zap,
    link: '/sectors/energy',
  },
  {
    key: 'critical-minerals',
    name: 'Mining & Critical Minerals',
    description: 'Cobalt, lithium, rare earths, and battery metals essential for global energy transition.',
    keyCountries: ['DRC', 'South Africa', 'Zimbabwe'],
    signal: 'high_growth',
    icon: Gem,
    link: '/sectors/critical-minerals',
  },
  {
    key: 'agriculture',
    name: 'Agriculture & Agritech',
    description: 'Food security initiatives, export crops, processing facilities, and agricultural technology adoption.',
    keyCountries: ['Ethiopia', 'Kenya', 'Côte d\'Ivoire'],
    signal: 'stable',
    icon: Sprout,
    link: '/sectors/agriculture',
  },
  {
    key: 'logistics',
    name: 'Logistics & Trade',
    description: 'AfCFTA trade corridors, port development, aviation expansion, and cross-border infrastructure.',
    keyCountries: ['Kenya', 'South Africa', 'Morocco'],
    signal: 'emerging',
    icon: Ship,
    link: '/sectors/logistics',
  },
  {
    key: 'tourism',
    name: 'Tourism & Hospitality',
    description: 'Safari tourism, coastal resorts, business travel, and hospitality infrastructure development.',
    keyCountries: ['South Africa', 'Kenya', 'Tanzania'],
    signal: 'stable',
    icon: Plane,
    link: '/sectors/tourism-hospitality',
  },
];

const CARIBBEAN_SECTORS: Sector[] = [
  {
    key: 'tourism',
    name: 'Tourism & Hospitality',
    description: 'Cruise tourism, resort development, eco-tourism, and business travel infrastructure across the region.',
    keyCountries: ['Bahamas', 'Jamaica', 'Barbados'],
    signal: 'stable',
    icon: Plane,
    link: '/sectors/tourism-hospitality',
  },
  {
    key: 'energy',
    name: 'Energy & LNG',
    description: 'Trinidad LNG exports, Guyana offshore oil boom, and renewable energy transition initiatives.',
    keyCountries: ['Trinidad & Tobago', 'Guyana', 'Jamaica'],
    signal: 'high_growth',
    icon: Zap,
    link: '/sectors/energy',
  },
  {
    key: 'fintech',
    name: 'Fintech & Digital Finance',
    description: 'Digital payments, CBDC pilots, remittance corridors, and nearshore financial services — aligned with Jamaica\'s lead sector.',
    keyCountries: ['Jamaica', 'Barbados', 'Trinidad & Tobago'],
    signal: 'high_growth',
    icon: TrendingUp,
    link: '/sectors/fintech',
  },
  {
    key: 'bpo',
    name: 'BPO & Nearshoring',
    description: 'Call centers, shared services, technology hubs, and nearshore operations for US/European markets.',
    keyCountries: ['Jamaica', 'Barbados', 'Dominican Republic'],
    signal: 'emerging',
    icon: Ship,
    link: '/sectors/digital-infrastructure',
  },
  {
    key: 'logistics',
    name: 'Trade & Logistics',
    description: 'CARICOM trade facilitation, port hubs, free trade zones, and regional logistics networks.',
    keyCountries: ['Trinidad & Tobago', 'Jamaica', 'Bahamas'],
    signal: 'stable',
    icon: Ship,
    link: '/sectors/logistics',
  },
  {
    key: 'agriculture',
    name: 'Agro-Export & Blue Economy',
    description: 'Specialty crops, agro-processing, fisheries, and sustainable marine economy — key to Jamaica and regional food security.',
    keyCountries: ['Jamaica', 'Dominican Republic', 'Guyana'],
    signal: 'stable',
    icon: Sprout,
    link: '/sectors/agriculture',
  },
];

const getSignalColor = (signal: string) => {
  switch (signal) {
    case 'high_growth':
      return 'text-emerald-500';
    case 'emerging':
      return 'text-blue-500';
    case 'stable':
      return 'text-zinc-500';
    case 'developing':
      return 'text-amber-500';
    default:
      return 'text-zinc-600';
  }
};

const getSignalLabel = (signal: string) => {
  switch (signal) {
    case 'high_growth':
      return 'High Growth';
    case 'emerging':
      return 'Emerging';
    case 'stable':
      return 'Stable';
    case 'developing':
      return 'Developing';
    default:
      return 'N/A';
  }
};

export function SectorLandscapeGrid({
  region,
  title = 'Sector Landscape',
  description,
}: SectorLandscapeGridProps) {
  const sectors = region === 'africa' ? AFRICA_SECTORS : CARIBBEAN_SECTORS;
  const accentColor = region === 'africa' ? 'text-blue-500' : 'text-teal-500';

  return (
    <section className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${accentColor} mb-4`}>
            Sectors
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-lg text-zinc-400 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const signalColor = getSignalColor(sector.signal);
            const signalLabel = getSignalLabel(sector.signal);

            const CardContent = (
              <>
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-8 h-8 ${signalColor}`} />
                  <div
                    className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${signalColor} bg-current/10`}
                  >
                    {signalLabel}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {sector.name}
                </h3>

                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {sector.description}
                </p>

                <div className="pt-4 border-t border-zinc-800">
                  <div className="text-xs text-zinc-600 mb-2">Key Markets</div>
                  <div className="flex flex-wrap gap-2">
                    {sector.keyCountries.map((country) => (
                      <span
                        key={country}
                        className="text-xs text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded-sm"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );

            if (sector.link) {
              return (
                <Link
                  key={sector.key}
                  href={sector.link}
                  className="group p-6 bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900 rounded-sm transition-all"
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={sector.key}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
