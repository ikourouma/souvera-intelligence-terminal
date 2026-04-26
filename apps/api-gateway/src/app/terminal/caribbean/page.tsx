import React from 'react';
import { TopNav } from '@/components/ui/top-nav';
import { CaribbeanMapSvg } from '@/components/map/caribbean-map-svg';
import { ArrowLeft, Clock, Activity, SignalHigh } from 'lucide-react';
import Link from 'next/link';

export default function CaribbeanTerminalPage() {
  return (
    <main className="min-h-screen bg-zinc-975 text-white font-sans overflow-hidden flex flex-col h-screen">
      <TopNav />
      {/* Reduced header for Terminal */}
      <div className="pt-20 px-6 pb-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-925 shadow-md">
        <div className="flex items-center gap-6">
          <Link href="/insights" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-mono uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <div className="w-px h-6 bg-zinc-800" />
          <h1 className="text-lg font-bold tracking-tighter">Caribbean Data Engine</h1>
          <span className="px-2 py-1 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest rounded-sm">
            Live
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm">
           <Activity className="w-3 h-3 text-souvera-blue" />
           <span>Ping 12ms</span>
           <span className="w-px h-3 bg-zinc-700 mx-1" />
           <Clock className="w-3 h-3" />
           <span>2026-Q3 Data</span>
        </div>
      </div>
      
      {/* Embedded Terminal Interface */}
      <div className="flex-grow flex bg-zinc-950 p-4 gap-4 overflow-hidden">
        
        {/* Left Sidebar: Market Stats */}
        <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
           <div className="bg-zinc-925 border border-zinc-800 p-4 rounded-sm">
             <h2 className="text-xs uppercase font-bold tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Macro Overview</h2>
             <div className="flex flex-col gap-4">
                <div>
                   <div className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">Total GDP</div>
                   <div className="text-xl font-bold tracking-tighter text-blue-400">$64.2B</div>
                </div>
                <div>
                   <div className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">Growth Output</div>
                   <div className="text-xl font-bold tracking-tighter text-emerald-400">+4.1% YoY</div>
                </div>
                <div>
                   <div className="text-[10px] text-zinc-500 font-mono tracking-widest mb-1">Key Corridors</div>
                   <div className="text-sm font-bold tracking-tighter mt-1">Caricom / Africa Bridge</div>
                </div>
             </div>
           </div>

           <div className="bg-zinc-925 border border-zinc-800 flex-grow rounded-sm flex flex-col">
             <h2 className="text-xs uppercase font-bold tracking-widest text-zinc-500 p-4 border-b border-zinc-800">Watchlist</h2>
             <div className="flex-grow flex items-center justify-center p-4">
                <span className="text-xs text-zinc-600 font-mono text-center">Tracking data loading from Supabase Matrix...</span>
             </div>
           </div>
        </div>

        {/* Center: The Map SVG */}
        <div className="flex-grow bg-zinc-925 border border-zinc-800 rounded-sm relative flex items-center justify-center overflow-hidden">
           
           {/* Terminal map overlay grid */}
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-radial from-transparent to-zinc-950/80 pointer-events-none" />
           
           <div className="w-full h-full p-8 p-12 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain relative z-10 drop-shadow-[0_0_15px_rgba(30,64,175,0.4)]">
              <CaribbeanMapSvg className="text-zinc-800 stroke-zinc-600 transition-all hover:text-zinc-700" />
           </div>
           
           <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-mono text-zinc-500">
             <span className="flex items-center gap-1"><SignalHigh className="w-3 h-3 text-emerald-500"/> GPS Locked</span>
             <span>AFRENOVATION GIS LAYER V2</span>
           </div>
        </div>
        
      </div>
    </main>
  );
}
