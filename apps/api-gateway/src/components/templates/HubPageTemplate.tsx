'use client';

import React from 'react';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface HubLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

export interface HubContent {
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  links: HubLink[];
  highlights?: {
    value: string;
    label: string;
  }[];
}

interface Props {
  content: HubContent;
}

export function HubPageTemplate({ content }: Props) {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      {/* Hero */}
      <section className="pt-24 pb-20 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <div className="section-label mb-4">{content.tagline}</div>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {content.title}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-4 max-w-2xl">
              {content.subtitle}
            </p>
            <p className="text-base text-zinc-500 leading-relaxed mb-10 max-w-2xl">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={content.primaryCta.href}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2"
              >
                {content.primaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {content.secondaryCta && (
                <Link
                  href={content.secondaryCta.href}
                  className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2"
                >
                  {content.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Strip */}
      {content.highlights && content.highlights.length > 0 && (
        <section className="py-8 border-b border-zinc-800 bg-[#121821]/50">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
              {content.highlights.map((h, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{h.value}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation Grid */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-blue-600/50 transition-all relative overflow-hidden"
                >
                  {link.badge && (
                    <div
                      className="absolute top-4 right-4 px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded-sm"
                      style={{
                        background: `${link.badgeColor || '#2563EB'}15`,
                        color: link.badgeColor || '#2563EB',
                        border: `1px solid ${link.badgeColor || '#2563EB'}30`,
                      }}
                    >
                      {link.badge}
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {link.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-6">{link.description}</p>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#121821]/30 border-t border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Ready to access institutional intelligence?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
            Join governments, development finance institutions, and global enterprises leveraging Souvera for strategic decision-making.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/access/request-access"
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
            >
              Request Access
            </Link>
            <Link
              href="/contact"
              className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
