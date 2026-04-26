'use client';
import React, { useState } from 'react';

/* ─── Signal Badge ──────────────────────────────────────────────────────── */
type SignalLevel = 'high_growth' | 'emerging' | 'stable' | 'watchlist' | 'risk_elevated';

const SIGNAL_CONFIG: Record<SignalLevel, { label: string; color: string }> = {
  high_growth:    { label: 'High Growth',    color: '#10b981' },
  emerging:       { label: 'Emerging',       color: '#3b82f6' },
  stable:         { label: 'Stable',         color: '#6b7280' },
  watchlist:      { label: 'Watchlist',      color: '#f59e0b' },
  risk_elevated:  { label: 'Risk Elevated',  color: '#ef4444' },
};

function SignalBadge({ level }: { level?: SignalLevel }) {
  if (!level) return null;
  const cfg = SIGNAL_CONFIG[level];
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 border text-[9px] font-mono font-bold uppercase tracking-[0.2em]"
      style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}0d` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </div>
  );
}

/* ─── Metric Card ────────────────────────────────────────────────────────── */
interface MetricCardProps {
  label: string;
  value?: string | number;
  unit?: string;
  status?: 'normal' | 'loading' | 'locked' | 'stale';
  source?: string;
  change?: { value: number; trend: 'up' | 'down' | 'neutral' };
}

function MetricCard({ label, value, unit, status = 'normal', source, change }: MetricCardProps) {
  if (status === 'loading') {
    return (
      <div className="terminal-card animate-pulse">
        <div className="h-3 w-20 bg-white/10 rounded mb-4" />
        <div className="h-7 w-28 bg-white/10 rounded" />
      </div>
    );
  }
  if (status === 'locked') {
    return (
      <div className="terminal-card relative overflow-hidden group cursor-pointer">
        <div className="h-3 w-20 bg-white/5 rounded mb-4" />
        <div className="h-7 w-28 bg-white/5 rounded blur-sm select-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-975/80 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-souvera-blue">Premium</span>
          <button className="text-[9px] text-zinc-400 underline hover:text-white">Unlock</button>
        </div>
      </div>
    );
  }
  const trendColor = change?.trend === 'up' ? '#10b981' : change?.trend === 'down' ? '#ef4444' : '#6b7280';
  const trendArrow = change?.trend === 'up' ? '▲' : change?.trend === 'down' ? '▼' : '●';
  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</span>
        {status === 'stale' && <span className="text-[8px] px-1.5 py-0.5 border border-yellow-700/30 text-yellow-600 font-mono uppercase">Stale</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-mono font-bold text-white">{value ?? '—'}</span>
        {unit && <span className="text-xs font-mono text-zinc-600">{unit}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        {change && (
          <span className="text-xs font-mono font-bold" style={{ color: trendColor }}>
            {trendArrow} {change.value}%
          </span>
        )}
        {source && <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">{source}</span>}
      </div>
    </div>
  );
}

/* ─── Panel Component ────────────────────────────────────────────────────── */
export interface CountryIntelligencePanelProps {
  country?: {
    iso3: string;
    name: string;
    region: string;
    flagUrl: string;
    signal: SignalLevel;
    metrics: { gdp: string; growth: number; population: string; fdi?: string };
  };
  onClose: () => void;
}

const TABS = ['overview', 'economy', 'trade', 'risk', 'sectors'];

export const CountryIntelligencePanel: React.FC<CountryIntelligencePanelProps> = ({ country, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  if (!country) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-zinc-975 border-l border-white/5 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <header className="px-6 py-5 border-b border-white/5 bg-zinc-925">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 border border-white/10 overflow-hidden bg-zinc-800 shrink-0">
              <img src={country.flagUrl} alt={country.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">{country.name}</h2>
              <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase">{country.region}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors p-1">✕</button>
        </div>
        <SignalBadge level={country.signal} />
      </header>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/5">
        <MetricCard label="GDP (USD)" value={country.metrics.gdp} source="World Bank" />
        <MetricCard label="GDP Growth" value={country.metrics.growth} unit="%" change={{ value: 0.3, trend: 'up' }} source="WB" />
        <MetricCard label="Population" value={country.metrics.population} source="UN" />
        <MetricCard label="FDI Inflow" status="locked" />
      </div>

      {/* Tabs */}
      <nav className="flex border-b border-white/5 bg-zinc-925 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-3.5 text-[9px] font-mono uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t ? 'border-souvera-blue text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-souvera-blue block mb-3">Strategic Position</span>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                {country.name} occupies a pivotal node in the {country.region} economic corridor. Recent structural reforms
                and alignment with AfCFTA trade incentives position this market as a high-momentum target for institutional capital.
              </p>
            </div>
            <div className="border border-white/5 p-5 bg-zinc-925">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 block mb-4">Key Signals</span>
              <ul className="space-y-3">
                {[
                  { dot: '#10b981', text: 'Diversified mineral export base driving FX stability.' },
                  { dot: '#10b981', text: 'Infrastructure rollout accelerating in industrial clusters.' },
                  { dot: '#3b82f6', text: '12% YoY growth in digital services sector.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] text-zinc-400 font-light">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.dot }} />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {activeTab !== 'overview' && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-4">
            <div className="w-10 h-10 border border-souvera-blue/20 bg-souvera-blue/5 flex items-center justify-center text-souvera-blue text-xl">◉</div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-white">Enterprise Access Required</div>
            <p className="text-xs text-zinc-500 font-light leading-relaxed max-w-xs">
              Full {activeTab} intelligence for {country.name} is available in the Souvera institutional tier.
            </p>
            <button className="mt-2 px-6 py-2.5 bg-white text-black text-[9px] font-bold font-mono uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors">
              Request Access
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-white/5 bg-zinc-925 flex items-center justify-between">
        <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600">Souvera Live Signal Layer</span>
        <button className="px-4 py-1.5 border border-souvera-blue/30 bg-souvera-blue/5 text-souvera-blue text-[9px] font-mono uppercase tracking-[0.2em] hover:bg-souvera-blue/10 transition-colors">
          Export
        </button>
      </footer>
    </div>
  );
};
