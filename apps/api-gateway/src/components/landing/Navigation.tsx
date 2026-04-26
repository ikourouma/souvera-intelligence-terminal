import React from 'react';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-975/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-souvera-blue rounded-none flex items-center justify-center font-mono font-bold text-white shadow-[0_0_15px_rgba(30,64,175,0.4)] group-hover:shadow-[0_0_25px_rgba(30,64,175,0.6)] transition-all">
              <span className="text-xl">S</span>
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-bold tracking-widest text-white uppercase leading-none">Souvera</span>
               <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase leading-none mt-1">Terminal</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 border-l border-white/10 pl-8">
            <a href="#platform" className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">Data Feed</a>
            <a href="#intelligence" className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors uppercase relative">
              Map Engine
              <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-souvera-blue rounded-full animate-pulse"></span>
            </a>
            <a href="#corridors" className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">Corridors</a>
          </div>

        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors uppercase">Log In</button>
          <button className="bg-white text-black px-6 py-2.5 text-xs font-bold font-mono tracking-widest uppercase hover:bg-zinc-200 transition-colors hidden sm:block">
            Access Terminal
          </button>
        </div>
      </div>
    </nav>
  );
}
