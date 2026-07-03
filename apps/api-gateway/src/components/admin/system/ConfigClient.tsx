// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// System Configuration Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Cpu,
  HardDrive,
} from 'lucide-react';

interface SystemConfig {
  environment: string;
  nodeVersion: string;
  nextVersion: string;
  supabaseUrl: string;
  deploymentRegion: string;
  buildTime: string;
}

interface HealthStatus {
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  auth: 'healthy' | 'degraded' | 'down';
}

export function ConfigClient() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/v1/admin/system/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
          setHealth(data.health);
        }
      } catch (error) {
        console.error('[Config] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'down':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'degraded':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'down':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-800 rounded w-64" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-800/50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            System Configuration
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Platform environment and runtime information
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Health Status */}
      {health && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">System Health</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(health.database)}`}>
              <Database className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs capitalize">{health.database}</p>
              </div>
              {getStatusIcon(health.database)}
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(health.api)}`}>
              <Globe className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">API Gateway</p>
                <p className="text-xs capitalize">{health.api}</p>
              </div>
              {getStatusIcon(health.api)}
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(health.auth)}`}>
              <Shield className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs capitalize">{health.auth}</p>
              </div>
              {getStatusIcon(health.auth)}
            </div>
          </div>
        </div>
      )}

      {/* Environment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runtime */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Runtime Environment</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Environment</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                config?.environment === 'production'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {config?.environment || 'development'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Node.js Version</span>
              <span className="text-sm text-white font-mono">{config?.nodeVersion || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Next.js Version</span>
              <span className="text-sm text-white font-mono">{config?.nextVersion || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-400">Build Time</span>
              <span className="text-sm text-white">{config?.buildTime || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Infrastructure</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Database Provider</span>
              <span className="text-sm text-white">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Supabase Project</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono truncate max-w-[200px]">
                  {config?.supabaseUrl ? new URL(config.supabaseUrl).hostname.split('.')[0] : 'N/A'}
                </span>
                {config?.supabaseUrl && (
                  <a
                    href={`${config.supabaseUrl}/project/default`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Deployment Region</span>
              <span className="text-sm text-white">{config?.deploymentRegion || 'Auto'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-400">CDN</span>
              <span className="text-sm text-white">Vercel Edge Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-zinc-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Security Information</h3>
            <p className="text-xs text-zinc-500">
              Sensitive configuration values (API keys, service role keys, secrets) are not exposed through this interface.
              Access environment variables through your deployment platform's dashboard for security.
            </p>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-end gap-4 text-xs text-zinc-600">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
