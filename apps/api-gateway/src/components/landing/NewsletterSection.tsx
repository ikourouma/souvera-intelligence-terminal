'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'newsletter',
          email,
          source_page: '/',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage('Too many requests. Please wait a moment.');
        } else {
          setErrorMessage(data.message || 'Unable to subscribe. Please try again.');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMessage('Network error. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <section className="py-24" style={{ background: '#0B0F14', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: CTA copy */}
          <div>
            <div className="section-label mb-3">Request Access</div>
            <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#F9FAFB' }}>
              Ready for Institutional-Grade Intelligence?
            </h2>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: '#9CA3AF' }}>
              Join analysts, investors, and government advisors using Souvera to monitor Africa and Caribbean market intelligence with high-frequency updates.
            </p>
            <Link
              href="/access"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-[11px] tracking-widest uppercase transition-all hover:gap-3"
              style={{ background: '#2563EB', color: 'white' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
            >
              View Access Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: email capture */}
          <div className="rounded-sm p-8" style={{ background: '#121821', border: '1px solid #1F2A37' }}>
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="w-5 h-5 rounded-full" style={{ background: '#22C55E' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#E5E7EB' }}>Intelligence Briefing Registered</h3>
                <p className="text-[13px]" style={{ color: '#6B7280' }}>You&apos;ll receive updates when new market intelligence is published.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#E5E7EB', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Intelligence Briefings
                </h3>
                <p className="text-[13px] mb-6" style={{ color: '#9CA3AF' }}>
                  Receive periodic briefings on Africa and Caribbean market signals, sector updates, and new intelligence releases.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {status === 'error' && (
                    <div className="p-3 rounded-sm flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-red-400">{errorMessage}</p>
                    </div>
                  )}
                  <div>
                    <label className="section-label mb-2 block">Corporate Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      disabled={status === 'loading'}
                      className="w-full px-4 py-3.5 text-[13px] text-white placeholder-zinc-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#0B0F14', border: '1px solid #1F2A37' }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'; }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1F2A37'; }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3.5 font-bold text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#2563EB', color: 'white' }}
                    onMouseEnter={e => { if (status !== 'loading') (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe to Intelligence Briefings'
                    )}
                  </button>
                </form>
                <p className="text-[10px] mt-4 font-mono" style={{ color: '#4B5563' }}>
                  By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
