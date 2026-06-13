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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-zinc-800 last:border-b-0 last:pb-0">
              <div className="bg-zinc-800/50 rounded-lg p-2.5 flex-shrink-0">
                <Icon className={`w-5 h-5 ${colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white mb-1">{activity.message}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                  {activity.user && (
                    <span>by {activity.user}</span>
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
