'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Target, Users, Zap, ArrowRight, MapPin, Briefcase } from 'lucide-react';

const OPEN_ROLES = [
  {
    title: 'Senior Macroeconomic Analyst',
    department: 'Intelligence Board',
    location: 'Remote / Lagos / London',
    type: 'Full-Time',
    color: '#3B82F6',
  },
  {
    title: 'Geospatial Data Engineer',
    department: 'Infrastructure',
    location: 'Remote / Nairobi / New York',
    type: 'Full-Time',
    color: '#22C55E',
  },
  {
    title: 'Sovereign Risk Researcher',
    department: 'Signal Unit',
    location: 'Remote / Kingston / Geneva',
    type: 'Full-Time',
    color: '#F59E0B',
  },
  {
    title: 'Institutional Sales Director',
    department: 'Global Growth',
    location: 'Remote / Dubai / Singapore',
    type: 'Full-Time',
    color: '#A78BFA',
  }
];

const PILLARS = [
  { title: 'Absolute Accuracy', desc: 'In sovereign intelligence, there is no room for noise. We build for the decimal points that matter.', icon: Target },
  { title: 'Objectivity First', desc: 'Our board is independent. Our signals are unbiased. We serve the objective truth.', icon: Users },
  { title: 'Immediate Impact', desc: 'Your work directly influences multi-billion dollar convictions across transatlantic corridors.', icon: Zap }
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Hero */}
      <section className="pt-24 pb-32 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="section-label mb-4">Afronovation Ecosystem</div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Join the Souvera<br />Intelligence Board.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              We are building the definitive data infrastructure for the African and Caribbean macroeconomic corridors. Join a global team of analysts, engineers, and strategists.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-[#121821]/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {PILLARS.map((p) => (
                <div key={p.title} className="space-y-6">
                   <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                      <p.icon className="w-6 h-6 text-blue-500" />
                   </div>
                   <h3 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{p.title}</h3>
                   <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                 <div className="section-label mb-2">Global Opportunities</div>
                 <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Current Directives</h2>
              </div>
              <div className="text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-[0.3em]">
                 Filter: All Departments · All Regions
              </div>
           </div>

           <div className="space-y-4">
              {OPEN_ROLES.map((role) => (
                <div 
                  key={role.title} 
                  className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer"
                >
                   <div className="flex items-center gap-6">
                      <div className="w-2 h-12 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: role.color }} />
                      <div>
                         <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{role.title}</h3>
                         <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase tracking-widest"><Briefcase className="w-3 h-3" /> {role.department}</span>
                            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase tracking-widest"><MapPin className="w-3 h-3" /> {role.location}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold text-zinc-600 font-mono uppercase">{role.type}</span>
                      <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                         <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-16 p-12 bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-600/20 rounded-sm text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                 <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Don't see your node?</h3>
                 <p className="text-sm text-zinc-500">We are always looking for senior macroeconomic talent and data infrastructure specialists.</p>
              </div>
              <button className="px-10 py-4 bg-white text-black font-black text-[12px] tracking-widest uppercase hover:bg-zinc-200 transition-all rounded-sm shrink-0">
                 Send Strategic Pitch
              </button>
           </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
