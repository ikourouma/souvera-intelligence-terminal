// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// User Management Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  UserPlus, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Ban,
  Key,
  RefreshCw,
} from 'lucide-react';
import { UserDetailModal } from './UserDetailModal';
import { AddUserModal } from './AddUserModal';

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

interface UserStats {
  total: number;
  active: number;
  suspended: number;
  newThisWeek: number;
}

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  public: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
  explorer: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  professional: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  business: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  investor: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  institutional: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  platform_admin: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  super_admin: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
};

export function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuUser, setActionMenuUser] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(planFilter !== 'all' && { plan: planFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/v1/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('[UserManagement] Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, planFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/admin/users/export', { method: 'POST' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('[UserManagement] Export failed:', error);
    }
  };

  const handleAction = async (userId: string, action: 'suspend' | 'activate' | 'reset-password') => {
    try {
      const endpoint = action === 'reset-password' 
        ? `/api/v1/admin/users/${userId}/reset-password`
        : `/api/v1/admin/users/${userId}/status`;
      
      const response = await fetch(endpoint, {
        method: action === 'reset-password' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'reset-password' ? {} : { status: action === 'suspend' ? 'suspended' : 'active' }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(`[UserManagement] ${action} failed:`, error);
    }
    setActionMenuUser(null);
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            User Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage platform users, subscriptions, and access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">Active (7d)</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.suspended.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">Suspended</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.newThisWeek.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">New (7d)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                showFilters 
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-zinc-800">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Plan</label>
              <select
                value={planFilter}
                onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">All Plans</option>
                <option value="explorer">Explorer</option>
                <option value="professional">Professional</option>
                <option value="business">Business</option>
                <option value="investor">Investor</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Plan</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Last Active</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Joined</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 bg-zinc-800 rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-zinc-800 rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No users found</p>
                    <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const planColor = PLAN_COLORS[user.planId] || PLAN_COLORS.public;
                  
                  return (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">{getInitials(user.fullName, user.email)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{user.fullName || 'Unnamed User'}</p>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${planColor.bg} ${planColor.text} border ${planColor.border}`}>
                          {user.planId?.replace('_', ' ') || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          user.status === 'active' ? 'text-emerald-400' :
                          user.status === 'suspended' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {user.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> :
                           user.status === 'suspended' ? <XCircle className="w-3.5 h-3.5" /> :
                           <AlertCircle className="w-3.5 h-3.5" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400">
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 relative">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {actionMenuUser === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10 overflow-hidden">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {}}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Plan
                              </button>
                              <button
                                onClick={() => handleAction(user.id, 'reset-password')}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                              >
                                <Key className="w-4 h-4" />
                                Reset Password
                              </button>
                              <div className="border-t border-zinc-800" />
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleAction(user.id, 'suspend')}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                  <Ban className="w-4 h-4" />
                                  Suspend User
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAction(user.id, 'activate')}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Activate User
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={(action) => {
            handleAction(selectedUser.id, action);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            setShowAddUserModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
