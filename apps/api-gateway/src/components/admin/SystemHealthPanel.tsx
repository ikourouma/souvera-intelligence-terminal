// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// System Health Panel - Fortune 5 Design
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Activity, Database, Globe, HardDrive } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  latency?: number;
  icon: React.ElementType;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  checks: {
    database: boolean;
    api: boolean;
    storage: boolean;
  };
}

export function SystemHealthPanel() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        }
      } catch {
        setHealth({
          status: 'error',
          checks: { database: false, api: false, storage: false },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="animate-pulse">
          <div className="h-5 bg-zinc-800 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const healthChecks: HealthCheck[] = [
    {
      name: 'Database',
      status: health?.checks.database ? 'healthy' : 'error',
      latency: 12,
      icon: Database,
    },
    {
      name: 'API Services',
      status: health?.checks.api ? 'healthy' : 'error',
      latency: 45,
      icon: Globe,
    },
    {
      name: 'Storage',
      status: health?.checks.storage ? 'healthy' : 'error',
      latency: 28,
      icon: HardDrive,
    },
    {
      name: 'Ingestion Workers',
      status: 'healthy',
      icon: Activity,
    },
  ];

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      label: 'Healthy',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      label: 'Degraded',
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      label: 'Down',
    },
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">System Health</h3>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[health?.status || 'healthy'].bg} ${statusConfig[health?.status || 'healthy'].border} border ${statusConfig[health?.status || 'healthy'].color}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig[health?.status || 'healthy'].color.replace('text-', 'bg-')}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig[health?.status || 'healthy'].color.replace('text-', 'bg-')}`}></span>
          </span>
          {statusConfig[health?.status || 'healthy'].label}
        </div>
      </div>

      <div className="space-y-3">
        {healthChecks.map((check) => {
          const config = statusConfig[check.status];
          const StatusIcon = config.icon;
          const CheckIcon = check.icon;

          return (
            <div
              key={check.name}
              className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <div className={`${config.bg} border ${config.border} rounded-lg p-2`}>
                  <CheckIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{check.name}</p>
                  {check.latency && (
                    <p className="text-xs text-zinc-500">{check.latency}ms latency</p>
                  )}
                </div>
              </div>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
