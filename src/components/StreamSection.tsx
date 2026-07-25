"use client";

import { useState } from "react";
import { RefreshCw, Radio, Play } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

interface StreamSectionProps {
  slug: string;
  // Legacy: pre-signed URLs passed from SSR (iframe use only)
  servers?: { label: string; signedUrl: string }[];
  iframeHtml?: string;
  // New: number of available servers — URLs fetched client-side on click
  serverCount?: number;
  matchStatus?: string;
  matchTime?: string;
}

export default function StreamSection({
  slug,
  servers,
  iframeHtml,
  serverCount = 0,
  matchStatus = "",
  matchTime = "",
}: StreamSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  // Client-side fetched stream URL (fetched on click, not at SSR time)
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Total number of servers: either from legacy `servers` prop or `serverCount`
  const totalServers = servers && servers.length > 0 ? servers.length : serverCount;

  /**
   * Fetch the signed stream URL from the API.
   * Called on user click — never at SSR/render time.
   * serverIndex: 0 = primary, 1+ = alternates
   */
  const fetchSignedUrl = async (serverIndex: number) => {
    setIsFetchingUrl(true);
    setFetchError(false);
    setSignedUrl(null);
    try {
      const res = await fetch("/api/refresh-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, serverIndex }),
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (!data.url) throw new Error("no url");
      setSignedUrl(data.url);
    } catch {
      setFetchError(true);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleActivate = async () => {
    setIsActivated(true);
    // If using legacy pre-signed servers (iframe path), no fetch needed
    if (servers && servers.length > 0) return;
    await fetchSignedUrl(activeIndex);
  };

  const handleServerSwitch = async (index: number) => {
    setActiveIndex(index);
    setIsActivated(true);
    if (servers && servers.length > 0) return;
    await fetchSignedUrl(index);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (servers && servers.length > 0) {
      setTimeout(() => setIsRefreshing(false), 1200);
      return;
    }
    await fetchSignedUrl(activeIndex);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Resolve the current stream URL
  const currentSignedUrl =
    servers && servers.length > 0
      ? servers[activeIndex]?.signedUrl ?? null
      : signedUrl;

  // Server tab labels
  const serverLabels = Array.from({ length: totalServers }, (_, i) =>
    i === 0 ? "خادم 1" : `خادم ${i + 1}`
  );

  const isLive = matchStatus === "live" || matchStatus === "inprogress" || totalServers > 0;
  const isFinished = (matchStatus === "finished" || matchStatus === "ended") && totalServers === 0;

  return (
    <div>
      {/* ── Server Tabs (only shown when 2+ servers and match is live) ── */}
      {isLive && totalServers > 1 && (
        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5 border-b border-border overflow-x-auto scrollbar-none">
          {serverLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => handleServerSwitch(i)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeIndex === i
                  ? "bg-primary text-white shadow-[0_0_14px_rgba(10,166,116,0.35)] border border-primary/40"
                  : "bg-surface-2/60 text-muted border border-border hover:text-foreground hover:border-border-hover hover:bg-surface-2"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeIndex === i ? "bg-white" : "bg-muted/40"
                }`}
              />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Player Area ── */}
      <div className="aspect-video w-full bg-[#080a0f] relative">
        {iframeHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: iframeHtml }}
            className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
          />
        ) : totalServers === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Radio className="h-14 w-14 text-white/10" />
            <p className="text-sm text-white/30">البث غير متوفر حالياً</p>
          </div>
        ) : isFinished ? (
          /* ── Finished match placeholder ── */
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 bg-[#080a0f] text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40">
              <Radio className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white/80">انتهت المباراة</h3>
            <p className="text-xs text-white/40 font-medium">البث المباشر غير متوفر حالياً بعد نهاية المباراة.</p>
          </div>
        ) : !isLive ? (
          /* ── Coming soon match placeholder ── */
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3.5 bg-[#080a0f] text-center px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(10,166,116,0.04)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-primary">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="relative space-y-1">
              <h3 className="text-sm font-bold text-white">المباراة لم تبدأ بعد</h3>
              <p className="text-xs text-white/50">
                ستبدأ المباراة عند الساعة <span className="font-bold text-primary font-mono">{matchTime || "—"}</span>
              </p>
              <p className="text-[11px] text-white/35 max-w-[280px] mx-auto leading-normal">
                سيتوفر البث المباشر والقنوات الناقلة تلقائياً فور اقتراب موعد المباراة.
              </p>
            </div>
          </div>
        ) : !isActivated ? (
          /* ── Click-to-Play placeholder ── */
          <button
            onClick={handleActivate}
            className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-[#080a0f]"
            aria-label="انقر لمشاهدة البث المباشر"
          >
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(10,166,116,0.07)_0%,transparent_70%)]" />

            {/* LIVE badge */}
            <div className="relative flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-[11px] font-bold text-red-400 tracking-widest">LIVE</span>
            </div>

            {/* Play button */}
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/90 border-2 border-primary/40 shadow-[0_0_40px_rgba(10,166,116,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(10,166,116,0.45)] transition-all duration-300">
              <Play className="h-6 w-6 sm:h-8 sm:w-8 fill-white text-white translate-x-0.5" />
            </div>

            {/* Label */}
            <p className="relative text-sm text-white/50 group-hover:text-white/70 transition-colors">
              انقر للمشاهدة
            </p>
          </button>
        ) : isFetchingUrl ? (
          /* Fetching URL spinner */
          <div className="flex h-full w-full items-center justify-center bg-[#080a0f]">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-[2.5px] border-white/5" />
              <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-primary animate-spin" />
            </div>
          </div>
        ) : fetchError ? (
          /* Error state */
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#080a0f]">
            <p className="text-sm text-white/30">تعذّر تحميل البث</p>
            <button
              onClick={() => fetchSignedUrl(activeIndex)}
              className="text-xs text-primary hover:text-primary/80 underline underline-offset-2"
            >
              حاول مجدداً
            </button>
          </div>
        ) : isRefreshing ? (
          <div className="flex h-full w-full items-center justify-center bg-[#080a0f]">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-[2.5px] border-white/5" />
              <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-primary animate-spin" />
            </div>
          </div>
        ) : currentSignedUrl ? (
          <VideoPlayer
            key={`${activeIndex}-${currentSignedUrl}`}
            signedUrl={currentSignedUrl}
            slug={slug}
          />
        ) : null}

        {/* ── Corner Refresh Button — only after activation ── */}
        {!iframeHtml && isActivated && !isRefreshing && !isFetchingUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="absolute top-2 right-2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/50 hover:text-white hover:bg-black/70 hover:border-white/25 hover:scale-110 active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            aria-label="تحديث البث"
            title="تحديث البث"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
