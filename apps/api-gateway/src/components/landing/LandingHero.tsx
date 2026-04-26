import React from 'react';

export default function LandingHero() {
  return (
    <section className="relative w-full min-h-[90vh] bg-zinc-925 flex flex-col justify-center overflow-hidden border-b border-white/5">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-souvera-blue/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none opacity-20" />

      <div className="container relative z-10 px-8 mx-auto mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Kinetic Text & Value Prop */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono text-white rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-souvera-blue animate-pulse" />
              Souvera Intelligence Terminal v2.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1] text-glow-blue">
              The Africa<br />
              <span className="text-white/60">Decision Engine.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 font-light max-w-lg leading-relaxed">
              Institutional-grade macroeconomic signaling, real-time corridor intelligence, and sovereign risk models for the African and Caribbean footprint.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button className="w-full sm:w-auto bg-white text-black px-8 py-4 font-bold text-sm tracking-widest uppercase hover:bg-zinc-200 transition-colors">
                Request Terminal Access
              </button>
              <button className="w-full sm:w-auto border border-white/20 bg-transparent text-white px-8 py-4 font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-colors">
                View API Docs
              </button>
            </div>
            
            {/* Bloomberg Style Ticker Mini */}
            <div className="pt-8 border-t border-white/10 flex items-center gap-6 overflow-hidden">
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">NGA Momentum</span>
                 <span className="text-sm font-mono text-high-growth">▲ 4.2%</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">ZAF Liquidity</span>
                 <span className="text-sm font-mono text-stable">▬ 1.1%</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">KEN Risk</span>
                 <span className="text-sm font-mono text-risk">▼ 2.8%</span>
               </div>
            </div>
          </div>

          {/* Right Column - Terminal Preview */}
          <div className="lg:col-span-6 relative">
            <div className="bg-zinc-975 border border-white/15 p-2 shadow-[0_0_50px_rgba(30,64,175,0.15)] relative group">
              {/* Terminal Top Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-zinc-925 mb-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Souvera Live Surface</div>
              </div>
              
              {/* Map/Grid UI Mock */}
              <div className="aspect-[4/3] bg-zinc-925 border border-white/5 relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                {/* Simulated Geospacial Grid elements */}
                <div className="flex-1 flex items-center justify-center relative">
                   <div className="w-[1px] h-full bg-white/10 absolute left-1/3" />
                   <div className="w-[1px] h-full bg-white/10 absolute right-1/3" />
                   <div className="w-full h-[1px] bg-white/10 absolute top-1/2" />
                   
                   {/* Map Nodes */}
                   <div className="absolute top-[40%] left-[45%] w-2 h-2 bg-high-growth rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                   <div className="absolute top-[55%] left-[55%] w-1.5 h-1.5 bg-emerging rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                   <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-watchlist rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                   
                   {/* Connections */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none">
                     <path d="M 45% 40% L 55% 55%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 2" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                   </svg>
                </div>
              </div>
            </div>
            
            {/* Floating Terminal Meta */}
            <div className="absolute -bottom-6 -left-6 bg-zinc-925 border border-white/10 p-4 shadow-2xl glass">
               <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">Live Nodes</div>
               <div className="text-2xl font-mono text-white text-glow-blue">2,414</div>
            </div>
            <div className="absolute -top-6 -right-6 bg-zinc-925 border border-white/10 p-4 shadow-2xl glass">
               <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">System Latency</div>
               <div className="text-xl font-mono text-high-growth">42ms</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
