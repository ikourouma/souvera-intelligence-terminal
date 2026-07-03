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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="space-y-2">
        {sources.slice(0, 6).map((source) => {
          const isFresh = source.status === 'fresh';
          const isStale = source.status === 'stale';
          const isMissing = source.status === 'missing';

          return (
            <div key={source.source_key} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  isFresh ? 'bg-emerald-500/10 border border-emerald-500/20' :
                  isStale ? 'bg-amber-500/10 border border-amber-500/20' :
                  'bg-red-500/10 border border-red-500/20'
                }`}>
                  {isFresh && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {isStale && <Clock className="w-4 h-4 text-amber-400" />}
                  {isMissing && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
                <span className="text-sm text-white">{source.label}</span>
              </div>
              <span className={`text-xs font-medium ${
                isFresh ? 'text-emerald-400' : isStale ? 'text-amber-400' : 'text-red-400'
              }`}>
                {source.last_updated
                  ? formatRelativeTime(new Date(source.last_updated))
                  : 'Never'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}
