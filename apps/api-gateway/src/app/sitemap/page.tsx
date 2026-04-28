'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import Link from 'next/link';
import { Map, Zap, Building2, TrendingUp, ShieldCheck, Info } from 'lucide-react';

const SITEMAP_GROUPS = [
  {
    title: 'Intelligence Command',
    icon: Map,
    links: [
      { name: 'Africa Command Center', href: '/africa-command-center' },
      { name: 'Caribbean Command Center', href: '/caribbean-command-center' },
      { name: 'Intelligence Map Briefing', href: '/intelligence-map' },
      { name: 'Functional Africa Terminal', href: '/terminal/africa' },
      { name: 'Functional Caribbean Terminal', href: '/terminal/caribbean' },
    ]
  },
  {
    title: 'Sector Intelligence',
    icon: Building2,
    links: [
      { name: 'Sector Intelligence Overview', href: '/sector-intelligence' },
      { name: 'Energy & Renewables', href: '/sector/energy-&-renewables' },
      { name: 'Mining & Critical Minerals', href: '/sector/mining-&-critical-minerals' },
      { name: 'Fintech & Digital Finance', href: '/sector/fintech-&-digital-finance' },
      { name: 'Tourism & Hospitality', href: '/sector/tourism-&-hospitality' },
    ]
  },
  {
    title: 'Market Intelligence',
    icon: TrendingUp,
    links: [
      { name: 'Signal Engine Briefing', href: '/signal-engine' },
      { name: 'Growth Market Rankings', href: '/terminal/africa#signals' },
      { name: 'Risk Index Monitoring', href: '/terminal/africa#risk' },
      { name: 'Subscription Plans', href: '/subscriptions' },
    ]
  },
  {
    title: 'Institutional',
    icon: Info,
    links: [
      { name: 'About Souvera', href: '/about' },
      { name: 'Data Sources & Methodology', href: '/Data-Sources-&-Methodology' },
      { name: 'Institutional Signal Ledger', href: '/source-registry' },
      { name: 'API Documentation', href: '/api-documentation' },
    ]
  },
  {
    title: 'Compliance Hub',
    icon: ShieldCheck,
    links: [
      { name: 'Privacy Policy', href: '/compliance/privacy-policy' },
      { name: 'Terms of Service', href: '/compliance/terms-of-service' },
      { name: 'Cookie Policy', href: '/compliance/cookie-policy' },
      { name: 'Accessibility Statement', href: '/compliance/accessibility' },
    ]
  }
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <section className="pt-32 pb-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <div className="section-label mb-4 text-blue-500">Navigation Matrix</div>
            <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Sitemap.</h1>
            <p className="text-lg text-zinc-500 leading-relaxed">
              Institutional directory for the Souvera Intelligence ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {SITEMAP_GROUPS.map((group, i) => (
               <div key={i} className="p-8 bg-[#121821] border border-zinc-800 rounded-sm">
                  <div className="flex items-center gap-3 mb-8">
                     <group.icon className="w-5 h-5 text-blue-500" />
                     <h2 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{group.title}</h2>
                  </div>
                  <ul className="space-y-4">
                     {group.links.map((link, j) => (
                       <li key={j}>
                          <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                             <Zap className="w-3 h-3 text-zinc-800 group-hover:text-blue-500 transition-colors" />
                             {link.name}
                          </Link>
                       </li>
                     ))}
                  </ul>
               </div>
             ))}
          </div>
        </div>
      </section>
      <SouveraFooter />
    </main>
  );
}
