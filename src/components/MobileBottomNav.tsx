"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy, BookOpen, ArrowLeftRight, BarChart3, MoreHorizontal, Settings, X, Tv, ShieldAlert
} from "lucide-react";
import { useSettings } from "./providers";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { timezone, setTimezone, timeFormat, setTimeFormat } = useSettings();

  const navItems = [
    {
      id: "matches",
      label: "المباريات",
      href: "/",
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Soccer pitch icon */}
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      isActive: pathname === "/",
    },
    {
      id: "news",
      label: "الأخبار",
      href: "/news",
      icon: (active: boolean) => (
        <BookOpen className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
      ),
      isActive: pathname.startsWith("/news"),
    },
    {
      id: "live",
      label: "البث المباشر",
      href: "/live",
      icon: (active: boolean) => (
        <Tv className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
      ),
      isActive: pathname === "/live",
    },
    {
      id: "standings",
      label: "الترتيب",
      href: "/standings/11",
      icon: (active: boolean) => (
        <BarChart3 className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
      ),
      isActive: pathname.startsWith("/standings"),
    },
    {
      id: "more",
      label: "المزيد",
      href: "#more",
      icon: (active: boolean) => (
        <MoreHorizontal className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
      ),
      isActive: isMoreOpen,
      isButton: true,
    },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0b0e14]/95 backdrop-blur-xl border-t border-zinc-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] select-none">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
          {navItems.map((item) => {
            const active = item.isActive;

            if (item.isButton) {
              return (
                <button
                  key={item.id}
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex flex-col items-center justify-center py-1 px-2 min-w-[58px] transition-all cursor-pointer ${active ? "text-emerald-400 font-extrabold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  <div className={`p-1 rounded-xl transition ${active ? "bg-emerald-500/10 text-emerald-400" : ""}`}>
                    {item.icon(active)}
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 min-w-[58px] transition-all cursor-pointer ${active ? "text-emerald-400 font-extrabold" : "text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                <div className={`p-1 rounded-xl transition ${active ? "bg-emerald-500/10 text-emerald-400" : ""}`}>
                  {item.icon(active)}
                </div>
                <span className="text-[10px] font-bold mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* More Options Drawer Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
          <div className="bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
              <h3 className="font-extrabold text-base text-zinc-100 flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-400" />
                الإعدادات والخيارات
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-200 hover:border-emerald-500/30 transition"
              >
                <span>جدول مباريات اليوم</span>
                <Trophy className="h-4 w-4 text-emerald-400" />
              </Link>

              <Link
                href="/live"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-200 hover:border-emerald-500/30 transition"
              >
                <span>مباريات البث المباشر</span>
                <Tv className="h-4 w-4 text-red-400" />
              </Link>

              <Link
                href="/standings/11"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-200 hover:border-emerald-500/30 transition"
              >
                <span>جداول الترتيب للدوريات</span>
                <BarChart3 className="h-4 w-4 text-emerald-400" />
              </Link>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-xs font-black text-zinc-400 block">إعدادات الوقت والتوقيت</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-bold">منطقتك الزمنية</span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value as any)}
                    className="bg-zinc-850 border border-zinc-750 text-emerald-400 font-bold rounded-lg px-2.5 py-1 text-xs outline-none"
                  >
                    <option value="auto">تلقائي</option>
                    <option value="Saudi">السعودية (GMT+3)</option>
                    <option value="Egypt">مصر (GMT+2)</option>
                    <option value="Morocco">المغرب (GMT+1)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-300 font-bold">صيغة الوقت</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setTimeFormat("24")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${timeFormat === "24" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-850 text-zinc-400"
                        }`}
                    >
                      24h
                    </button>
                    <button
                      onClick={() => setTimeFormat("12")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${timeFormat === "12" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-850 text-zinc-400"
                        }`}
                    >
                      12h
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
