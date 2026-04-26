"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDown, ArrowRight, Globe, TrendingUp, Building2, Shield, Landmark, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

const navigation = [
  {
    name: "The Council",
    icon: Shield,
    sections: [
      {
        title: "Institutional Identity",
        links: [
          { name: "About AfDEC Mandate", href: "/about" },
          { name: "Sovereign Strategic Framework", href: "/about/strategic-framework" },
          { name: "Leadership & Governance Hub", href: "/about/leadership" },
          { name: "The Sovereign Council", href: "/about/leadership#council" },
        ],
      },
      {
        title: "Operations",
        links: [
          { name: "Staff & Committee Appointments", href: "/about/leadership#executive" },
          { name: "Board of Advisors", href: "/about/leadership#advisor" },
          { name: "Careers & Volunteer Corps", href: "/careers" },
          { name: "Media & Press Relations", href: "/media" },
        ],
      },
      {
        title: "Impact Capital",
        links: [
          { name: "Diaspora Impact Fund", href: "/diaspora-impact-fund" },
          { name: "SME Development Projects", href: "/diaspora-impact-fund#projects" },
          { name: "Direct Contribution Portal", href: "/diaspora-impact-fund#contribute" },
          { name: "Launch SME Application", href: "/diaspora-impact-fund#apply" },
        ],
      },
      {
        title: "Strategic Access",
        links: [
          { name: "Initiate Global Expansion", href: "/corridor/expansion" },
          { name: "Member Portal 'God Mode'", href: "/auth" },
          { name: "Sponsorship & Tenders", href: "/invest#sponsorship" },
        ],
      },

    ],
  },
  {
    name: "Strategic Footprint",
    icon: Landmark,
    sections: [
      {
        title: "Regional Authority",
        links: [
          { name: "Why North Carolina Hub", href: "/why-nc" },
          { name: "Why Africa Continent", href: "/why-africa" },
          { name: "Regional Market Access", href: "/corridor/markets" },
        ],
      },
      {
        title: "Infrastructure",
        links: [
          { name: "Dual-Continent Business Hubs", href: "/dual-continent-business-hub" },
          { name: "Sovereign Incentives & Grants", href: "/sovereign-incentives-grants" },
          { name: "Sovereign Tourism Strategy", href: "/tourism" },
        ],
      },
    ],
  },
  {
    name: "Transatlantic Integration",
    icon: Globe,
    sections: [
      {
        title: "Corridor Services",
        links: [
          { name: "Enterprise Expansion Suite", href: "/corridor/expansion" },
          { name: "Export & Trade Logistics", href: "/corridor/export-trade" },
          { name: "Government Relations", href: "/corridor/partnerships" },
        ],
      },
    ],
  },
  {
    name: "Sector Intelligence",
    icon: Building2,
    sections: [
      {
        title: "Core Infrastructure",
        links: [
          { name: "Agriculture & Farming", href: "/sectors/agriculture" },
          { name: "Clean Energy & Water", href: "/sectors/clean-energy" },
          { name: "Life Sciences & Biotech", href: "/sectors/life-sciences" },
        ],
      },
      {
        title: "Advanced Technology",
        links: [
          { name: "Advanced Manufacturing", href: "/sectors/manufacturing" },
          { name: "Fintech & Capital Markets", href: "/sectors/fintech" },
          { name: "Defense & Security", href: "/sectors/defense" },
        ],
      },
    ],
  },
  {
    name: "Insights & Analytics",
    icon: TrendingUp,
    sections: [
      {
        title: "Intelligence Terminal",
        links: [
          { name: "● Live · Africa Intelligence Map", href: "/africa-intelligence" },
          { name: "Diaspora Data Terminal", href: "/insights/data-terminal" },
        ],
      },
      {
        title: "Institutional Research",
        links: [
          { name: "Policy Briefs & White Papers", href: "/insights/policy" },
          { name: "Strategic Market Outlook", href: "/insights/market-outlook" },
        ],
      },
    ],
  },
];

const mobileUtilityLinks = [
  { name: "FAQS", href: "/faqs" },
  { name: "CONTACT", href: "/contact" },
  { name: "NEWS & MEDIA", href: "/news" },
  { name: "EVENTS", href: "/events" },
  { name: "COMPLIANCE", href: "/compliance" },
];

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);
  
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleMouseEnter = contextSafe((menuName: string) => {
    setActiveMenu(menuName);
    gsap.to(panelRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out",
      display: "block",
    });
  });

  const handleMouseLeave = contextSafe(() => {
    setActiveMenu(null);
    gsap.to(panelRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: "power2.in",
      display: "none",
    });
  });

  // Mobile overlay animations
  useGSAP(() => {
    if (mobileOpen && mobileOverlayRef.current) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      gsap.to(mobileOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
        display: "flex",
        ease: "power2.out",
      });
      // Stagger the nav items in
      gsap.fromTo(
        ".mobile-nav-item",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.15, ease: "power3.out" }
      );
      gsap.fromTo(
        ".mobile-utility-item",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, delay: 0.5, ease: "power2.out" }
      );
    } else if (!mobileOpen && mobileOverlayRef.current) {
      document.body.style.overflow = "";
      gsap.to(mobileOverlayRef.current, {
        opacity: 0,
        duration: 0.25,
        display: "none",
        ease: "power2.in",
      });
    }
  }, [mobileOpen]);

  const toggleMobileAccordion = (name: string) => {
    setMobileAccordion(mobileAccordion === name ? null : name);
  };

  return (
    <>
    <header 
      ref={containerRef}
      className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 relative"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="relative z-20 shrink-0 mr-8">
          <BrandLogo isDarkTheme={true} />
        </div>

        {/* Desktop Navigation — hidden below lg */}
        <nav className="hidden lg:flex items-center space-x-8 h-full">
          {navigation.map((item) => (
            <div 
              key={item.name}
              className="h-full flex items-center relative cursor-pointer"
              onMouseEnter={() => handleMouseEnter(item.name)}
            >
              <span className={`text-sm font-medium transition-colors flex items-center group ${activeMenu === item.name ? 'text-blue-400' : 'text-zinc-300 hover:text-zinc-100'}`}>
                {item.name}
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 ${activeMenu === item.name ? 'rotate-180 text-blue-400' : 'text-zinc-500'}`} />
              </span>
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 relative z-20">
          <Link href="#" className="hidden md:block text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors">
            Initiate Expansion
          </Link>
          <Link href="/auth" className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <span>Member Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* ── Mobile Hamburger ── visible below lg */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="lg:hidden relative w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors z-[200]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DESKTOP: Mega Menu Dropdown Panel                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div 
        ref={panelRef}
        className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 shadow-2xl overflow-hidden hidden opacity-0 -translate-y-2"
        style={{ opacity: 0, display: 'none' }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={`${item.name}-panel`}
                className={`grid grid-cols-12 gap-8 transition-opacity duration-300 ${activeMenu === item.name ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-x-6 top-12 pointer-events-none'}`}
              >
                <div className="col-span-4 border-r border-zinc-800/50 pr-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-md">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-100">{item.name}</h2>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                    Access institutional resources, sector frameworks, and comprehensive guidance for the {item.name} sector of the council.
                  </p>
                </div>
                
                <div className="col-span-8 grid grid-cols-2 gap-x-12 gap-y-8">
                  {item.sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="text-sm font-bold text-zinc-500 tracking-wider uppercase mb-4">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.links.map((link) => (
                          <li key={link.name}>
                            <Link href={link.href} className="text-zinc-300 hover:text-blue-400 font-medium text-sm transition-colors block">
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MOBILE: Full-Screen Overlay — OUTSIDE header to escape        */}
      {/* the sticky z-[100] parent stacking context                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div
        ref={mobileOverlayRef}
        className="fixed inset-0 z-[200] bg-zinc-950 flex-col hidden"
        style={{ opacity: 0 }}
      >
        {/* Overlay Header — mirrors main header for visual continuity */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <BrandLogo isDarkTheme={true} />
          <button 
            onClick={() => setMobileOpen(false)} 
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          
          {/* Primary Navigation — Accordion */}
          <div className="space-y-1 mb-12">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isOpen = mobileAccordion === item.name;
              return (
                <div key={item.name} className="mobile-nav-item">
                  <button
                    onClick={() => toggleMobileAccordion(item.name)}
                    className={`w-full flex items-center justify-between py-4 px-3 rounded-sm transition-colors ${isOpen ? 'bg-zinc-900 text-white' : 'text-zinc-300 hover:bg-zinc-900/50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-sm ${isOpen ? 'bg-blue-500/10' : 'bg-zinc-800/50'}`}>
                        <Icon className={`w-4 h-4 ${isOpen ? 'text-blue-400' : 'text-zinc-500'}`} />
                      </div>
                      <span className="text-[15px] font-semibold tracking-wide">{item.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : 'text-zinc-600'}`} />
                  </button>

                  {/* Accordion Content */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '600px' : '0', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="pl-12 pr-4 pb-4 pt-2 space-y-6">
                      {item.sections.map((section) => (
                        <div key={section.title}>
                          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">{section.title}</h4>
                          <ul className="space-y-2.5">
                            {section.links.map((link) => (
                              <li key={link.name}>
                                <Link
                                  href={link.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="text-[13px] text-zinc-400 hover:text-blue-400 transition-colors block py-0.5"
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
                </div>
              );
            })}
          </div>

          {/* Utility Links */}
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-5 px-3">Quick Access</h4>
            <div className="grid grid-cols-2 gap-2">
              {mobileUtilityLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="mobile-utility-item text-xs font-bold tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 px-3 py-3 rounded-sm transition-colors border border-zinc-800/50"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="space-y-3 px-3">
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="mobile-utility-item flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold tracking-widest uppercase py-4 rounded-sm transition-all"
            >
              <span>Member Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              onClick={() => setMobileOpen(false)}
              className="mobile-utility-item flex items-center justify-center w-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm font-bold tracking-widest uppercase py-4 rounded-sm transition-all"
            >
              Initiate Expansion
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
