'use client';
import React from 'react';
import { ShieldCheck, Target, Zap, Globe, BarChart3, Users } from 'lucide-react';

const ADVANTAGES = [
  {
    title: 'Official Data Sources',
    description: 'Our data is sourced directly from IMF, World Bank, African Development Bank, Caribbean Development Bank, and official national statistical agencies.',
    icon: ShieldCheck,
    color: '#2563EB',
  },
  {
    title: 'Transatlantic Context',
    description: 'A unified intelligence platform that bridges the macroeconomic gap between African and Caribbean investment corridors.',
    icon: Globe,
    color: '#22C55E',
  },
  {
    title: 'AI-Assisted Analysis',
    description: 'Governed machine learning supports anomaly detection, source comparison, and signal clustering—always validated against official data.',
    icon: Users,
    color: '#A78BFA',
  },
  {
    title: 'Signal Intelligence',
    description: 'Our Signal Engine identifies growth vectors and risk indicators by analyzing patterns across macroeconomic data points.',
    icon: Zap,
    color: '#F59E0B',
  },
  {
    title: 'Integrated Intelligence',
    description: 'Intelligence is useless in a vacuum. Souvera integrates research directly with the decision-making terminal.',
    icon: Target,
    color: '#EC4899',
  },
  {
    title: 'Institutional Grade',
    description: 'Designed for governments, development finance institutions, and global enterprises requiring rigorous data standards.',
    icon: BarChart3,
    color: '#06B6D4',
  },
];

export function WhySouveraSection() {
  return (
    <section className="py-24" style={{ background: '#0B0F14', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="section-label mb-2">The Strategic Edge</div>
          <h2 className="text-4xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F9FAFB' }}>
            Why Souvera Intelligence?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: '#9CA3AF' }}>
            In an era of fragmented data and conflicting narratives, Souvera provides the objective truth for African and Caribbean markets. We deliver the transparency required for institutional capital to move with absolute conviction.
          </p>
        </div>

        {/* Advantage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ADVANTAGES.map((adv) => (
            <div 
              key={adv.title}
              className="p-8 rounded-sm transition-all duration-300 group hover:-translate-y-1"
              style={{ background: '#121821', border: '1px solid #1F2A37' }}
            >
              <div className="w-12 h-12 rounded-sm flex items-center justify-center mb-6 transition-colors" 
                style={{ background: `${adv.color}10`, border: `1px solid ${adv.color}25` }}
              >
                <adv.icon className="w-6 h-6" style={{ color: adv.color }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#F9FAFB', fontFamily: 'Space Grotesk, sans-serif' }}>
                {adv.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: '#9CA3AF' }}>
                {adv.description}
              </p>
              
              <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="h-[1px] w-8" style={{ background: adv.color }} />
                 <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: adv.color }}>Strategic Advantage</span>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Quote/Teaser */}
        <div className="mt-20 p-10 rounded-sm text-center relative overflow-hidden" style={{ background: '#161D26', border: '1px solid #1F2A37' }}>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />
           <div className="relative z-10 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F9FAFB' }}>
                "Objective intelligence is the foundation of the Transatlantic Corridor."
              </h3>
              <p className="text-[13px] font-mono tracking-widest uppercase" style={{ color: '#6B7280' }}>
                — Souvera Strategic Research Board
              </p>
           </div>
        </div>

      </div>
    </section>
  );
}
