"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, Clock, Bell, Sparkles, Tv, Check, Flame, Send } from "lucide-react";

interface StreamCountdownProps {
  /** Target kick-off time in ISO string or timestamp */
  startTime: string | number;
  /** Minutes before kickoff when stream unlocks (Default: 30) */
  unlockMinutesBefore?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  channelName?: string;
  commentatorName?: string;
  competitionName?: string;
  onUnlock?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isUnlocked: boolean;
}

export default function StreamCountdown({
  startTime,
  unlockMinutesBefore = 30,
  homeTeamName = "الفريق الأول",
  awayTeamName = "الفريق الثاني",
  homeTeamLogo,
  awayTeamLogo,
  channelName,
  commentatorName,
  competitionName,
  onUnlock,
}: StreamCountdownProps) {
  const [reminded, setReminded] = useState(false);

  // Compute unlock timestamp
  const calculateTargetTime = useCallback(() => {
    const kickOffMs = typeof startTime === "number" ? startTime : new Date(startTime).getTime();
    if (isNaN(kickOffMs)) return null;
    return kickOffMs - unlockMinutesBefore * 60 * 1000;
  }, [startTime, unlockMinutesBefore]);

  const getTimeLeft = useCallback((): TimeLeft => {
    const unlockTarget = calculateTargetTime();
    if (!unlockTarget) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isUnlocked: true };
    }

    const now = Date.now();
    const diff = unlockTarget - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isUnlocked: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const totalSeconds = Math.floor(diff / 1000);

    return { days, hours, minutes, seconds, totalSeconds, isUnlocked: false };
  }, [calculateTargetTime]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = getTimeLeft();
      setTimeLeft(current);

      if (current.isUnlocked) {
        clearInterval(timer);
        if (onUnlock) onUnlock();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [getTimeLeft, onUnlock]);

  const handleReminderClick = () => {
    setReminded(true);
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      try {
        Notification.requestPermission();
      } catch { }
    }
  };

  const kickOffDate = new Date(typeof startTime === "number" ? startTime : startTime);
  const formattedKickOffTime = !isNaN(kickOffDate.getTime())
    ? kickOffDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : "";

  const initialTotalSecondsRef = React.useRef<number | null>(null);

  // Initialize total duration on first calculation so ring starts full and drains down
  useEffect(() => {
    if (initialTotalSecondsRef.current === null && timeLeft.totalSeconds > 0) {
      initialTotalSecondsRef.current = timeLeft.totalSeconds;
    }
  }, [timeLeft.totalSeconds]);

  // SVG circular geometry
  const radius = 82;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius; // ~515.22

  const total = initialTotalSecondsRef.current && initialTotalSecondsRef.current > 0 
    ? initialTotalSecondsRef.current 
    : Math.max(timeLeft.totalSeconds, 1);
  
  // Progress fraction from 1.0 (full) to 0.0 (empty)
  const progress = Math.max(0, Math.min(1, timeLeft.totalSeconds / total));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="relative w-full aspect-video min-h-[380px] sm:min-h-[440px] md:min-h-[480px] bg-[#07090e] rounded-2xl overflow-hidden flex flex-col items-center justify-between p-3.5 sm:p-6 text-center select-none shadow-2xl border border-zinc-800/80"
      dir="rtl"
    >
      {/* ─── Ambient Glow & Stadium Atmosphere ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_120%,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Subtle Pitch Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* ─── Header: Security Shield Capsule ─── */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2 px-1 sm:px-2">
        {/* Anti-Bot Security Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-lg shadow-emerald-500/5 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-emerald-300">
            يفتح قبل {unlockMinutesBefore} دقيقة
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>

        {/* Competition or Channel Pill */}
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

      {/* ─── Center: Match Info & Circular Progress Countdown ─── */}
      <div className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center justify-center gap-2.5 sm:gap-4">
        {/* Teams Matchup Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
          {/* Home Team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
            <span className="text-xs sm:text-sm md:text-base font-black text-white truncate drop-shadow-sm">
              {homeTeamName}
            </span>
            {homeTeamLogo ? (
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full p-1 bg-white/5 border border-white/10 shrink-0 shadow-md">
                <Image
                  src={homeTeamLogo}
                  alt={homeTeamName}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
            ) : null}
          </div>

          {/* VS Badge */}
          <div className="shrink-0 px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 border border-white/10 text-[10px] sm:text-xs font-black text-emerald-400 tracking-wider">
            VS
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start min-w-0">
            {awayTeamLogo ? (
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full p-1 bg-white/5 border border-white/10 shrink-0 shadow-md">
                <Image
                  src={awayTeamLogo}
                  alt={awayTeamName}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
            ) : null}
            <span className="text-xs sm:text-sm md:text-base font-black text-white truncate drop-shadow-sm">
              {awayTeamName}
            </span>
          </div>
        </div>

        {/* Kickoff timing subtitle */}
        {formattedKickOffTime && (
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>موعد انطلاق المباراة: {formattedKickOffTime}</span>
          </div>
        )}

        {/* ─── Circular Glowing Progress Ring & Centered Timer ─── */}
        <div className="relative flex items-center justify-center my-1 sm:my-2">
          {/* Outer Ambient Glow Circle */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl scale-95 pointer-events-none" />

          {/* SVG Progress Circle */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]"
              viewBox="0 0 190 190"
            >
              <defs>
                <linearGradient id="streamTimerGradCom" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <circle
                cx="95"
                cy="95"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-white/10 fill-transparent"
              />

              {/* Animated Progress Stroke */}
              <circle
                cx="95"
                cy="95"
                r={radius}
                stroke="url(#streamTimerGradCom)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="fill-transparent transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Content (Mathematically Centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
              {/* Optional Day Badge if > 0 */}
              {timeLeft.days > 0 && (
                <div className="mb-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold text-emerald-300">
                  {timeLeft.days} {timeLeft.days === 1 ? "يوم" : "أيام"} متبقية
                </div>
              )}

              {/* Digits HH : MM : SS */}
              <div
                className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-widest tabular-nums drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                dir="ltr"
              >
                <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-emerald-400 animate-pulse mx-0.5">:</span>
                <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-cyan-400 animate-pulse mx-0.5">:</span>
                <span className="text-cyan-300">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>

              {/* Arabic Subtitles for Units */}
              <div
                className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-semibold text-zinc-400 mt-1"
                dir="ltr"
              >
                <span className="w-7 text-center">ساعة</span>
                <span className="text-zinc-600">•</span>
                <span className="w-7 text-center">دقيقة</span>
                <span className="text-zinc-600">•</span>
                <span className="w-7 text-center text-cyan-400">ثانية</span>
              </div>

              {/* Status indicator below counter */}
              <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] text-zinc-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>العد التنازلي للبث</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Broadcast Notice */}
        <p className="text-[11px] sm:text-xs text-zinc-400 font-medium max-w-sm sm:max-w-md px-2 leading-relaxed">
          سيبدأ البث المباشر فور انتهاء العداد التنازلي أعلاه تلقائياً دون الحاجة لتحديث الصفحة.
        </p>
      </div>

      {/* ─── Footer: Interactive Bell & Live Pulse ─── */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-white/5 px-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
          <span>الاستوديو التحليلي وسيرفرات البث قيد التجهيز</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/yalla_shooot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 hover:border-[#229ED9]/50 transition-all duration-200 shadow-md shadow-[#229ED9]/10 cursor-pointer"
            title="انضم لقناتنا على تليجرام"
          >
            <Send className="w-3.5 h-3.5" />
            <span>قناة التليجرام للبث ✈️</span>
          </a>

          <button
            onClick={handleReminderClick}
            disabled={reminded}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md ${
              reminded
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                : "bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-emerald-500/40 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {reminded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم تفعيل التنبيه!</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>تنبيهي عند بدء البث</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
