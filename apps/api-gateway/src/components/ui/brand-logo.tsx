"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  customLogoUrl?: string;
  className?: string;
  isDarkTheme?: boolean;
  variant?: "full" | "acronym"; // Added variant to handle Footer reduction
}

export function BrandLogo({ customLogoUrl, className = "", isDarkTheme = true, variant = "full" }: BrandLogoProps) {
  const textColor = isDarkTheme ? "text-white" : "text-zinc-900";
  const subTextColor = isDarkTheme ? "text-zinc-400" : "text-zinc-500";

  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      {customLogoUrl ? (
        <div className="relative h-10 w-auto min-w-[200px]">
          <Image 
            src={customLogoUrl} 
            alt="AfDEC Logo" 
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          {/* Default Shield/Symbol - Now fits AfDEC */}
          <div className="h-10 px-3 bg-blue-600/10 border border-blue-500/30 flex justify-center items-center rounded-sm shrink-0 group-hover:bg-blue-600/20 transition-colors duration-300">
            <span className="text-blue-500 font-bold text-sm tracking-tight">AfDEC</span>
          </div>
          
          {/* Text Lockup Options */}
          {variant === "full" ? (
            <>
              {/* Desktop Full Text */}
              <div className="flex flex-col justify-center hidden lg:flex">
                <span className={`font-bold tracking-tight text-base leading-none mb-1 cursor-default ${textColor}`}>
                  African Diaspora Economic Council
                </span>
                <span className={`text-[11px] uppercase font-semibold tracking-widest leading-none cursor-default ${subTextColor}`}>
                  North Carolina
                </span>
              </div>
              
              {/* Mobile Fallback - Hides the long text */}
              <div className="flex lg:hidden flex-col justify-center">
                 <span className={`font-bold tracking-widest text-lg leading-none ${textColor}`}>
                  AfDEC
                </span>
              </div>
            </>
          ) : (
             <span className={`text-lg font-bold tracking-tight ${textColor}`}>
                AfDEC
             </span>
          )}
        </div>
      )}
    </Link>
  );
}
