'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import Link from 'next/link';
import { Map, Zap, Building2, TrendingUp, ShieldCheck, Info, Terminal, Database, Layers } from 'lucide-react';

const SITEMAP_GROUPS = [
  {
    title: 'Platform',
    icon: Terminal,
    links: [
      { name: 'Platform Overview', href: '/platform' },
      { name: 'Intelligence Terminal', href: '/platform/terminal' },
      { name: 'Signal Engine', href: '/platform/signal-engine' },
      { name: 'Data Foundation', href: '/platform/data-foundation' },
      { name: 'API Access', href: '/platform/api' },
    ]
  },
  {
    title: 'Intelligence',
    icon: Map,
    links: [
      { name: 'Intelligence Overview', href: '/intelligence' },
      { name: 'Africa Intelligence', href: '/intelligence/africa' },
      { name: 'Caribbean Intelligence', href: '/intelligence/caribbean' },
      { name: 'Intelligence Map', href: '/intelligence/map' },
      { name: 'Country Comparison', href: '/intelligence/compare' },
    ]
  },
  {
    title: 'Sectors',
    icon: Building2,
    links: [
      { name: 'Sector Intelligence Overview', href: '/sectors' },
      { name: 'Fintech', href: '/sectors/fintech' },
      { name: 'Critical Minerals', href: '/sectors/critical-minerals' },
      { name: 'Energy', href: '/sectors/energy' },
      { name: 'Agriculture', href: '/sectors/agriculture' },
      { name: 'Logistics', href: '/sectors/logistics' },
    ]
  },
  {
    title: 'Insights',
    icon: TrendingUp,
    links: [
      { name: 'Insights Overview', href: '/insights' },
      { name: 'Executive Briefings', href: '/insights/briefings' },
      { name: 'Market Rankings', href: '/insights/rankings' },
      { name: 'Data Methodology', href: '/insights/methodology' },
    ]
  },
  {
    title: 'Access',
    icon: Layers,
    links: [
      { name: 'Access Plans', href: '/access' },
      { name: 'Request Access', href: '/access/request-access' },
      { name: 'Request Demo', href: '/access/request-demo' },
      { name: 'Institutional Solutions', href: '/access/institutional' },
    ]
  },
  {
    title: 'Resources',
    icon: Database,
    links: [
      { name: 'Resources Overview', href: '/resources' },
      { name: 'Data Sources', href: '/resources/data-sources' },
      { name: 'Source Registry', href: '/resources/source-registry' },
      { name: 'Compliance', href: '/resources/compliance' },
      { name: 'FAQ', href: '/resources/faq' },
      { name: 'System Status', href: '/status' },
    ]
  },
  {
    title: 'Company',
    icon: Info,
    links: [
      { name: 'About Souvera', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ]
  },
  {
    title: 'Legal',
    icon: ShieldCheck,
    links: [
      { name: 'Legal Overview', href: '/legal' },
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
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
