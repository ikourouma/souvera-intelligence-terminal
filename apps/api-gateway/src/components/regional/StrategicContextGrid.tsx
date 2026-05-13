'use client';

import { Globe, Users, TrendingUp, Zap } from 'lucide-react';

interface ContextItem {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  stat?: string;
}

interface StrategicContextGridProps {
  region: 'africa' | 'caribbean';
  title?: string;
  description?: string;
}

const AFRICA_CONTEXT: ContextItem[] = [
  {
    icon: Globe,
    title: 'AfCFTA Opportunity',
    description: 'The African Continental Free Trade Area creates a single market of 1.4 billion people with $3.4 trillion combined GDP, unlocking unprecedented trade opportunities.',
    stat: '$3.4T Market',
  },
  {
    icon: Users,
    title: 'Demographic Dividend',
    description: 'Africa has the world\'s youngest population with a median age of 19. Rapid urbanization and growing middle class drive consumer demand.',
    stat: '1.4B People',
  },
  {
    icon: TrendingUp,
    title: 'Digital Leapfrogging',
    description: 'Mobile penetration exceeds 80% in key markets. Fintech adoption, mobile money, and e-commerce growth outpace developed markets.',
    stat: '80%+ Mobile',
  },
  {
    icon: Zap,
    title: 'Energy Transition',
    description: 'Critical minerals for EV batteries, solar energy potential, and green hydrogen opportunities position Africa as key to global energy transition.',
    stat: '6 of 10 Fastest-Growing',
  },
];

const CARIBBEAN_CONTEXT: ContextItem[] = [
  {
    icon: TrendingUp,
    title: 'Nearshoring Opportunity',
    description: 'US companies increasingly moving operations closer to home. Caribbean offers timezone alignment, cultural ties, and competitive costs.',
    stat: 'US Timezone',
  },
  {
    icon: Zap,
    title: 'Energy Transition',
    description: 'Guyana emerging as fastest-growing oil economy. Trinidad LNG exports continue. Renewable energy potential across solar and wind.',
    stat: 'Guyana Oil Boom',
  },
  {
    icon: Globe,
    title: 'CARICOM Integration',
    description: 'Caribbean Community working toward single market and economy. Trade harmonization, free movement of goods, and economic cooperation.',
    stat: '20 Territories',
  },
  {
    icon: Users,
    title: 'Diaspora Economics',
    description: 'Remittances exceed $10B annually. Diaspora investment flows, cultural bridges, and trade corridors link Caribbean to North America and Europe.',
    stat: '$10B+ Remittances',
  },
];

export function StrategicContextGrid({
  region,
  title = 'Strategic Context',
  description,
}: StrategicContextGridProps) {
  const context = region === 'africa' ? AFRICA_CONTEXT : CARIBBEAN_CONTEXT;
  const accentColor = region === 'africa' ? 'text-blue-500' : 'text-teal-500';

  return (
    <section className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${accentColor} mb-4`}>
            Context
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {context.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
              >
                <Icon className={`w-8 h-8 ${accentColor} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {item.description}
                </p>
                {item.stat && (
                  <div className="pt-4 border-t border-zinc-800">
                    <div className="text-sm font-bold text-white">
                      {item.stat}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
