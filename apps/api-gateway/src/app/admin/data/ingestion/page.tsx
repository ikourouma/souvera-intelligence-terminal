// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Ingestion Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { Upload, Play, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ingestion | Admin',
  description: 'Manage data ingestion runs for Souvera Intelligence Terminal',
};

export default function IngestionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Ingestion</h1>
          <p className="text-zinc-400 mt-1">
            Monitor and trigger data ingestion runs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Data
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Trigger Ingestion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Successful</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Failed</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Partial</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Scheduled</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingestion Runs Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Recent Ingestion Runs</h2>
        </div>
        <div className="p-12 text-center">
          <Upload className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 mt-4">No ingestion runs yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Upload data or trigger an ingestion to see run history
          </p>
        </div>
      </div>

      {/* Scheduled Jobs */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scheduled Ingestion Jobs</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">World Bank WDI Update</p>
                <p className="text-zinc-500 text-sm">Weekly macro indicators refresh</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">Every Sunday 00:00 UTC</span>
              <span className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-400">Pending Setup</span>
            </div>
          </div>
        </div>
        <p className="text-zinc-500 text-xs mt-4">
          Scheduled ingestion requires cron job configuration. See Phase 4B Sprint 3.
        </p>
      </div>
    </div>
  );
}
