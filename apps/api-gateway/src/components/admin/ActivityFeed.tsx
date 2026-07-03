// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Activity Feed Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { Clock, Database, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'upload' | 'ingestion' | 'report' | 'error' | 'success';
  message: string;
  timestamp: string;
  user?: string;
}

const activityIcons = {
  upload: Upload,
  ingestion: Database,
  report: FileText,
  error: AlertCircle,
  success: CheckCircle,
};

const activityColors = {
  upload: 'text-blue-400',
  ingestion: 'text-purple-400',
  report: 'text-emerald-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/activities');
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('[ActivityFeed] Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="space-y-2">
        {activities.slice(0, 6).map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          const bgClass = activity.type === 'error' ? 'bg-red-500/10 border-red-500/20' :
                          activity.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                          activity.type === 'upload' ? 'bg-blue-500/10 border-blue-500/20' :
                          activity.type === 'ingestion' ? 'bg-purple-500/10 border-purple-500/20' :
                          'bg-zinc-800/50 border-zinc-700/50';

          return (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`${bgClass} border rounded-lg p-2 flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-tight">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-zinc-500">
                    {formatRelativeTime(new Date(activity.timestamp))}
                  </span>
                  {activity.user && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500">{activity.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}
