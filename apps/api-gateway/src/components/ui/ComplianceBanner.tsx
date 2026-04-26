'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';

export function ComplianceBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('souvera_compliance_hidden');
    if (!hidden) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('souvera_compliance_hidden', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in fade-in slide-in-from-bottom-full duration-700">
      <div className="w-full bg-[#121821] border-t border-blue-600/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        
        {/* Accent Glow */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
        <div className="absolute inset-0 bg-blue-600/[0.03] pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-2 uppercase tracking-[0.2em] font-mono">
            Sovereign Data & Privacy Compliance
          </h3>
          <p className="text-[13px] md:text-[14px] text-zinc-400 leading-relaxed max-w-6xl">
            Souvera Intelligence adheres to the highest standards of data governance, including regional AU/CARICOM protocols and international privacy frameworks. Our data ingestion is transparent, secure, and dedicated to sovereign economic transparency. 
            For more information, please read our <Link href="/compliance-hub" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">Privacy Policy</Link>. 
            By clicking "Accept," you agree to the use of these tools and acknowledge our commitment to institutional-grade data integrity.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 relative z-10">
          <button 
            onClick={dismiss}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg hover:shadow-blue-600/20"
          >
            Accept
          </button>
          <button 
            onClick={dismiss}
            className="p-2 text-zinc-600 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
