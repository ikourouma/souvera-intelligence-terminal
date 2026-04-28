'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Building2, Landmark, LineChart, Shield, Target, Globe, ArrowRight } from 'lucide-react';

const SOLUTIONS = [
  {
    title: 'Institutional Capital',
    icon: LineChart,
    tagline: 'Precision Investment Alpha',
    description: 'High-fidelity macro signals and deep sector intelligence for private equity, venture capital, and hedge funds targeting emerging corridors.',
    features: ['Real-time growth vectors', 'Risk trigger monitoring', 'Transatlantic trade mapping'],
    color: '#3B82F6'
  },
  {
    title: 'Sovereign Entities',
    icon: Landmark,
    tagline: 'Strategic Fiscal Intelligence',
    description: 'Empowering central banks and government ministries with benchmarking data, trade flow visibility, and sovereign peer analysis.',
    features: ['Regional benchmarking', 'Fiscal shift signaling', 'Policy impact modeling'],
    color: '#F59E0B'
  },
  {
    title: 'Global Corporates',
    icon: Building2,
    tagline: 'Market Entry & Strategy',
    description: 'Comprehensive data for Global 2000 firms planning market entry or expansion across the African and Caribbean trade nodes.',
    features: ['Supply chain risk audit', 'FDI sentiment tracking', 'Local sector drill-downs'],
    color: '#22C55E'
  }
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Header */}
      <section className="pt-24 pb-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="section-label mb-4">Strategic Solutions</div>
            <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Intelligence Tailored to Your Node.
            </h1>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
              Souvera provides specialized intelligence layers for the three most critical forces in global macroeconomic growth.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {SOLUTIONS.map((sol) => (
                <div key={sol.title} className="group p-10 bg-[#121821] border border-zinc-800 rounded-sm hover:border-zinc-700 transition-all flex flex-col relative overflow-hidden">
                   {/* Accent Glow */}
                   <div className="absolute top-0 left-0 w-full h-1 opacity-50 transition-opacity" style={{ background: sol.color }} />
                   
                   <div className="w-12 h-12 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:border-blue-600/30 transition-colors">
                      <sol.icon className="w-6 h-6" style={{ color: sol.color }} />
                   </div>

                   <div className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: sol.color }}>{sol.tagline}</div>
                   <h3 className="text-2xl font-bold mb-6 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{sol.title}</h3>
                   <p className="text-sm text-zinc-500 leading-relaxed mb-8 flex-1">{sol.description}</p>

                   <div className="space-y-3 mb-10">
                      {sol.features.map(f => (
                        <div key={f} className="flex items-center gap-3">
                           <div className="w-1 h-1 rounded-full" style={{ background: sol.color }} />
                           <span className="text-[11px] text-zinc-400 font-mono uppercase tracking-widest">{f}</span>
                        </div>
                      ))}
                   </div>

                   <button className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      Request Solution Brief <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust & Capability Section */}
      <section className="py-24 bg-[#121821]/30 border-t border-zinc-800">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
               <div>
                  <div className="section-label mb-4">Capability Map</div>
                  <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                     Institutional-Grade Infrastructure for Billion-Dollar Convictions.
                  </h2>
                  <p className="text-zinc-500 leading-relaxed mb-8">
                     Our solutions are backed by the most robust data ingestion pipeline in the transatlantic corridor, ensuring that every signal is verified and every trend is backed by sovereign truth.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-4 bg-[#0B0F14] border border-zinc-800 rounded-sm">
                        <Globe className="w-6 h-6 text-blue-500 mb-2" />
                        <div className="text-lg font-bold">74+ Markets</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Full Coverage</div>
                     </div>
                     <div className="p-4 bg-[#0B0F14] border border-zinc-800 rounded-sm">
                        <Shield className="w-6 h-6 text-emerald-500 mb-2" />
                        <div className="text-lg font-bold">Sovereign Node</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Direct Ingestion</div>
                     </div>
                  </div>
               </div>
               <div className="relative aspect-video bg-[#0B0F14] border border-zinc-800 rounded-sm overflow-hidden p-12 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative z-10 text-center">
                     <Target className="w-16 h-16 text-blue-600 mx-auto mb-6 opacity-50" />
                     <div className="text-sm font-mono text-zinc-600 uppercase tracking-[0.3em]">Decision Matrix Initializing...</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
