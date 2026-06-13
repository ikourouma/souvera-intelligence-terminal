'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Map, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { managePlanHref } from '@/lib/intelligence/routing';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AccountMenuProps {
  user: SupabaseUser;
}

export function AccountMenu({ user }: AccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState<string>('Explorer');
  const [fullName, setFullName] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient(); // Still needed for sign out

  // Fetch user plan and profile from /api/v1/me
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/v1/me');
        
        if (!response.ok) {
          console.error('[AccountMenu] Failed to fetch account info:', response.status);
          setPlan('Account');
          return;
        }

        const data = await response.json();
        
        if (!data.authenticated || !data.access) {
          console.warn('[AccountMenu] User not authenticated or no access info');
          setPlan('Account');
          return;
        }

        // Set plan label from API
        setPlan(data.access.planLabel.replace(' Plan', ''));
        
        // Set full name from profile
        if (data.user?.fullName) {
          setFullName(data.user.fullName);
        }
      } catch (error) {
        console.error('[AccountMenu] Error fetching account info:', error);
        setPlan('Account');
      }
    }
    fetchUserData();
  }, [user.id]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even if error
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  // Generate display name and initials
  const email = user.email || '';
  
  const getDisplayInfo = () => {
    // A. If full name exists, use it
    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        // FirstName LastInitial
        const firstName = parts[0];
        const lastInitial = parts[parts.length - 1].charAt(0);
        const initials = firstName.charAt(0) + lastInitial;
        return {
          initials: initials.toUpperCase(),
          displayName: `${firstName} ${lastInitial}.`,
        };
      } else {
        // Single name
        const name = parts[0];
        return {
          initials: name.substring(0, 2).toUpperCase(),
          displayName: name,
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
    };
  };

  const { initials, displayName } = getDisplayInfo();
  
  // Plan display label
  const planLabel = plan ? `${plan} Plan` : 'Explorer Plan';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-sm transition-all hover:bg-zinc-800/50 max-w-[200px] lg:max-w-[220px]"
        aria-label="Account menu"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        {/* Display Name (hidden on mobile) */}
        <span className="hidden md:block text-sm text-zinc-300 truncate min-w-0 flex-1">
          {displayName}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-zinc-500 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 min-w-[240px] bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden z-50 max-w-[calc(100vw-1rem)]">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            {fullName && (
              <p className="text-sm text-white font-semibold mb-1">{fullName}</p>
            )}
            <p className="text-xs text-zinc-400 truncate">{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 font-medium">
                {planLabel}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              Account Settings
            </Link>
            <Link
              href={managePlanHref(true)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Manage Plan
            </Link>
            <Link
              href="/intelligence/map"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Map className="w-4 h-4" />
              Intelligence Map
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-zinc-800 py-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
