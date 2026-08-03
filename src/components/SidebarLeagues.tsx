"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, ChevronLeft } from "lucide-react";

interface LeagueItem {
  id: number;
  name: string;
  country: string;
  logoColor: string;
}

const POPULAR_LEAGUES: LeagueItem[] = [
  { id: 5930, name: "كأس العالم", country: "دولي", logoColor: "from-blue-600 to-sky-700" },
  { id: 572, name: "دوري أبطال أوروبا", country: "أوروبا", logoColor: "from-blue-750 to-indigo-950" },
  { id: 7, name: "الدوري الإنجليزي", country: "إنجلترا", logoColor: "from-purple-600 to-indigo-700" },
  { id: 11, name: "الدوري الإسباني", country: "إسبانيا", logoColor: "from-red-600 to-orange-500" },
  { id: 649, name: "الدوري السعودي", country: "السعودية", logoColor: "from-green-600 to-yellow-600" },
  { id: 624, name: "دوري أبطال أفريقيا", country: "أفريقيا", logoColor: "from-amber-600 to-yellow-750" },
  { id: 557, name: "الدوري المغربي", country: "المغرب", logoColor: "from-emerald-600 to-green-800" },
  { id: 8935, name: "الدوري المصري", country: "مصر", logoColor: "from-red-700 to-zinc-800" },
  { id: 623, name: "دوري أبطال آسيا", country: "آسيا", logoColor: "from-indigo-600 to-purple-800" },
  { id: 329, name: "كأس أمم أوروبا", country: "أوروبا", logoColor: "from-blue-600 to-indigo-800" },
  { id: 167, name: "كأس أمم إفريقيا", country: "أفريقيا", logoColor: "from-green-600 to-emerald-800" },
  { id: 17, name: "الدوري الإيطالي", country: "إيطاليا", logoColor: "from-blue-600 to-cyan-500" },
  { id: 25, name: "الدوري الألماني", country: "ألمانيا", logoColor: "from-red-650 to-red-800" },
  { id: 35, name: "الدوري الفرنسي", country: "فرنسا", logoColor: "from-cyan-600 to-blue-800" },
  { id: 573, name: "الدوري الأوروبي", country: "أوروبا", logoColor: "from-orange-500 to-yellow-600" },
];

export default function SidebarLeagues({ activeLeagueId }: { activeLeagueId?: number }) {
  const pathname = usePathname();
  const activeChipRef = useRef<HTMLAnchorElement>(null);

  // Auto-scroll selected league chip to center on mobile horizontal bar
  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeLeagueId, pathname]);

  const handleMobileClick = () => {
    // Smooth scroll to top of content on mobile selection
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE VIEW (lg:hidden): Compact Horizontal Scrollable Carousel Bar */}
      {/* ============================================================ */}
      <div className="lg:hidden w-full bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-md overflow-hidden mb-2">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
            <Award className="h-4 w-4 text-emerald-400" />
            <span>اختر البطولة أو الدوري:</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono font-bold">15 بطولة</span>
        </div>

        {/* Scrollable Horizontal Chips Container */}
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 select-none">
          {POPULAR_LEAGUES.map((league) => {
            const isSelected = activeLeagueId === league.id || pathname.includes(`/standings/${league.id}`);
            
            return (
              <Link
                key={league.id}
                ref={isSelected ? activeChipRef : null}
                href={`/standings/${league.id}`}
                onClick={handleMobileClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 border border-emerald-400 scale-105"
                    : "bg-zinc-950/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                }`}
              >
                <img
                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${league.id}`}
                  alt={league.name}
                  width={20}
                  height={20}
                  className={`h-5 w-5 object-contain rounded-full p-0.5 ${
                    isSelected ? "bg-zinc-950/20 border border-zinc-900/30" : "bg-zinc-900 border border-zinc-800"
                  }`}
                  loading="lazy"
                />
                <span className="whitespace-nowrap">{league.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP VIEW (hidden lg:block): Full Vertical Sidebar */}
      {/* ============================================================ */}
      <aside className="hidden lg:block w-80 shrink-0 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800/60">
          <Award className="h-5 w-5 text-emerald-400" />
          <h2 className="font-bold text-base text-zinc-100">أهم البطولات والدوريات</h2>
        </div>

        <div className="space-y-1">
          {POPULAR_LEAGUES.map((league) => {
            const isSelected = activeLeagueId === league.id || pathname.includes(`/standings/${league.id}`);
            
            return (
              <Link
                key={league.id}
                href={`/standings/${league.id}`}
                className={`flex items-center justify-between p-3 min-h-[48px] rounded-xl transition-all duration-200 group ${
                  isSelected
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-900/5 font-bold"
                    : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${league.id}`}
                    alt={league.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain rounded-lg bg-zinc-900 border border-zinc-800 p-1"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-semibold leading-tight">{league.name}</div>
                    <div className="text-[10px] text-zinc-400 font-medium mt-0.5">{league.country}</div>
                  </div>
                </div>
                
                <ChevronLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${
                  isSelected ? "text-emerald-400" : "text-zinc-500"
                }`} />
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
