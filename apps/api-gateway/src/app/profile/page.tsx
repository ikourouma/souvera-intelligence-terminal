'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Building2, Briefcase, Lock, 
  Loader2, CheckCircle2, AlertCircle, Eye, EyeOff,
  ArrowLeft, LogOut, Shield, CreditCard
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { comparePlansHref } from '@/lib/intelligence/routing';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  title: string | null;
  organization_name: string | null;
  avatar_url: string | null;
}

interface UserSubscription {
  plan_id: string;
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [profileStatus, setProfileStatus] = useState<FormStatus>('idle');
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<FormStatus>('idle');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('souvera_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setTitle(profileData.title || '');
        setOrganizationName(profileData.organization_name || '');
      }

      // Get subscription
      const { data: subData } = await supabase
        .from('souvera_subscriptions')
        .select('plan_id, status')
        .eq('user_id', user.id)
        .in('status', ['trial', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subData) {
        setSubscription(subData);
      }

      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('loading');
    setProfileError('');

    const { error } = await supabase
      .from('souvera_profiles')
      .update({
        full_name: fullName,
        title: title,
        organization_name: organizationName,
      })
      .eq('id', profile?.id);

    if (error) {
      setProfileStatus('error');
      setProfileError(error.message);
      return;
    }

    setProfileStatus('success');
    setTimeout(() => setProfileStatus('idle'), 3000);
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus('loading');
    setPasswordError('');

    // Verify current password is provided
    if (!currentPassword) {
      setPasswordStatus('error');
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordError('Passwords do not match.');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordStatus('error');
      setPasswordError(validationError);
      return;
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: currentPassword,
    });

    if (verifyError) {
      setPasswordStatus('error');
      setPasswordError('Current password is incorrect.');
      return;
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordStatus('error');
      setPasswordError(error.message);
      return;
    }

    setPasswordStatus('success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    );
  }

  const planDisplayName = subscription?.plan_id 
    ? subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1)
    : 'Explorer';

  return (
    <main className="min-h-screen bg-zinc-950">
      <SouveraMegaNav />
      <div className="py-12 px-4 pt-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/intelligence/map"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Intelligence Map
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Subscription Info */}
        <div id="subscription" className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-6 mb-8 scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-sm">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Current Plan</h2>
              <p className="text-zinc-400 text-sm">Manage your subscription</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{planDisplayName}</p>
              <p className="text-zinc-500 text-sm capitalize">
                Status: {subscription?.status || 'active'}
              </p>
            </div>
            <Link
              href={comparePlansHref('profile')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-sm transition-colors"
            >
              Compare Plans
            </Link>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-sm">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              <p className="text-zinc-400 text-sm">Update your personal details</p>
            </div>
          </div>

          {profileStatus === 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-400 text-sm">Profile updated successfully</span>
            </div>
          )}

          {profileStatus === 'error' && profileError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-400 text-sm">{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-sm px-4 py-3 text-zinc-400 text-sm cursor-not-allowed"
              />
              <p className="text-zinc-600 text-xs mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={profileStatus === 'loading'}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Briefcase className="w-3 h-3" /> Title / Role
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Analyst"
                disabled={profileStatus === 'loading'}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Building2 className="w-3 h-3" /> Organization
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your organization"
                disabled={profileStatus === 'loading'}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={profileStatus === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {profileStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-sm">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              <p className="text-zinc-400 text-sm">Update your account password</p>
            </div>
          </div>

          {passwordStatus === 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-400 text-sm">Password updated successfully</span>
            </div>
          )}

          {passwordStatus === 'error' && passwordError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-400 text-sm">{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3" /> Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={passwordStatus === 'loading'}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={passwordStatus === 'loading'}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3 pr-12 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3" /> Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={passwordStatus === 'loading'}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <div className="text-xs text-zinc-500 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                <li className={newPassword.length >= 8 ? 'text-emerald-500' : ''}>At least 8 characters</li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-emerald-500' : ''}>One uppercase letter</li>
                <li className={/[a-z]/.test(newPassword) ? 'text-emerald-500' : ''}>One lowercase letter</li>
                <li className={/[0-9]/.test(newPassword) ? 'text-emerald-500' : ''}>One number</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={passwordStatus === 'loading'}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white font-semibold py-3 rounded-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passwordStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
      </div>
      <SouveraFooter />
    </main>
  );
}
