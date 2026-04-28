'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { FileText, Download, Share2, Calendar, Newspaper, ArrowRight } from 'lucide-react';

const PRESS_RELEASES = [
  {
    date: 'Oct 24, 2026',
    title: 'Souvera Announces Expansion into Caribbean Maritime Intelligence Node',
    excerpt: 'Strategic initiative to map trade-flow signals between the Port of Kingston and key African coastal hubs.',
    category: 'Corporate Announcement',
    color: '#3B82F6',
  },
  {
    date: 'Oct 18, 2026',
    title: 'Afronovation Ecosystem reaches 100M+ Sovereign Data Points',
    excerpt: 'The Intelligence Terminal engine marks a significant milestone in transatlantic macroeconomic coverage.',
    category: 'Milestone',
    color: '#22C55E',
  },
  {
    date: 'Oct 12, 2026',
    title: 'New Policy Briefing: The impact of AfCFTA on West African Fintech FDI',
    excerpt: 'Deep-dive analysis on the emerging regulatory alignment between ECOWAS member states.',
    category: 'Research Briefing',
    color: '#F59E0B',
  }
];

const ASSETS = [
  { name: 'Souvera Brand Guidelines 2026', type: 'PDF', size: '4.2 MB' },
  { name: 'Institutional Logo Pack (Vector)', type: 'ZIP', size: '12.8 MB' },
  { name: 'Platform Interface Mockups', type: 'JPG/PNG', size: '45.1 MB' },
  { name: 'Corporate Fact Sheet', type: 'PDF', size: '1.1 MB' }
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      {/* Header */}
      <section className="pt-24 pb-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <div className="section-label mb-4">Newsroom</div>
              <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Institutional Announcements.
              </h1>
              <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
                Stay updated with the latest sovereign signals, corporate milestones, and research briefings from the Souvera Intelligence Board.
              </p>
            </div>
            <div className="flex items-center gap-4">
               <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Subscribe to Feed
               </button>
               <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Media Inquiries
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News Grid */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
           <h2 className="section-label mb-12 flex items-center gap-2">
              <Newspaper className="w-4 h-4" /> Latest Press Releases
           </h2>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {PRESS_RELEASES.map((pr) => (
                <div key={pr.title} className="group flex flex-col p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-zinc-700 transition-all cursor-pointer">
                   <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{pr.date}</span>
                      <span className="px-2 py-0.5 rounded-sm text-[8px] font-bold tracking-widest uppercase" style={{ background: `${pr.color}15`, color: pr.color, border: `1px solid ${pr.color}30` }}>
                        {pr.category}
                      </span>
                   </div>
                   <h3 className="text-xl font-bold mb-4 leading-snug group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {pr.title}
                   </h3>
                   <p className="text-sm text-zinc-500 leading-relaxed mb-10 flex-1">
                      {pr.excerpt}
                   </p>
                   <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 group-hover:text-white transition-colors">Read Release</span>
                      <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-12 py-4 border border-zinc-800 hover:bg-zinc-900 transition-colors text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              View Archive (2024 - 2026)
           </button>
        </div>
      </section>

      {/* Brand Assets Node */}
      <section className="py-24 bg-[#121821]/30 border-t border-zinc-800">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
               <div className="lg:col-span-5">
                  <div className="section-label mb-4">Media Kit</div>
                  <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                     Strategic Brand Assets.
                  </h2>
                  <p className="text-zinc-500 leading-relaxed mb-8">
                     Download authorized brand collateral, leadership headshots, and platform interface visualizations for media use.
                  </p>
                  <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-sm">
                     <p className="text-xs text-zinc-400 italic">
                        "For high-resolution media requests or boardroom interview scheduling, please contact our global communications node."
                     </p>
                  </div>
               </div>

               <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ASSETS.map((asset) => (
                    <div key={asset.name} className="p-6 bg-[#0B0F14] border border-zinc-800 rounded-sm flex items-start justify-between group hover:border-zinc-700 transition-colors">
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-white mb-1">{asset.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono uppercase">{asset.type} · {asset.size}</span>
                       </div>
                       <button className="p-2 text-zinc-700 hover:text-white transition-colors">
                          <Download className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
