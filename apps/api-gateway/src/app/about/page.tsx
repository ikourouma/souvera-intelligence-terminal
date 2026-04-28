'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Target, Globe, Shield, Zap, TrendingUp, Users } from 'lucide-react';

const VALUES = [
  { title: 'Transparency', desc: 'Objective, sovereign-grade data ingested directly from source repositories.', icon: Shield },
  { title: 'Transatlantic', desc: 'Bridging the macroeconomic gap between Africa and the Caribbean.', icon: Globe },
  { title: 'Actionable', desc: 'Not just data—strategic signals that drive multi-billion dollar convictions.', icon: Zap }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Identity Hero */}
      <section className="pt-24 pb-32 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <div className="section-label mb-4">Institutional Identity</div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.0]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Democratizing<br />Sovereign<br />Intelligence.
            </h1>
            <p className="text-2xl text-zinc-400 leading-relaxed max-w-2xl font-light">
              Souvera is the definitive intelligence engine for African and Caribbean macroeconomic corridors. We provide the transparency required for institutional capital to move with absolute conviction.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-[#121821]/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7">
                 <div className="section-label mb-6">The Mandate</div>
                 <h2 className="text-4xl font-bold mb-8 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Bridging the transatlantic gap with objective truth.
                 </h2>
                 <div className="prose prose-invert max-w-none text-zinc-400 text-lg space-y-6">
                    <p>
                       For decades, African and Caribbean markets have been shrouded in fragmented data and legacy narratives. Souvera was built to change that. 
                    </p>
                    <p>
                       By integrating 69+ sovereign data nodes directly into a single, high-fidelity intelligence interface, we empower global institutional investors and sovereign governments with the real-time signaling required for strategic growth.
                    </p>
                 </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                 {VALUES.map((v) => (
                    <div key={v.title} className="p-8 bg-[#0B0F14] border border-zinc-800 rounded-sm hover:border-blue-600/30 transition-colors">
                       <div className="flex items-center gap-4 mb-4">
                          <v.icon className="w-6 h-6 text-blue-500" />
                          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{v.title}</h3>
                       </div>
                       <p className="text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* The Loop Section (Brief) */}
      <section className="py-32">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
            <div className="section-label mb-6 mx-auto">Our Core Logic</div>
            <h2 className="text-4xl font-bold mb-16" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
               From Raw Data to Decision Alpha.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                 { step: '01', title: 'Ingestion', desc: 'Direct feeds from central bank nodes.', icon: Globe },
                 { step: '02', title: 'Synthesis', desc: 'AI-driven signal normalization.', icon: Zap },
                 { step: '03', title: 'Strategy', desc: 'Expert analyst verification.', icon: Users },
                 { step: '04', title: 'Alpha', desc: 'Institutional conviction.', icon: TrendingUp }
               ].map((item) => (
                 <div key={item.step} className="relative group">
                    <div className="text-6xl font-black text-zinc-900 absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">{item.step}</div>
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:border-blue-600 transition-colors">
                       <item.icon className="w-6 h-6 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                    <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-mono">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Strategic Board Preview */}
      <section className="py-32 bg-[#121821]/50 border-t border-zinc-800">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
               <div className="max-w-2xl">
                  <div className="section-label mb-4">The board</div>
                  <h2 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Expert-Led Intelligence.</h2>
               </div>
               <p className="text-sm text-zinc-500 max-w-md">
                  Our Intelligence Board is comprised of 40+ senior macroeconomic analysts and data engineers across five global hubs.
               </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="space-y-4 group">
                    <div className="aspect-[4/5] bg-zinc-900 border border-zinc-800 grayscale group-hover:grayscale-0 transition-all overflow-hidden">
                       <div className="w-full h-full bg-gradient-to-t from-zinc-950 to-transparent opacity-50" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-white uppercase tracking-widest font-mono">Senior Board Member</div>
                       <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Macroeconomic Division</div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
