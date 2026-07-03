'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthSlider } from '@/components/auth/AuthSlider';
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle,
  UserPlus,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/auth/PasswordInput';

type FormStatus = 'idle' | 'loading' | 'error';

const MIN_PASSWORD_LENGTH = 8;

function isAlreadyRegisteredError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('already registered') ||
    lower.includes('already been registered') ||
    lower.includes('user already exists')
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/intelligence/map';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus('error');
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          plan_id: 'explorer',
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setStatus('error');
      if (isAlreadyRegisteredError(error.message)) {
        setErrorMessage(
          'An account with this email already exists. Sign in or reset your password.',
        );
      } else {
        setErrorMessage(error.message);
      }
      return;
    }

    router.push(`/signup/check-email?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      <AuthSlider />

      <div className="w-full md:w-1/2 md:flex-1 flex flex-col items-stretch relative overflow-y-auto bg-zinc-950 px-8 lg:px-12 xl:px-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

        <div className="w-full max-w-md lg:max-w-lg mx-auto pt-14 md:pt-6 pb-6 lg:py-10 relative z-10">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span
                className="text-white font-black tracking-[0.25em] uppercase text-2xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                SOUVERA
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create free account.</h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Free signup provisions the <span className="text-zinc-300">Explorer</span> plan —
              <br />
              country profiles, market signals, and the intelligence map
            </p>
          </div>

          {status === 'error' && errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-red-400 text-sm">
                  <p>{errorMessage}</p>
                  {isAlreadyRegisteredError(errorMessage) && (
                    <p className="mt-2">
                      <Link href="/login" className="text-white font-semibold hover:text-blue-400 underline">
                        Sign in
                      </Link>
                      {' · '}
                      <Link
                        href="/auth/forgot-password"
                        className="text-white font-semibold hover:text-blue-400 underline"
                      >
                        Reset password
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <User className="w-3 h-3" /> Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
                disabled={status === 'loading'}
                autoComplete="name"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                required
                disabled={status === 'loading'}
                autoComplete="email"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <Lock className="w-3 h-3" /> Password
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                required
                minLength={MIN_PASSWORD_LENGTH}
                disabled={status === 'loading'}
                autoComplete="new-password"
              />
              <p className="text-[10px] text-zinc-600">At least {MIN_PASSWORD_LENGTH} characters</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <Lock className="w-3 h-3" /> Confirm password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={MIN_PASSWORD_LENGTH}
                disabled={status === 'loading'}
                autoComplete="new-password"
              />
            </div>

            <p className="text-[10px] text-zinc-600 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/legal/terms" className="text-zinc-400 hover:text-white underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-zinc-400 hover:text-white underline">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold tracking-widest uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-900/20 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create free account
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-900 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-zinc-500 shrink-0">Already have an account?</span>
              <Link
                href="/login"
                className="text-sm font-bold text-white hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                Sign in <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="text-sm text-zinc-500 shrink-0">Need Professional or Business access?</span>
              <Link
                href="/access/request-access"
                className="text-sm font-bold text-white hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
