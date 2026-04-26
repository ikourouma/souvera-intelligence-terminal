'use client';
import React from 'react';
import { Database, Cpu, Lightbulb, LineChart, ChevronRight } from 'lucide-react';

export function IntelligenceInfographic() {
  return (
    <section className="py-24" style={{ background: '#0B0F14' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="section-label mb-2 inline-block">The Pipeline</div>
          <h2 className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The Souvera Intelligence Loop
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-0 w-full h-[2px] bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-amber-500/20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Step 1: Raw Nodes */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all group-hover:scale-110" style={{ background: '#121821', border: '2px solid #2563EB' }}>
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <div className="absolute top-7 left-7 w-20 h-20 bg-blue-600/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Sovereign Nodes</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                Direct ingestion from 69+ macroeconomic repositories including Central Banks, AU, and CARICOM portals.
              </p>
            </div>

            {/* Step 2: Signal Processing */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all group-hover:scale-110" style={{ background: '#121821', border: '2px solid #22C55E' }}>
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="absolute top-7 left-7 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Signal Processing</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                Proprietary AI filters noise and identifies growth vectors, risk triggers, and sovereign fiscal shifts.
              </p>
            </div>

            {/* Step 3: Strategic Intelligence */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all group-hover:scale-110" style={{ background: '#121821', border: '2px solid #A78BFA' }}>
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <div className="absolute top-7 left-7 w-20 h-20 bg-purple-500/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Expert Synthesis</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                Regional analysts synthesize signals into actionable research briefs and strategic risk assessments.
              </p>
            </div>

            {/* Step 4: Alpha Generation */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all group-hover:scale-110" style={{ background: '#2563EB', border: '2px solid #2563EB' }}>
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <div className="absolute top-7 left-7 w-20 h-20 bg-blue-600/30 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Decision Alpha</h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                Institutional-grade intelligence delivered via the Terminal, allowing for multi-billion dollar convictions.
              </p>
            </div>

          </div>

          {/* Data Flow Animation (Visual Mockup) */}
          <div className="mt-20 p-1 bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-amber-500/20 rounded-sm">
            <div className="bg-[#0B0F14] rounded-sm p-12 text-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative z-10 inline-flex flex-col items-center">
                 <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-600 mb-6">Real-Time Data Stream Visualization</div>
                 <div className="flex gap-4 items-end">
                    {[24, 45, 32, 56, 28, 42, 35, 48, 30, 52, 38, 44].map((h, i) => (
                      <div key={i} className="w-1 bg-blue-600/30 rounded-full animate-bounce" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                 </div>
                 <div className="mt-8 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-500 font-mono tracking-widest uppercase">Live Signal Detected: ZAF Growth +1.2%</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
