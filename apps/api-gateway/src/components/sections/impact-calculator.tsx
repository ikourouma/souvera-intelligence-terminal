"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Leaf, 
  Zap, 
  TrendingUp, 
  Heart, 
  Calculator, 
  Info,
  ArrowRight,
  Target,
  Award,
  Globe,
  Shield
} from "lucide-react";

type ImpactCategory = "agriculture" | "healthcare" | "education" | "infrastructure" | "sme";

interface CategoryData {
  id: ImpactCategory;
  label: string;
  icon: any;
  multiplier: number; // Lives impacted per $1,000
  metricLabel: string;
  outcome: string;
  color: string;
}

const CATEGORIES: CategoryData[] = [
  { 
    id: "agriculture", 
    label: "Agriculture", 
    icon: Leaf, 
    multiplier: 12, 
    metricLabel: "Farming Entities", 
    outcome: "Increased yields & soil health data",
    color: "emerald"
  },
  { 
    id: "healthcare", 
    label: "Healthcare", 
    icon: Heart, 
    multiplier: 45, 
    metricLabel: "Beds / Medical Units", 
    outcome: "Transatlantic medical supply nodes",
    color: "blue"
  },
  { 
    id: "education", 
    label: "ICT & Education", 
    icon: Zap, 
    multiplier: 30, 
    metricLabel: "Digital Student Hubs", 
    outcome: "Pan-African youth talent development",
    color: "indigo"
  },
  { 
    id: "infrastructure", 
    label: "Infrastructure", 
    icon: Globe, 
    multiplier: 8, 
    metricLabel: "Clean Energy Units", 
    outcome: "Sustainable power for rural schools",
    color: "amber"
  },
  { 
    id: "sme", 
    label: "SME Trade", 
    icon: TrendingUp, 
    multiplier: 3, 
    metricLabel: "Sovereign Enterprises", 
    outcome: "AfCFTA market access & certification",
    color: "purple"
  }
];

export const ImpactCalculator = () => {
  const [amount, setAmount] = useState<number>(5000);
  const [activeCategory, setActiveCategory] = useState<ImpactCategory>("agriculture");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory)!;
  const impactCount = Math.floor((amount / 1000) * currentCategory.multiplier);

  if (!isClient) return null;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 mb-4 rounded-full">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">Sovereign Impact Simulator</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">AfDEC Diaspora Return</h3>
          <p className="text-zinc-500 text-sm mt-1">Simulate the social and economic impact of your contribution.</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Total Impact Multiplier</div>
           <div className="text-3xl font-black text-white">{currentCategory.multiplier}x</div>
        </div>
      </div>

      <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Controls */}
        <div className="space-y-10">
          {/* Amount Slider */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Contribution Amount (USD)</label>
              <div className="text-3xl font-black text-emerald-400">${amount.toLocaleString()}</div>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="100000" 
              step="1000" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <span>$1,000</span>
              <span>$100,000+</span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Priority Mandate</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all duration-300 ${
                      isActive 
                      ? `border-emerald-500/50 bg-emerald-500/10` 
                      : `border-zinc-800 bg-zinc-900/40 hover:border-zinc-700`
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCategory + amount}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="p-10 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-4 opacity-5 bg-${currentCategory.color}-500/10`}>
                   <currentCategory.icon className="w-24 h-24" />
                </div>
                
                <div className="relative z-10">
                   <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Estimated Outcome</div>
                   <div className="flex items-baseline gap-3 mb-4">
                      <div className={`text-6xl md:text-7xl font-black text-${currentCategory.color}-400 group-hover:scale-105 transition-transform duration-500`}>{impactCount.toLocaleString()}</div>
                      <div className="text-xl font-bold text-zinc-300 uppercase tracking-tight">{currentCategory.metricLabel}</div>
                   </div>
                   <div className="h-px w-24 bg-zinc-800 mb-6" />
                   <p className="text-zinc-400 font-medium leading-relaxed max-w-sm italic">
                      "With a contribution of ${amount.toLocaleString()}, AfDEC will facilitate **{currentCategory.outcome}** for **{impactCount}** verified beneficiaries."
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 border border-zinc-900 bg-zinc-900/40 rounded-sm flex items-center space-x-3">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-[9px] font-black text-zinc-600 uppercase mb-0.5">Strategy Alignment</div>
                      <div className="text-[11px] font-bold text-zinc-300">AfCFTA Blueprint</div>
                    </div>
                 </div>
                 <div className="p-4 border border-zinc-900 bg-zinc-900/40 rounded-sm flex items-center space-x-3">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-[9px] font-black text-zinc-600 uppercase mb-0.5">Accountability</div>
                      <div className="text-[11px] font-bold text-zinc-300">Audited Portfolio</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
             <Link 
               href="/diaspora-impact-fund/interest"
               className="flex-1 bg-white text-zinc-950 px-8 py-4 text-xs font-black uppercase tracking-widest rounded-sm hover:bg-zinc-100 transition-all shadow-xl flex items-center justify-center gap-2"
             >
                Commit to Mandate
                <ArrowRight className="w-4 h-4" />
             </Link>
             <Link 
               href="#methodology"
               className="flex-1 border border-zinc-800 text-zinc-400 px-8 py-4 text-xs font-black uppercase tracking-widest rounded-sm hover:border-zinc-600 hover:text-white transition-all flex items-center justify-center gap-2"
             >
                <Info className="w-4 h-4" />
                View Methodology
             </Link>
          </div>
        </div>
      </div>
      
      {/* Disclaimer Footer */}
      <div className="bg-[#0c0c0c] border-t border-zinc-800 p-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-700" />
            <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Institutional Estimates Only · Non-Binding</span>
         </div>
         <div className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">
            AfDEC Intelligence Division © 2026
         </div>
      </div>
    </div>
  );
};
