import React from 'react';

export interface TerminalShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/terminal/map', label: 'Map Engine', icon: '◈', active: true },
  { href: '/terminal/countries', label: 'Countries', icon: '◉', active: false },
  { href: '/terminal/compare', label: 'Compare', icon: '⊞', active: false },
];

const RESOURCE_ITEMS = [
  { href: '/terminal/reports', label: 'Reports', icon: '≡' },
  { href: '/terminal/signals', label: 'Signal Feed', icon: '◎' },
];

export const TerminalShell: React.FC<TerminalShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-925 flex text-white antialiased">
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/5 bg-zinc-975 flex flex-col fixed inset-y-0 z-40">
        {/* Brand */}
        <div className="px-5 h-16 border-b border-white/5 flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 bg-souvera-blue flex items-center justify-center font-mono font-bold text-white text-sm shadow-[0_0_12px_rgba(30,64,175,0.5)]">
            S
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-white leading-none">Souvera</div>
            <div className="text-[9px] font-mono tracking-[0.2em] text-zinc-600 uppercase leading-none mt-1">Terminal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 px-3 mb-3">Intelligence</div>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 mb-1 text-[11px] font-mono uppercase tracking-widest transition-all duration-200
                ${item.active
                  ? 'bg-souvera-blue/10 text-white border border-souvera-blue/20'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 px-3 mb-3 mt-6">Resources</div>
          {RESOURCE_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 mb-1 text-[11px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent transition-all"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="bg-zinc-925 border border-white/5 p-3 flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0">
              IK
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Ibrahim K.</div>
              <div className="text-[9px] font-mono text-zinc-600 truncate">Institutional Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-zinc-975/70 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">Terminal</span>
            <span className="text-zinc-700 text-xs">/</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-white text-glow-blue">
              Intelligent Map
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/5 bg-zinc-925 text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-600">
            Live
            <span className="w-1.5 h-1.5 rounded-full bg-high-growth animate-pulse ml-1" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 bg-zinc-925 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
