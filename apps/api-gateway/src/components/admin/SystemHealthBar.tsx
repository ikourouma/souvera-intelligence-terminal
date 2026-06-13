// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// System Health Bar Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  checks: {
    database: boolean;
    api: boolean;
    storage: boolean;
  };
}

export function SystemHealthBar() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemHealth() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        } else {
          setHealth({
            status: 'error',
            message: 'Unable to fetch system status',
            checks: { database: false, api: false, storage: false },
          });
        }
      } catch (error) {
        console.error('[SystemHealthBar] Error fetching health:', error);
        setHealth({
          status: 'error',
          message: 'System health check failed',
          checks: { database: false, api: false, storage: false },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSystemHealth();
    
    const interval = setInterval(fetchSystemHealth, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-zinc-800 rounded" />
          <div className="h-4 bg-zinc-800 rounded w-48" />
        </div>
      </div>
    );
  }

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    warning: {
      icon: AlertCircle,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
    },
    error: {
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
    },
  };

  const config = statusConfig[health?.status || 'healthy'];
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
          <div>
            <p className={`text-sm font-semibold ${config.textColor}`}>
              {health?.message || 'Checking system status...'}
            </p>
            {health?.checks && (
              <div className="flex items-center gap-4 mt-1">
                <span className={`text-xs ${health.checks.database ? 'text-emerald-400' : 'text-red-400'}`}>
                  Database: {health.checks.database ? '✓' : '✗'}
                </span>
                <span className={`text-xs ${health.checks.api ? 'text-emerald-400' : 'text-red-400'}`}>
                  API: {health.checks.api ? '✓' : '✗'}
                </span>
                <span className={`text-xs ${health.checks.storage ? 'text-emerald-400' : 'text-red-400'}`}>
                  Storage: {health.checks.storage ? '✓' : '✗'}
                </span>
              </div>
            )}
          </div>
        </div>
        <Activity className={`w-5 h-5 ${config.textColor} animate-pulse`} />
      </div>
    </div>
  );
}
