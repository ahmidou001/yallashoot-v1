"use client";

import React, { useState, useEffect } from "react";

export type AdsterraBannerSize =
  | "728x90"
  | "468x60"
  | "320x50"
  | "300x250"
  | "160x600";

interface BannerConfig {
  key: string;
  width: number;
  height: number;
}

const BANNER_CONFIGS: Record<AdsterraBannerSize, BannerConfig> = {
  "728x90": {
    key: "f1d00690cf5e5e45af3d3997975f6fbc",
    width: 728,
    height: 90,
  },
  "468x60": {
    key: "42c591b26df07fdfd3c3df6f2b2c96a8",
    width: 468,
    height: 60,
  },
  "320x50": {
    key: "a0b994406b0df34491aa94ec9cd24caf",
    width: 320,
    height: 50,
  },
  "300x250": {
    key: "42f76c98375a3cf4a75da0ccd2afc48f",
    width: 300,
    height: 250,
  },
  "160x600": {
    key: "66ad76c05f192abc62039b8632b06c36",
    width: 160,
    height: 600,
  },
};

interface AdsterraBannerProps {
  size: AdsterraBannerSize;
  className?: string;
  label?: string;
}

/**
 * Isolated Adsterra Banner component for Next.js.
 * Uses a sandboxed iframe with srcDoc to:
 * 1. Prevent window.atOptions global namespace collisions across multiple banners.
 * 2. Eliminate Cumulative Layout Shift (CLS = 0) with reserved dimension wrappers.
 * 3. Keep SSR HTML 100% clean for Googlebot crawlers.
 */
export default function AdsterraBanner({
  size,
  className = "",
  label = "إعلان",
}: AdsterraBannerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const config = BANNER_CONFIGS[size];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!config) return null;

  const { key, width, height } = config;

  const htmlContent = `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${key}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${key}/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      className={`relative mx-auto flex flex-col items-center justify-center overflow-hidden my-3 ${className}`}
      style={{ minHeight: `${height}px`, minWidth: `${Math.min(width, 320)}px` }}
    >
      {/* Subtle Ad Label */}
      <span className="text-[10px] text-zinc-400 font-mono tracking-wider mb-1 select-none">
        {label}
      </span>

      <div
        className="relative flex items-center justify-center overflow-hidden rounded-lg bg-zinc-900/40 border border-zinc-800/40"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: "100%" }}
      >
        {isMounted ? (
          <iframe
            srcDoc={htmlContent}
            width={width}
            height={height}
            title={`ad-${size}`}
            style={{ border: "none", overflow: "hidden", display: "block" }}
            scrolling="no"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full animate-pulse bg-zinc-900/20"
            style={{ width: `${width}px`, height: `${height}px` }}
          />
        )}
      </div>
    </div>
  );
}
