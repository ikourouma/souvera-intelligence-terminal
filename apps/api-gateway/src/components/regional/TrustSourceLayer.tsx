'use client';

import Link from 'next/link';
import { Database, RefreshCw, Shield } from 'lucide-react';
import { DATA_STATUS_LABELS } from '@/lib/map-constants';

interface TrustSourceLayerProps {
  region?: 'africa' | 'caribbean';
  title?: string;
}

export function TrustSourceLayer({ region, title = 'Data Sources & Credibility' }: TrustSourceLayerProps) {
  const accentColor = region === 'africa' ? 'text-blue-500' : region === 'caribbean' ? 'text-teal-500' : 'text-blue-500';

  const dataSources = [
    { key: 'world_bank', name: 'World Bank Indicators API' },
    { key: 'imf', name: 'International Monetary Fund' },
    { key: 'rest_countries', name: 'REST Countries' },
  ];

  if (region === 'africa') {
    dataSources.push({ key: 'afdb', name: 'African Development Bank' });
  }

  if (region === 'caribbean') {
    dataSources.push(
      { key: 'cdb', name: 'Caribbean Development Bank' },
      { key: 'caricom', name: 'CARICOM Secretariat' }
    );
  }

  return (
    <section className="py-16 border-b border-zinc-800 bg-zinc-900/30">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${accentColor} mb-4`}>
            Trust & Transparency
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Data Sources */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <Database className={`w-6 h-6 ${accentColor} mb-3`} />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
              Data Sources
            </h3>
            <ul className="space-y-2">
              {dataSources.map((source) => (
                <li key={source.key} className="text-sm text-zinc-400">
                  {source.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Refresh Cadence */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <RefreshCw className={`w-6 h-6 ${accentColor} mb-3`} />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
              Update Frequency
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Data is sourced from official institutions. Updates occur quarterly for macroeconomic indicators and annually for structural data.
            </p>
          </div>

          {/* Coverage */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <Shield className={`w-6 h-6 ${accentColor} mb-3`} />
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
              Coverage
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {region === 'africa' ? '54 nations' : region === 'caribbean' ? '20 territories' : 'All markets'}, 
              {' '}6 core sectors, 20+ indicators per country.
            </p>
          </div>
        </div>

        {/* Live & Curated Data Disclaimer */}
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
          <div className="flex items-start gap-4">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-400 mb-2">
                {DATA_STATUS_LABELS.previewData}
              </h4>
              <p className="text-sm text-emerald-400/80 leading-relaxed mb-3">
                Souvera combines live institutional feeds with editorially curated country profiles.
                Pilot terminals (Nigeria, Jamaica) are fully populated. All metrics are
                source-attributed and tier-gated.
              </p>
              <Link
                href="/resources/source-registry"
                className="text-sm text-emerald-400 hover:text-emerald-300 underline"
              >
                View Source Registry →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
