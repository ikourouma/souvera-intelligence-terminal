'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('success');
    setTimeout(() => {
      router.push('/intelligence');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-12 group">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-white font-black tracking-[0.25em] uppercase text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            SOUVERA
          </span>
        </Link>

        {status === 'success' ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Password Updated</h1>
            <p className="text-zinc-400">
              Your password has been successfully reset. Redirecting to the terminal...
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Set New Password.</h1>
            <p className="text-zinc-500 text-sm font-medium mb-8">
              Choose a strong password for your Souvera account.
            </p>

            {status === 'error' && errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Lock className="w-3 h-3" /> New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={status === 'loading'}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 pr-12 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={status === 'loading'}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
                />
              </div>

              <div className="text-xs text-zinc-500 space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                  <li className={password.length >= 8 ? 'text-emerald-500' : ''}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(password) ? 'text-emerald-500' : ''}>One uppercase letter</li>
                  <li className={/[a-z]/.test(password) ? 'text-emerald-500' : ''}>One lowercase letter</li>
                  <li className={/[0-9]/.test(password) ? 'text-emerald-500' : ''}>One number</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold tracking-widest uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
