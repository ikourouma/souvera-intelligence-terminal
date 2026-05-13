'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AGOA Tracker Client Component
// Owner: Afronovation, Inc.
// ===========================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Search, 
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Info,
  Lock
} from 'lucide-react';
import { 
  getAGOAStatusLabel, 
  getAGOAStatusColor,
  formatDisplayDate 
} from '@/lib/data/utils';

interface AGOAStatus {
  country_iso3: string;
  country_name: string;
  agoa_status: string;
  agoa_apparel_eligible?: boolean;
  agoa_eligible_since?: string;
  agoa_suspension_date?: string;
  agoa_notes?: string;
  agoa_source_url?: string;
  agoa_as_of_date?: string;
  agoa_last_reviewed_at?: string;
  source_type: string;
  data_label: string;
  is_full_access: boolean;
  upgrade_message?: string;
}

interface AGOAResponse {
  statuses: AGOAStatus[];
  summary: {
    total_tracked: number;
    eligible_count: number;
    suspended_count: number;
    note: string;
  };
  attribution: {
    source_name: string;
    source_type: string;
    data_label: string;
    confidence_level: string;
  };
  entitlement: {
    plan_id: string;
    is_full_access: boolean;
  };
}

export function AGOATrackerClient() {
  const [data, setData] = useState<AGOAResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  async function fetchAGOAData() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/v1/trade/agoa?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AGOA data');
      }
      
      const responseData: AGOAResponse = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AGOA data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAGOAData();
  }, [statusFilter]);

  const filteredStatuses = (data?.statuses || []).filter(status => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      status.country_name.toLowerCase().includes(query) ||
      status.country_iso3.toLowerCase().includes(query)
    );
  });

  const isFullAccess = data?.entitlement?.is_full_access ?? false;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/intelligence/trade"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Trade Intelligence</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Scale className="w-6 h-6 text-blue-400" />
            </div>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400">
              U.S. Trade Policy
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            AGOA Eligibility Tracker
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Track African Growth and Opportunity Act eligibility status for sub-Saharan African countries.
          </p>

          {/* Data Attribution */}
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
              {data?.attribution?.data_label || 'Curated Preview Data'}
            </span>
            <span className="text-zinc-500">
              Source: {data?.attribution?.source_name || 'Office of the U.S. Trade Representative'}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        {data?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Total Tracked</p>
              <p className="text-2xl font-bold text-white">{data.summary.total_tracked}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Currently Eligible</p>
              <p className="text-2xl font-bold text-emerald-400">{data.summary.eligible_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Suspended</p>
              <p className="text-2xl font-bold text-red-400">{data.summary.suspended_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-zinc-500">{data.summary.note}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Notice */}
        {!isFullAccess && (
          <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-white font-medium">Limited View</p>
                <p className="text-zinc-400 text-sm">
                  Upgrade to Professional for full AGOA intelligence including eligibility history, suspension details, and source citations.
                </p>
              </div>
              <Link
                href="/access"
                className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Status</option>
              <option value="eligible">Eligible</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
              <option value="ineligible">Ineligible</option>
            </select>
          </div>
          <button
            onClick={() => fetchAGOAData()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
            <p className="text-zinc-500 mt-4">Loading AGOA data...</p>
          </div>
        ) : filteredStatuses.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Scale className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 mt-4">No AGOA status data available</p>
            <p className="text-zinc-500 text-sm mt-1">
              AGOA eligibility data is being curated. Check back soon.
            </p>
          </div>
        ) : (
          /* Countries Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStatuses.map((status) => (
              <div
                key={status.country_iso3}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{status.country_name}</h3>
                    <p className="text-zinc-500 text-sm">{status.country_iso3}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAGOAStatusColor(status.agoa_status)}`}>
                    {getAGOAStatusLabel(status.agoa_status)}
                  </span>
                </div>

                {status.is_full_access && (
                  <div className="space-y-2 text-sm">
                    {status.agoa_apparel_eligible !== undefined && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Apparel Eligible</span>
                        <span className={status.agoa_apparel_eligible ? 'text-emerald-400' : 'text-zinc-500'}>
                          {status.agoa_apparel_eligible ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    {status.agoa_eligible_since && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Eligible Since</span>
                        <span className="text-zinc-300">{formatDisplayDate(status.agoa_eligible_since)}</span>
                      </div>
                    )}
                    {status.agoa_last_reviewed_at && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Last Reviewed</span>
                        <span className="text-zinc-300">{formatDisplayDate(status.agoa_last_reviewed_at)}</span>
                      </div>
                    )}
                    {status.agoa_source_url && (
                      <a
                        href={status.agoa_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </a>
                    )}
                  </div>
                )}

                {!status.is_full_access && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <Lock className="w-3 h-3" />
                      <span>{status.upgrade_message}</span>
                    </div>
                  </div>
                )}

                {/* Source Badge */}
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">{status.data_label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
