import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'Platform Overview', href: '/platform' },
    { name: 'Intelligence Terminal', href: '/platform/terminal' },
    { name: 'Signal Engine', href: '/platform/signal-engine' },
    { name: 'Data Foundation', href: '/platform/data-foundation' },
    { name: 'API Access', href: '/platform/api' },
  ],
  intelligence: [
    { name: 'Africa Intelligence', href: '/intelligence/africa' },
    { name: 'Caribbean Intelligence', href: '/intelligence/caribbean' },
    { name: 'Intelligence Map', href: '/intelligence/map' },
    { name: 'Country Comparison', href: '/intelligence/compare' },
    { name: 'Sector Analysis', href: '/sectors' },
  ],
  access: [
    { name: 'Request Access', href: '/access/request-access', highlight: true },
    { name: 'Access Plans', href: '/access' },
    { name: 'Institutional Solutions', href: '/access/institutional' },
    { name: 'Request Demo', href: '/access/request-demo' },
    { name: 'Contact Sales', href: '/contact' },
  ],
  company: [
    { name: 'About Souvera', href: '/about' },
    { name: 'Afronovation, Inc.', href: 'https://www.afronovation.com' },
    { name: 'System Status', href: '/status' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
    { name: 'Compliance', href: '/resources/compliance' },
    { name: 'Data Sources', href: '/resources/data-sources' },
  ],
};

export function SouveraFooter() {
  return (
    <footer style={{ background: '#070B0F', borderTop: '1px solid #1F2A37' }} className="pt-20 pb-10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Main grid: Brand(2) + 4 link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-y-12 gap-x-8 xl:gap-x-10 mb-16">

          {/* Brand Identity — spans 2 cols */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-white font-bold tracking-[0.2em] uppercase text-sm" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                SOUVERA
              </span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-xs mb-6" style={{ color: '#6B7280' }}>
              Institutional-grade macroeconomic intelligence for African and Caribbean markets. Data sourced from IMF, World Bank, and official regional institutions.
            </p>
            <div className="flex items-center gap-2 mb-5">
              <div className="px-2 py-1 rounded-sm text-[9px] font-bold tracking-widest uppercase font-mono" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                Active
              </div>
              <span className="text-[10px] font-mono" style={{ color: '#4B5563' }}>50+ Markets</span>
            </div>
            {/* Social links - to be added when official Souvera accounts are created */}
          </div>

          {/* Platform */}
          <div>
            <h4 className="section-label mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] transition-colors hover:text-souvera-blue" style={{ color: '#6B7280' }}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence */}
          <div>
            <h4 className="section-label mb-4">Intelligence</h4>
            <ul className="space-y-2.5">
              {footerLinks.intelligence.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] transition-colors hover:text-souvera-blue" style={{ color: '#6B7280' }}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Access */}
          <div>
            <h4 className="section-label mb-4">Access</h4>
            <ul className="space-y-2.5">
              {footerLinks.access.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-[13px] transition-colors flex items-center gap-1 ${link.highlight ? 'font-semibold hover:text-emerald-300' : 'hover:text-souvera-blue'}`}
                    style={{ color: link.highlight ? '#22C55E' : '#6B7280' }}
                  >
                    {link.name}
                    {link.highlight && <ArrowUpRight className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="section-label mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] transition-colors flex items-center gap-1 hover:text-souvera-blue" style={{ color: '#6B7280' }}>
                    {link.name}
                    {link.href.startsWith('http') && <ArrowUpRight className="w-3 h-3 opacity-50" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: '2rem', borderTop: '1px solid #1F2A37' }}>
          {/* Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-8">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-souvera-blue"
                style={{ color: '#4B5563' }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="w-full h-px mb-8" style={{ background: '#1F2A37' }} />

          {/* Copyright */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
            <div className="text-[11px] font-mono" style={{ color: '#4B5563' }}>
              <span className="font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>
                © {new Date().getFullYear()} Souvera Intelligence Terminal.
              </span>
              <span className="hidden sm:inline mx-3" style={{ color: '#1F2A37' }}>|</span>
              <br className="sm:hidden" />
              <span className="uppercase">A product of Afronovation, Inc.</span>
            </div>

            <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest" style={{ color: '#4B5563' }}>
              <span>Data: IMF · World Bank · UNCTAD</span>
              <span style={{ color: '#1F2A37' }}>|</span>
              <Link href="https://www.afronovation.com" target="_blank" rel="noopener noreferrer" className="hover:text-souvera-blue transition-colors underline underline-offset-4" style={{ textDecorationColor: 'rgba(37,99,235,0.3)', color: '#6B7280' }}>
                Afronovation, Inc.
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
