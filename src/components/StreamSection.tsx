"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Radio, Play, Zap } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import StreamCountdown from "./StreamCountdown";
import { triggerSmartlink } from "@/lib/smartlink";

interface StreamSectionProps {
  slug: string;
  servers?: { label: string; signedUrl: string }[];
  iframeHtml?: string;
  serverCount?: number;
  matchStatus?: string;
  matchTime?: string;
  matchStartTime?: string | number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  channelName?: string;
  commentatorName?: string;
  competitionName?: string;
}

export default function StreamSection({
  slug,
  servers,
  iframeHtml,
  serverCount = 1,
  matchStatus = "",
  matchTime = "",
  matchStartTime,
  homeTeamName = "",
  awayTeamName = "",
  homeTeamLogo,
  awayTeamLogo,
  channelName,
  commentatorName,
  competitionName,
}: StreamSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActivated, setIsActivated] = useState(true);

  // Dynamic server count discovered from API
  const [dynamicServerCount, setDynamicServerCount] = useState<number>(
    servers && servers.length > 0 ? servers.length : (serverCount || 1)
  );

  // Client-side fetched stream URL
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const [isApiLocked, setIsApiLocked] = useState(false);
  const [discoveredStartTime, setDiscoveredStartTime] = useState<string | number | null>(null);
  const [isUnlockedManual, setIsUnlockedManual] = useState(false);

  // Auto-fetch stream on mount or slug change
  useEffect(() => {
    if (servers && servers.length > 0) return;
    fetchSignedUrl(0);
  }, [slug]);

  const totalServers =
    servers && servers.length > 0
      ? servers.length
      : Math.max(dynamicServerCount, serverCount || 1);

  const fetchSignedUrl = async (serverIndex: number) => {
    setIsFetchingUrl(true);
    setFetchError(false);
    setSignedUrl(null);
    try {
      const res = await fetch("/api/refresh-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, serverIndex, startTime: matchStartTime }),
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.locked) {
        setIsApiLocked(true);
        if (data.startTime) setDiscoveredStartTime(data.startTime);
        return;
      }
      if (!data.url) throw new Error("no url");
      setIsApiLocked(false);
      setSignedUrl(data.url);
      if (data.serverCount && data.serverCount > 0) {
        setDynamicServerCount(data.serverCount);
      }
    } catch {
      // Fallback: try /api/streams/[gameId]
      try {
        const gameId = slug?.split("-")[0] || slug;
        const res2 = await fetch(`/api/streams/${gameId}`);
        if (!res2.ok) throw new Error("fallback failed");
        const json2 = await res2.json();
        if (json2.locked) {
          setIsApiLocked(true);
          if (json2.startTime) setDiscoveredStartTime(json2.startTime);
          return;
        }
        if (json2.success && json2.data) {
          const sUrl =
            json2.data.servers?.[serverIndex]?.signedUrl || json2.data.streamUrl;
          if (sUrl) {
            setIsApiLocked(false);
            setSignedUrl(sUrl);
            if (json2.data.serverCount && json2.data.serverCount > 0) {
              setDynamicServerCount(json2.data.serverCount);
            }
            return;
          }
        }
      } catch {}
      setFetchError(true);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleActivate = async () => {
    // Trigger smartlink on initial user play intent
    triggerSmartlink();
    setIsActivated(true);
    if (servers && servers.length > 0) return;
    await fetchSignedUrl(activeIndex);
  };

  const handleServerSwitch = async (index: number) => {
    if (index === activeIndex && signedUrl) return;
    // Trigger smartlink if 2-minute cooldown elapsed
    triggerSmartlink();
    setActiveIndex(index);
    setIsActivated(true);
    if (servers && servers.length > 0) return;
    await fetchSignedUrl(index);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (servers && servers.length > 0) {
      setTimeout(() => setIsRefreshing(false), 800);
      return;
    }
    await fetchSignedUrl(activeIndex);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currentSignedUrl =
    servers && servers.length > 0
      ? servers[activeIndex]?.signedUrl ?? null
      : signedUrl;

  const serverLabels = Array.from({ length: totalServers }, (_, i) => `خادم ${i + 1}`);

  const isFinished = matchStatus === "finished" || matchStatus === "ended";
  const isLive =
    !isFinished &&
    (matchStatus === "live" || matchStatus === "inprogress");

  // Determine if stream is locked awaiting 30-min window before kick-off
  const effectiveStartTime = matchStartTime || discoveredStartTime;
  const kickOffMs = effectiveStartTime ? new Date(effectiveStartTime).getTime() : null;
  const UNLOCK_WINDOW_MS = 30 * 60 * 1000;
  const isTimeLocked =
    !isLive &&
    !isFinished &&
    !isUnlockedManual &&
    kickOffMs !== null &&
    !isNaN(kickOffMs) &&
    kickOffMs - Date.now() > UNLOCK_WINDOW_MS;

  const showCountdown =
    !isLive &&
    !isFinished &&
    !isUnlockedManual &&
    (isTimeLocked || isApiLocked) &&
    !!effectiveStartTime;

  if (showCountdown && effectiveStartTime) {
    return (
      <StreamCountdown
        startTime={effectiveStartTime}
        unlockMinutesBefore={30}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeTeamLogo={homeTeamLogo}
        awayTeamLogo={awayTeamLogo}
        channelName={channelName}
        commentatorName={commentatorName}
        competitionName={competitionName}
        onUnlock={() => {
          setIsUnlockedManual(true);
          setIsApiLocked(false);
          fetchSignedUrl(0);
        }}
      />
    );
  }

  return (
    <div>
      {/* ── Modern Multi-Server Switcher Bar (Matching Image 2) ── */}
      {!isFinished && (
        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-5 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md">
          {/* Right side: Title & Live Pulse */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
              البث المباشر
            </span>
          </div>

          {/* Center/Left: Server Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5" dir="rtl">
            {serverLabels.map((label, i) => {
              const isSelected = activeIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => handleServerSwitch(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-extrabold scale-[1.02]"
                      : "bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 hover:text-white hover:bg-zinc-700/80"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-zinc-950" : "bg-zinc-500"
                    }`}
                  />
                  <span>{label}</span>
                </button>
              );
            })}

            {/* Quick Refresh Server Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700/50 transition-all cursor-pointer ${
                isRefreshing ? "animate-spin text-emerald-400" : ""
              }`}
              title="تحديث الخادم"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
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
            <p className="text-xs text-white/40 font-medium">
              البث المباشر غير متوفر حالياً بعد نهاية المباراة.
            </p>
          </div>
        ) : !isActivated ? (
          /* ── Click-to-Play Activation Overlay ── */
          <button
            onClick={handleActivate}
            className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-[#080a0f] cursor-pointer"
            aria-label="انقر لمشاهدة البث المباشر"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)]" />

            <div className="relative flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider">
                بث مباشر
              </span>
            </div>

            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500 border-2 border-emerald-300/40 shadow-[0_0_40px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all duration-300">
              <Play className="h-6 w-6 sm:h-8 sm:w-8 fill-zinc-950 text-zinc-950 translate-x-0.5" />
            </div>

            <p className="relative text-xs sm:text-sm text-zinc-400 group-hover:text-white transition-colors">
              انقر هنا لبدء مشاهدة البث بجودة عالية
            </p>
          </button>
        ) : isFetchingUrl || isRefreshing ? (
          /* ── Fetching URL Loading Spinner ── */
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#080a0f]">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-[2.5px] border-white/10" />
              <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-emerald-500 animate-spin" />
            </div>
            <p className="text-xs text-white/50 font-medium">
              جاري تجهيز {serverLabels[activeIndex] || "سيرفر البث"}...
            </p>
          </div>
        ) : fetchError ? (
          /* ── Fetch Error ── */
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#080a0f] p-6 text-center">
            <Radio className="h-10 w-10 text-white/20 mb-1" />
            <p className="text-sm text-white/70 font-medium">
              البث المباشر غير متوفر حالياً لهذه المباراة
            </p>
            <p className="text-xs text-white/40 max-w-sm">
              يتم تفعيل سيرفرات البث تلقائياً قبل انطلاق المباراة ببضع دقائق.
            </p>
            <button
              onClick={() => fetchSignedUrl(activeIndex)}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              إعادة فحص السيرفر
            </button>
          </div>
        ) : currentSignedUrl ? (
          <VideoPlayer
            key={`${activeIndex}-${currentSignedUrl}`}
            signedUrl={currentSignedUrl}
            slug={slug}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Radio className="h-14 w-14 text-white/10" />
            <p className="text-sm text-white/30">البث غير متوفر حالياً</p>
          </div>
        )}

        {/* ── Corner Refresh Button ── */}
        {!iframeHtml && isActivated && !isRefreshing && !isFetchingUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="absolute top-3 left-3 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            aria-label="تحديث البث"
            title="تحديث سيرفر البث"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
