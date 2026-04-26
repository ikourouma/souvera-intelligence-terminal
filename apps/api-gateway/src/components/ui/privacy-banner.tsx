"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ShieldAlert, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

export function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [managed, setManaged] = useState({
    title: "Data & Privacy Compliance",
    message: "AfDEC uses cookies and terminal analytics to ensure robust transatlantic data delivery and platform security.",
    button_primary: "Accept & Proceed",
    button_secondary: "Manage Preferences"
  });
  const bannerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadManaged() {
      const { data } = await supabase.from('managed_content').select('content').eq('slug', 'privacy_banner_config').single();
      if (data?.content) {
        setManaged(data.content as any);
      }
    }
    loadManaged();
  }, []);

  useGSAP(() => {
    // Slide up from bottom after a delay to ensure it doesn't block initial heroic impression
    gsap.fromTo(
      bannerRef.current,
      { y: 150, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 2.5 }
    );
  }, { scope: bannerRef });

  const handleDismiss = () => {
    gsap.to(bannerRef.current, {
      y: 150,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => setIsVisible(false)
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={bannerRef}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[480px] z-[100] bg-zinc-900 border border-zinc-700 shadow-2xl p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-500/10 rounded">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">{managed.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {managed.message} By continuing, you agree to our <Link href="/compliance/privacy-policy" className="underline hover:text-blue-400">Privacy Policy</Link> and <Link href="/compliance/cookie-policy" className="underline hover:text-blue-400">Cookie Protocol</Link>.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors uppercase tracking-widest"
              >
                {managed.button_primary}
              </button>
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors uppercase tracking-widest"
              >
                {managed.button_secondary}
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-white transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
