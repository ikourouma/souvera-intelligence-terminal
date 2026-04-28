'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, ArrowRight, Globe, TrendingUp,
  Building2, Map, Menu, X, Zap,
} from 'lucide-react';

const navigation = [
  {
    name: 'Intelligence',
    icon: Globe,
    sections: [
      {
        title: 'Command Nodes',
        links: [
          { name: 'Africa Command Center', href: '/africa-command-center' },
          { name: 'Caribbean Command Center', href: '/caribbean-command-center' },
          { name: 'Intelligence Map Briefing', href: '/intelligence-map' },
        ],
      },
      {
        title: 'Access Terminal',
        links: [
          { name: '● Africa Dashboard', href: '/terminal/africa' },
          { name: '● Caribbean Dashboard', href: '/terminal/caribbean' },
          { name: 'Geospatial Terminal', href: '/terminal/africa/map' },
        ],
      },
    ],
  },
  {
    name: 'Sectors',
    icon: Building2,
    sections: [
      {
        title: 'Institutional Briefings',
        links: [
          { name: 'Sector Intelligence Overview', href: '/sector-intelligence' },
          { name: 'Energy & Renewables', href: '/sector/energy-&-renewables' },
          { name: 'Mining & Critical Minerals', href: '/sector/mining-&-critical-minerals' },
        ],
      },
      {
        title: 'Sector Dashboards',
        links: [
          { name: 'Fintech & Digital Finance', href: '/sector/fintech-&-digital-finance' },
          { name: 'Tourism & Hospitality', href: '/sector/tourism-&-hospitality' },
          { name: 'Logistics & Trade', href: '/sector/logistics-&-trade' },
        ],
      },
    ],
  },
  {
    name: 'Market Intelligence',
    icon: TrendingUp,
    sections: [
      {
        title: 'Signal Analysis',
        links: [
          { name: 'Signal Engine Briefing', href: '/signal-engine' },
          { name: 'Growth Market Rankings', href: '/terminal/africa#signals' },
          { name: 'Risk Index monitoring', href: '/terminal/africa#risk' },
        ],
      },
      {
        title: 'Institutional Reports',
        links: [
          { name: 'Country Intelligence Briefs', href: '/subscriptions' },
          { name: 'Investor Memos', href: '/subscriptions' },
          { name: 'FDI Inflow Rankings', href: '/terminal/africa/economies#fdi' },
        ],
      },
    ],
  },
  {
    name: 'Access',
    icon: Zap,
    sections: [
      {
        title: 'Gateway',
        links: [
          { name: 'Subscription Plans', href: '/subscriptions' },
          { name: 'API Documentation', href: '/api-documentation' },
          { name: 'Enterprise Solutions', href: '/solutions' },
        ],
      },
      {
        title: 'Authentication',
        links: [
          { name: 'Sign In to Terminal', href: '/login' },
          { name: 'Create Free Account', href: '/login' },
          { name: 'Request Demo', href: '/contact' },
        ],
      },
    ],
  },
  {
    name: 'Resources',
    icon: Globe,
    sections: [
      {
        title: 'Institutional',
        links: [
          { name: 'Data Sources & Methodology', href: '/Data-Sources-&-Methodology' },
          { name: 'Institutional Signal Ledger', href: '/source-registry' },
          { name: 'About Souvera', href: '/about' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { name: 'Source Registry', href: '/source-registry' },
          { name: 'Methodology', href: '/Data-Sources-&-Methodology' },
          { name: 'Legal Hub', href: '/legal' },
          { name: 'Sitemap', href: '/sitemap' },
        ],
      },
    ],
  },
];

const mobileUtilityLinks = [
  { name: 'Subscriptions', href: '/subscriptions' },
  { name: 'Latest Insights', href: '/insights' },
  { name: 'Contact', href: '/contact' },
];

export function SouveraMegaNav() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // Reset menu state on route change
  React.useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
    if (panelRef.current) {
      gsap.set(panelRef.current, { opacity: 0, y: -8, display: 'none' });
    }
  }, [pathname]);

  useGSAP(() => {
    // Initial state setup to prevent hydration mismatch/stuck states
    if (panelRef.current) {
      gsap.set(panelRef.current, { opacity: 0, y: -8, display: 'none' });
    }
  }, { scope: containerRef });

  const handleMouseEnter = contextSafe((menuName: string) => {
    setActiveMenu(menuName);
    gsap.to(panelRef.current, {
      opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', display: 'block',
    });
  });

  const handleMouseLeave = contextSafe(() => {
    setActiveMenu(null);
    gsap.to(panelRef.current, {
      opacity: 0, y: -8, duration: 0.25, ease: 'power2.in', display: 'none',
    });
  });

  useGSAP(() => {
    if (mobileOpen && mobileOverlayRef.current) {
      document.body.style.overflow = 'hidden';
      gsap.to(mobileOverlayRef.current, { opacity: 1, duration: 0.3, display: 'flex', ease: 'power2.out' });
      gsap.fromTo('.sv-mobile-item', { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, stagger: 0.05, delay: 0.1, ease: 'power3.out' });
    } else if (!mobileOpen && mobileOverlayRef.current) {
      document.body.style.overflow = '';
      gsap.to(mobileOverlayRef.current, { opacity: 0, duration: 0.2, display: 'none', ease: 'power2.in' });
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={containerRef}
        className="sticky top-0 z-50 w-full"
        style={{ background: 'rgba(11,15,20,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1F2A37' }}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-18 flex items-center justify-between" style={{ height: '72px' }}>
          {/* Logo */}
          <Link href="/" className="relative z-20 shrink-0 mr-8 flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-white font-black tracking-[0.25em] uppercase text-xl" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                SOUVERA
              </span>
            </div>
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono hidden sm:block border-l border-zinc-800 pl-3">
              Intelligence Terminal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="h-full flex items-center cursor-pointer"
                onMouseEnter={() => handleMouseEnter(item.name)}
              >
                <span className={`text-[13px] font-medium transition-colors flex items-center gap-1 ${activeMenu === item.name ? 'text-souvera-blue' : 'text-zinc-400 hover:text-zinc-100'}`}>
                  {item.name}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === item.name ? 'rotate-180 text-souvera-blue' : 'text-zinc-600'}`} />
                </span>
              </div>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-4 relative z-20">
            <Link
              href="/terminal/africa"
              className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Access Terminal
            </Link>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 text-[12px] font-bold tracking-widest uppercase px-5 py-2.5 transition-all"
              style={{ background: '#2563EB', color: 'white' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-[200]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mega Menu Panel */}
        <div
          ref={panelRef}
          className="absolute top-full left-0 w-full shadow-2xl overflow-hidden hidden"
          style={{ opacity: 0, display: 'none', background: '#0B0F14', borderBottom: '1px solid #1F2A37' }}
        >
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.name}-panel`}
                  className={`grid grid-cols-12 gap-8 transition-opacity duration-200 ${activeMenu === item.name ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-x-6 top-10 pointer-events-none'}`}
                >
                  {/* Left description column */}
                  <div className="col-span-3 border-r pr-8" style={{ borderColor: '#1F2A37' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-md" style={{ background: 'rgba(37,99,235,0.1)' }}>
                        <Icon className="w-5 h-5 text-souvera-blue" />
                      </div>
                      <h2 className="text-base font-bold text-white">{item.name}</h2>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: '#9CA3AF' }}>
                      Sovereign-grade intelligence across African and Caribbean markets. Powered by IMF, World Bank, and real-time data infrastructure.
                    </p>
                  </div>

                  {/* Right links */}
                  <div className="col-span-9 grid grid-cols-2 gap-x-12 gap-y-6">
                    {item.sections.map((section) => (
                      <div key={section.title}>
                        <h3 className="section-label mb-3">{section.title}</h3>
                        <ul className="space-y-2.5">
                          {section.links.map((link) => (
                            <li key={link.name}>
                              <Link
                                href={link.href}
                                className="text-[13px] font-medium transition-colors block hover:text-souvera-blue"
                                style={{ color: '#D1D5DB' }}
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <div
        ref={mobileOverlayRef}
        className="fixed inset-0 z-[200] flex-col hidden"
        style={{ opacity: 0, background: '#0B0F14' }}
      >
        <div className="h-[72px] px-6 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #1F2A37' }}>
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <span className="text-white font-bold tracking-widest uppercase text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SOUVERA</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-1 mb-10">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isOpen = mobileAccordion === item.name;
              return (
                <div key={item.name} className="sv-mobile-item">
                  <button
                    onClick={() => setMobileAccordion(isOpen ? null : item.name)}
                    className="w-full flex items-center justify-between py-3.5 px-3 rounded-sm transition-colors"
                    style={{ background: isOpen ? '#161D26' : 'transparent', color: isOpen ? 'white' : '#9CA3AF' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-sm" style={{ background: isOpen ? 'rgba(37,99,235,0.1)' : '#1F2A37' }}>
                        <Icon className="w-4 h-4" style={{ color: isOpen ? '#2563EB' : '#6B7280' }} />
                      </div>
                      <span className="text-[14px] font-semibold">{item.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: isOpen ? '#2563EB' : '#4B5563' }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}>
                    <div className="pl-10 pr-4 pb-4 pt-2 space-y-5">
                      {item.sections.map((section) => (
                        <div key={section.title}>
                          <h4 className="section-label mb-2">{section.title}</h4>
                          <ul className="space-y-2">
                            {section.links.map((link) => (
                              <li key={link.name}>
                                <Link href={link.href} onClick={() => setMobileOpen(false)} className="text-[13px] block py-0.5 transition-colors hover:text-souvera-blue" style={{ color: '#9CA3AF' }}>
                                  {link.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <Link href="/terminal/africa" onClick={() => setMobileOpen(false)} className="sv-mobile-item flex items-center justify-center gap-2 w-full font-bold text-[12px] tracking-widest uppercase py-4 rounded-sm transition-all" style={{ background: '#2563EB', color: 'white' }}>
              Access Terminal <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid #1F2A37' }}>
              {mobileUtilityLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="sv-mobile-item text-[10px] font-bold tracking-widest uppercase text-center py-3 rounded-sm transition-colors" style={{ background: '#161D26', color: '#9CA3AF', border: '1px solid #1F2A37' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
