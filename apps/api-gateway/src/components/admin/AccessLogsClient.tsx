// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// User Access Logs Client Component (Stub)
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import {
  ScrollText,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  Globe,
  User,
  Key,
} from 'lucide-react';

export function AccessLogsClient() {
  const plannedFeatures = [
    {
      icon: User,
      title: 'Login Events',
      description: 'Track successful and failed authentication attempts',
    },
    {
      icon: Globe,
      title: 'Page Views',
      description: 'Monitor user navigation and page access patterns',
    },
    {
      icon: Activity,
      title: 'API Requests',
      description: 'Log API endpoint usage and response times',
    },
    {
      icon: AlertTriangle,
      title: 'Security Events',
      description: 'Failed auth attempts, suspicious activity detection',
    },
    {
      icon: Key,
      title: 'Permission Changes',
      description: 'Track role and access level modifications',
    },
    {
      icon: Clock,
      title: 'Session Analytics',
      description: 'User session duration and activity metrics',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          User Access Logs
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Track user activity and access patterns
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-zinc-900/50 border border-indigo-500/20 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ScrollText className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Coming in Phase 5</h2>
        <p className="text-zinc-400 max-w-lg mx-auto mb-8">
          Comprehensive user activity logging is planned for Phase 5 of the Souvera platform development.
          This feature will provide full visibility into user behavior and security events.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-400">
          <Clock className="w-4 h-4" />
          <span>Scheduled for Phase 5 Sprint 2</span>
        </div>
      </div>

      {/* Planned Features */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Planned Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plannedFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <feature.icon className="w-5 h-5 text-zinc-400" />
                <h3 className="text-white font-medium">{feature.title}</h3>
              </div>
              <p className="text-sm text-zinc-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Alternatives */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white mb-3">Current Alternatives</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            <span>
              <strong className="text-zinc-300">Audit Logs:</strong>{' '}
              View data changes at{' '}
              <a href="/admin/system/audit" className="text-indigo-400 hover:underline">
                /admin/system/audit
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            <span>
              <strong className="text-zinc-300">Supabase Dashboard:</strong>{' '}
              View auth logs directly in your Supabase project dashboard
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            <span>
              <strong className="text-zinc-300">Vercel Analytics:</strong>{' '}
              Page view and performance metrics (if enabled)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
