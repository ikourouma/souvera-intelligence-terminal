// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Header - Fortune 5 Enterprise Grade
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { SouveraLogo } from '@/components/ui/SouveraLogo';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'platform_admin' | 'super_admin';
  avatarUrl?: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
}

interface Notification {
  id: string;
  type: 'system' | 'user' | 'data' | 'content';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: string;
}

interface AdminHeaderProps {
  user: AdminUser;
  isSuperAdmin: boolean;
}

export function AdminHeader({ user, isSuperAdmin }: AdminHeaderProps) {
  const router = useRouter();
  const [health, setHealth] = useState<SystemHealth>({ status: 'healthy', lastCheck: new Date().toISOString() });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHealth();
    fetchNotifications();
    
    const healthInterval = setInterval(fetchHealth, 30000);
    const notificationInterval = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(healthInterval);
      clearInterval(notificationInterval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchHealth() {
    try {
      const response = await fetch('/api/v1/admin/dashboard/health');
      if (response.ok) {
        const data = await response.json();
        setHealth({ status: data.status, lastCheck: new Date().toISOString() });
      }
    } catch {
      setHealth({ status: 'error', lastCheck: new Date().toISOString() });
    }
  }

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/v1/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      console.error('[AdminHeader] Failed to fetch notifications');
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/v1/admin/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      console.error('[AdminHeader] Failed to mark notification as read');
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/v1/admin/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      console.error('[AdminHeader] Failed to mark all as read');
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch {
      console.error('[AdminHeader] Logout failed');
      setLoggingOut(false);
    }
  }

  const healthConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      pulse: 'animate-pulse',
      label: 'All Systems Operational',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      pulse: '',
      label: 'Degraded Performance',
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      pulse: '',
      label: 'System Issues Detected',
    },
  };

  const currentHealth = healthConfig[health.status];
  const HealthIcon = currentHealth.icon;
  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Console Badge */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center group">
              <SouveraLogo variant="full" size="sm" />
            </Link>
            <div className="h-6 w-px bg-zinc-700" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-zinc-300">Admin Console</span>
            </div>
          </div>

          {/* Center: System Health Indicator */}
          <div className="hidden lg:flex items-center">
            <div className={`flex items-center gap-2 px-4 py-1.5 ${currentHealth.bg} border ${currentHealth.border} rounded-full`}>
              <span className={`relative flex h-2 w-2`}>
                <span className={`${currentHealth.pulse} absolute inline-flex h-full w-full rounded-full ${currentHealth.color.replace('text-', 'bg-')} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentHealth.color.replace('text-', 'bg-')}`}></span>
              </span>
              <span className={`text-xs font-medium ${currentHealth.color}`}>
                {currentHealth.label}
              </span>
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2">
            {/* Mobile Health Indicator */}
            <div className={`lg:hidden flex items-center justify-center w-9 h-9 ${currentHealth.bg} border ${currentHealth.border} rounded-lg`}>
              <HealthIcon className={`w-4 h-4 ${currentHealth.color}`} />
            </div>

            {/* Notification Bell */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 hover:border-zinc-600 transition-all"
              >
                <Bell className="w-4 h-4 text-zinc-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`w-full px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-b-0 ${
                            !notification.isRead ? 'bg-zinc-800/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              notification.severity === 'critical' ? 'bg-red-500' :
                              notification.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-zinc-300'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-zinc-600 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
                    <Link 
                      href="/admin/notifications" 
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{initials}</span>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white leading-tight">{user.fullName || user.email}</p>
                  <p className="text-xs text-zinc-500">
                    {isSuperAdmin ? 'Super Admin' : 'Platform Admin'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 hidden md:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-medium text-white">{user.fullName || 'Admin User'}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                        isSuperAdmin 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {isSuperAdmin ? 'Super Admin' : 'Platform Admin'}
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4 text-zinc-500" />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-zinc-500" />
                      Settings
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Activity className="w-4 h-4 text-zinc-500" />
                      Dashboard
                    </Link>
                  </div>
                  <div className="border-t border-zinc-800 py-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {loggingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
