'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SECTORS = [
  {
    id: 'fintech',
    name: 'Fintech & Digital Finance',
    region: 'Africa',
    marketSize: '$14B',
    cagr: '+28%',
    color: '#3B82F6',
    countries: ['Nigeria', 'Kenya', 'South Africa', 'Egypt'],
    highlights: ['Mobile Money Interop', 'B2B Payments Infrastructure', 'Regulatory Sandbox'],
    href: '/terminal/sectors#fintech',
  },
  {
    id: 'mining',
    name: 'Mining & Critical Minerals',
    region: 'Africa',
    marketSize: '$320B',
    cagr: '+12%',
    color: '#F59E0B',
    countries: ['DRC', 'South Africa', 'Zambia', 'Zimbabwe'],
    highlights: ['Cobalt · Lithium · Copper', 'EV Supply Chain', 'Critical Minerals Race'],
    href: '/terminal/sectors#mining',
  },
  {
    id: 'energy',
    name: 'Energy & Renewables',
    region: 'Africa',
    marketSize: '$28B',
    cagr: '+8%',
    color: '#22C55E',
    countries: ['Mozambique', 'Namibia', 'Nigeria', 'Tanzania'],
    highlights: ['Green Hydrogen (Namibia)', 'LNG (Mozambique)', 'Solar Grid Build-Out'],
    href: '/terminal/sectors#energy',
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Agribusiness',
    region: 'Africa',
    marketSize: '$180B',
    cagr: '+6.5%',
    color: '#10B981',
    countries: ['Ghana', 'Ethiopia', 'Côte d\'Ivoire', 'Kenya'],
    highlights: ['Cocoa · Coffee · Cashew', 'AfCFTA Corridors', 'AgriTech Platforms'],
    href: '/terminal/sectors#agriculture',
  },
  {
    id: 'tourism-caribbean',
    name: 'Tourism & Hospitality',
    region: 'Caribbean',
    marketSize: '$40B',
    cagr: '+9%',
    color: '#06B6D4',
    countries: ['Dominican Republic', 'Jamaica', 'The Bahamas', 'Barbados'],
    highlights: ['Eco-Tourism', 'Luxury Resort Development', 'Cultural Tourism'],
    href: '/terminal/caribbean/sectors#tourism',
  },
  {
    id: 'energy-caribbean',
    name: 'Energy (LNG & Oil)',
    region: 'Caribbean',
    marketSize: '$25B',
    cagr: '+5%',
    color: '#A78BFA',
    countries: ['Trinidad & Tobago', 'Guyana', 'Suriname', 'Barbados'],
    highlights: ['LNG Expansion', 'Offshore Oil (Guyana)', 'Petrochemicals'],
    href: '/terminal/caribbean/sectors#energy',
  },
];

export function SectorShowcase() {
  return (
    <section className="py-24" style={{ background: '#0B0F14', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="section-label mb-2">Sector Intelligence</div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#F9FAFB' }}>
              $600B+ Opportunity Map
            </h2>
          </div>
          <Link href="/terminal/sectors" className="hidden md:flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase transition-colors hover:text-white" style={{ color: '#6B7280' }}>
            Full Sector Intelligence <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {SECTORS.map((sector) => (
            <Link
              key={sector.id}
              href={sector.href}
              className="rounded-sm p-6 flex flex-col transition-all duration-300 group cursor-pointer"
              style={{ background: '#121821', border: '1px solid #1F2A37' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${sector.color}40`; (e.currentTarget as HTMLElement).style.background = '#161D26'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1F2A37'; (e.currentTarget as HTMLElement).style.background = '#121821'; }}
            >
              {/* Region badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 font-mono rounded-sm" style={{ background: `${sector.color}15`, color: sector.color, border: `1px solid ${sector.color}25` }}>
                  {sector.region}
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" style={{ color: sector.color }} />
              </div>

              {/* Sector name */}
              <h3 className="text-[15px] font-bold mb-1 leading-snug" style={{ color: '#E5E7EB', fontFamily: 'Space Grotesk, sans-serif' }}>
                {sector.name}
              </h3>

              {/* Metrics row */}
              <div className="flex items-center gap-4 mb-5 mt-2">
                <div>
                  <div className="section-label mb-0.5">Market Size</div>
                  <div className="data-value text-[14px]">{sector.marketSize}</div>
                </div>
                <div className="w-px h-8" style={{ background: '#1F2A37' }} />
                <div>
                  <div className="section-label mb-0.5">CAGR 5Y</div>
                  <div className="text-[14px] font-bold font-mono" style={{ color: '#22C55E' }}>{sector.cagr}</div>
                </div>
              </div>

              {/* Lead countries */}
              <div className="mb-4">
                <div className="section-label mb-2">Lead Markets</div>
                <div className="flex flex-wrap gap-1.5">
                  {sector.countries.map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-sm font-mono" style={{ background: '#1F2A37', color: '#9CA3AF' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-auto pt-4" style={{ borderTop: '1px solid #1F2A37' }}>
                {sector.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 mb-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: sector.color }} />
                    <span className="text-[11px]" style={{ color: '#6B7280' }}>{h}</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
