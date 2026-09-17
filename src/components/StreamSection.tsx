"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, Radio, Play, Zap, Send, Flame, Tv } from "lucide-react";
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
  const [isActivated, setIsActivated] = useState(false);

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
  const [hasUnlockedCountdown, setHasUnlockedCountdown] = useState(false);
  const [isConnectingCountdown, setIsConnectingCountdown] = useState(false);

  const handlePreKickoffPlayClick = () => {
    // 1. Trigger ad/smartlink on user first play intent
    triggerSmartlink();
    // 2. Realistic buffer/connection state for 1200ms
    setIsConnectingCountdown(true);
    setTimeout(() => {
      setIsConnectingCountdown(false);
      setHasUnlockedCountdown(true);
    }, 1200);
  };

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
    if (!hasUnlockedCountdown) {
      return (
        <div
          className="relative w-full aspect-video min-h-[380px] sm:min-h-[440px] md:min-h-[480px] bg-[#07090e] rounded-2xl overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 text-center select-none shadow-2xl border border-zinc-800/80"
          dir="rtl"
        >
          {/* Ambient Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.2)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Bar Badges */}
          <div className="relative z-10 w-full flex items-center justify-between gap-2 px-1 sm:px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-lg shadow-emerald-500/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-300">
                بث مباشر فوري • جودة فائقة HD
              </span>
            </div>

            {(channelName || competitionName) && (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md">
                <Tv className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{channelName || competitionName}</span>
                {commentatorName && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{commentatorName}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Center Play Area */}
          <div className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center justify-center gap-4 sm:gap-6">
            {/* Teams Header */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
                <span className="text-xs sm:text-sm md:text-base font-black text-white truncate drop-shadow-sm">
                  {homeTeamName}
                </span>
                {homeTeamLogo && (
                  <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full p-1 bg-white/5 border border-white/10 shrink-0 shadow-md">
                    <Image
                      src={homeTeamLogo}
                      alt={homeTeamName}
                      fill
                      sizes="44px"
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <div className="shrink-0 px-2.5 py-1 rounded-md bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 border border-white/10 text-xs font-black text-emerald-400 tracking-wider">
                VS
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start min-w-0">
                {awayTeamLogo && (
                  <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full p-1 bg-white/5 border border-white/10 shrink-0 shadow-md">
                    <Image
                      src={awayTeamLogo}
                      alt={awayTeamName}
                      fill
                      sizes="44px"
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                )}
                <span className="text-xs sm:text-sm md:text-base font-black text-white truncate drop-shadow-sm">
                  {awayTeamName}
                </span>
              </div>
            </div>

            {/* Play Button or Connecting State */}
            {isConnectingCountdown ? (
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" />
                  <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  جاري الاتصال بسيرفر البث المباشر...
                </p>
                <span className="text-[11px] text-zinc-400">
                  فحص جودة البث والأقمار الصناعية 📡
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <button
                  onClick={handlePreKickoffPlayClick}
                  className="group relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-4 border-emerald-300/40 shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:shadow-[0_0_70px_rgba(16,185,129,0.75)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  aria-label="تشغيل البث المباشر"
                >
                  <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                  <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-zinc-950 text-zinc-950 translate-x-1 drop-shadow-md group-hover:scale-105 transition-transform" />
                </button>

                <div className="flex flex-col items-center gap-1 mt-1">
                  <span className="text-sm sm:text-base font-black text-white drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                    انقر هنا لبدء مشاهدة البث المباشر (HD)
                  </span>
                  <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                    سيرفرات فائقة السرعة • تدعم جميع الأجهزة والهواتف
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-white/5 px-2">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
              <span>البث متاح بدون تقطيع على جميع السيرفرات</span>
            </div>

            <a
              href="https://t.me/yalla_shooot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 hover:border-[#229ED9]/50 transition-all duration-200 shadow-md shadow-[#229ED9]/10 cursor-pointer"
              title="انضم لقناة التليجرام"
            >
              <Send className="w-3.5 h-3.5" />
              <span>قناة التليجرام للبث ✈️</span>
            </a>
          </div>
        </div>
      );
    }

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
          /* ── Click-to-Play Activation Overlay (Option 1) ── */
          <button
            onClick={handleActivate}
            className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 sm:gap-5 bg-[#080a0f] cursor-pointer p-4 text-center select-none"
            aria-label="انقر لتشغيل البث المباشر والصوت"
          >
            {/* Ambient Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none" />

            {/* Live Indicator Pill */}
            <div className="relative z-10 flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 shadow-lg shadow-emerald-500/10 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-black text-emerald-300 tracking-wider">
                بث مباشر الآن • جودة فائقة HD
              </span>
            </div>

            {/* Pulsing Play Button */}
            <div className="relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 border-2 border-emerald-300/60 shadow-[0_0_50px_rgba(16,185,129,0.45)] group-hover:scale-110 group-hover:shadow-[0_0_65px_rgba(16,185,129,0.65)] transition-all duration-300">
              <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-zinc-950 text-zinc-950 translate-x-0.5" />
            </div>

            {/* Call to action text */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <h3 className="text-sm sm:text-base md:text-lg font-black text-white group-hover:text-emerald-300 transition-colors drop-shadow-md">
                انقر هنا لتشغيل البث المباشر والصوت
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                🔊 تشغيل فوري بأعلى جودة مع صوت المعلق
              </p>
            </div>
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
            startUnmuted={true}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Radio className="h-14 w-14 text-white/10" />
            <p className="text-sm text-white/30">البث غير متوفر حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
