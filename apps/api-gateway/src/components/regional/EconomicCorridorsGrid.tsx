'use client';

import { TrendingUp, Users, Building2, MapPin } from 'lucide-react';

interface EconomicCorridor {
  key: string;
  name: string;
  featured?: boolean;
  gdp: string;
  population: string;
  countries: number;
  topMarkets: string[];
  description: string;
  sectors: string[];
  colorScheme: {
    border: string;
    badge: string;
    icon: string;
  };
}

const AFRICA_CORRIDORS: EconomicCorridor[] = [
  {
    key: 'west',
    name: 'West Africa',
    featured: true,
    gdp: '$836B',
    population: '430M+',
    countries: 16,
    topMarkets: ['Nigeria', 'Ghana', 'Senegal', 'Côte d\'Ivoire'],
    description: 'The largest consumer market on the continent. Lagos — Africa\'s unrivalled fintech capital. Accra — fastest-growing tech hub. Home to ECOWAS and the engine of continental commerce.',
    sectors: ['Fintech & Digital Payments', 'Agriculture & Agribusiness', 'Energy Infrastructure', 'Consumer Goods'],
    colorScheme: {
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: 'text-blue-500',
    },
  },
  {
    key: 'east',
    name: 'East Africa',
    featured: false,
    gdp: '$380B',
    population: '470M+',
    countries: 14,
    topMarkets: ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda'],
    description: 'Fastest-growing region. Nairobi — Silicon Savannah. Kigali — governance model. M-Pesa revolutionized global mobile payments here.',
    sectors: ['Technology & Innovation', 'Tourism & Wildlife', 'Logistics & Trade'],
    colorScheme: {
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: 'text-emerald-500',
    },
  },
  {
    key: 'central',
    name: 'Central Africa',
    featured: false,
    gdp: '$260B',
    population: '200M+',
    countries: 8,
    topMarkets: ['Cameroon', 'DR Congo', 'Gabon', 'Republic of Congo'],
    description: 'The resource frontier. DRC holds 70% of global cobalt. Vast forestry and agricultural potential. Emerging logistics corridor.',
    sectors: ['Mining & Minerals', 'Forestry & Agriculture', 'Renewable Energy'],
    colorScheme: {
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: 'text-amber-500',
    },
  },
  {
    key: 'north',
    name: 'Northern Africa',
    featured: false,
    gdp: '$720B',
    population: '250M+',
    countries: 7,
    topMarkets: ['Egypt', 'Morocco', 'Algeria', 'Tunisia'],
    description: 'Gateway to Europe and the Middle East. Cairo — Africa\'s most populous city. Casablanca — financial hub. Established manufacturing powerhouse.',
    sectors: ['Manufacturing & Export', 'Energy & Gas', 'Tourism & Heritage'],
    colorScheme: {
      border: 'border-purple-500/30',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: 'text-purple-500',
    },
  },
  {
    key: 'south',
    name: 'Southern Africa',
    featured: false,
    gdp: '$680B',
    population: '190M+',
    countries: 10,
    topMarkets: ['South Africa', 'Angola', 'Zambia', 'Mozambique'],
    description: 'Most industrialized region. Johannesburg — financial capital. Rich in diamonds, platinum, and critical minerals. Vast energy transition potential.',
    sectors: ['Financial Services', 'Mining & Minerals', 'Energy Transition'],
    colorScheme: {
      border: 'border-cyan-500/30',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      icon: 'text-cyan-500',
    },
  },
];

interface EconomicCorridorsGridProps {
  title?: string;
  description?: string;
}

export function EconomicCorridorsGrid({
  title = 'Five Economic Corridors',
  description,
}: EconomicCorridorsGridProps) {
  const featuredCorridor = AFRICA_CORRIDORS.find(c => c.featured);
  const standardCorridors = AFRICA_CORRIDORS.filter(c => !c.featured);

  return (
    <section className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Regional Intelligence
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

        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Corridor (West Africa) - Spans 2 columns */}
          {featuredCorridor && (
            <div className="lg:col-span-2">
              <div
                className={`group h-full p-8 bg-zinc-900/50 border ${featuredCorridor.colorScheme.border} hover:bg-zinc-900 rounded-sm transition-all`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className={`w-8 h-8 ${featuredCorridor.colorScheme.icon}`} />
                      <h3 className="text-2xl font-bold text-white">
                        {featuredCorridor.name}
                      </h3>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${featuredCorridor.colorScheme.badge}`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Featured Corridor
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-base text-zinc-300 leading-relaxed mb-6">
                  {featuredCorridor.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm">
                    <div className="text-xs text-zinc-600 mb-1">Combined GDP</div>
                    <div className="text-2xl font-bold text-white">{featuredCorridor.gdp}</div>
                  </div>
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm">
                    <div className="text-xs text-zinc-600 mb-1">Population</div>
                    <div className="text-2xl font-bold text-white">{featuredCorridor.population}</div>
                  </div>
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm">
                    <div className="text-xs text-zinc-600 mb-1">Countries</div>
                    <div className="text-2xl font-bold text-white">{featuredCorridor.countries}</div>
                  </div>
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm">
                    <div className="text-xs text-zinc-600 mb-1">Top Markets</div>
                    <div className="text-sm font-semibold text-white">{featuredCorridor.topMarkets[0]}</div>
                  </div>
                </div>

                {/* Sectors */}
                <div>
                  <div className="text-xs text-zinc-600 mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Key Sectors
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featuredCorridor.sectors.map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded-sm"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Markets Footer */}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="text-xs text-zinc-600 mb-2">Anchor Economies</div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    {featuredCorridor.topMarkets.join(' • ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column - Stacked Cards */}
          <div className="space-y-6">
            {standardCorridors.slice(0, 2).map((corridor) => (
              <div
                key={corridor.key}
                className={`group p-6 bg-zinc-900/50 border ${corridor.colorScheme.border} hover:bg-zinc-900 rounded-sm transition-all`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Building2 className={`w-6 h-6 ${corridor.colorScheme.icon} shrink-0 mt-1`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {corridor.name}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                      {corridor.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-[10px] text-zinc-600 mb-1">GDP</div>
                    <div className="text-base font-bold text-white">{corridor.gdp}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-600 mb-1">Population</div>
                    <div className="text-base font-bold text-white">{corridor.population}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {corridor.sectors.slice(0, 2).map((sector, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-500 rounded-sm"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row - Remaining Corridors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {standardCorridors.slice(2).map((corridor) => (
            <div
              key={corridor.key}
              className={`group p-6 bg-zinc-900/50 border ${corridor.colorScheme.border} hover:bg-zinc-900 rounded-sm transition-all`}
            >
              <div className="flex items-start gap-3 mb-4">
                <Building2 className={`w-6 h-6 ${corridor.colorScheme.icon} shrink-0 mt-1`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {corridor.name}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {corridor.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-zinc-600 mb-1">GDP</div>
                  <div className="text-lg font-bold text-white">{corridor.gdp}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600 mb-1">Population</div>
                  <div className="text-lg font-bold text-white">{corridor.population}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-600 mb-1">Countries</div>
                  <div className="text-lg font-bold text-white">{corridor.countries}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-600 mb-2">Key Sectors</div>
                <div className="flex flex-wrap gap-1.5">
                  {corridor.sectors.map((sector, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-400 rounded-sm"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-zinc-600" />
                  <div className="text-xs text-zinc-500">{corridor.topMarkets.slice(0, 3).join(' • ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 p-6 bg-blue-600/5 border border-blue-500/10 rounded-sm">
          <p className="text-sm text-zinc-500 leading-relaxed">
            Africa is not monolithic. Each region presents distinct investment profiles, sector strengths, and market access opportunities. Combined GDP: <span className="text-white font-semibold">$2.9T</span>. Combined population: <span className="text-white font-semibold">1.5B</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
