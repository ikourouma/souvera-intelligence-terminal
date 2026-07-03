'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthSlider } from '@/components/auth/AuthSlider';
import { ArrowRight, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ResendStatus = 'idle' | 'loading' | 'success' | 'error';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [resendStatus, setResendStatus] = useState<ResendStatus>('idle');
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    if (!email) {
      setResendStatus('error');
      setResendError('Email address is missing. Please sign up again.');
      return;
    }

    setResendStatus('loading');
    setResendError('');

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent('/intelligence/map')}`,
      },
    });

    if (error) {
      setResendStatus('error');
      setResendError(error.message);
      return;
    }

    setResendStatus('success');
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      <AuthSlider />

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-20 relative overflow-hidden bg-zinc-950">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />

        <div className="w-full max-w-md relative z-10">
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
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Check your email.</h1>
            <p className="text-zinc-500 text-sm font-medium">
              Confirm your address to activate your Explorer account
            </p>
          </div>

          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-white font-semibold mb-2">Confirmation link sent</h2>
                {email ? (
                  <p className="text-zinc-400 text-sm">
                    We sent a confirmation link to{' '}
                    <span className="text-white font-medium">{email}</span>. Click the link in that
                    email to finish setting up your account.
                  </p>
                ) : (
                  <p className="text-zinc-400 text-sm">
                    Check your inbox for a confirmation link from Souvera. Click it to activate your
                    Explorer account.
                  </p>
                )}
              </div>
            </div>
          </div>

          {resendStatus === 'success' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-emerald-400 text-sm">Confirmation email resent. Check your inbox.</p>
              </div>
            </div>
          )}

          {resendStatus === 'error' && resendError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{resendError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'loading' || !email}
              className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-white font-bold tracking-widest uppercase py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {resendStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend confirmation email'
              )}
            </button>

            <Link
              href="/login"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase py-3.5 rounded-sm transition-all flex items-center justify-center gap-2"
            >
              Back to sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-8 text-[11px] text-zinc-600 leading-relaxed text-center">
            Didn&apos;t receive the email? Check spam, or wait a few minutes before resending.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </main>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
