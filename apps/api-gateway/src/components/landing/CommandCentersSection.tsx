'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const COMMAND_CENTERS = [
  {
    id: 'africa',
    title: 'Africa Intelligence',
    subtitle: 'Coverage Across 54 Nations',
    description: 'Comprehensive macroeconomic intelligence, country profiles, and sector analysis across the African continent.',
    href: '/intelligence/africa',
    accentColor: '#22C55E',
    metrics: [
      { label: 'Nations Covered', value: '54' },
      { label: 'GDP Coverage', value: '$3.1T' },
      { label: 'Sectors', value: '6' },
      { label: 'Status', value: 'Active' },
    ],
    dashboards: ['Country Profiles', 'Intelligence Map', 'Rankings', 'Sector Analysis'],
    cta: 'Explore Africa Intelligence',
  },
  {
    id: 'caribbean',
    title: 'Caribbean Intelligence',
    subtitle: 'Coverage Across 15 Economies',
    description: 'Caribbean economic intelligence covering tourism, energy, financial services, and CARICOM trade flows.',
    href: '/intelligence/caribbean',
    accentColor: '#06B6D4',
    metrics: [
      { label: 'Territories', value: '15' },
      { label: 'GDP Coverage', value: '$270B' },
      { label: 'Sectors', value: '5' },
      { label: 'CARICOM', value: 'Active' },
    ],
    dashboards: ['Country Profiles', 'Intelligence Map', 'Rankings', 'Sector Analysis'],
    cta: 'Explore Caribbean Intelligence',
  },
];

export function CommandCentersSection() {
  return (
    <section className="py-24" style={{ background: '#121821', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="mb-12">
          <div className="section-label mb-2">Intelligence Architecture</div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#F9FAFB' }}>
            Dual Command Centers
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {COMMAND_CENTERS.map((center) => (
            <div
              key={center.id}
              className="rounded-sm overflow-hidden flex flex-col transition-all duration-300 group"
              style={{ background: '#161D26', border: '1px solid #1F2A37' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${center.accentColor}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1F2A37'; }}
            >
              {/* Accent top line */}
              <div className="h-[2px] w-full" style={{ background: center.accentColor }} />

              {/* Header */}
              <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid #1F2A37' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: center.accentColor }} />
                      <span className="section-label">{center.subtitle}</span>
                    </div>
                    <h3 className="text-2xl font-bold" style={{ color: '#F9FAFB', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {center.title}
                    </h3>
                  </div>
                  <div className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 font-mono" style={{ background: `${center.accentColor}15`, color: center.accentColor, border: `1px solid ${center.accentColor}30` }}>
                    Live
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed" style={{ color: '#9CA3AF' }}>{center.description}</p>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-4 divide-x divide-[#1F2A37]" style={{ borderBottom: '1px solid #1F2A37' }}>
                {center.metrics.map((m) => (
                  <div key={m.label} className="px-4 py-4 text-center">
                    <div className="text-[18px] font-bold font-mono mb-1" style={{ color: '#E5E7EB' }}>{m.value}</div>
                    <div className="section-label">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Dashboard list */}
              <div className="px-8 py-5 flex-1" style={{ borderBottom: '1px solid #1F2A37' }}>
                <div className="section-label mb-3">8 Intelligence Dashboards</div>
                <div className="flex flex-wrap gap-2">
                  {center.dashboards.map((d) => (
                    <span key={d} className="text-[10px] font-mono px-3 py-1.5 rounded-sm" style={{ background: '#0B0F14', color: '#9CA3AF', border: '1px solid #1F2A37' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-8 py-5">
                <Link
                  href={center.href}
                  className="flex items-center gap-2 w-full justify-center py-4 text-[11px] font-bold tracking-widest uppercase transition-all group-hover:gap-3"
                  style={{ background: `${center.accentColor}15`, color: center.accentColor, border: `1px solid ${center.accentColor}30` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = center.accentColor; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${center.accentColor}15`; (e.currentTarget as HTMLElement).style.color = center.accentColor; }}
                >
                  {center.cta}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
