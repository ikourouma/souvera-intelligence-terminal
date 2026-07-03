// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// User Detail Modal
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Calendar, 
  Shield, 
  Clock, 
  Activity,
  FileText,
  Globe,
  Key,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  planId: string;
  status: 'active' | 'suspended' | 'pending';
  lastActive: string | null;
  createdAt: string;
  avatarUrl?: string;
}

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onAction: (action: 'suspend' | 'activate' | 'reset-password') => void;
}

interface UserDetails {
  profile: User;
  stats: {
    totalLogins: number;
    reportsGenerated: number;
    apiCalls: number;
    lastLoginIp?: string;
  };
  activity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export function UserDetailModal({ user, onClose, onAction }: UserDetailModalProps) {
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await fetch(`/api/v1/admin/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        } else {
          setDetails({
            profile: user,
            stats: { totalLogins: 0, reportsGenerated: 0, apiCalls: 0 },
            activity: [],
          });
        }
      } catch {
        setDetails({
          profile: user,
          stats: { totalLogins: 0, reportsGenerated: 0, apiCalls: 0 },
          activity: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [user]);

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const planLabels: Record<string, string> = {
    public: 'Public',
    explorer: 'Explorer',
    professional: 'Professional',
    business: 'Business',
    investor: 'Investor',
    institutional: 'Institutional',
    platform_admin: 'Platform Admin',
    super_admin: 'Super Admin',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">{getInitials(user.fullName, user.email)}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{user.fullName || 'Unnamed User'}</h2>
              <p className="text-sm text-zinc-400 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  user.status === 'suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                   user.status === 'suspended' ? <XCircle className="w-3 h-3 mr-1" /> :
                   <AlertCircle className="w-3 h-3 mr-1" />}
                  {user.status}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  {planLabels[user.planId] || 'Free'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {(['overview', 'activity', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-indigo-500 -mb-px'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-zinc-800 rounded-lg" />
              <div className="h-20 bg-zinc-800 rounded-lg" />
              <div className="h-20 bg-zinc-800 rounded-lg" />
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{details?.stats.totalLogins || 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">Total Logins</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{details?.stats.reportsGenerated || 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">Reports Generated</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{details?.stats.apiCalls || 0}</p>
                  <p className="text-xs text-zinc-500 mt-1">API Calls</p>
                </div>
              </div>

              {/* Info List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Joined</p>
                    <p className="text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Last Active</p>
                    <p className="text-sm text-white">{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
                {details?.stats.lastLoginIp && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <Globe className="w-4 h-4 text-zinc-500" />
                    <div>
                      <p className="text-xs text-zinc-500">Last Login IP</p>
                      <p className="text-sm text-white">{details.stats.lastLoginIp}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'activity' ? (
            <div className="space-y-3">
              {details?.activity && details.activity.length > 0 ? (
                details.activity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <Activity className="w-4 h-4 text-zinc-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.description}</p>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No activity recorded</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">User account settings and actions</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => onAction('reset-password')}
                  className="flex items-center gap-3 w-full p-4 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
                >
                  <Key className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Reset Password</p>
                    <p className="text-xs text-zinc-500">Send password reset email to user</p>
                  </div>
                </button>
                
                {user.status === 'active' ? (
                  <button
                    onClick={() => onAction('suspend')}
                    className="flex items-center gap-3 w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-left"
                  >
                    <Ban className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Suspend Account</p>
                      <p className="text-xs text-zinc-500">Temporarily disable user access</p>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onAction('activate')}
                    className="flex items-center gap-3 w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors text-left"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Activate Account</p>
                      <p className="text-xs text-zinc-500">Restore user access</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
