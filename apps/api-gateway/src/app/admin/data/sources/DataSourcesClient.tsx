'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Data Sources Client Component
// Owner: Afronovation, Inc.
// ===========================================

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  RefreshCw,
  Database,
  Globe,
  FileText,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { DataSource, SourceType, ConfidenceLevel } from '@/lib/data/types';

interface SourcesResponse {
  sources: DataSource[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

function getSourceTypeIcon(type: SourceType) {
  switch (type) {
    case 'api': return Globe;
    case 'file': return FileText;
    case 'manual': return Edit2;
    default: return Database;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'testing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'paused': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    case 'retired': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

function getConfidenceColor(level: ConfidenceLevel) {
  switch (level) {
    case 'high': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'medium': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'low': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'curated': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

export function DataSourcesClient() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false
  });

  async function fetchSources() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('source_type', typeFilter);
      params.set('limit', pagination.limit.toString());
      params.set('offset', pagination.offset.toString());
      
      const response = await fetch(`/api/v1/admin/sources?${params.toString()}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch sources');
      }
      
      const data: SourcesResponse = await response.json();
      setSources(data.sources);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sources');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSources();
  }, [statusFilter, typeFilter, pagination.offset]);

  const filteredSources = sources.filter(source => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      source.name.toLowerCase().includes(query) ||
      source.key.toLowerCase().includes(query) ||
      source.domain.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Sources</h1>
          <p className="text-zinc-400 mt-1">
            Manage data sources for the Souvera Intelligence Terminal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSources()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="testing">Testing</option>
            <option value="paused">Paused</option>
            <option value="retired">Retired</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Types</option>
            <option value="api">API</option>
            <option value="file">File</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Sources</p>
              <p className="text-2xl font-bold text-white">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Approved</p>
              <p className="text-2xl font-bold text-white">
                {sources.filter(s => s.source_status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Testing</p>
              <p className="text-2xl font-bold text-white">
                {sources.filter(s => s.source_status === 'testing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">API Sources</p>
              <p className="text-2xl font-bold text-white">
                {sources.filter(s => s.source_type === 'api').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Sources Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
            <p className="text-zinc-500 mt-4">Loading sources...</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 mt-4">No data sources found</p>
            <p className="text-zinc-500 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Add a data source to get started'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredSources.map((source) => {
                const TypeIcon = getSourceTypeIcon(source.source_type);
                return (
                  <tr key={source.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg">
                          <TypeIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{source.name}</p>
                          <p className="text-zinc-500 text-sm font-mono">{source.key}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300 text-sm capitalize">
                        {source.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300 text-sm capitalize">
                        {source.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(source.confidence_level)}`}>
                        {source.confidence_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(source.source_status)}`}>
                        {source.source_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} sources
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 rounded-lg text-sm text-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={!pagination.has_more}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 rounded-lg text-sm text-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Add Data Source</h2>
            <p className="text-zinc-400 mb-6">Create a new data source for the intelligence terminal.</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Source Key</label>
                <input
                  type="text"
                  placeholder="e.g., world_bank_wdi"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g., World Bank"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Domain</label>
                  <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <option value="macro">Macro</option>
                    <option value="trade">Trade</option>
                    <option value="policy">Policy</option>
                    <option value="reference">Reference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Source Type</label>
                  <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <option value="api">API</option>
                    <option value="file">File</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Provider URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
              >
                Create Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
