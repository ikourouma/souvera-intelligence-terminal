'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, FileText, RefreshCw, Trash2 } from 'lucide-react';

interface ReportAdminStats {
  period: string;
  totalRequests: number;
  usageRowsThisMonth: number;
  topUsage: Array<{
    user_id: string;
    template_count: number;
    ai_count: number;
    period_yyyy_mm: string;
  }>;
}

export function ReportsResetClient() {
  const [stats, setStats] = useState<ReportAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('business@afronovation.com');
  const [period, setPeriod] = useState('');
  const [usageOnly, setUsageOnly] = useState(false);
  const [keepStorage, setKeepStorage] = useState(false);
  const [keepHistory, setKeepHistory] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/reports');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to load report stats');
      }
      const data = await res.json();
      setStats(data.stats);
      setPeriod((prev) => prev || data.stats?.period || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleReset = async (allUsers: boolean) => {
    if (confirmText !== 'RESET_REPORTS') {
      setError('Type RESET_REPORTS to confirm');
      return;
    }
    if (!allUsers && !email.trim()) {
      setError('Email is required');
      return;
    }

    setResetting(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await fetch('/api/v1/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: allUsers ? undefined : email.trim(),
          allUsers,
          period: period || undefined,
          usageOnly,
          keepStorage,
          keepHistory,
          confirm: 'RESET_REPORTS',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Reset failed');

      const r = data.result;
      setLastResult(
        `Reset complete: ${r.usageRowsReset} usage row(s), ${r.requestsDeleted} request(s), ${r.storageFilesDeleted} storage file(s).`
      );
      setConfirmText('');
      await fetchStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-400" />
            Report Quota &amp; History
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Platform admin: reset monthly quota counters, report request history, and stored PDFs.
            Use for QA or support when a subscriber hits plan limits.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {lastResult && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {lastResult}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total report requests" value={stats?.totalRequests ?? '—'} />
        <StatCard label="Usage rows (this month)" value={stats?.usageRowsThisMonth ?? '—'} />
        <StatCard label="Current period (UTC)" value={stats?.period ?? '—'} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-amber-400" />
          Reset reports
        </h2>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/90">
            This permanently deletes quota usage for the selected scope, report history rows, and
            PDFs in the reports storage bucket (unless options below are checked). Audit logged.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">User email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="business@afronovation.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Period (YYYY-MM, optional)
            </span>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="2026-05"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usageOnly}
              onChange={(e) => setUsageOnly(e.target.checked)}
              className="rounded border-zinc-600"
            />
            Quota only (keep history &amp; PDFs)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={keepHistory}
              onChange={(e) => setKeepHistory(e.target.checked)}
              disabled={usageOnly}
              className="rounded border-zinc-600 disabled:opacity-40"
            />
            Keep request history
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={keepStorage}
              onChange={(e) => setKeepStorage(e.target.checked)}
              disabled={usageOnly}
              className="rounded border-zinc-600 disabled:opacity-40"
            />
            Keep storage PDFs
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            Type RESET_REPORTS to confirm
          </span>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white font-mono"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={resetting}
            onClick={() => handleReset(false)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {resetting ? 'Resetting…' : 'Reset user'}
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={() => handleReset(true)}
            className="px-4 py-2 rounded-lg border border-red-500/50 text-red-300 hover:bg-red-500/10 text-sm font-medium disabled:opacity-50"
          >
            Reset all users
          </button>
        </div>
      </div>

      {stats?.topUsage?.length ? (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <h3 className="text-sm font-semibold text-zinc-300">Top usage this month</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-2 font-medium">User ID</th>
                <th className="px-4 py-2 font-medium">Template</th>
                <th className="px-4 py-2 font-medium">AI</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsage.map((row) => (
                <tr key={row.user_id} className="border-b border-zinc-800/50 text-zinc-300">
                  <td className="px-4 py-2 font-mono text-xs">{row.user_id}</td>
                  <td className="px-4 py-2">{row.template_count}</td>
                  <td className="px-4 py-2">{row.ai_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
