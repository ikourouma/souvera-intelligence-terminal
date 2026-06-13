// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Alert Banner Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, XCircle, AlertCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error('[AlertBanner] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  const alertConfig = {
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
      iconColor: 'text-amber-400',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
      iconColor: 'text-red-400',
    },
    info: {
      icon: AlertCircle,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400',
    },
  };

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${config.textColor} font-medium`}>
                  {alert.message}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setDismissed(new Set(dismissed).add(alert.id))}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
