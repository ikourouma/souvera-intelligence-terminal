'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { ShieldCheck, Database, Globe, Zap, Search, Download, CheckCircle2 } from 'lucide-react';

const SOURCES = [
  { name: 'IMF - International Data Resources', category: 'Macroeconomic', status: 'Live', node: 'Global Node 01', latency: '42ms' },
  { name: 'World Bank - Open Data Repository', category: 'Social & Development', status: 'Live', node: 'Global Node 02', latency: '68ms' },
  { name: 'UN Data - Statistical Division', category: 'Demographics', status: 'Live', node: 'Global Node 03', latency: '124ms' },
  { name: 'OECD Data Portal', category: 'Policy & Economic', status: 'Syncing', node: 'Global Node 04', latency: '156ms' },
  { name: 'Bank for International Settlements (BIS)', category: 'Financial Stability', status: 'Live', node: 'Global Node 05', latency: '89ms' },
  { name: 'ILOSTAT - International Labour Org', category: 'Labour Market', status: 'Live', node: 'Global Node 06', latency: '92ms' },
  { name: 'African Development Bank (AfDB)', category: 'Regional Africa', status: 'Live', node: 'Regional Node A1', latency: '210ms' },
  { name: 'CARICOM Central Bank Network', category: 'Regional Caribbean', status: 'Live', node: 'Regional Node C1', latency: '184ms' },
];

export default function SourceRegistryPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Header */}
      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <div className="section-label mb-4">Transparency Ledger</div>
              <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Institutional Signal Ledger.
              </h1>
              <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
                Benchmark-grade auditing of our 69+ active sovereign data feeds. Total transparency across every transatlantic node.
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">69 Active Nodes</span>
               </div>
               <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Audit (PDF)
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registry Grid */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                 <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-white border-b-2 border-blue-600 pb-2">All Sources</button>
                 <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white pb-2 transition-colors">Africa Nodes</button>
                 <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white pb-2 transition-colors">Caribbean Nodes</button>
              </div>
              <div className="relative">
                 <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="SEARCH REGISTRY..." 
                   className="bg-zinc-900 border border-zinc-800 rounded-sm py-2 pl-10 pr-4 text-[10px] font-mono w-64 focus:border-blue-600 outline-none transition-colors"
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 gap-px bg-zinc-800 border border-zinc-800 rounded-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-900/50">
                 <div className="col-span-5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sovereign Source</div>
                 <div className="col-span-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Category</div>
                 <div className="col-span-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Node ID</div>
                 <div className="col-span-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">Status</div>
                 <div className="col-span-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-right">Latency</div>
              </div>

              {/* Table Body */}
              {SOURCES.map((source, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-5 bg-[#0B0F14] hover:bg-[#121821] transition-colors items-center">
                   <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                         <Database className="w-4 h-4 text-zinc-600" />
                      </div>
                      <span className="text-[13px] font-bold text-zinc-200">{source.name}</span>
                   </div>
                   <div className="col-span-2">
                      <span className="text-[10px] font-mono px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-sm">{source.category}</span>
                   </div>
                   <div className="col-span-2 text-[11px] text-zinc-600 font-mono">{source.node}</div>
                   <div className="col-span-1 flex justify-center">
                      <div className={`px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase ${
                        source.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                         {source.status}
                      </div>
                   </div>
                   <div className="col-span-2 text-right">
                      <span className="text-[11px] font-mono text-zinc-500">{source.latency}</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Global Benchmarking', desc: 'Direct ingestion from G20 and OECD-standard data nodes.', icon: Globe },
                { title: 'Source Validation', desc: 'Every signal is verified via dual-layer sovereign auditing.', icon: ShieldCheck },
                { title: 'Zero Latency', desc: 'High-frequency WebSocket sync for critical market triggers.', icon: Zap }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-[#121821] border border-zinc-800 rounded-sm">
                   <f.icon className="w-6 h-6 text-blue-500 mb-4" />
                   <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                   <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
