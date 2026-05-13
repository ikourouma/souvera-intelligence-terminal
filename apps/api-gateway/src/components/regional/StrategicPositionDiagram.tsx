'use client';

import { ArrowRight, Globe, MapPin, TrendingUp } from 'lucide-react';

interface StrategicPositionDiagramProps {
  title?: string;
  description?: string;
}

const CORRIDORS = [
  {
    name: 'US-Caribbean Trade Corridor',
    description: 'Direct access to 330M US consumers. Timezone alignment for business operations. Nearshoring for services and manufacturing.',
    icon: ArrowRight,
    color: 'emerald',
  },
  {
    name: 'European Tourism Corridor',
    description: 'Established tourism flows from UK, Germany, France. Cruise industry hub. Resort and hospitality infrastructure.',
    icon: Globe,
    color: 'blue',
  },
  {
    name: 'Transatlantic Energy Corridor',
    description: 'Trinidad LNG exports to Europe and Asia. Guyana offshore oil boom. Energy transition investments.',
    icon: TrendingUp,
    color: 'amber',
  },
  {
    name: 'Africa-Caribbean Diaspora Link',
    description: 'Cultural and economic ties. Remittance flows. Trade opportunities. Pan-African diaspora networks.',
    icon: MapPin,
    color: 'purple',
  },
];

export function StrategicPositionDiagram({
  title = 'Strategic Corridor Positioning',
  description,
}: StrategicPositionDiagramProps) {
  return (
    <section className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-teal-500 mb-4">
            Strategic Position
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
          {!description && (
            <p className="text-lg text-zinc-400 max-w-3xl">
              The Caribbean serves as a strategic gateway connecting the Americas, Europe, and Africa. Geographic positioning enables unique corridor opportunities.
            </p>
          )}
        </div>

        {/* Corridor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORRIDORS.map((corridor) => {
            const Icon = corridor.icon;
            const colorClass = {
              emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
              blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
              amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
              purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
              teal: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
            }[corridor.color] || 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';

            return (
              <div
                key={corridor.name}
                className={`p-6 rounded-sm border ${colorClass}`}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`w-8 h-8 shrink-0 mt-1 ${colorClass.split(' ')[0]}`} />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-3">
                      {corridor.name}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {corridor.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gateway Visual */}
        <div className="mt-12 p-8 bg-teal-500/5 border border-teal-500/20 rounded-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              Gateway Advantage
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Caribbean nations benefit from proximity to major markets, established trade routes, cultural ties to multiple continents, and strategic positioning for energy and logistics flows.
            </p>
            <div className="mt-6 flex items-center justify-center gap-8 text-sm text-zinc-500">
              <div>
                <div className="text-2xl font-bold text-white mb-1">2-4h</div>
                <div>Flight to US East Coast</div>
              </div>
              <div className="w-px h-12 bg-zinc-800"></div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">US TZ</div>
                <div>Timezone Aligned</div>
              </div>
              <div className="w-px h-12 bg-zinc-800"></div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">$270B</div>
                <div>Combined GDP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
