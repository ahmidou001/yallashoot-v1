"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Calendar, Play, Tv, RefreshCw, AlertCircle, Award, 
  ChevronLeft, ChevronRight, Star, Trophy, Clock, 
  ArrowLeftRight, Flame, BookOpen, Heart, Info, ChevronDown, MoreHorizontal 
} from "lucide-react";
import SidebarLeagues from "@/components/SidebarLeagues";
import { GamesResponse, Game, Competition } from "@/types/api";
import { useSettings } from "@/components/providers";
import { generateMatchSlug } from "@/lib/matchSlug";

// Fetch functions
async function fetchGames(date: string): Promise<GamesResponse> {
  const res = await fetch(`/api/games?date=${date}`);
  if (!res.ok) throw new Error("Failed to load games");
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to load games");
  }
  return json.data;
}

async function fetchFeaturedGames(): Promise<any[]> {
  const res = await fetch("/api/games/featured");
  if (!res.ok) throw new Error("Failed to load featured games");
  const json = await res.json();
  if (!json.success || !json.data) {
    return [];
  }
  return json.data;
}

async function fetchScorers(competitionId: string): Promise<any> {
  const res = await fetch(`/api/competitions/featured?competitionId=${competitionId}`);
  if (!res.ok) throw new Error("Failed to load scorers");
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to load scorers");
  }
  return json.data;
}

const PRIORITY_LEAGUE_IDS = [
  5930, // FIFA World Cup (كأس العالم)
  329,  // UEFA European Championship (اليورو)
  167,  // Africa Cup of Nations (كأس أمم أفريقيا)
  572,  // UEFA Champions League (دوري أبطال أوروبا)
  573,  // UEFA Europa League (الدوري الأوروبي)
  7685, // UEFA Conference League (دوري المؤتمر الأوروبي)
  7,    // Premier League England (الدوري الإنجليزي الممتاز)
  11,   // La Liga Spain (الدوري الإسباني)
  557,  // Botola Pro Morocco (البطولة الاحترافية المغربية)
  649,  // Saudi Pro League (الدوري السعودي للمحترفين)
  8935, // Egyptian Premier League (الدوري المصري الممتاز)
  17,   // Serie A Italy (الدوري الإيطالي)
  25,   // Bundesliga Germany (الدوري الألماني)
  35,   // Ligue 1 France (الدوري الفرنسي)
  624,  // CAF Champions League (دوري أبطال أفريقيا)
  623,  // AFC Champions League (دوري أبطال آسيا)
  321,  // International Friendlies (المباريات الوديّة الدوليّة)
  131,  // الدوري النرويجي الممتاز
  640,  // كأس الأرجنتين
  237,  // الدوري الأمريكي MLS
  26,   // الدوري الهولندي الممتاز
  28,   // الدوري البرتغالي الممتاز
  10,   // كأس الاتحاد الإنجليزي
  13,   // كأس ملك إسبانيا
  5651, // الدوري المغربي القسم الثاني
  323,  // مباريات ودية أندية
];

export default function HomePage() {
  const { formatTime } = useSettings();

  // Selected date state in DD/MM/YYYY format
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });

  const [filterLiveOnly, setFilterLiveOnly] = useState(false);
  const [activeScorersLeague, setActiveScorersLeague] = useState<string>("5930");
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [openCountry, setOpenCountry] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch real sports news from MongoDB API
  const { data: newsArticles, isLoading: isNewsLoading } = useQuery({
    queryKey: ["latestNewsFeed"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=10");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    refetchInterval: 60000,
  });

  // Custom Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Click outside to close calendar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCalendarOpen]);

  // 1. Query for games feed
  const { data, isLoading, error } = useQuery<GamesResponse>({
    queryKey: ["games", selectedDate],
    queryFn: () => fetchGames(selectedDate),
    refetchInterval: (query) => {
      const games = query.state.data?.games;
      const hasLive = games?.some((g) => g.statusGroup === 3);
      return hasLive ? 30000 : false;
    },
  });

  // 2. Query for featured games list
  const { data: featuredGames, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["featuredGames"],
    queryFn: fetchFeaturedGames,
  });

  // 3. Query for scorers
  const { data: scorersData, isLoading: isScorersLoading } = useQuery({
    queryKey: ["scorers", activeScorersLeague],
    queryFn: () => fetchScorers(activeScorersLeague),
  });

  // Navigate Date Handler
  const handleNavigateDate = (direction: "prev" | "next") => {
    const parts = selectedDate.split("/");
    if (parts.length !== 3) return;
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    d.setDate(d.getDate() + (direction === "prev" ? -1 : 1));
    
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    setSelectedDate(`${dd}/${mm}/${yyyy}`);
  };

  // Group and sort games by competition
  const getGroupedGames = () => {
    if (!data || !data.games) return [];

    const filteredGames = data.games.filter((game) => {
      if (filterLiveOnly) return game.statusGroup === 3;
      return true;
    });

    const groups: Record<number, { competition: Competition; games: Game[] }> = {};

    filteredGames.forEach((game) => {
      const compId = game.competitionId;
      if (!groups[compId]) {
        const comp = data.competitions.find((c) => c.id === compId) || {
          id: compId,
          name: "بطولة أخرى",
        };
        groups[compId] = { competition: comp, games: [] };
      }
      groups[compId].games.push(game);
    });

    const result = Object.values(groups);
    
    // Sort priority
    result.sort((a, b) => {
      const idxA = PRIORITY_LEAGUE_IDS.indexOf(a.competition.id);
      const idxB = PRIORITY_LEAGUE_IDS.indexOf(b.competition.id);
      if (idxA > -1 && idxB > -1) return idxA - idxB;
      if (idxA > -1) return -1;
      if (idxB > -1) return 1;
      return a.competition.name.localeCompare(b.competition.name, "ar");
    });

    return result;
  };

  const groupedCompetitions = getGroupedGames();
  const priorityCompetitions = groupedCompetitions.filter((item) =>
    PRIORITY_LEAGUE_IDS.includes(item.competition.id)
  );
  const otherCompetitions = groupedCompetitions.filter((item) =>
    !PRIORITY_LEAGUE_IDS.includes(item.competition.id)
  );
  const liveCount = data?.games?.filter((g) => g.statusGroup === 3).length || 0;

  // Group games dynamically by Country name
  const getGroupedByCountry = () => {
    if (!data || !data.games || !data.competitions || !data.countries) return [];
    
    const groups: Record<number, { country: any; games: Game[] }> = {};
    
    data.games.forEach((game) => {
      const comp = data.competitions.find((c) => c.id === game.competitionId);
      if (!comp) return;
      
      const countryId = comp.countryId || 9999;
      const country = (data.countries || []).find((c) => c.id === countryId) || {
        id: countryId,
        name: "دولي",
      };
      
      if (!groups[countryId]) {
        groups[countryId] = { country, games: [] };
      }
      groups[countryId].games.push(game);
    });
    
    return Object.values(groups).sort((a, b) => b.games.length - a.games.length);
  };

  const countryGroupings = getGroupedByCountry();

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const getScorerImageUrl = (scorer: any) => {
    const pathSuffix = scorer.isNational 
      ? `NationalTeam/${scorer.athleteId}` 
      : `${scorer.athleteId}`;
    return `https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v${scorer.imageVersion}/Athletes/${pathSuffix}`;
  };

  // Calendar math
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Saturday (6) alignment
    const padding = (firstDayIndex + 1) % 7;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(year, month, i));
    }
    return { padding, days };
  };

  const { padding: calendarPadding, days: calendarDays } = getCalendarDays();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
      {/* 2-Column Responsive Layout: Swapped order in DOM so that Sidebar is on the RIGHT and Slider/Widgets on the LEFT under dir="rtl" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================ */}
        {/* Column A: Right Sidebar Column (Live Match Center) - lg:col-span-4 */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Header with Calendar Picker & Date Navigation */}
            <div className="flex items-center justify-between bg-zinc-900/60 px-4.5 py-4 border-b border-zinc-800">
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-150">مباريات اليوم</h3>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavigateDate("prev")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-850 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition cursor-pointer"
                  title="اليوم السابق"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Calendar Trigger */}
                <div className="relative" ref={calendarRef}>
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 transition cursor-pointer font-bold text-xs"
                    title="اختر التاريخ"
                  >
                    <Calendar className="h-4 w-4 text-emerald-450" />
                    <span className="font-mono">{selectedDate}</span>
                  </button>

                  {/* Custom Calendar Dropdown */}
                  {isCalendarOpen && (
                    <div className="absolute top-12 left-0 w-64 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl z-40 text-center select-none font-sans">
                      <div className="flex items-center justify-between mb-3 text-xs font-black text-zinc-200">
                        <button
                          onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                          className="p-1 hover:text-emerald-400 transition cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <span>
                          {calendarDate.toLocaleString("ar-EG", { month: "long" })} {calendarDate.getFullYear()}
                        </span>
                        <button
                          onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                          className="p-1 hover:text-emerald-400 transition cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Week headers */}
                      <div className="grid grid-cols-7 gap-1 text-[9px] font-extrabold text-zinc-500 mb-2">
                        {["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"].map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: calendarPadding }).map((_, i) => (
                          <span key={`pad-${i}`} className="h-6" />
                        ))}
                        {calendarDays.map((dayDate) => {
                          const dayNum = dayDate.getDate();
                          const dateStr = `${String(dayNum).padStart(2, "0")}/${String(dayDate.getMonth() + 1).padStart(2, "0")}/${dayDate.getFullYear()}`;
                          const isActive = selectedDate === dateStr;
                          return (
                            <button
                              key={dayNum}
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setIsCalendarOpen(false);
                              }}
                              className={`h-6 text-[10px] font-black font-mono rounded-lg transition cursor-pointer flex items-center justify-center ${
                                isActive 
                                  ? "bg-emerald-500 text-zinc-950" 
                                  : "text-zinc-300 hover:bg-zinc-900"
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Reset to Today button */}
                      <button
                        onClick={() => {
                          const today = new Date();
                          const dd = String(today.getDate()).padStart(2, "0");
                          const mm = String(today.getMonth() + 1).padStart(2, "0");
                          const yyyy = today.getFullYear();
                          setSelectedDate(`${dd}/${mm}/${yyyy}`);
                          setCalendarDate(today);
                          setIsCalendarOpen(false);
                        }}
                        className="w-full mt-3 py-1.5 text-[10px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg hover:bg-emerald-950/40 transition cursor-pointer"
                      >
                        اليوم
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleNavigateDate("next")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-850 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition cursor-pointer"
                  title="اليوم التالي"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Toggle and Timezone dropdown */}
            <div className="flex items-center justify-between gap-3 px-4.5 py-3.5 bg-zinc-900/20 border-b border-zinc-850">
              <button
                onClick={() => setFilterLiveOnly(!filterLiveOnly)}
                className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  filterLiveOnly
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-inner"
                    : "bg-zinc-850 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${filterLiveOnly ? "bg-emerald-400 live-glow-badge" : "bg-zinc-500"}`} />
                مباشر
                {liveCount > 0 && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-zinc-950 font-mono shadow-md">
                    {liveCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-zinc-450 font-medium">
                <span>حسب التوقيت</span>
              </div>
            </div>

            {/* Loading / Error states */}
            {isLoading && (
              <div className="space-y-4 p-4.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-6 bg-zinc-850 rounded w-1/2" />
                    <div className="h-16 bg-zinc-850/60 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-6 text-center text-xs text-red-400 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8" />
                <span>فشل تحميل المباريات. يرجى التحديث.</span>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && groupedCompetitions.length === 0 && (
              <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
                <Play className="h-8 w-8 rotate-180 text-zinc-650" />
                <span>لا توجد مباريات في هذا التوقيت</span>
              </div>
            )}

            {/* Match Feed list */}
            {!isLoading && !error && (
              <div className="max-h-[550px] overflow-y-auto divide-y divide-zinc-850 select-none [scrollbar-width:thin] bg-zinc-900/10">
                {/* 1. Popular/Priority Leagues Group */}
                {priorityCompetitions.length > 0 && (
                  <div>
                    <div className="bg-zinc-950/65 px-4 py-2.5 border-b border-zinc-800/80 flex items-center justify-between shadow-xs">
                      <span className="text-[11px] font-black text-zinc-350">بطولات كرة قدم شائعة</span>
                      <Star className="h-3.5 w-3.5 text-sky-500 fill-sky-500" />
                    </div>
                    <div className="space-y-4 p-2 sm:p-3">
                      {priorityCompetitions.map(({ competition, games }) => (
                        <div key={competition.id} className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#161b26] shadow-lg">
                          {/* League Header */}
                          {(() => {
                            const countryName = (data?.countries || []).find((c) => c.id === competition.countryId)?.name || (competition.countryId === 19 ? "أوروبا" : "دولي");
                            return (
                              <div className="flex items-center justify-between bg-[#11151f] px-4 py-3 border-b border-zinc-800/70">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${competition.id}`}
                                    alt={competition.name}
                                    className="h-7 w-7 object-contain rounded-lg bg-zinc-850 border border-zinc-750 p-1"
                                    loading="lazy"
                                  />
                                  <div className="flex flex-col text-right">
                                    <span className="text-xs font-black text-zinc-150 leading-tight">{competition.name}</span>
                                    <span className="text-[10px] text-zinc-450 font-bold mt-0.5">{countryName}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="h-3.5 w-3.5 text-sky-500 fill-sky-500" />
                                  <MoreHorizontal className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition cursor-pointer" />
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Matches */}
                          <div className="divide-y divide-zinc-850/60">
                            {games.map((game) => {
                              const isLive = game.statusGroup === 3;
                              const isFinished = game.statusGroup === 4;
                              const homeScore = game.homeCompetitor.score;
                              const awayScore = game.awayCompetitor.score;
                              const slug = generateMatchSlug(game.homeCompetitor, game.awayCompetitor, game.id);

                              return (
                                <Link
                                  key={game.id}
                                  href={`/match/${slug}`}
                                  className="group block p-3.5 hover:bg-zinc-850/30 transition cursor-pointer"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    {/* Home Competitor (Logo on outer right edge) */}
                                    <div className="flex-1 flex items-center justify-start gap-2.5 min-w-0">
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
                                        alt={game.homeCompetitor.name}
                                        className="h-6 w-6 object-contain shrink-0"
                                        loading="lazy"
                                      />
                                      <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                                        {game.homeCompetitor.name}
                                      </span>
                                    </div>

                                    {/* Center: Time / Score Pill Badge */}
                                    <div className="flex flex-col items-center justify-center shrink-0 min-w-[68px] px-1 text-center">
                                      {isLive ? (
                                        <div className="flex flex-col items-center">
                                          <span className="rounded-full bg-red-950/90 border border-red-500/30 px-2 py-0.5 text-[9px] font-black text-red-400 animate-pulse">
                                            مباشر {game.gameTime}&apos;
                                          </span>
                                          <div className="flex items-center gap-1 mt-1 text-xs font-black font-mono text-zinc-100">
                                            <span>{homeScore}</span>
                                            <span className="text-zinc-500">:</span>
                                            <span>{awayScore}</span>
                                          </div>
                                        </div>
                                      ) : isFinished ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c2230] border border-zinc-750 text-xs font-black font-mono text-zinc-200">
                                          <span>{homeScore}</span>
                                          <span className="text-zinc-500">:</span>
                                          <span>{awayScore}</span>
                                        </div>
                                      ) : (
                                        <div className="px-3 py-1 rounded-full bg-[#1c2230] border border-zinc-750/70 text-xs font-mono font-bold text-zinc-200 shadow-inner">
                                          {formatTime(game.startTime)}
                                        </div>
                                      )}
                                    </div>

                                    {/* Away Competitor (Logo on outer left edge) */}
                                    <div className="flex-1 flex items-center justify-end gap-2.5 min-w-0">
                                      <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition text-left">
                                        {game.awayCompetitor.name}
                                      </span>
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
                                        alt={game.awayCompetitor.name}
                                        className="h-6 w-6 object-contain shrink-0"
                                        loading="lazy"
                                      />
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 2. Other Leagues Group */}
                {otherCompetitions.length > 0 && (
                  <div>
                    <div className="bg-zinc-950/65 px-4 py-2.5 border-b border-zinc-800/80">
                      <span className="text-[11px] font-black text-zinc-400">بطولات أخرى</span>
                    </div>
                    <div className="space-y-4 p-2 sm:p-3">
                      {otherCompetitions.map(({ competition, games }) => (
                        <div key={competition.id} className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#161b26] shadow-lg">
                          {/* League Header */}
                          {(() => {
                            const countryName = (data?.countries || []).find((c) => c.id === competition.countryId)?.name || (competition.countryId === 19 ? "أوروبا" : "دولي");
                            return (
                              <div className="flex items-center justify-between bg-[#11151f] px-4 py-3 border-b border-zinc-800/70">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${competition.id}`}
                                    alt={competition.name}
                                    className="h-7 w-7 object-contain rounded-lg bg-zinc-850 border border-zinc-750 p-1"
                                    loading="lazy"
                                  />
                                  <div className="flex flex-col text-right">
                                    <span className="text-xs font-black text-zinc-150 leading-tight">{competition.name}</span>
                                    <span className="text-[10px] text-zinc-450 font-bold mt-0.5">{countryName}</span>
                                  </div>
                                </div>
                                <MoreHorizontal className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition cursor-pointer" />
                              </div>
                            );
                          })()}
                          
                          {/* Matches */}
                          <div className="divide-y divide-zinc-850/60">
                            {games.map((game) => {
                              const isLive = game.statusGroup === 3;
                              const isFinished = game.statusGroup === 4;
                              const homeScore = game.homeCompetitor.score;
                              const awayScore = game.awayCompetitor.score;
                              const slug = generateMatchSlug(game.homeCompetitor, game.awayCompetitor, game.id);

                              return (
                                <Link
                                  key={game.id}
                                  href={`/match/${slug}`}
                                  className="group block p-3.5 hover:bg-zinc-850/30 transition cursor-pointer"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    {/* Home Competitor (Logo on outer right edge) */}
                                    <div className="flex-1 flex items-center justify-start gap-2.5 min-w-0">
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
                                        alt={game.homeCompetitor.name}
                                        className="h-6 w-6 object-contain shrink-0"
                                        loading="lazy"
                                      />
                                      <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                                        {game.homeCompetitor.name}
                                      </span>
                                    </div>

                                    {/* Center: Time / Score Pill Badge */}
                                    <div className="flex flex-col items-center justify-center shrink-0 min-w-[68px] px-1 text-center">
                                      {isLive ? (
                                        <div className="flex flex-col items-center">
                                          <span className="rounded-full bg-red-950/90 border border-red-500/30 px-2 py-0.5 text-[9px] font-black text-red-400 animate-pulse">
                                            مباشر {game.gameTime}&apos;
                                          </span>
                                          <div className="flex items-center gap-1 mt-1 text-xs font-black font-mono text-zinc-100">
                                            <span>{homeScore}</span>
                                            <span className="text-zinc-500">:</span>
                                            <span>{awayScore}</span>
                                          </div>
                                        </div>
                                      ) : isFinished ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c2230] border border-zinc-750 text-xs font-black font-mono text-zinc-200">
                                          <span>{homeScore}</span>
                                          <span className="text-zinc-500">:</span>
                                          <span>{awayScore}</span>
                                        </div>
                                      ) : (
                                        <div className="px-3 py-1 rounded-full bg-[#1c2230] border border-zinc-750/70 text-xs font-mono font-bold text-zinc-200 shadow-inner">
                                          {formatTime(game.startTime)}
                                        </div>
                                      )}
                                    </div>

                                    {/* Away Competitor (Logo on outer left edge) */}
                                    <div className="flex-1 flex items-center justify-end gap-2.5 min-w-0">
                                      <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition text-left">
                                        {game.awayCompetitor.name}
                                      </span>
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
                                        alt={game.awayCompetitor.name}
                                        className="h-6 w-6 object-contain shrink-0"
                                        loading="lazy"
                                      />
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion Country List Bottom (Styled to match Image 3) */}
            <div className="border-t border-zinc-800">
              <div className="bg-zinc-900/40 px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-extrabold text-zinc-400">مباريات اليوم في كرة القدم حسب البلد</span>
              </div>
              <div className="divide-y divide-zinc-850 text-right select-none max-h-[350px] overflow-y-auto">
                {countryGroupings.map(({ country, games }) => {
                  const isOpen = openCountry === country.name;
                  return (
                    <div key={country.id} className="flex flex-col">
                      <button
                        onClick={() => setOpenCountry(isOpen ? null : country.name)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-850/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-zinc-350 font-mono">
                            {games.length}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-zinc-500 transition-all ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-zinc-200">{country.name}</span>
                          <img
                            src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_countries:default.png/v1/countries/${country.id}`}
                            alt={country.name}
                            className="h-4.5 w-6 object-cover rounded"
                            loading="lazy"
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="bg-zinc-950 p-3 space-y-2 border-t border-zinc-900">
                          {games.map((game) => {
                            const slug = generateMatchSlug(game.homeCompetitor, game.awayCompetitor, game.id);
                            return (
                              <Link
                                key={game.id}
                                href={`/match/${slug}`}
                                className="block p-3 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850/20 hover:border-zinc-800 transition"
                              >
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-mono text-[10px] bg-zinc-850 px-2 py-0.5 rounded text-zinc-300 font-bold">
                                    {game.statusGroup === 3 ? `${game.gameTime}'` : formatTime(game.startTime)}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                                      <span>{game.homeCompetitor.name}</span>
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
                                        alt=""
                                        className="h-4 w-4 object-contain"
                                      />
                                    </div>
                                    <span className="text-zinc-600 font-medium">vs</span>
                                    <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
                                        alt=""
                                        className="h-4 w-4 object-contain"
                                      />
                                      <span>{game.awayCompetitor.name}</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* Column B: Left Column (Hero, Stats, Coverage, News, Footer widgets) - lg:col-span-8 */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Hero Featured Slider / Match Banner */}
          {featuredGames && featuredGames.length > 0 ? (
            <FeaturedMatchHero matches={featuredGames} formatTime={formatTime} />
          ) : (
            <div className="h-64 bg-zinc-900 rounded-2xl animate-pulse" />
          )}

          {/* 2. Top Scorers Stats Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5 mb-4">
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-150 flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-yellow-500" />
                هدافي البطولات
              </h3>
              <span className="text-xs font-bold text-zinc-400">الأهداف</span>
            </div>

            {/* Horizontal Tabs */}
            <div className="flex border-b border-zinc-850 mb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-2">
              {[
                { id: "5930", label: "كأس العالم" },
                { id: "572", label: "دوري الأبطال" },
                { id: "7", label: "الدوري الإنجليزي" },
                { id: "11", label: "الدوري الإسباني" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScorersLeague(tab.id)}
                  className={`px-4 py-2 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                    activeScorersLeague === tab.id
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-zinc-450 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scorer List */}
            {isScorersLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-zinc-850 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : scorersData?.stats && scorersData.stats.length > 0 ? (
              <div className="space-y-3">
                {scorersData.stats.slice(0, 3).map((scorer: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-850/20 transition">
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-[11px] font-black text-zinc-300 font-mono">
                        {idx + 1}
                      </span>
                      {/* Player face */}
                      <img
                        src={getScorerImageUrl(scorer)}
                        alt={scorer.name}
                        className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-col text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-zinc-150">{scorer.name}</span>
                        <span className="text-[10px] text-zinc-550 font-medium">{scorer.teamName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${scorer.teamId}`}
                        alt={scorer.teamName}
                        className="h-5 w-5 object-contain"
                        loading="lazy"
                      />
                      <span className="text-xs sm:text-sm font-black text-zinc-300 font-mono bg-zinc-850 px-2.5 py-0.5 rounded">
                        {scorer.value}
                      </span>
                    </div>
                  </div>
                ))}

                <Link
                  href={`/standings/${activeScorersLeague}`}
                  className="block text-center text-xs font-bold text-emerald-400 hover:text-emerald-350 transition-all pt-2.5"
                >
                  عرض جدول الترتيب الكامل
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs">لا تتوفر إحصائيات لهذه البطولة حالياً.</div>
            )}
          </div>

          {/* 3. General Football News Feed Grid (Dynamic from MongoDB) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-150 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
                أحدث الأخبار الرياضية
              </h3>
              <Link href="/news" className="text-xs font-bold text-emerald-400 hover:text-emerald-350 transition flex items-center gap-1">
                عرض أرشيف الأخبار &rarr;
              </Link>
            </div>

            {isNewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-2xl h-24 p-3" />
                ))}
              </div>
            ) : newsArticles && newsArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsArticles.map((article: any) => (
                  <Link
                    key={article._id || article.slug}
                    href={`/news/${article.slug || article._id}`}
                    className="group flex gap-3.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition duration-200"
                  >
                    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-zinc-950 shrink-0">
                      <img
                        src={article.image_url || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60"}
                        alt={article.headline_ar}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                      {article.score >= 8 && (
                        <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-black text-white border border-red-500 animate-pulse select-none">
                          <span className="h-1 w-1 rounded-full bg-white" />
                          عاجل
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-200 leading-tight group-hover:text-emerald-400 transition line-clamp-2">
                        {article.headline_ar}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-550 font-bold select-none">
                        <span className="text-zinc-400 font-semibold">{article.source || "أنباء رياضية"}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {article.published_at || article.created_at
                            ? new Date(article.published_at || article.created_at).toLocaleDateString("ar-MA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "مباشر"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-xs bg-zinc-900/40 border border-zinc-850 rounded-2xl">
                لا تتوفر أخبار رياضية حالياً.
              </div>
            )}
          </div>

          {/* 5. SEO Text & Footer Widgets Block */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-6">
            
            {/* Expandable SEO block */}
            <div className="border-b border-zinc-800 pb-5">
              <h4 className="font-extrabold text-sm text-zinc-200 mb-2">كرة القدم على يلا شوت لايف</h4>
              <p className={`text-xs text-zinc-450 leading-relaxed transition-all duration-300 ${isSeoExpanded ? "line-clamp-none" : "line-clamp-3"}`}>
                موقع يلا شوت لايف يقدم تغطية شاملة وحية لكافة مباريات كرة القدم المحلية والدولية. نوفر نتائج مباشرة، إحصائيات تفصيلية عن الفرق واللاعبين، بالإضافة لترتيب الهدافين وجداول المجموعات في كأس العالم 2026 ودوري أبطال أوروبا. بفضل التحديثات اللحظية وسرعة الخوادم، يمكنك البقاء على اطلاع مستمر بجدول مباريات اليوم وتوقيتات اللقاءات بمختلف المناطق الزمنية.
              </p>
              <button
                onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                className="mt-2 text-xs font-black text-emerald-400 hover:text-emerald-350 cursor-pointer"
              >
                {isSeoExpanded ? "اقرأ أقل" : "اقرأ المزيد"}
              </button>
            </div>

            {/* 3-Column Footer sub-grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
              
              {/* Col 1: A-Z Leagues (Far Right) */}
              <div className="space-y-3">
                <h5 className="font-black text-xs text-zinc-200 border-r-2 border-emerald-500 pr-2">كل البطولات أ-ي</h5>
                <ul className="grid grid-cols-2 gap-1.5 text-xs text-zinc-450">
                  {[
                    { name: "ألمانيا", id: 25 },
                    { name: "الأرجنتين", id: 651 },
                    { name: "البرازيل", id: 300 },
                    { name: "إنجلترا", id: 7 },
                    { name: "إسبانيا", id: 11 },
                    { name: "إيطاليا", id: 17 },
                    { name: "المغرب", id: 557 },
                    { name: "فرنسا", id: 35 },
                    { name: "السعودية", id: 649 }
                  ].map((item, i) => (
                    <li key={i} className="hover:text-zinc-200 transition select-none">
                      <Link href={`/standings/${item.id}`}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 2: Popular Leagues (Center) */}
              <div className="space-y-3">
                <h5 className="font-black text-xs text-zinc-200 border-r-2 border-emerald-500 pr-2">بطولات شائعة</h5>
                <ul className="space-y-1.5 text-xs text-zinc-450">
                  {[
                    { name: "كأس العالم 2026", id: 5930 },
                    { name: "دوري أبطال أوروبا", id: 572 },
                    { name: "الدوري الإسباني الممتاز", id: 11 },
                    { name: "الدوري الإنجليزي", id: 7 },
                    { name: "البطولة الاحترافية المغربية", id: 557 },
                    { name: "الدوري السعودي", id: 649 }
                  ].map((item, i) => (
                    <li key={i} className="hover:text-zinc-200 transition select-none">
                      <Link href={`/standings/${item.id}`}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Popular Teams (Far Left) */}
              <div className="space-y-3">
                <h5 className="font-black text-xs text-zinc-200 border-r-2 border-emerald-500 pr-2">الفرق الأكثر شعبية</h5>
                <div className="space-y-1.5">
                  {[
                    { id: 131, name: "ريال مدريد" },
                    { id: 132, name: "برشلونة" },
                    { id: 110, name: "مانشستر سيتي" },
                    { id: 3252, name: "الهلال" },
                    { id: 3928, name: "النصر" }
                  ].map((team) => (
                    <div key={team.id} className="flex items-center justify-between text-xs text-zinc-450 hover:text-zinc-200 transition select-none">
                      <Link href={`/team/${team.id}`} className="hover:text-emerald-400 transition cursor-pointer">{team.name}</Link>
                      <button 
                        onClick={() => toggleFavorite(team.id)} 
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star className={`h-3.5 w-3.5 ${favorites.includes(team.id) ? "fill-yellow-500 text-yellow-500" : "text-zinc-650 hover:text-zinc-400"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Hero featured component with carousel sliding and countdown clock
interface FeaturedMatchHeroProps {
  matches: any[];
  formatTime: (d: string) => string;
}

function FeaturedMatchHero({ matches, formatTime }: FeaturedMatchHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!matches || matches.length === 0) {
    return <div className="text-center py-6 text-zinc-500 text-xs">لا تتوفر مباريات بارزة حالياً.</div>;
  }

  const match = matches[currentIndex];
  
  const isNotStarted = match.statusGroup === 2 || match.statusGroup === 1 || match.statusText === "لم تبدأ";
  const isLive = match.statusGroup === 3;
  const isFinished = match.statusGroup === 4;

  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isMoreThan24h, setIsMoreThan24h] = useState(false);

  useEffect(() => {
    if (!isNotStarted) return;

    const calculateTimeLeft = () => {
      const diff = new Date(match.startTime).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsMoreThan24h(false);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours >= 24) {
        setIsMoreThan24h(true);
        const matchDate = new Date(match.startTime);
        matchDate.setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const days = Math.round((matchDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days === 1) {
          setTimeLeft("غداً");
        } else if (days === 2) {
          setTimeLeft("يومين");
        } else if (days >= 3 && days <= 10) {
          setTimeLeft(`${days} أيام`);
        } else {
          setTimeLeft(`${days} يوم`);
        }
      } else {
        setIsMoreThan24h(false);
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        setTimeLeft(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [match.startTime, isNotStarted]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? matches.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === matches.length - 1 ? 0 : prev + 1));
  };

  // Simple relative label for date (e.g. "غداً" or today date)
  const getDateLabel = () => {
    const today = new Date();
    const matchDate = new Date(match.startTime);
    const diffTime = matchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "غداً";
    if (diffDays === 0) return "اليوم";
    
    return matchDate.toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl group select-none">
      
      {/* Left Navigation Arrow */}
      {matches.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition z-20 cursor-pointer shadow-lg hover:scale-105"
          title="المباراة السابقة"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {matches.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition z-20 cursor-pointer shadow-lg hover:scale-105"
          title="المباراة التالية"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {(() => {
        const matchSlug = generateMatchSlug(match.homeCompetitor, match.awayCompetitor, match.id);
        return (
          <div className="p-6 sm:p-8 flex flex-col items-center w-full">
            
            {/* Clickable Card Body */}
            <Link href={`/match/${matchSlug}`} className="w-full flex flex-col items-center group/card-content">
              {/* Stage Header */}
              <div className="flex items-center gap-1.5 mb-2 group-hover/card-content:scale-[1.01] transition-transform">
                <img
                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${match.competitionId}`}
                  alt=""
                  className="h-4.5 w-4.5 object-contain"
                />
                <span className="rounded-full bg-zinc-850 border border-zinc-800 px-4 py-1 text-xs font-black text-zinc-300">
                  {match.competitionDisplayName || match.competitionName}
                </span>
              </div>

              {/* Slide date relative label */}
              <span className="text-zinc-450 font-bold text-xs mb-4">{getDateLabel()}</span>

              {/* Teams and Score/Time info */}
              <div className="w-full flex items-center justify-between gap-4 sm:gap-8 max-w-lg">
                
                {/* Home Competitor */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${match.homeCompetitor.id}`}
                    alt={match.homeCompetitor.name}
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-2xl bg-zinc-850 p-2 border border-zinc-800 shadow-inner mb-3 group-hover/card-content:border-emerald-500/30 transition-colors"
                    loading="lazy"
                  />
                  <h3 className="font-black text-xs sm:text-sm text-zinc-150 leading-tight group-hover/card-content:text-emerald-455 transition-colors">
                    {match.homeCompetitor.name}
                  </h3>
                </div>

                {/* Central clock or score */}
                <div className="flex flex-col items-center justify-center text-center min-w-[120px] shrink-0">
                  {isNotStarted ? (
                    <div className="flex flex-col items-center">
                      <span className={`text-[28px] sm:text-[34px] font-black leading-none ${
                        isMoreThan24h ? "text-zinc-100" : "font-mono tracking-wider text-emerald-450"
                      }`}>
                        {timeLeft}
                      </span>
                      <span className="text-[10px] text-zinc-550 font-bold mt-2">يبدأ خلال</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4.5 my-1">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-zinc-100">
                        {match.homeCompetitor.score !== -1 ? match.homeCompetitor.score : 0}
                      </span>
                      <span className="text-zinc-650 font-bold text-xl">:</span>
                      <span className="text-3xl sm:text-4xl font-black font-mono text-zinc-100">
                        {match.awayCompetitor.score !== -1 ? match.awayCompetitor.score : 0}
                      </span>
                    </div>
                  )}
                  
                  {!isNotStarted && (
                    <span className="text-[10px] font-black text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded-full mt-2">
                      {isLive ? `${match.gameTime}'` : isFinished ? "منتهية" : "لم تبدأ"}
                    </span>
                  )}
                </div>

                {/* Away Competitor */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${match.awayCompetitor.id}`}
                    alt={match.awayCompetitor.name}
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-2xl bg-zinc-850 p-2 border border-zinc-800 shadow-inner mb-3 group-hover/card-content:border-emerald-500/30 transition-colors"
                    loading="lazy"
                  />
                  <h3 className="font-black text-xs sm:text-sm text-zinc-150 leading-tight group-hover/card-content:text-emerald-455 transition-colors">
                    {match.awayCompetitor.name}
                  </h3>
                </div>

              </div>

              {/* Match Info Details (Date, Time, Venue) */}
              <div className="text-zinc-400 text-[10px] sm:text-xs font-semibold mt-5 text-center select-text max-w-lg leading-relaxed bg-zinc-850/40 px-4 py-1.5 rounded-xl border border-zinc-800/40 group-hover/card-content:border-zinc-700 transition-colors">
                {(() => {
                  const matchDate = new Date(match.startTime);
                  const dateStr = matchDate.toLocaleDateString("ar-EG-u-nu-latn", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  });
                  const timeStr = formatTime(match.startTime);
                  const venueStr = match.venue?.name;
                  
                  const parts = [dateStr, timeStr];
                  if (venueStr) {
                    parts.push(venueStr);
                  }
                  return parts.join(" | ");
                })()}
              </div>
            </Link>

        {/* Lower Toolbar */}
        {(() => {
          const matchSlug = generateMatchSlug(match.homeCompetitor, match.awayCompetitor, match.id);
          return (
            <div className="w-full grid grid-cols-4 gap-2 mt-8 pt-6 border-t border-zinc-800/85">
              <Link
                href={`/match/${matchSlug}`}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800/50 text-[10px] font-bold text-zinc-350 hover:text-emerald-400 transition"
              >
                <Play className="h-4.5 w-4.5 rotate-180 mb-1" />
                <span>صفحة المباراة</span>
              </Link>
              <Link
                href={`/match/${matchSlug}?tab=lineups`}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800/50 text-[10px] font-bold text-zinc-350 hover:text-emerald-400 transition"
              >
                <Tv className="h-4.5 w-4.5 mb-1" />
                <span>تشكيلة الفريقين</span>
              </Link>
              <Link
                href={`/match/${matchSlug}?tab=stats`}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800/50 text-[10px] font-bold text-zinc-350 hover:text-emerald-400 transition"
              >
                <ArrowLeftRight className="h-4.5 w-4.5 mb-1" />
                <span>الإحصائيات</span>
              </Link>
              <Link
                href={`/standings/${match.competitionId}`}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800/50 text-[10px] font-bold text-zinc-350 hover:text-emerald-400 transition"
              >
                <Award className="h-4.5 w-4.5 mb-1" />
                <span>خروج المغلوب</span>
              </Link>
            </div>
          );
        })()}

        {/* Slide indicators at bottom */}
        {matches.length > 1 && (
          <div className="flex gap-1.5 mt-4">
            {matches.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? "w-4 bg-emerald-500" : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>
        )}

          </div>
        );
      })()}
    </div>
  );
}
