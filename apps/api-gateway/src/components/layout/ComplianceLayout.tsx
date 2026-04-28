'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';

interface Props {
  title: string;
  content: string;
}

export function ComplianceLayout({ title, content }: Props) {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <section className="pt-32 pb-24 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="section-label mb-4 text-blue-500 uppercase tracking-widest">Compliance Hub</div>
          <h1 className="text-4xl font-bold mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h1>
          <div className="prose prose-invert prose-zinc max-w-none">
            <div className="whitespace-pre-line text-zinc-400 leading-relaxed text-sm">
              {content}
            </div>
          </div>
        </div>
      </section>
      <SouveraFooter />
    </main>
  );
}

// Sub-pages will use this layout
