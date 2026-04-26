import React from 'react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto terminal-card bg-surface glass p-12 text-center border-glow shadow-2xl">
          <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
            Ready to Unlock the Live Signal Layer?
          </h2>
          <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto">
            Join the most advanced sovereign intelligence network and gain a data edge in the world’s most dynamic corridor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary px-10 py-5 text-lg shadow-lg hover:translate-y-[-2px] transition-transform">
              Request Terminal Access
            </button>
            <button className="px-10 py-5 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors text-white font-semibold shadow-lg">
              Contact Enterprise Sales
            </button>
          </div>
          <p className="mt-8 text-xs text-muted font-mono tracking-widest uppercase">
            Built by Afronovation, Inc. // Endorsed by AfDEC
          </p>
        </div>
      </div>
    </section>
  );
}
