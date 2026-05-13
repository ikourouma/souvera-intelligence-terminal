'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { ArrowRight, MessageSquare, ShieldCheck, Zap, Users, Target, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface PresentationContent {
  title: string;
  tagline: string;
  heroImage?: string;
  what: {
    title: string;
    description: string;
    points: string[];
  };
  who: {
    title: string;
    description: string;
    segments: { name: string; benefit: string }[];
  };
  why: {
    title: string;
    description: string;
    impact: { label: string; value: string }[];
  };
  how: {
    title: string;
    description: string;
    steps: string[];
  };
}

interface Props {
  content: PresentationContent;
}

export function PresentationPageTemplate({ content }: Props) {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Hero Section */}
      <section className="pt-24 pb-32 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <div className="section-label mb-4">{content.tagline}</div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {content.title}
            </h1>
            <div className="flex flex-wrap gap-4 mt-12">
               <Link href="/access/request-access" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Request Access
               </Link>
               <Link href="/contact" className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-black text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2">
                  Contact Sales <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT Section */}
      <section className="py-32 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                 <div className="section-label mb-4 text-blue-500">WHAT</div>
                 <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{content.what.title}</h2>
                 <p className="text-xl text-zinc-400 leading-relaxed mb-8">{content.what.description}</p>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {content.what.points.map((p, i) => (
                   <div key={i} className="p-6 bg-[#121821] border border-zinc-800 rounded-sm flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                      <span className="text-sm text-zinc-300 leading-relaxed">{p}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* WHO Section */}
      <section className="py-32 bg-[#121821]/30 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="max-w-3xl mb-16">
              <div className="section-label mb-4 text-emerald-500">WHO</div>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{content.who.title}</h2>
              <p className="text-lg text-zinc-400 leading-relaxed">{content.who.description}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.who.segments.map((s, i) => (
                <div key={i} className="p-8 bg-[#0B0F14] border border-zinc-800 rounded-sm hover:border-emerald-500/30 transition-colors">
                   <Users className="w-8 h-8 text-emerald-500 mb-6" />
                   <h3 className="text-xl font-bold mb-2">{s.name}</h3>
                   <p className="text-sm text-zinc-500 leading-relaxed">{s.benefit}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* WHY Section */}
      <section className="py-32 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                 <div className="section-label mb-4 text-amber-500">WHY</div>
                 <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{content.why.title}</h2>
                 <p className="text-lg text-zinc-400 leading-relaxed mb-10">{content.why.description}</p>
                 <div className="grid grid-cols-2 gap-6">
                    {content.why.impact.map((imp, i) => (
                      <div key={i} className="space-y-1">
                         <div className="text-3xl font-black text-white">{imp.value}</div>
                         <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{imp.label}</div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="aspect-video bg-[#121821] border border-zinc-800 rounded-sm flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
                 <Target className="w-24 h-24 text-zinc-800" />
              </div>
           </div>
        </div>
      </section>

      {/* HOW Section */}
      <section className="py-32">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
           <div className="section-label mb-4 text-blue-500 mx-auto">HOW</div>
           <h2 className="text-4xl font-bold mb-6 mx-auto max-w-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{content.how.title}</h2>
           <p className="text-lg text-zinc-400 leading-relaxed mb-16 mx-auto max-w-2xl">{content.how.description}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {content.how.steps.map((step, i) => (
                <div key={i} className="relative group">
                   <div className="text-7xl font-black text-zinc-900 absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</div>
                   <div className="w-16 h-16 rounded-full bg-[#121821] border border-zinc-800 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:border-blue-600 transition-colors">
                      <Zap className="w-6 h-6 text-blue-500" />
                   </div>
                   <p className="text-sm font-bold text-white uppercase tracking-widest px-4">{step}</p>
                </div>
              ))}
           </div>

           <div className="mt-24 p-12 bg-blue-600 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                 <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ready to access?</h3>
                 <p className="text-white/80">Request access to Souvera Intelligence today.</p>
              </div>
              <Link href="/access/request-access" className="px-10 py-5 bg-white text-blue-600 font-black text-[14px] tracking-widest uppercase rounded-sm hover:bg-zinc-100 transition-all shadow-xl">
                 Request Access
              </Link>
           </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
