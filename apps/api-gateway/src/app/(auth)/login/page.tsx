'use client';

import React from 'react';
import Link from 'next/link';
import { AuthSlider } from '@/components/auth/AuthSlider';
import { ArrowRight, Lock, ShieldCheck, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Left Side: Marketing Slider */}
      <AuthSlider />

      {/* Right Side: Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-20 relative overflow-hidden bg-zinc-950">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="w-full max-w-md relative z-10">
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
            <p className="text-zinc-500 text-sm font-medium">Access the Souvera Intelligence Terminal</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <Mail className="w-3 h-3" /> Corporate Identity
              </label>
              <input 
                type="email" 
                placeholder="name@organization.com"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Secure Passcode
                </label>
                <Link href="/forgot" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest font-mono">
                  Recovery
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-4 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-900/20"
            >
              Authorize Access
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Additional Actions */}
          <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Need terminal access?</span>
              <Link href="/register" className="text-sm font-bold text-white hover:text-blue-500 transition-colors flex items-center gap-1.5">
                Register Account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Secure 256-bit AES encryption active. Access logs are monitored by the Sovereign Compliance Board.
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-20 flex items-center justify-between opacity-30 group">
             <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">
               Souvera Intel // V2.0.4
             </div>
             <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">
               AfDEC Endorsed
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
