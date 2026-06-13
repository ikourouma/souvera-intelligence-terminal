// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Data Freshness Widget
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface DataSource {
  source_key: string;
  label: string;
  last_updated: string | null;
  status: 'fresh' | 'stale' | 'missing';
}

export function DataFreshnessWidget() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDataFreshness() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/freshness');
        if (response.ok) {
          const data = await response.json();
          setSources(data.sources || []);
        }
      } catch (error) {
        console.error('[DataFreshnessWidget] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDataFreshness();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-zinc-800 rounded" />
              <div className="flex-1 h-4 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Data Freshness</h3>
      <div className="space-y-3">
        {sources.map((source) => {
          const isFresh = source.status === 'fresh';
          const isStale = source.status === 'stale';
          const isMissing = source.status === 'missing';

          return (
            <div key={source.source_key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isFresh && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {isStale && <Clock className="w-5 h-5 text-amber-400" />}
                {isMissing && <AlertCircle className="w-5 h-5 text-red-400" />}
                <span className="text-sm text-white">{source.label}</span>
              </div>
              <span className="text-xs text-zinc-500">
                {source.last_updated
                  ? new Date(source.last_updated).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
