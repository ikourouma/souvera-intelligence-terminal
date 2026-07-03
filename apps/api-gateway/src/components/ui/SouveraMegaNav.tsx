'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import {
  ChevronDown, ArrowRight, Menu, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MOBILE_UTILITY_LINKS, SITE_MEGA_NAV } from '@/lib/site-navigation';
import { AccountMenu } from './AccountMenu';
import type { User } from '@supabase/supabase-js';

const navigation = SITE_MEGA_NAV;

// Helper to get display info from user
function getUserDisplayInfo(user: User | null, fullName?: string | null) {
  if (!user) return null;
  
  const email = user.email || '';
  
  // A. If full name exists, use it
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1].charAt(0);
      const initials = firstName.charAt(0) + lastInitial;
      return {
        initials: initials.toUpperCase(),
        displayName: `${firstName} ${lastInitial}.`,
        fullName,
      };
    } else {
      const name = parts[0];
      return {
        initials: name.substring(0, 2).toUpperCase(),
        displayName: name,
        fullName: name,
      };
    }
  }
  
  // B. Derive from email local part
  const localPart = email.split('@')[0] || 'account';
  const friendlyName = localPart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  
  return {
    initials: friendlyName.substring(0, 2).toUpperCase(),
    displayName: friendlyName,
    fullName: null,
  };
}

export function SouveraMegaNav() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('Explorer');
  const [authLoading, setAuthLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });
  const supabase = createClient();

  // Check auth state and fetch user data
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      // Fetch account info from /api/v1/me if authenticated
      if (session?.user) {
        try {
          const response = await fetch('/api/v1/me');
          
          if (!response.ok) {
            console.error('[SouveraMegaNav] Failed to fetch account info:', response.status);
            return;
          }

          const data = await response.json();
          
          if (data.authenticated && data.access) {
            // Set plan name from API
            setUserPlan(data.access.planLabel.replace(' Plan', ''));
            
            // Set full name from profile
            if (data.user?.fullName) {
              setUserFullName(data.user.fullName);
            }
          }
        } catch (error) {
          console.error('[SouveraMegaNav] Error fetching account info:', error);
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setUserFullName(null);
        setUserPlan('Explorer');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
        className="sticky top-0 z-[100] w-full"
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
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium hidden sm:block border-l border-zinc-800 pl-3">
              Intelligence Terminal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 h-full flex-1 min-w-0 justify-center">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="h-full flex items-center cursor-pointer shrink-0"
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
          <div className="flex items-center gap-4 relative z-20 shrink-0 ml-4">
            <Link
              href="/intelligence/map"
              className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Access Terminal
            </Link>
            
            {/* Auth State: Show loading, account menu, or sign in */}
            {authLoading ? (
              <div className="hidden sm:block w-24 h-10 bg-zinc-800/50 animate-pulse rounded-sm" />
            ) : user ? (
              <div className="hidden sm:block">
                <AccountMenu user={user} />
              </div>
            ) : (
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
            )}
            
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
          className="absolute top-full left-0 w-full z-[100] shadow-2xl overflow-hidden hidden"
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
                      Sovereign-grade intelligence across African and Caribbean markets. Powered by IMF, World Bank, and source-attributed data infrastructure.
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
                              {link.featured ? (
                                <Link
                                  href={link.href}
                                  className="group relative flex items-center gap-2 text-[13px] font-semibold transition-all block rounded-lg px-3.5 py-2.5 -mx-3 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-teal-500/15 border border-fuchsia-500/40 hover:border-fuchsia-400/70 hover:from-violet-600/30 hover:via-fuchsia-500/25 hover:to-teal-500/20 shadow-[0_0_20px_rgba(217,70,239,0.12)] hover:shadow-[0_0_28px_rgba(217,70,239,0.22)]"
                                >
                                  <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-80" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-teal-400 ring-1 ring-white/20" />
                                  </span>
                                  <span className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-teal-200 bg-clip-text text-transparent group-hover:from-white group-hover:via-fuchsia-100 group-hover:to-teal-100">
                                    {link.name}
                                  </span>
                                  {link.badge && (
                                    <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-fuchsia-500/30 to-violet-500/30 text-fuchsia-100 border border-fuchsia-400/50 shadow-sm">
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                              ) : (
                                <Link
                                  href={link.href}
                                  className="text-[13px] font-medium transition-colors block hover:text-souvera-blue"
                                  style={{ color: '#D1D5DB' }}
                                >
                                  {link.name}
                                </Link>
                              )}
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
          {/* User Info in Mobile (if authenticated) */}
          {user && (() => {
            const displayInfo = getUserDisplayInfo(user, userFullName);
            const planLabel = userPlan ? `${userPlan} Plan` : 'Explorer Plan';
            
            return (
              <div className="mb-6 pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {displayInfo?.initials || 'AC'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold">{displayInfo?.displayName || 'Account'}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="ml-[52px]">
                  <span className="inline-block text-xs px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 font-medium">
                    {planLabel}
                  </span>
                </div>
              </div>
            );
          })()}
          
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
                                <Link
                                  href={link.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`text-[13px] block py-2 px-3 -mx-3 rounded-lg transition-colors ${
                                    link.featured
                                      ? 'font-semibold bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-teal-500/15 border border-fuchsia-500/40'
                                      : 'hover:text-souvera-blue py-1 px-0 mx-0 border-0 bg-transparent'
                                  }`}
                                  style={link.featured ? undefined : { color: '#9CA3AF' }}
                                >
                                  <span
                                    className={
                                      link.featured
                                        ? 'bg-gradient-to-r from-violet-300 via-fuchsia-300 to-teal-300 bg-clip-text text-transparent'
                                        : undefined
                                    }
                                  >
                                    {link.name}
                                  </span>
                                  {link.badge && (
                                    <span className="ml-2 text-[9px] font-bold tracking-wider uppercase text-fuchsia-300 not-italic">
                                      {link.badge}
                                    </span>
                                  )}
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
            <Link href="/intelligence/map" onClick={() => setMobileOpen(false)} className="sv-mobile-item flex items-center justify-center gap-2 w-full font-bold text-[12px] tracking-widest uppercase py-4 rounded-sm transition-all" style={{ background: '#2563EB', color: 'white' }}>
              Access Terminal <ArrowRight className="w-4 h-4" />
            </Link>
            
            {/* Auth-dependent actions */}
            {user ? (
              <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid #1F2A37' }}>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="sv-mobile-item text-[10px] font-bold tracking-widest uppercase text-center py-3 rounded-sm transition-colors" style={{ background: '#161D26', color: '#9CA3AF', border: '1px solid #1F2A37' }}>
                  Profile
                </Link>
                <Link href="/profile#subscription" onClick={() => setMobileOpen(false)} className="sv-mobile-item text-[10px] font-bold tracking-widest uppercase text-center py-3 rounded-sm transition-colors" style={{ background: '#161D26', color: '#9CA3AF', border: '1px solid #1F2A37' }}>
                  Plans
                </Link>
                <button onClick={async () => { await supabase.auth.signOut(); setMobileOpen(false); window.location.href = '/'; }} className="sv-mobile-item text-[10px] font-bold tracking-widest uppercase text-center py-3 rounded-sm transition-colors" style={{ background: '#161D26', color: '#EF4444', border: '1px solid #1F2A37' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid #1F2A37' }}>
                {MOBILE_UTILITY_LINKS.map((link) => (
                  <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="sv-mobile-item text-[10px] font-bold tracking-widest uppercase text-center py-3 rounded-sm transition-colors" style={{ background: '#161D26', color: '#9CA3AF', border: '1px solid #1F2A37' }}>
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
