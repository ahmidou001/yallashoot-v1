"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, Clock, Bell, Sparkles, Tv, Check, Flame } from "lucide-react";

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

  return (
    <div
      className="relative w-full aspect-video min-h-[340px] sm:min-h-[400px] md:min-h-[440px] bg-[#07090e] rounded-2xl overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 text-center select-none shadow-2xl border border-zinc-800/80"
      dir="rtl"
    >
      {/* ─── Ambient Glow & Stadium Atmosphere ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_120%,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Subtle Pitch Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* ─── Header: Security Shield Capsule ─── */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 px-1 sm:px-2">
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

      {/* ─── Center: Match Info & Countdown Cards ─── */}
      <div className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center gap-3.5 sm:gap-5">
        {/* Teams Matchup Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
          {/* Home Team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
            <span className="text-xs sm:text-base font-black text-white truncate drop-shadow-sm">
              {homeTeamName}
            </span>
            {homeTeamLogo ? (
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
            ) : null}
          </div>

          {/* VS Badge */}
          <div className="shrink-0 px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 border border-white/10 text-[10px] sm:text-xs font-black text-emerald-400 tracking-wider">
            VS
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start min-w-0">
            {awayTeamLogo ? (
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
            ) : null}
            <span className="text-xs sm:text-base font-black text-white truncate drop-shadow-sm">
              {awayTeamName}
            </span>
          </div>
        </div>

        {/* Kickoff timing subtitle */}
        {formattedKickOffTime && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>موعد انطلاق المباراة: {formattedKickOffTime}</span>
          </div>
        )}

        {/* ─── Digital Neon Countdown Boxes ─── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3.5 w-full max-w-md pt-1">
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 shadow-lg backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
              <span className="font-mono text-2xl sm:text-4xl font-extrabold text-white tracking-wider tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-1">
                يوم
              </span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 shadow-lg backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
            <span className="font-mono text-2xl sm:text-4xl font-extrabold text-emerald-400 tracking-wider tabular-nums drop-shadow-[0_0_18px_rgba(16,185,129,0.5)]">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-1">
              ساعة
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 shadow-lg backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
            <span className="font-mono text-2xl sm:text-4xl font-extrabold text-emerald-400 tracking-wider tabular-nums drop-shadow-[0_0_18px_rgba(16,185,129,0.5)]">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-1">
              دقيقة
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 shadow-lg backdrop-blur-xl group hover:border-emerald-500/40 transition-all">
            <span className="font-mono text-2xl sm:text-4xl font-extrabold text-cyan-400 tracking-wider tabular-nums drop-shadow-[0_0_18px_rgba(6,182,212,0.5)]">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-1">
              ثانية
            </span>
          </div>
        </div>

        {/* Live Broadcast Notice */}
        <p className="text-[11px] sm:text-xs text-zinc-400 font-medium max-w-sm sm:max-w-md px-2 leading-relaxed">
          سيبدأ البث المباشر فور انتهاء العداد التنازلي أعلاه تلقائياً دون الحاجة لتحديث الصفحة.
        </p>
      </div>

      {/* ─── Footer: Interactive Bell & Live Pulse ─── */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5 px-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-400 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>الاستوديو التحليلي وسيرفرات البث قيد التجهيز</span>
        </div>

        <button
          onClick={handleReminderClick}
          disabled={reminded}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md ${reminded
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
  );
}
