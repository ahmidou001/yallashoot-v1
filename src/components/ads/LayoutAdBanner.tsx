"use client";

import React, { useState, useEffect } from "react";
import AdsterraBanner from "./AdsterraBanner";

interface LayoutAdBannerProps {
  className?: string;
}

/**
 * Global Layout Ad Banner Component
 * - 728x90 on Desktop/Tablet (>= 768px)
 * - 320x50 on Mobile (< 768px)
 * - Guaranteed Zero CLS: Reserved minimum dimensions eliminate layout shift for Google Core Web Vitals.
 * - Client-Side Only (Hydration Gate): Keeps SSR HTML 100% clean for Googlebot and Bingbot indexing.
 */
export default function LayoutAdBanner({ className = "" }: LayoutAdBannerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  return (
    <aside
      aria-label="إعلان ممول"
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 select-none flex justify-center items-center ${className}`}
    >
      {/* Zero CLS container with fixed aspect bounds */}
      <div className="w-full flex justify-center items-center">
        {isDesktop === null ? (
          /* Reserved Skeleton before client detection (Zero CLS) */
          <div className="w-full flex justify-center items-center">
            <div className="hidden md:flex w-[728px] h-[90px] rounded-lg bg-zinc-900/30 border border-zinc-800/30 animate-pulse my-3" />
            <div className="flex md:hidden w-[320px] h-[50px] rounded-lg bg-zinc-900/30 border border-zinc-800/30 animate-pulse my-3" />
          </div>
        ) : isDesktop ? (
          /* Desktop Banner: 728x90 */
          <div className="flex justify-center w-full min-h-[105px]">
            <AdsterraBanner size="728x90" label="إعلان ممول" />
          </div>
        ) : (
          /* Mobile Banner: 320x50 */
          <div className="flex justify-center w-full min-h-[65px]">
            <AdsterraBanner size="320x50" label="إعلان" />
          </div>
        )}
      </div>
    </aside>
  );
}
