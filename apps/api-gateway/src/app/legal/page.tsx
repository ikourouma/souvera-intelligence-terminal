'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import Link from 'next/link';
import { Shield, FileText, Lock, Eye, Accessibility } from 'lucide-react';

const LEGAL_NODES = [
  {
    title: 'Privacy Policy',
    description: 'How we protect your sovereign data and personal identity.',
    href: '/legal/privacy',
    icon: Lock
  },
  {
    title: 'Terms of Service',
    description: 'Institutional guidelines for platform utilization and licensing.',
    href: '/legal/terms',
    icon: FileText
  },
  {
    title: 'Cookie Policy',
    description: 'Management of session nodes and technical data tools.',
    href: '/legal/cookies',
    icon: Eye
  },
  {
    title: 'Accessibility',
    description: 'Our commitment to inclusive institutional intelligence.',
    href: '/legal/accessibility',
    icon: Accessibility
  }
];

export default function LegalHubPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <section className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <div className="section-label mb-4 text-blue-500 uppercase tracking-widest">Trust & Transparency</div>
            <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Legal Hub.</h1>
            <p className="text-lg text-zinc-500 leading-relaxed">
              Institutional framework and compliance protocols for the Souvera Intelligence ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {LEGAL_NODES.map((node, i) => (
               <Link key={i} href={node.href} className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-blue-500/50 transition-all">
                  <div className="flex items-start justify-between mb-6">
                     <div className="p-3 bg-blue-500/10 rounded-sm">
                        <node.icon className="w-6 h-6 text-blue-500" />
                     </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{node.title}</h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">{node.description}</p>
               </Link>
             ))}
          </div>
        </div>
      </section>
      <SouveraFooter />
    </main>
  );
}
