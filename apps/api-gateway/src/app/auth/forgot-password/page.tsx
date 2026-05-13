'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('success');
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
            <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
            <p className="text-zinc-400 mb-8">
              We&apos;ve sent a password reset link to <span className="text-white">{email}</span>. 
              The link will expire in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Password Recovery.</h1>
            <p className="text-zinc-500 text-sm font-medium mb-8">
              Enter your email address and we&apos;ll send you a link to reset your password.
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
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold tracking-widest uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-900">
              <Link
                href="/login"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
