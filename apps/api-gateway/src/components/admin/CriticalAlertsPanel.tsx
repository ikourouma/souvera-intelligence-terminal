// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Critical Alerts Panel - Fortune 5 Design
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, XCircle, CheckCircle, ArrowRight, Bell } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export function CriticalAlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch {
        console.error('[CriticalAlertsPanel] Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="animate-pulse">
          <div className="h-5 bg-zinc-800 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const alertConfig = {
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    info: {
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  };

  const criticalAlerts = alerts.filter(a => a.type === 'error' || a.type === 'warning');
  const hasAlerts = criticalAlerts.length > 0;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Critical Alerts</h3>
        {hasAlerts && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400">
            {criticalAlerts.length} active
          </span>
        )}
      </div>

      {!hasAlerts ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full p-3 mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-emerald-400">All Systems Operational</p>
          <p className="text-xs text-zinc-500 mt-1">No critical alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-2">
          {criticalAlerts.slice(0, 4).map((alert) => {
            const config = alertConfig[alert.type];
            const AlertIcon = config.icon;

            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 ${config.bg} border ${config.border} rounded-lg`}
              >
                <AlertIcon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${config.color}`}>{alert.message}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}

          {criticalAlerts.length > 4 && (
            <p className="text-xs text-zinc-500 text-center pt-2">
              +{criticalAlerts.length - 4} more alerts
            </p>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <Link
          href="/admin/notifications"
          className="flex items-center justify-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Bell className="w-4 h-4" />
          View All Alerts
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
