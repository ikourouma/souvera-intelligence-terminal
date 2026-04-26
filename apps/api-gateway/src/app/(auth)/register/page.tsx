'use client';

import React from 'react';
import Link from 'next/link';
import { AuthSlider } from '@/components/auth/AuthSlider';
import { ArrowRight, UserPlus, Building2, Briefcase, ChevronDown } from 'lucide-react';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Left Side: Marketing Slider */}
      <AuthSlider />

      {/* Right Side: Auth Form */}
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
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Institutional Onboarding.</h1>
            <p className="text-zinc-500 text-sm font-medium">Join the world's most elite market intelligence network</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Given Name</label>
                <input 
                  type="text" 
                  placeholder="Ibrahim"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Surname</label>
                <input 
                  type="text" 
                  placeholder="K."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Institutional Email</label>
              <input 
                type="email" 
                placeholder="name@organization.com"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Organization
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. AfDB, IMF"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Professional Role
                </label>
                <div className="relative">
                  <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-4 py-3.5 text-white text-sm focus:border-blue-600 focus:outline-none transition-all appearance-none cursor-pointer">
                    <option value="analyst">Market Analyst</option>
                    <option value="investor">Institutional Investor</option>
                    <option value="government">Government Official</option>
                    <option value="executive">Executive Leader</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Requested Access Tier</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'explorer', label: 'Explorer', desc: 'Free Core Signals' },
                  { id: 'professional', label: 'Professional', desc: 'Deep Intelligence' }
                ].map((tier) => (
                  <label key={tier.id} className="relative cursor-pointer group">
                    <input type="radio" name="tier" value={tier.id} className="peer sr-only" defaultChecked={tier.id === 'explorer'} />
                    <div className="p-3 border border-zinc-800 bg-zinc-900/30 rounded-sm group-hover:border-blue-600/50 transition-all peer-checked:border-blue-600 peer-checked:bg-blue-600/5">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-0.5">{tier.label}</div>
                      <div className="text-[9px] text-zinc-500">{tier.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-zinc-600 italic leading-relaxed">
              * Souvera accounts are reviewed for institutional verification. You will be notified via your corporate email upon clearance.
            </p>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase py-4 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-900/20"
            >
              Request Onboarding
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </form>

          {/* Additional Actions */}
          <div className="mt-10 pt-8 border-t border-zinc-900 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Already a terminal member?</span>
            <Link href="/login" className="text-sm font-bold text-white hover:text-blue-500 transition-colors flex items-center gap-1.5">
              Secure Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
