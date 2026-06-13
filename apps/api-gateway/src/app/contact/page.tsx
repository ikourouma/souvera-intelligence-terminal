'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { ArrowRight, Mail, Building2, ChevronDown, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { contactPageSchema, generateJsonLd } from '@/lib/jsonld';
import { ACCESS_TYPE_OPTIONS, isAccessPlanId } from '@/lib/access-plans';

const INQUIRY_TYPES = [
  'General Inquiry',
  'Access & Pricing',
  'Enterprise Solutions',
  'Partnership Opportunity',
  'Media & Press',
  'Technical Support',
];

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

function ContactForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const source = searchParams.get('source');
  const intent = searchParams.get('intent');

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: '',
    accessType: '',
    message: '',
  });

  useEffect(() => {
    if (plan === 'business' || intent === 'upgrade') {
      setFormData((prev) => ({
        ...prev,
        inquiryType: prev.inquiryType || 'Access & Pricing',
        accessType: prev.accessType || (isAccessPlanId(plan) ? plan : 'business'),
        message:
          prev.message ||
          `I would like to upgrade to the Souvera Business plan for full intelligence reports (Investment Memos, Trade Profiles, Sector Deep-Dives, and AI custom reports).${source ? ` Referred from: ${source.replace(/-/g, ' ')}.` : ''}`,
      }));
    } else if (isAccessPlanId(plan)) {
      setFormData((prev) => ({
        ...prev,
        inquiryType: prev.inquiryType || 'Access & Pricing',
        accessType: prev.accessType || plan,
      }));
    }
  }, [plan, source, intent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'contact',
          email: formData.email,
          first_name: firstName,
          last_name: lastName,
          organization: formData.organization,
          inquiry_type: formData.inquiryType,
          access_type: formData.accessType || undefined,
          message: formData.message,
          source_page: '/contact',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage('Too many requests. Please wait a moment and try again.');
        } else {
          setErrorMessage(data.message || 'Unable to send your message. Please try again.');
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(contactPageSchema) }}
      />
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Contact
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Get in Touch.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Have questions about Souvera? Our team is here to help. Fill out the form below and we&apos;ll respond within 2 business days.
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
                    Message Received
                  </h2>
                  <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    Thank you for contacting us. Our team will review your message and respond within 2 business days.
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
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Full name"
                      />
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                        Inquiry Type *
                      </label>
                      <div className="relative">
                        <select
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleChange}
                          required
                          disabled={status === 'loading'}
                          className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select type</option>
                          {INQUIRY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                        Access Type{(intent === 'upgrade' || isAccessPlanId(plan)) ? ' *' : ''}
                      </label>
                      <div className="relative">
                        <select
                          name="accessType"
                          value={formData.accessType}
                          onChange={handleChange}
                          required={intent === 'upgrade' || isAccessPlanId(plan)}
                          disabled={status === 'loading'}
                          className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select tier</option>
                          {ACCESS_TYPE_OPTIONS.map((tier) => (
                            <option key={tier.value} value={tier.value}>
                              {tier.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      rows={5}
                      className="w-full px-4 py-3.5 bg-[#121821] border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors rounded-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="How can we help?"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-zinc-600">
                    By submitting this form, you agree to our{' '}
                    <Link href="/legal/privacy" className="text-blue-500 hover:text-blue-400">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#121821] border border-zinc-800 rounded-sm p-8 sticky top-32">
                <h3
                  className="text-xl font-bold mb-6"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Contact Information
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Email</h4>
                      <p className="text-sm text-zinc-400">contact@souvera.io</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Company</h4>
                      <p className="text-sm text-zinc-400">
                        Souvera is a product of Afronovation, Inc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800">
                  <h4 className="font-bold text-white mb-4">Quick Links</h4>
                  <div className="space-y-2">
                    <Link
                      href="/access/request-access"
                      className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors"
                    >
                      → Request Platform Access
                    </Link>
                    <Link
                      href="/access/institutional"
                      className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors"
                    >
                      → Enterprise Solutions
                    </Link>
                    <Link
                      href="/resources/faq"
                      className="block text-sm text-zinc-400 hover:text-blue-500 transition-colors"
                    >
                      → Frequently Asked Questions
                    </Link>
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

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactForm />
    </Suspense>
  );
}
