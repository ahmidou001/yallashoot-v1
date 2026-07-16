"use client";

import React from "react";
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

  return (
    <aside className="w-full shrink-0 md:w-80 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
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
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                isSelected
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-900/5"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${league.id}`}
                  alt={league.name}
                  className="h-8 w-8 object-contain rounded-lg bg-zinc-900 border border-zinc-800 p-1"
                  loading="lazy"
                />
                <div>
                  <div className="text-sm font-semibold leading-tight">{league.name}</div>
                  <div className="text-[10px] text-zinc-500 font-medium mt-0.5">{league.country}</div>
                </div>
              </div>
              
              <ChevronLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${
                isSelected ? "text-emerald-400" : "text-zinc-600"
              }`} />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
