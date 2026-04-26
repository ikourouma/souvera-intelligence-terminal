'use client';
import React from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Shield, Lock, FileText, Globe, Gavel, CheckCircle2 } from 'lucide-react';

const FRAMEWORKS = [
  {
    title: 'African Union (AU) Data Protocol',
    status: 'Aligned',
    description: 'Adhering to the African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention).',
    icon: Globe,
  },
  {
    title: 'CARICOM Privacy Standards',
    status: 'Compliant',
    description: 'Alignment with the CARICOM model legislation on privacy and data protection across the Caribbean corridor.',
    icon: Shield,
  },
  {
    title: 'GDPR / Institutional Standards',
    status: 'Full Adherence',
    description: 'Global benchmark compliance for institutional capital and multi-national investment firms.',
    icon: Lock,
  }
];

export default function ComplianceHub() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      
      <div className="pt-24 pb-32 max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="section-label mb-2">Governance Framework</div>
          <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Compliance & Data Integrity
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Souvera Intelligence operates under a strict "Sovereign First" data governance model. We ensure that all macroeconomic signals are ingested, processed, and reported with absolute transparency and regional alignment.
          </p>
        </div>

        {/* Framework Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
           {FRAMEWORKS.map((f) => (
             <div key={f.title} className="p-8 bg-[#121821] border border-zinc-800 rounded-sm group hover:border-blue-600/50 transition-colors">
                <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6">
                   <f.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                   <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                   <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">{f.status}</span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
             </div>
           ))}
        </div>

        {/* Policy Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           <div className="lg:col-span-8 space-y-12">
              <section>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    Data Sovereignty Policy
                 </h2>
                 <div className="prose prose-invert max-w-none text-zinc-400 space-y-4">
                    <p>
                       Souvera acknowledges that economic data is a sovereign asset. Our platform is designed to respect the data residency requirements of each AU and CARICOM member state.
                    </p>
                    <p>
                       We do not sell raw sovereign data to third parties. Our intelligence is derived from publicly accessible nodes and authorized institutional feeds, processed via our proprietary signal engine to deliver "synthetic alpha"—insights that drive investment without compromising state secrets.
                    </p>
                 </div>
              </section>

              <section>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-blue-500" />
                    Institutional Disclosure
                 </h2>
                 <div className="prose prose-invert max-w-none text-zinc-400 space-y-4">
                    <p>
                       All users of the Souvera Intelligence Terminal must adhere to our Terms of Use and Ethical Data Consumption guidelines. Misuse of signals for speculative destabilization is strictly prohibited under our service agreement.
                    </p>
                 </div>
              </section>
           </div>

           {/* Sidebar */}
           <div className="lg:col-span-4 space-y-8">
              <div className="p-8 bg-blue-600/5 border border-blue-600/20 rounded-sm">
                 <h3 className="text-lg font-bold mb-4">Download Full Registry</h3>
                 <p className="text-xs text-zinc-500 mb-6">Access our comprehensive list of data sources, methodology whitepapers, and compliance audits.</p>
                 <button className="w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm">
                    Download Governance Pack (PDF)
                 </button>
              </div>
           </div>
        </div>
      </div>

      <SouveraFooter />
    </main>
  );
}
