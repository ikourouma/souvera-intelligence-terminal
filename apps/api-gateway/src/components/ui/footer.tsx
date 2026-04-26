import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

const footerLinks = {
  council: [
    { name: "Sovereign Leadership Hub", href: "/about/leadership" },
    { name: "Institutional Governance", href: "/about/leadership#governance" },
    { name: "Sovereign Strategic Framework", href: "/about/strategic-framework" },
    { name: "Diaspora Impact Fund", href: "/diaspora-impact-fund" },
    { name: "Annual Report", href: "/annual-report" },
    { name: "Careers", href: "/careers" },
    { name: "Media Relations", href: "/media" },
  ],
  infrastructure: [
    { name: "Why North Carolina", href: "/why-nc" },
    { name: "Why Africa", href: "/why-africa" },
    { name: "Sovereign Tourism", href: "/tourism" },
    { name: "Business Hubs", href: "/dual-continent-business-hub" },
    { name: "Sovereign Incentives", href: "/sovereign-incentives-grants" },
  ],
  integration: [
    { name: "Transatlantic Corridor Hub", href: "/corridor" },
    { name: "Enterprise Expansion Suite", href: "/corridor/expansion" },
    { name: "Export & Trade Logistics", href: "/corridor/export-trade" },
    { name: "Regional Market Access", href: "/corridor/markets" },
  ],
  sectors: [
    { name: "Agriculture & Farming", href: "/sectors/agriculture" },
    { name: "Sustainable Energy", href: "/sectors/clean-energy" },
    { name: "Life Sciences & Health", href: "/sectors/life-sciences" },
    { name: "Manufacturing & Aerospace", href: "/sectors/manufacturing" },
    { name: "Financial Technology", href: "/sectors/fintech" },
    { name: "Defense & Security", href: "/sectors/defense" },
  ],
  initiatives: [
    { name: "Grow with AfDEC", href: "/initiatives/grow", highlight: true },
    { name: "Impact Projects", href: "/diaspora-impact-fund#projects" },
    { name: "Africa Works Initiative", href: "/initiatives/africa-works" },
    { name: "Standing Against Poverty", href: "/initiatives/poverty" },
    { name: "Climate & Growth", href: "/initiatives/climate" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/compliance/privacy-policy" },
    { name: "Terms of Service", href: "/compliance/terms-of-service" },
    { name: "Cookie Policy", href: "/compliance/cookie-policy" },
    { name: "Accessibility Statement", href: "/compliance/accessibility" },
    { name: "Master Sitemap", href: "/sitemap" },
    { name: "Governance & Compliance", href: "/compliance" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-zinc-900 pt-24 pb-12">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Asymmetric Grid: Brand(2) + Council(1) + Infrastructure(1) + Integration(1) + Initiatives(1) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-y-14 gap-x-8 xl:gap-x-10 mb-20">

          {/* ── 1. Brand Identity Zone (spans 2 columns) ── */}
          <div className="col-span-2">
            <div className="mb-5">
              <BrandLogo isDarkTheme={true} variant={"acronym"} />
            </div>
            <p className="text-[13px] text-zinc-500 leading-relaxed max-w-sm mb-8">
              The African Diaspora Economic Council. Bridging institutional capital and enterprise expansion across the transatlantic corridor through sovereign-grade strategic operations.
            </p>
            <div className="flex items-center space-x-2.5">
              <Link href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </Link>
              <Link href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </Link>
              <Link href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:border-pink-500 hover:text-white transition-all duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </Link>
              <Link href="#" aria-label="X" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:border-zinc-100 hover:text-zinc-900 transition-all duration-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
              <Link href="#" aria-label="Flipboard" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all duration-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0v24h24V0H0zm19.2 9.6h-4.8v4.8H9.6v4.8H4.8V4.8h14.4v4.8z"/></svg>
              </Link>
            </div>
          </div>

          {/* ── 2. The Council ── */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-100 mb-5 uppercase tracking-[0.15em]">The Council</h4>
            <ul className="space-y-2.5">
              {footerLinks.council.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] text-zinc-500 hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── 3. Infrastructure ── */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-100 mb-5 uppercase tracking-[0.15em]">Infrastructure</h4>
            <ul className="space-y-2.5">
              {footerLinks.infrastructure.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] text-zinc-500 hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── 4. Integration ── */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-100 mb-5 uppercase tracking-[0.15em]">Integration</h4>
            <ul className="space-y-2.5">
              {footerLinks.integration.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] text-zinc-500 hover:text-blue-400 transition-colors group flex items-center">
                    {link.name}
                    {link.name.includes("Access") && <ArrowUpRight className="ml-1 w-3 h-3 text-zinc-700 group-hover:text-blue-400 transition-colors" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── 5. Initiatives ── */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-100 mb-5 uppercase tracking-[0.15em]">Initiatives</h4>
            <ul className="space-y-2.5">
              {footerLinks.initiatives.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={`text-[13px] transition-colors ${link.highlight ? 'text-emerald-400 font-semibold hover:text-emerald-300' : 'text-zinc-500 hover:text-blue-400'}`}>
                    {link.name}
                    {link.highlight && <ArrowUpRight className="inline-block ml-1 w-3 h-3 text-emerald-500" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-12 border-t border-zinc-900">
          {/* Tier 1: Policy Related Links (Centered) */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-10">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-[11px] font-black text-zinc-500 hover:text-blue-500 transition-colors uppercase tracking-[0.2em]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="w-full h-px bg-zinc-900 mb-10" />

          {/* Tier 2: Registry & Engineering (Split Line) */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left text-[11px] font-bold tracking-widest leading-relaxed">
            <div className="text-zinc-600">
              <span className="text-zinc-400 font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} African Diaspora Economic Council.</span>
              <span className="hidden sm:inline mx-3 text-zinc-800">|</span>
              <br className="sm:hidden" />
              <span className="uppercase text-zinc-600">A North Carolina 501(c)(4) Organization</span>
            </div>

            <div className="text-zinc-600 uppercase">
              Engineered by{" "}
              <Link 
                href="https://www.afronovation.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-blue-500 transition-colors font-black decoration-blue-500/20 underline underline-offset-4"
              >
                Afronovation, Inc.
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
