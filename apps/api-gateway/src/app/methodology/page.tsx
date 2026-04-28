'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Cpu, Database, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react';

const PIPELINE_STEPS = [
  {
    title: 'Source Ingestion',
    icon: Database,
    desc: 'Direct integration with 69+ macroeconomic nodes across AU and CARICOM central bank repositories.',
    details: ['REST API integration', 'WebSocket Signal Monitoring', 'PDF/Report Extraction']
  },
  {
    title: 'Normalization',
    icon: Globe,
    desc: 'Our proprietary engine normalizes disparate data formats into a unified sovereign-grade schema.',
    details: ['ISO-ID Mapping', 'Currency Normalization', 'Fiscal Year Alignment']
  },
  {
    title: 'Signal Synthesis',
    icon: Cpu,
    desc: 'Applying macroeconomic models to identify growth vectors, risk triggers, and transatlantic corridors.',
    details: ['Growth Volatility Scores', 'Sovereign Debt Ratios', 'FDI Sentiment Analysis']
  },
  {
    title: 'Expert Verification',
    icon: ShieldCheck,
    desc: 'Human-in-the-loop validation by our senior board of analysts before any signal is promoted to the terminal.',
    details: ['Analyst Briefings', 'Risk Threshold Audits', 'Source Registry Verification']
  }
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Header */}
      <section className="pt-24 pb-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="section-label mb-4">Technical Transparency</div>
            <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              The Souvera Engine.
            </h1>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
              Understand the multi-layered process that transforms raw sovereign data into institutional-grade intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* The Pipeline Visualization */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.title} className="relative">
                   {i < PIPELINE_STEPS.length - 1 && (
                     <div className="hidden lg:block absolute top-10 left-full w-full h-[1px] bg-zinc-800 z-0" />
                   )}
                   <div className="p-8 bg-[#121821] border border-zinc-800 rounded-sm relative z-10 hover:border-blue-600/50 transition-colors">
                      <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6">
                         <step.icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed mb-6">{step.desc}</p>
                      <ul className="space-y-2">
                         {step.details.map(d => (
                           <li key={d} className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase">
                              <Zap className="w-2.5 h-2.5 text-blue-500" /> {d}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-24 bg-[#121821]/30 border-t border-zinc-800">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
               <div className="lg:col-span-5">
                  <div className="section-label mb-4">Sovereign Integrity</div>
                  <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                     Objective Truth via Decentralized Nodes.
                  </h2>
                  <p className="text-zinc-500 leading-relaxed mb-8">
                     Our methodology is built on the principle of data sovereignty. We do not aggregate via third-party vendors. Instead, we connect directly to the source nodes of each market we track.
                  </p>
                  <div className="flex items-center gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-sm">
                     <BarChart3 className="w-8 h-8 text-blue-500" />
                     <div>
                        <div className="text-sm font-bold text-white">99.2% Source Correlation</div>
                        <div className="text-[10px] text-zinc-500 font-mono">Verified Q3 2026 Audit</div>
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-7 prose prose-invert max-w-none text-zinc-400">
                  <h3 className="text-white">Validation Protocols</h3>
                  <p>
                     Every signal promoted to the Souvera Intelligence Terminal undergoes a secondary audit. Our internal models check for statistical anomalies and cross-reference with historical sovereign trends to ensure that the alpha we deliver is grounded in objective reality.
                  </p>
                  <p>
                     This dual-layer verification (AI synthesis followed by Analyst verification) ensures that Souvera remains the most trusted source of transatlantic macroeconomic data for institutional stakeholders.
                  </p>
               </div>
            </div>
         </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
