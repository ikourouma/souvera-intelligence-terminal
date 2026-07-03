'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthSlider } from '@/components/auth/AuthSlider';
import { ArrowRight, Lock, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/auth/PasswordInput';

type AuthMode = 'password' | 'magic-link';
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/intelligence/map';

  const [mode, setMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please check your credentials and try again.'
        : error.message);
      return;
    }

    setStatus('success');
    router.push(redirectTo);
    router.refresh();
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('success');
  };

  const handleSubmit = mode === 'password' ? handlePasswordLogin : handleMagicLinkLogin;

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      {/* Left Side: Marketing Slider */}
      <AuthSlider />

      {/* Right Side: Auth Form */}
      <div className="w-full md:w-1/2 md:flex-1 flex flex-col items-stretch relative overflow-y-auto bg-zinc-950 px-8 lg:px-12 xl:px-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

        <div className="w-full max-w-xl lg:max-w-2xl mx-auto pt-14 md:pt-6 pb-6 lg:py-10 relative z-10">
          {/* Logo Section */}
          <div className="mb-12">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-white font-black tracking-[0.25em] uppercase text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                SOUVERA
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Institutional Login.</h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Access the Souvera Intelligence
              <br />
              Terminal
            </p>
          </div>

          {/* Success State for Magic Link */}
          {status === 'success' && mode === 'magic-link' && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Check your email</h3>
                  <p className="text-zinc-400 text-sm">
                    We&apos;ve sent a magic link to <span className="text-white">{email}</span>. 
                    Click the link in the email to sign in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex mb-6 bg-zinc-900/50 rounded-sm p-1">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                mode === 'password'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic-link')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                mode === 'magic-link'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <Mail className="w-3 h-3" /> Corporate Identity
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

            {mode === 'password' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Secure Passcode
                  </label>
                  <Link href="/auth/forgot-password" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest font-mono">
                    Recovery
                  </Link>
                </div>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  required
                  disabled={status === 'loading'}
                  autoComplete="current-password"
                  inputClassName="px-4 py-4"
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold tracking-widest uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-900/20 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'password' ? 'Authorizing...' : 'Sending Link...'}
                </>
              ) : (
                <>
                  {mode === 'password' ? 'Authorize Access' : 'Send Magic Link'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Additional Actions */}
          <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-zinc-500 shrink-0">New to Souvera?</span>
              <Link href="/signup" className="text-sm font-bold text-white hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                Create free account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-zinc-500 shrink-0">Need terminal access?</span>
              <Link href="/access/request-access" className="text-sm font-bold text-white hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                Request Access <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Enterprise-grade security. All sessions are encrypted
                <br className="hidden sm:block" />
                and access is logged for compliance.
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-16 flex items-center justify-between gap-6 opacity-30 whitespace-nowrap">
             <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono shrink-0">
               Souvera Intel // V2.1.0
             </div>
             <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono shrink-0">
               Afronovation, Inc.
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
