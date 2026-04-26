'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const AFRICA_TOP10 = [
  { rank: 1, country: 'South Africa', iso: 'ZAF', flag: '🇿🇦', gdp: '$443.6B', growth: '+1.2%', sectors: 'Mining · Finance' },
  { rank: 2, country: 'Egypt', iso: 'EGY', flag: '🇪🇬', gdp: '$399.5B', growth: '+4.1%', sectors: 'Logistics · Tourism' },
  { rank: 3, country: 'Nigeria', iso: 'NGA', flag: '🇳🇬', gdp: '$334.3B', growth: '+3.4%', sectors: 'Oil · Fintech' },
  { rank: 4, country: 'Algeria', iso: 'DZA', flag: '🇩🇿', gdp: '$285.0B', growth: '+3.2%', sectors: 'Gas · Manufacturing' },
  { rank: 5, country: 'Morocco', iso: 'MAR', flag: '🇲🇦', gdp: '$196.1B', growth: '+3.0%', sectors: 'Auto · Aerospace' },
  { rank: 6, country: 'Kenya', iso: 'KEN', flag: '🇰🇪', gdp: '$140.9B', growth: '+5.0%', sectors: 'Fintech · Agriculture' },
  { rank: 7, country: 'Ethiopia', iso: 'ETH', flag: '🇪🇹', gdp: '$125.7B', growth: '+7.1%', sectors: 'Manufacturing · Hydro' },
  { rank: 8, country: 'Ghana', iso: 'GHA', flag: '🇬🇭', gdp: '$113.5B', growth: '+3.8%', sectors: 'Gold · Cocoa' },
  { rank: 9, country: 'Côte d\'Ivoire', iso: 'CIV', flag: '🇨🇮', gdp: '$111.5B', growth: '+6.4%', sectors: 'Cocoa · Finance' },
  { rank: 10, country: 'Angola', iso: 'AGO', flag: '🇦🇴', gdp: '$109.9B', growth: '+3.6%', sectors: 'Oil · Construction' },
];

const CARIBBEAN_TOP5 = [
  { rank: 1, country: 'Dominican Republic', flag: '🇩🇴', gdp: '$127.9B', growth: '+5.1%', sector: 'Tourism · Manufacturing' },
  { rank: 2, country: 'Trinidad & Tobago', flag: '🇹🇹', gdp: '$25.9B', growth: '+2.8%', sector: 'LNG · Petrochemicals' },
  { rank: 3, country: 'Jamaica', flag: '🇯🇲', gdp: '$22.3B', growth: '+4.2%', sector: 'Tourism · BPO' },
  { rank: 4, country: 'The Bahamas', flag: '🇧🇸', gdp: '$16.5B', growth: '+3.5%', sector: 'Tourism · Finance' },
  { rank: 5, country: 'Barbados', flag: '🇧🇧', gdp: '$8.0B', growth: '+3.1%', sector: 'Tourism · Intl Business' },
];

export function TopEconomiesSection() {
  return (
    <section className="py-24" style={{ background: '#0B0F14', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="section-label mb-2">Market Rankings · IMF 2026 Projections</div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#F9FAFB' }}>
              Largest Economies by GDP
            </h2>
          </div>
          <Link href="/terminal/economies" className="hidden md:flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase transition-colors hover:text-white" style={{ color: '#6B7280' }}>
            Full Rankings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Africa Top 10 */}
          <div className="xl:col-span-2 rounded-sm overflow-hidden" style={{ background: '#121821', border: '1px solid #1F2A37' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1F2A37', background: '#161D26' }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                <span className="text-[11px] font-bold tracking-widest uppercase font-mono" style={{ color: '#E5E7EB' }}>Africa Command</span>
              </div>
              <span className="section-label">54 Nations Indexed</span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase font-mono" style={{ borderBottom: '1px solid #1F2A37', color: '#4B5563' }}>
              <div className="col-span-1">#</div>
              <div className="col-span-4">Country</div>
              <div className="col-span-2 text-right">GDP</div>
              <div className="col-span-2 text-right">Growth</div>
              <div className="col-span-3 hidden md:block">Key Sectors</div>
            </div>

            {AFRICA_TOP10.map((e, i) => (
              <div
                key={e.rank}
                className="grid grid-cols-12 gap-2 px-5 py-3 items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
                style={{ borderBottom: i < 9 ? '1px solid rgba(31,42,55,0.5)' : 'none' }}
              >
                <div className="col-span-1">
                  <span className="rank-badge">{e.rank}</span>
                </div>
                <div className="col-span-4 flex items-center gap-2.5">
                  <span className="text-lg leading-none">{e.flag}</span>
                  <div>
                    <div className="text-[12px] font-semibold" style={{ color: '#E5E7EB' }}>{e.country}</div>
                    <div className="text-[9px] font-mono" style={{ color: '#4B5563' }}>{e.iso}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="data-value text-[12px]">{e.gdp}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[11px] font-bold font-mono" style={{ color: '#22C55E' }}>{e.growth}</span>
                </div>
                <div className="col-span-3 hidden md:block">
                  <span className="text-[10px]" style={{ color: '#6B7280' }}>{e.sectors}</span>
                </div>
              </div>
            ))}

            <div className="px-5 py-3" style={{ borderTop: '1px solid #1F2A37' }}>
              <div className="text-[9px] font-mono" style={{ color: '#374151' }}>
                Source: IMF World Economic Outlook 2026 · World Bank · Daba Finance
              </div>
            </div>
          </div>

          {/* Caribbean Top 5 */}
          <div className="rounded-sm overflow-hidden flex flex-col" style={{ background: '#121821', border: '1px solid #1F2A37' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1F2A37', background: '#161D26' }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#06B6D4' }} />
                <span className="text-[11px] font-bold tracking-widest uppercase font-mono" style={{ color: '#E5E7EB' }}>Caribbean Command</span>
              </div>
              <span className="section-label">15 Territories</span>
            </div>

            {CARIBBEAN_TOP5.map((e, i) => (
              <div
                key={e.rank}
                className="px-5 py-4 transition-colors hover:bg-white/[0.02] cursor-pointer"
                style={{ borderBottom: i < 4 ? '1px solid rgba(31,42,55,0.5)' : 'none' }}
              >
                <div className="flex items-start gap-3">
                  <span className="rank-badge">{e.rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base leading-none">{e.flag}</span>
                      <span className="text-[12px] font-semibold truncate" style={{ color: '#E5E7EB' }}>{e.country}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: '#6B7280' }}>{e.sector}</span>
                      <span className="text-[11px] font-bold font-mono" style={{ color: '#22C55E' }}>{e.growth}</span>
                    </div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: '#4B5563' }}>{e.gdp}</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-auto px-5 py-4" style={{ borderTop: '1px solid #1F2A37' }}>
              <Link href="/terminal/caribbean/economies" className="flex items-center justify-center gap-2 w-full py-3 text-[11px] font-bold tracking-widest uppercase transition-all hover:text-white" style={{ border: '1px solid #1F2A37', color: '#6B7280', background: 'transparent' }}>
                Full Caribbean Rankings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
