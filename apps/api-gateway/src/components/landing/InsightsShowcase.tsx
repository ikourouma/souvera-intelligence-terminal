'use client';
import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';

const FEATURED_INSIGHTS = [
  {
    category: 'Strategic Briefing',
    title: 'The Transatlantic Corridor: Lagos to Kingston Trade Flows 2026',
    excerpt: 'An analysis of emerging maritime trade routes and sovereign fiscal alignments between ECOWAS and CARICOM nations.',
    author: 'Souvera Research Board',
    date: 'Oct 24, 2026',
    icon: TrendingUp,
    color: '#3B82F6',
  },
  {
    category: 'Flash Risk Report',
    title: 'Regional Mining Policy Shifts in the DRC and Zambia',
    excerpt: 'Critical minerals intelligence: Evaluating the impact of new royalty frameworks on cobalt and copper supply chains.',
    author: 'Mining Intelligence Unit',
    date: 'Oct 25, 2026',
    icon: AlertTriangle,
    color: '#F59E0B',
  },
  {
    category: 'Market Memo',
    title: 'Nigeria FX Stabilization: A Turning Point for Fintech FDI?',
    excerpt: 'Evaluating the impact of recent naira volatility on multi-national investment cycles in the West African fintech hub.',
    author: 'Financial Node Analysts',
    date: 'Oct 22, 2026',
    icon: FileText,
    color: '#22C55E',
  }
];

export function InsightsShowcase() {
  return (
    <section className="py-24" style={{ background: '#0B0F14', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="section-label mb-2">Strategic Intelligence</div>
            <h2 className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Latest Research & Briefings
            </h2>
            <p className="mt-4 text-zinc-500 leading-relaxed">
              Objective, expert-led analysis on the most critical macroeconomic shifts across our active nodes. Admin-managed and updated daily by the Souvera Research Board.
            </p>
          </div>
          <Link href="/insights" className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
            View All Insights <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {FEATURED_INSIGHTS.map((insight) => (
            <div 
              key={insight.title}
              className="group p-8 rounded-sm transition-all duration-300 hover:border-zinc-700 cursor-pointer"
              style={{ background: '#121821', border: '1px solid #1F2A37' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="px-2 py-1 rounded-sm text-[9px] font-bold tracking-widest uppercase" style={{ background: `${insight.color}15`, color: insight.color, border: `1px solid ${insight.color}30` }}>
                  {insight.category}
                </div>
                <insight.icon className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: '1.4' }}>
                {insight.title}
              </h3>
              
              <p className="text-[13px] text-zinc-500 leading-relaxed mb-8">
                {insight.excerpt}
              </p>

              <div className="pt-6 flex items-center justify-between" style={{ borderTop: '1px solid #1F2A37' }}>
                <div className="flex flex-col gap-0.5">
                   <span className="text-[10px] text-zinc-600 uppercase font-mono">{insight.author}</span>
                   <span className="text-[10px] text-zinc-800 font-mono">{insight.date}</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 transition-all group-hover:bg-blue-600 group-hover:border-blue-600">
                   <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
