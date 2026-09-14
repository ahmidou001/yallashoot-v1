"use client";

import React, { useState, useEffect } from "react";

interface AdsterraNativeProps {
  className?: string;
  label?: string;
}

/**
 * Adsterra Native Banner component for yallashoot.com
 * Container: container-cca09f6b14dc2f7224a80e71224907f7
 * Script: https://pl31338259.profitableratecpmnetwork.com/cca09f6b14dc2f7224a80e71224907f7/invoke.js
 */
export default function AdsterraNative({
  className = "",
  label = "أخبار وإعلانات مقترحة",
}: AdsterraNativeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: 100%;
      overflow: hidden;
    }
    #container-cca09f6b14dc2f7224a80e71224907f7 {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="container-cca09f6b14dc2f7224a80e71224907f7"></div>
  <script async="async" data-cfasync="false" src="https://pl31338259.profitableratecpmnetwork.com/cca09f6b14dc2f7224a80e71224907f7/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      className={`relative mx-auto w-full max-w-3xl my-6 flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 shadow-md ${className}`}
      style={{ minHeight: "160px" }}
    >
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/40 px-1">
        <span className="text-[11px] font-bold text-zinc-400 select-none">
          {label}
        </span>
        <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
          Sponsored
        </span>
      </div>

      <div className="relative w-full overflow-hidden flex items-center justify-center min-h-[120px]">
        {isMounted ? (
          <iframe
            srcDoc={htmlContent}
            width="100%"
            height="140"
            title="adsterra-native"
            style={{ border: "none", overflow: "hidden", display: "block" }}
            scrolling="no"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-28 animate-pulse rounded-xl bg-zinc-900/30" />
        )}
      </div>
    </div>
  );
}
