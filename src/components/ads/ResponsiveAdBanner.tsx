"use client";

import React from "react";
import AdsterraBanner from "./AdsterraBanner";

interface ResponsiveAdBannerProps {
  className?: string;
  label?: string;
}

/**
 * Responsive Ad Banner:
 * Displays 728x90 Leaderboard on Desktop & Tablet (md and above).
 * Displays 320x50 Banner on Mobile (< md).
 * Guaranteed Zero CLS with reserved height wrappers.
 */
export default function ResponsiveAdBanner({
  className = "",
  label = "إعلان",
}: ResponsiveAdBannerProps) {
  return (
    <div className={`w-full flex justify-center items-center my-3 ${className}`}>
      {/* Desktop & Tablet: 728x90 */}
      <div className="hidden md:flex justify-center w-full min-h-[110px]">
        <AdsterraBanner size="728x90" label={label} />
      </div>

      {/* Mobile: 320x50 */}
      <div className="flex md:hidden justify-center w-full min-h-[70px]">
        <AdsterraBanner size="320x50" label={label} />
      </div>
    </div>
  );
}
