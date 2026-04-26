import React from 'react';

// Simplified but geographically accurate paths for key African regions/countries
// for the shell demonstration. Full 54-nation set to be expanded in Step 5.
const AFRICA_GEO = [
  { id: 'ZMB', name: 'Zambia', d: 'M150,300 L170,300 L180,320 L160,340 L140,320 Z', signal: 'high_growth' },
  { id: 'ZAF', name: 'South Africa', d: 'M140,350 L180,350 L190,380 L130,380 Z', signal: 'stable' },
  { id: 'NGA', name: 'Nigeria', d: 'M80,200 L110,200 L115,220 L75,220 Z', signal: 'emerging' },
  { id: 'EGY', name: 'Egypt', d: 'M150,100 L190,100 L190,140 L150,140 Z', signal: 'watchlist' },
  { id: 'KEN', name: 'Kenya', d: 'M180,240 L210,240 L215,260 L175,260 Z', signal: 'high_growth' },
  // Caribbean Corridor Expansion
  { id: 'JAM', name: 'Jamaica', d: 'M20,100 L40,100 L40,110 L20,110 Z', signal: 'high_growth' },
  { id: 'BRB', name: 'Barbados', d: 'M60,130 L70,130 L70,140 L60,140 Z', signal: 'emerging' },
  { id: 'KNA', name: 'St. Kitts & Nevis', d: 'M50,115 L55,115 L55,120 L50,120 Z', signal: 'high_growth' },
];

export default function IntelligentMap({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="relative w-full h-[600px] terminal-card bg-background/50 border-glow flex items-center justify-center overflow-hidden group">
      {/* Map Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* SVG Map Container */}
      <svg 
        viewBox="0 0 300 450" 
        className="w-full h-full max-w-[500px] drop-shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-transform duration-700 group-hover:scale-[1.02]"
      >
        <g className="countries">
          {AFRICA_GEO.map((country) => (
            <path
              key={country.id}
              d={country.d}
              className={`
                cursor-pointer transition-all duration-300 hover:stroke-white hover:stroke-[1.5px]
                ${country.signal === 'high_growth' ? 'fill-high-growth/20 stroke-high-growth/40' : ''}
                ${country.signal === 'emerging' ? 'fill-emerging/20 stroke-emerging/40' : ''}
                ${country.signal === 'watchlist' ? 'fill-watchlist/20 stroke-watchlist/40' : ''}
                ${country.signal === 'stable' ? 'fill-stable/20 stroke-stable/40' : ''}
              `}
              onClick={() => onSelect(country.id)}
            >
              <title>{country.name} - Signal: {country.signal}</title>
            </path>
          ))}
        </g>
        
        {/* Connection Corridors Backlog Layer (Hidden by default) */}
        <path d="M100,210 Q200,100 250,50" className="stroke-accent-primary/20 fill-none stroke-[0.5] stroke-dash-array-[2,2] opacity-0" />
      </svg>

      {/* Floating Map Controls */}
      <div className="absolute bottom-6 left-6 glass p-2 rounded-lg border border-border flex flex-col gap-2">
        <button className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-white">+</button>
        <button className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-white">-</button>
      </div>

      <div className="absolute top-6 right-6 glass p-4 rounded-lg border border-border">
        <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Signal Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-high-growth" />
            <span className="text-[10px] text-white">High Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerging" />
            <span className="text-[10px] text-white">Emerging Market</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-watchlist" />
            <span className="text-[10px] text-white">Watchlist / Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
