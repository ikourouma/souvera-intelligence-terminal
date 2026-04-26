'use client';

import React from 'react';
import Link from 'next/link';
import { AuthSlider } from '@/components/auth/AuthSlider';
import { ArrowRight, Mail, Globe, ShieldCheck, MessageSquare, Building2, ChevronDown } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Left Side: Marketing Slider */}
      <AuthSlider />

      {/* Right Side: Contact Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-20 relative overflow-y-auto bg-zinc-950">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="w-full max-w-lg relative z-10 py-12">
          {/* Logo Section */}
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-white font-black tracking-[0.25em] uppercase text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                SOUVERA
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Strategic Outreach.</h1>
            <p className="text-zinc-500 text-sm font-medium">Communicate directly with the Souvera Intelligence Board</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Full Identity
                </label>
                <input 
                  type="text" 
                  placeholder="Your Name"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Institutional Email
                </label>
                <input 
                  type="email" 
                  placeholder="name@organization.com"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Organization</label>
                <input 
                  type="text" 
                  placeholder="e.g. AfDB, IMF"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Directive Category</label>
                <div className="relative">
                  <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all appearance-none cursor-pointer">
                    <option value="intel">Market Intelligence Query</option>
                    <option value="api">Institutional API Access</option>
                    <option value="sovereign">Sovereign Investment</option>
                    <option value="press">Press & Relations</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Strategic Intent
              </label>
              <textarea 
                rows={5}
                placeholder="Briefly state the nature of your institutional directive..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700 resize-none"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] uppercase py-5 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-900/20"
            >
              Transmit Directive
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col gap-6">
            <div className="flex items-center gap-3 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                All communications are routed through secure sovereign data nodes. Zero-knowledge encryption is applied to all institutional directives.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
               <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-mono">
                 Souvera Intelligence Hub
               </div>
               <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-mono">
                 Response: ~2.4h
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
