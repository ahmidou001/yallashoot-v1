"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tv, Home, Award, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings, TimezoneOption, TimeFormatOption, ThemeOption } from "./providers";

export default function Header() {
  const pathname = usePathname();
  const {
    timezone,
    setTimezone,
    timeFormat,
    setTimeFormat,
    theme,
    setTheme
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<"main" | "timezone" | "timeformat" | "theme">("main");
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Reset menu view when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to prevent flash
      const t = setTimeout(() => setCurrentMenu("main"), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-black text-xl tracking-tight text-emerald-500 hover:text-emerald-400 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-900/10">
              <Tv className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-white via-zinc-100 to-emerald-400 bg-clip-text text-transparent">
              يلا شوت لايف
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/" 
                  ? "bg-zinc-900 text-emerald-400 border border-zinc-800" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Home className="h-4 w-4" />
              الرئيسية
            </Link>
            <Link
              href="/live"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/live"
                  ? "bg-zinc-900 text-emerald-400 border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Tv className="h-4 w-4" />
              مباريات البث المباشر
            </Link>
            <Link
              href="/standings/11"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith("/standings")
                  ? "bg-zinc-900 text-emerald-400 border border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Award className="h-4 w-4" />
              جداول الترتيب
            </Link>
          </nav>
        </div>

        {/* Settings button and dropdown container */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer relative"
            title="الإعدادات"
          >
            <Settings className={`h-5 w-5 transition duration-300 ${isOpen ? "rotate-90 text-emerald-350" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-4 shadow-xl z-50 text-right flex flex-col gap-1.5 select-none animate-fadeIn">
              
              {/* Menu 1: Main preferences menu */}
              {currentMenu === "main" && (
                <>
                  {/* Timezone */}
                  <button 
                    onClick={() => setCurrentMenu("timezone")}
                    className="w-full flex items-center justify-between py-3 px-2.5 rounded-xl hover:bg-zinc-900/60 transition group text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      <ChevronLeft className="h-4 w-4 text-zinc-500 group-hover:text-zinc-350 transition" />
                      <span className="text-xs text-zinc-450 font-bold">
                        {timezone === "auto" ? "منطقتك الزمنية" : 
                         timezone === "Saudi" ? "السعودية" : 
                         timezone === "Egypt" ? "مصر" : 
                         timezone === "Morocco" ? "المغرب" : "التوقيت العالمي"}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-zinc-200">منطقتك الزمنية</span>
                  </button>

                  {/* Time Format */}
                  <button 
                    onClick={() => setCurrentMenu("timeformat")}
                    className="w-full flex items-center justify-between py-3 px-2.5 rounded-xl hover:bg-zinc-900/60 transition group text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      <ChevronLeft className="h-4 w-4 text-zinc-500 group-hover:text-zinc-350 transition" />
                      <span className="text-xs text-zinc-450 font-bold">
                        {timeFormat === "24" ? "24 ساعة" : "12 ساعة"}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-zinc-200">صيغة الوقت</span>
                  </button>

                  {/* Theme */}
                  <button 
                    onClick={() => setCurrentMenu("theme")}
                    className="w-full flex items-center justify-between py-3 px-2.5 rounded-xl hover:bg-zinc-900/60 transition group text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      <ChevronLeft className="h-4 w-4 text-zinc-500 group-hover:text-zinc-350 transition" />
                      <span className="text-xs text-zinc-450 font-bold">
                        {theme === "system" ? "تلقائي" : theme === "light" ? "نهاري" : "ليلي"}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-zinc-200">المظهر</span>
                  </button>
                </>
              )}

              {/* Menu 2: Timezone options */}
              {currentMenu === "timezone" && (
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => setCurrentMenu("main")}
                    className="w-full flex items-center justify-between py-2 px-1 text-zinc-400 hover:text-zinc-200 transition font-bold text-xs sm:text-sm border-b border-zinc-900 mb-2 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>منطقتك الزمنية</span>
                  </button>
                  {[
                    { id: "auto", label: "منطقتك الزمنية" },
                    { id: "Saudi", label: "السعودية (GMT+3)" },
                    { id: "Egypt", label: "مصر (GMT+2)" },
                    { id: "Morocco", label: "المغرب (GMT+1)" },
                    { id: "UTC", label: "التوقيت العالمي (UTC)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTimezone(opt.id as TimezoneOption);
                        setCurrentMenu("main");
                      }}
                      className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        timezone === opt.id 
                          ? "bg-emerald-950/60 text-emerald-450 border border-emerald-500/25" 
                          : "text-zinc-450 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      {timezone === opt.id && <span className="text-emerald-450 font-black">✓</span>}
                      <span className="mr-auto">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Menu 3: Time format options */}
              {currentMenu === "timeformat" && (
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => setCurrentMenu("main")}
                    className="w-full flex items-center justify-between py-2 px-1 text-zinc-400 hover:text-zinc-200 transition font-bold text-xs sm:text-sm border-b border-zinc-900 mb-2 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>صيغة الوقت</span>
                  </button>
                  {[
                    { id: "24", label: "24 ساعة (التوقيت خلال 24 ساعة)" },
                    { id: "12", label: "12 ساعة (التوقيت صباحاً / مساءً)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTimeFormat(opt.id as TimeFormatOption);
                        setCurrentMenu("main");
                      }}
                      className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        timeFormat === opt.id 
                          ? "bg-emerald-950/60 text-emerald-450 border border-emerald-500/25" 
                          : "text-zinc-450 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      {timeFormat === opt.id && <span className="text-emerald-450 font-black">✓</span>}
                      <span className="mr-auto">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Menu 4: Theme options */}
              {currentMenu === "theme" && (
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => setCurrentMenu("main")}
                    className="w-full flex items-center justify-between py-2 px-1 text-zinc-400 hover:text-zinc-200 transition font-bold text-xs sm:text-sm border-b border-zinc-900 mb-2 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>المظهر</span>
                  </button>
                  {[
                    { id: "system", label: "تلقائي (حسب النظام)" },
                    { id: "light", label: "نهاري" },
                    { id: "dark", label: "ليلي" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id as ThemeOption);
                        setCurrentMenu("main");
                      }}
                      className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        theme === opt.id 
                          ? "bg-emerald-950/60 text-emerald-450 border border-emerald-500/25" 
                          : "text-zinc-450 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      {theme === opt.id && <span className="text-emerald-450 font-black">✓</span>}
                      <span className="mr-auto">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
