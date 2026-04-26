'use client';

import React from 'react';
import Link from 'next/link';
import { SouveraMegaNav } from "@/components/ui/SouveraMegaNav";
import { SouveraFooter } from "@/components/ui/SouveraFooter";
import { CheckCircle2, Activity, Globe, Database, Shield, ArrowRight } from 'lucide-react';

const systems = [
  { name: "Signal Engine", status: "operational", uptime: "99.99%", latency: "142ms", desc: "Macroeconomic weighting and score calculation node." },
  { name: "Geospatial Intelligence", status: "operational", uptime: "100%", latency: "85ms", desc: "Mapping and spatial data rendering infrastructure." },
  { name: "Regional Data Nodes (Africa)", status: "operational", uptime: "99.95%", latency: "210ms", desc: "Live telemetry from 54 African sovereign nodes." },
  { name: "Regional Data Nodes (Caribbean)", status: "operational", uptime: "99.98%", latency: "165ms", desc: "CARICOM and regional logistics data corridors." },
  { name: "Souvera API Gateway", status: "operational", uptime: "99.99%", latency: "45ms", desc: "Edge routing and institutional authentication layer." },
  { name: "Supabase Data Pipeline", status: "operational", uptime: "100%", latency: "12ms", desc: "Encrypted storage and real-time database sync." }
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col">
      <SouveraMegaNav />

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-12 border-b border-zinc-900">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-sm">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                System Status.
              </h1>
            </div>
            <p className="text-lg text-zinc-500 font-medium">
              Real-time monitoring of the Souvera Intelligence Network and regional data corridors.
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800 rounded-sm">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">All Systems Nominal</div>
              <div className="text-[9px] text-zinc-500 font-mono">Last check: 14s ago</div>
            </div>
          </div>
        </div>

        {/* System Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {systems.map((s, i) => (
            <div key={i} className="p-8 border border-zinc-900 bg-zinc-900/10 rounded-sm hover:border-zinc-800 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{s.name}</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs">{s.desc}</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-mono">
                     <CheckCircle2 className="w-3 h-3" /> {s.status}
                   </span>
                   <span className="text-[10px] font-mono text-zinc-600">{s.latency}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900/50">
                <div>
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 font-mono">Uptime (30d)</div>
                  <div className="text-sm font-bold text-zinc-300 font-mono">{s.uptime}</div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 font-mono">Health</div>
                   <div className="flex gap-0.5 h-1.5">
                     {[...Array(12)].map((_, j) => (
                       <div key={j} className="w-1 bg-emerald-500/40 rounded-full" />
                     ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-8 bg-blue-600/5 border border-blue-600/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Institutional Transparency</h4>
              <p className="text-[11px] text-zinc-500">Uptime reports are cryptographically signed and verified by the Sovereign OS framework.</p>
            </div>
          </div>
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-white text-zinc-950 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            Report Incident <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <SouveraFooter />
    </main>
  );
}
