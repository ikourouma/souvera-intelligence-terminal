'use client';
import React from 'react';
import Link from 'next/link';
import { Terminal, BookOpen, Database, BarChart4, ArrowRight } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'terminal',
    name: 'Intelligence Terminal',
    tagline: 'Real-Time Macro Execution',
    description: 'The core engine of Souvera. High-fidelity geospatial intelligence, regional signal monitors, and investment-grade country dossiers.',
    icon: Terminal,
    href: '/terminal/africa',
    color: '#3B82F6',
    features: ['Live Signal Feed', 'Geospatial Mapping', 'Macro KPI Engine']
  },
  {
    id: 'research',
    name: 'Strategic Insights',
    tagline: 'Expert-Led Briefings',
    description: 'Weekly and flash research reports synthesized by our regional analysts. Admin-managed briefings on emerging transatlantic corridors.',
    icon: BookOpen,
    href: '/insights',
    color: '#A78BFA',
    features: ['Sector Drilldowns', 'Policy Analysis', 'Flash Risk Alerts']
  },
  {
    id: 'api',
    name: 'Institutional Data API',
    tagline: 'Programmatic Alpha',
    description: 'Direct WebSocket and RESTful access to our proprietary signal scores. Feed Souvera intelligence into your proprietary models.',
    icon: Database,
    href: '/docs/api',
    color: '#22C55E',
    features: ['99.9% Uptime', 'JSON/CSV Formats', 'High-Frequency Updates']
  },
  {
    id: 'advisory',
    name: 'Sovereign Advisory',
    tagline: 'Bespoke Intelligence',
    description: 'Direct access to our senior economic analysts for custom research, risk modeling, and strategic market entry assessments.',
    icon: BarChart4,
    href: '/contact',
    color: '#F59E0B',
    features: ['Custom Modeling', 'Market Entry Strategy', 'On-Demand Analysts']
  }
];

export function ProductSuiteSection() {
  return (
    <section className="py-24" style={{ background: '#0B0F14', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="section-label mb-2">Institutional Suite</div>
            <h2 className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Strategic Intelligence Solutions
            </h2>
            <p className="mt-4 text-zinc-500 leading-relaxed">
              Souvera provides a multi-layered ecosystem of products designed to deliver transparency to African and Caribbean markets. Choose the toolset that matches your institutional requirement.
            </p>
          </div>
          <Link href="/pricing" className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-sm">
            Compare Access Tiers
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCTS.map((prod) => (
            <div 
              key={prod.id}
              className="group p-10 rounded-sm transition-all duration-500 hover:border-zinc-700 relative overflow-hidden"
              style={{ background: '#121821', border: '1px solid #1F2A37' }}
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none">
                 <prod.icon className="w-full h-full" style={{ color: prod.color }} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: `${prod.color}15`, border: `1px solid ${prod.color}30` }}>
                      <prod.icon className="w-5 h-5" style={{ color: prod.color }} />
                   </div>
                   <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: prod.color }}>{prod.tagline}</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {prod.name}
                </h3>
                
                <p className="text-sm text-zinc-500 leading-relaxed mb-8 max-w-md">
                  {prod.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {prod.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full" style={{ background: prod.color }} />
                       <span className="text-[10px] text-zinc-400 uppercase font-mono">{f}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href={prod.href}
                  className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase transition-all group-hover:gap-3"
                  style={{ color: prod.color }}
                >
                  Explore Product <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
