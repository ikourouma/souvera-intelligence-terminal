'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { ArrowRight, CheckCircle2, Building2, Loader2, AlertCircle } from 'lucide-react';

const ORGANIZATION_TYPES = [
  'Development Finance Institution',
  'Government / Public Sector',
  'Investment Fund / Asset Manager',
  'Corporate / Enterprise',
  'Consulting / Advisory',
  'Research / Academic',
  'Other',
];

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function RequestAccessPage() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    organizationType: '',
    role: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'request_access',
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          organization: formData.organization,
          organization_type: formData.organizationType,
          role: formData.role,
          message: formData.message,
          source_page: '/access/request-access',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage('Too many requests. Please wait a moment and try again.');
        } else {
          setErrorMessage(data.message || 'Unable to submit your request. Please try again.');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMessage('A network error occurred. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Request Access
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Access Souvera Intelligence.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Complete the form below to request access to the Souvera Intelligence platform. Our team will review your request and respond within 2 business days.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              {status === 'success' ? (
                <div className="bg-[#121821] border border-zinc-800 rounded-sm p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Request Received
                  </h2>
                  <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    Thank you for your interest in Souvera. Our team will review your request and respond within 2 business days.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
                  >
                    Return to Home
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-400 font-medium">Submission Failed</p>
                        <p className="text-sm text-red-400/80 mt-1">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="name@organization.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                      Organization *
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Organization name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                      Organization Type *
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select type</option>
                      {ORGANIZATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                      Your Role *
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Your title or role"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                      How do you plan to use Souvera?
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      disabled={status === 'loading'}
                      className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Tell us about your use case..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-zinc-600">
                    By submitting this form, you agree to our{' '}
                    <Link href="/legal/privacy" className="text-blue-500 hover:text-blue-400">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/legal/terms" className="text-blue-500 hover:text-blue-400">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#121821] border border-zinc-800 rounded-sm p-8 sticky top-32">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  What happens next?
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Review', description: 'Our team reviews your request within 2 business days.' },
                    { step: '2', title: 'Contact', description: 'We\'ll reach out to discuss your requirements and best access tier.' },
                    { step: '3', title: 'Onboard', description: 'Get set up with credentials and begin exploring Souvera intelligence.' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-500">{item.step}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-zinc-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800">
                  <div className="flex items-start gap-4">
                    <Building2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white mb-1">Enterprise needs?</h4>
                      <p className="text-sm text-zinc-500 mb-3">
                        For custom solutions, API access, or institutional requirements.
                      </p>
                      <Link
                        href="/access/institutional"
                        className="text-[11px] font-bold tracking-widest uppercase text-purple-500 hover:text-purple-400"
                      >
                        View Institutional Solutions →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
