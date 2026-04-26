import React from 'react';

const CASE_STUDIES = [
  {
    institution: 'World Bank',
    challenge: 'Data Latency & Macro Lag',
    description: 'Official reporting for frontier markets lags 6–18 months, leaving investors blind to immediate economic shifts following policy changes or currency floatation.',
    solution: 'Souvera\'s live signal engine provides sub-second market pulse indicators, offering a forward-looking momentum score even when official data is silent.',
    id: 'world-bank-case',
    signal: 'high_growth'
  },
  {
    institution: 'Bloomberg Terminals',
    challenge: 'Frontier Market Discordance',
    description: 'Standard financial terminals excel at G20 markets but fail at the "last mile" of granular data in Afro-descendent economies, where informal sectors drive 40%+ of GDP.',
    solution: 'Souvera integrates non-traditional signal sources and hyper-local datasets to normalize the "informal economy gap" for institutional-grade decision making.',
    id: 'bloomberg-case',
    signal: 'emerging'
  },
  {
    institution: 'AfCFTA Investors',
    challenge: 'Cross-Corridor Risk Assessment',
    description: 'Lack of standardized risk/reward metrics across the Africa-Caribbean corridor blocks scalable capital flow despite AfCFTA trade incentives.',
    solution: 'Standardized performance markers and interoperable trade signal scores enable a unified Command Center view of the entire AfriCaribbean corridor.',
    id: 'actif-case',
    signal: 'watchlist'
  }
];

const signalColor: Record<string, string> = {
  high_growth: '#10b981',
  emerging: '#3b82f6',
  watchlist: '#f59e0b',
};

export default function InstitutionalProof() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
      {CASE_STUDIES.map((study) => (
        <div key={study.id} className="bg-zinc-925 p-8 flex flex-col gap-6 group hover:bg-zinc-975 transition-colors duration-300">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">{study.institution}</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: signalColor[study.signal], boxShadow: `0 0 8px ${signalColor[study.signal]}` }}
            />
          </div>

          {/* Challenge */}
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-glow-blue transition-all">
            {study.challenge}
          </h3>

          <div className="flex flex-col gap-4 flex-1">
            {/* Problem */}
            <div>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 block mb-2">Problem</span>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">{study.description}</p>
            </div>
            {/* Solution */}
            <div className="pt-4 border-t border-white/5">
              <span
                className="text-[9px] font-mono uppercase tracking-[0.2em] block mb-2"
                style={{ color: signalColor[study.signal] }}
              >
                Souvera Solution
              </span>
              <p className="text-sm text-zinc-300 font-light leading-relaxed">{study.solution}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
