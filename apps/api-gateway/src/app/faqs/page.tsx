'use client';

import React, { useState } from "react";
import { SouveraMegaNav } from "@/components/ui/SouveraMegaNav";
import { SouveraFooter } from "@/components/ui/SouveraFooter";
import { Plus, Minus, Search, Database, Shield, Zap, Globe } from "lucide-react";

const faqs = [
  {
    category: "Market Signals",
    q: "How does the Souvera Signal Engine determine market levels?",
    a: "The Signal Engine utilizes a proprietary weighting algorithm that correlates live data from the World Bank, IMF, and regional African/Caribbean data nodes. We analyze FDI inflows, currency stability, and infrastructure pipeline density to assign levels from 'Risk Elevated' to 'High Growth'."
  },
  {
    category: "Terminal Access",
    q: "What is required for 'Professional' or 'Institutional' clearance?",
    a: "Tier-1 access requires verified institutional credentials. Organizations must undergo a 24-hour verification cycle by the Souvera Compliance Board. Once cleared, your account is granted full Signal Engine access and API integration keys."
  },
  {
    category: "Data Integrity",
    q: "How often is the macroeconomic data refreshed?",
    a: "Public signals are updated every 15 minutes. 'Professional' and 'Institutional' tiers receive real-time telemetry updates for high-volatility markets and active infrastructure deal-flow monitoring."
  },
  {
    category: "Sovereign Framework",
    q: "Does Souvera operate under AfDEC's global mandate?",
    a: "Yes. Souvera is the core intelligence terminal for the African Diaspora Economic Council (AfDEC). Our data framework is natively aligned with the Transatlantic Trade Corridors and sovereign development protocols."
  },
  {
    category: "Caribbean Intelligence",
    q: "Is the Caribbean map specific to CARICOM member states?",
    a: "The Caribbean Command Center covers all CARICOM nations plus key regional logistics hubs. We provide specific intelligence for energy, tourism, and financial services across the entire Caribbean basin."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-zinc-950 font-sans text-zinc-300 flex flex-col">
      <SouveraMegaNav />

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
        
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">Knowledge Repository</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Operational Directives.
          </h1>
          <p className="text-lg text-zinc-400 max-w-lg mx-auto font-medium">
            Search our centralized repository for terminal mechanics, signal methodologies, and institutional clearance guidelines.
          </p>
          
          <div className="mt-12 relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query the database..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm py-5 pl-14 pr-6 text-white text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-sm">
              <Database className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Zero Query Matches Found in the Signal Lake.</span>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-sm transition-all duration-300 ${isOpen ? 'bg-zinc-900/50 border-zinc-700 shadow-2xl' : 'bg-transparent border-zinc-800 hover:border-zinc-700'}`}
                >
                  <button 
                    onClick={() => toggleOpen(idx)}
                    className="w-full text-left px-8 py-7 flex items-start justify-between focus:outline-none"
                  >
                    <div className="pr-8">
                       <span className="block text-[10px] font-bold text-blue-500 tracking-widest uppercase mb-3 font-mono">{faq.category}</span>
                       <h3 className={`text-xl font-bold tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-zinc-300'}`}>
                         {faq.q}
                       </h3>
                    </div>
                    <div className={`mt-1 w-7 h-7 flex shrink-0 items-center justify-center rounded-sm border transition-all ${isOpen ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-zinc-700 text-zinc-500'}`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  <div 
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="px-8 pb-8 text-zinc-400 text-[15px] leading-relaxed border-t border-zinc-800/50 mt-2 pt-8 font-medium">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: "Dual Regions", desc: "Africa and Caribbean specific signal corridors." },
            { icon: Shield, title: "Verified Data", desc: "Correlated IMF, World Bank, and local node data." },
            { icon: Zap, title: "Real-time", desc: "High-frequency signal updates for active members." }
          ].map((feat, i) => (
            <div key={i} className="p-6 border border-zinc-900 rounded-sm bg-zinc-900/20">
              <feat.icon className="w-5 h-5 text-blue-500 mb-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2 font-mono">{feat.title}</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <SouveraFooter />
    </main>
  );
}
