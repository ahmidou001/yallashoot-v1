"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity, BarChart3, Users, History, Award,
  RefreshCw, ChevronLeft, Calendar, ShieldAlert,
  Play, Trophy, Newspaper, Film, Sparkles, Tv
} from "lucide-react";
import PitchLineups from "./PitchLineups";
import SecurePlayer from "./SecurePlayer";
import AdsterraBanner from "./ads/AdsterraBanner";
import AdsterraNative from "./ads/AdsterraNative";
import ResponsiveAdBanner from "./ads/ResponsiveAdBanner";
import { useSettings } from "./providers";
import {
  GameDetailsResponse, StatsResponse, H2HResponse,
  StandingsResponse, MatchEvent, Member, StandingRow
} from "@/types/api";

const COMMENTATORS = [
  "عصام الشوالي",
  "حفيظ الدراجي",
  "فارس عوض",
  "خليل البلوشي",
  "رؤوف خليف",
  "علي سعيد الكعبي",
  "يوسف سيف",
  "أيمن جادة",
];

const getAssignedCommentator = (commentator?: string | null, gameId?: number | string) => {
  if (commentator && commentator !== "غير محدد" && commentator.trim().length > 0) {
    return commentator;
  }
  const idNum = typeof gameId === "number" ? gameId : parseInt(String(gameId).replace(/\D/g, "") || "0", 10);
  return COMMENTATORS[Math.abs(idNum) % COMMENTATORS.length];
};

interface ServerItem {
  id?: number;
  label: string;
  signedUrl: string;
}

interface MatchDetailsClientProps {
  initialDetails: GameDetailsResponse;
  gameId: string;
  matchSlug?: string;
  streamData?: {
    hasStream?: boolean;
    streamType: "iframe" | "hls" | "youtube" | "other";
    streamUrl?: string;
    tokenRequired?: boolean;
    token?: string;
    expires?: number;
    channel?: string | null;
    commentator?: string | null;
    serverCount?: number;
    servers?: ServerItem[];
    iframeHtml?: string | null;
  } | null;
  servers?: ServerItem[];
  highlightUrl?: string | null;
}

export default function MatchDetailsClient({
  initialDetails,
  gameId,
  matchSlug,
  streamData,
  servers = [],
  highlightUrl,
}: MatchDetailsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatTime, formatDate, formatHistoryDate } = useSettings();

  // Check if match has finished or started
  const isFinished = initialDetails.game.statusGroup === 4;
  const isStarted = initialDetails.game.homeCompetitor.score !== -1;
  const defaultTab = "details";

  // Expand states for team performance logs
  const [showMoreHome, setShowMoreHome] = useState(false);
  const [showMoreAway, setShowMoreAway] = useState(false);

  // Set tab state with zero scroll-jump
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const raw = searchParams.get("tab") || defaultTab;
    if ((raw === "overview" || raw === "stats") && !isStarted) return defaultTab;
    return raw;
  });

  // Sync state if browser back/forward buttons are pressed
  useEffect(() => {
    const raw = searchParams.get("tab");
    if (raw && ((raw !== "overview" && raw !== "stats") || isStarted)) {
      setActiveTabState(raw);
    }
  }, [searchParams, isStarted]);

  // Set active tab smoothly without scrolling to top
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const homeId = initialDetails.game.homeCompetitor.id;
  const awayId = initialDetails.game.awayCompetitor.id;
  const competitionId = initialDetails.game.competitionId;

  const isLive = initialDetails.game.statusGroup === 3;

  // 0. Query Stream Data Client-side (Protects SSR HTML from DMCA scrapers)
  const { data: fetchedStreamData } = useQuery({
    queryKey: ["streamDataClient", gameId],
    queryFn: async () => {
      const res = await fetch(`/api/streams/${gameId}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success || !json.data) return null;
      return {
        hasStream: true,
        streamType: (json.data.streamType || "iframe") as "iframe" | "hls" | "youtube" | "other",
        streamUrl: json.data.streamUrl,
        tokenRequired: json.data.tokenRequired,
        token: json.data.token as string | undefined,
        expires: json.data.expires as number | undefined,
        channel: json.data.channel || null,
        commentator: json.data.commentator || null,
        serverCount: json.data.serverCount || 1,
        servers: json.data.servers || [],
        iframeHtml: json.data.iframeHtml || null,
      };
    },
    refetchInterval: (typeof document !== "undefined" && document.hidden) ? false : (isLive ? 60000 : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const activeStreamData = fetchedStreamData || streamData || {
    hasStream: true,
    streamType: "hls" as const,
    streamUrl: undefined,
    tokenRequired: false,
    token: undefined,
    expires: undefined,
    channel: null,
    commentator: null,
    serverCount: 1,
    servers: [] as ServerItem[],
    iframeHtml: null,
  };

  // 1. Query for Match Details & Lineups
  const { data: detailsData } = useQuery<GameDetailsResponse>({
    queryKey: ["matchDetails", gameId],
    queryFn: async () => {
      const res = await fetch(`/api/match/${gameId}`);
      const json = await res.json();
      return json.data;
    },
    initialData: initialDetails,
    refetchInterval: (typeof document !== "undefined" && document.hidden) ? false : (isLive ? 35000 : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const { game, competitions = [] } = detailsData;
  const { homeCompetitor, awayCompetitor } = game;
  const members = game.members || [];
  const competition = competitions.find((c) => c.id === game.competitionId);
  const leagueName = competition?.name || "البطولة";

  // 2. Query for Match Statistics
  const { data: statsData, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: ["matchStats", gameId],
    queryFn: async () => {
      const res = await fetch(`/api/match/${gameId}/stats`);
      const json = await res.json();
      return json.data;
    },
    enabled: activeTab === "stats",
    refetchInterval: (typeof document !== "undefined" && document.hidden) ? false : (isLive ? 45000 : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  // 3. Query for Head-to-Head (H2H)
  const matchupId = `${homeId}-${awayId}-${competitionId}`;
  const { data: h2hData, isLoading: h2hLoading } = useQuery<H2HResponse>({
    queryKey: ["matchH2H", gameId],
    queryFn: async () => {
      const res = await fetch(`/api/match/${gameId}/h2h?matchupId=${matchupId}`);
      const json = await res.json();
      return json.data;
    },
    enabled: activeTab === "h2h",
  });

  // Query for Standings table in H2H tab
  const { data: standingsData, isLoading: standingsLoading } = useQuery<StandingsResponse>({
    queryKey: ["standings", competitionId],
    queryFn: async () => {
      const res = await fetch(`/api/standings/${competitionId}`);
      const json = await res.json();
      return json.data;
    },
    enabled: activeTab === "h2h" || activeTab === "standings",
  });

  // Query Match Highlight for this gameId
  const { data: matchHighlight } = useQuery({
    queryKey: ["matchHighlight", gameId],
    queryFn: async () => {
      const res = await fetch(`/api/highlights?gameId=${gameId}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success || !json.data || json.data.length === 0) return null;
      return json.data[0];
    },
  });

  // Helper to resolve player name
  const getPlayerName = (id: number): string => {
    const member = members.find((m) => m.id === id);
    return member ? member.name : "لاعب";
  };

  // Helper to determine if a player is from the Home Team
  const isHomePlayer = (playerId: number): boolean => {
    const homeLineup = game.homeCompetitor.lineups?.members || [];
    return homeLineup.some((m) => m.id === playerId);
  };

  // Helper to parse stats percentage comparisons
  const parseStatValues = (homeVal: string | number, awayVal: string | number) => {
    const clean = (val: string | number): number => {
      if (typeof val === "number") return val;
      return parseInt(val.replace("%", ""), 10) || 0;
    };
    const h = clean(homeVal);
    const a = clean(awayVal);
    const total = h + a || 1;
    return {
      homeVal: h,
      awayVal: a,
      homeRatio: (h / total) * 100,
      awayRatio: (a / total) * 100,
    };
  };

  // Score display helper

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      {/* Back to Home Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 mb-6 transition"
      >
        <ChevronLeft className="h-4 w-4 rotate-180" />
        العودة لجدول المباريات
      </Link>

      {/* Top Responsive Leaderboard (728x90 Desktop / 320x50 Mobile) */}
      <ResponsiveAdBanner className="mb-6" />

      {/* Match Stream Broadcast Container */}
      {activeStreamData && activeStreamData.hasStream && (
        <div className="mb-8">
          <SecurePlayer
            gameId={gameId}
            matchSlug={matchSlug}
            streamType={activeStreamData.streamType}
            streamUrl={activeStreamData.streamUrl || ""}
            tokenRequired={activeStreamData.tokenRequired}
            token={activeStreamData.token}
            expires={activeStreamData.expires}
            isLive={isLive}
            isFinished={isFinished}
            highlightUrl={highlightUrl}
            matchTime={formatTime(game.startTime)}
            matchStartTime={game.startTime}
            homeTeamName={homeCompetitor.name}
            awayTeamName={awayCompetitor.name}
            homeTeamLogo={homeCompetitor.id ? `https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${homeCompetitor.id}` : undefined}
            awayTeamLogo={awayCompetitor.id ? `https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${awayCompetitor.id}` : undefined}
            channelName={activeStreamData.channel || (game as any).channel || "beIN Sports"}
            commentatorName={getAssignedCommentator(activeStreamData.commentator, game.id)}
            competitionName={leagueName}
            serverCount={activeStreamData.serverCount || 1}
            iframeHtml={activeStreamData.iframeHtml}
            servers={activeStreamData.servers?.length ? activeStreamData.servers : servers}
          />
          {/* Below-Stream 300x250 Rectangle Banner */}
          <AdsterraBanner size="300x250" className="my-6" />
        </div>
      )}

      {/* Scoreboard Card */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-xl mb-8">

        {/* Glow effect on live matches */}
        {isLive && (
          <div className="absolute inset-x-0 top-0 h-[3px] bg-emerald-500 shadow-md shadow-emerald-500/20" />
        )}

        <div className="flex items-center justify-between gap-6">

          {/* Home Competitor */}
          <Link href={`/team/${game.homeCompetitor.id}`} className="flex-1 flex flex-col items-center text-center cursor-pointer group">
            <img
              src={`https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
              alt={game.homeCompetitor.name}
              className="h-16 w-16 object-contain rounded-2xl bg-zinc-800 border border-zinc-700/50 p-2 shadow-inner mb-3 transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-150 leading-tight group-hover:text-emerald-400 transition-colors">
              {game.homeCompetitor.name}
            </h3>
          </Link>

          {/* Scores and Status */}
          <div className="flex flex-col items-center justify-center text-center shrink-0">
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-450 mb-2 live-glow-badge">
                مباشر
              </span>
            )}

            <div className="flex items-center gap-5 my-1">
              <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-zinc-100">
                {isStarted ? game.homeCompetitor.score : "-"}
              </span>
              <span className="text-zinc-650 font-bold text-xl sm:text-2xl">:</span>
              <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-zinc-100">
                {isStarted ? game.awayCompetitor.score : "-"}
              </span>
            </div>

            <span className="text-xs font-bold text-zinc-400 bg-zinc-800/60 border border-zinc-800 px-3 py-1 rounded-full mt-2">
              {game.statusText || (isLive ? `${game.gameTime}'` : "لم تبدأ")}
            </span>
          </div>

          {/* Away Competitor */}
          <Link href={`/team/${game.awayCompetitor.id}`} className="flex-1 flex flex-col items-center text-center cursor-pointer group">
            <img
              src={`https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
              alt={game.awayCompetitor.name}
              className="h-16 w-16 object-contain rounded-2xl bg-zinc-800 border border-zinc-700/50 p-2 shadow-inner mb-3 transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-150 leading-tight group-hover:text-emerald-400 transition-colors">
              {game.awayCompetitor.name}
            </h3>
          </Link>

        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden justify-between sm:justify-start gap-1">
        {[
          { id: "details", label: "التفاصيل", icon: Award },
          ...(isStarted
            ? [{ id: "overview", label: "أحداث المباراة", icon: Activity }]
            : []),
          ...(matchHighlight?.iframeUrl
            ? [{ id: "highlight", label: "ملخص المباراة", icon: Play }]
            : []),
          ...(isStarted
            ? [{ id: "stats", label: "الإحصائيات", icon: BarChart3 }]
            : []),
          { id: "lineups", label: "التشكيلة", icon: Users },
          { id: "h2h", label: "المواجهات المباشرة", icon: History },
          { id: "standings", label: "الترتيب", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 sm:px-4.5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${isSelected
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[200px]">
        {/* Tab 0: Match Highlight Video */}
        {activeTab === "highlight" && matchHighlight && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-4 sm:p-6 shadow-xl">
              <h3 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Play className="h-4 w-4 text-emerald-400 fill-current" />
                {matchHighlight.title || "ملخص المباراة"}
              </h3>

              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
                <iframe
                  src={matchHighlight.iframeUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
                  allowFullScreen
                  title={matchHighlight.title || "ملخص المباراة"}
                />
              </div>

              {/* Fallback Direct Link */}
              <div className="mt-4 pt-3 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400">
                  إذا حُظر التشغيل في موقعك من قِبل القناة الناقلة:
                </span>
                {(() => {
                  let directUrl = matchHighlight.iframeUrl;
                  const ytMatch = directUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
                  if (ytMatch && ytMatch[1]) {
                    directUrl = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
                  }
                  return (
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black transition shadow-md shrink-0"
                    >
                      <span>مشاهدة الفيديو مباشرة على المصدر الأصلي ↗</span>
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Overview & Events Timeline */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              شريط أحداث اللقاء الحية
            </h2>

            {game.events && game.events.length > 0 ? (
              <div className="relative max-w-xl mx-auto py-8">
                {/* Vertical Center Line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-zinc-800/80" />

                <div className="space-y-6">
                  {game.events.map((evt, idx) => {
                    const isHome = isHomePlayer(evt.playerId);
                    const isGoal = evt.eventType.id === 1;
                    const isYellow = evt.eventType.id === 2;
                    const isRed = evt.eventType.id === 3;
                    const isSub = evt.eventType.id === 7 || evt.eventType.id === 1000;

                    return (
                      <div key={idx} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 relative">
                        {/* Left column (Away Team Side) */}
                        <div className="flex justify-end pr-2 sm:pr-4">
                          {!isHome && (
                            <>
                              {isGoal && (
                                <div className="flex items-center gap-2.5 flex-row-reverse text-left">
                                  <span className="text-base sm:text-lg">⚽</span>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs sm:text-sm font-bold text-zinc-150 leading-tight">
                                      {getPlayerName(evt.playerId)}
                                    </span>
                                    {evt.extraPlayers && evt.extraPlayers.length > 0 && (
                                      <span className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                                        مساعدة: {getPlayerName(evt.extraPlayers[0])}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {isYellow && (
                                <div className="flex items-center gap-2.5 flex-row-reverse text-left">
                                  <div className="w-2.5 h-3.5 bg-yellow-500 rounded-xs shadow-sm shrink-0" />
                                  <span className="text-xs sm:text-sm font-bold text-zinc-150 leading-tight">
                                    {getPlayerName(evt.playerId)}
                                  </span>
                                </div>
                              )}
                              {isRed && (
                                <div className="flex items-center gap-2.5 flex-row-reverse text-left">
                                  <div className="w-2.5 h-3.5 bg-red-600 rounded-xs shadow-sm shrink-0 animate-pulse" />
                                  <span className="text-xs sm:text-sm font-bold text-zinc-150 leading-tight">
                                    {getPlayerName(evt.playerId)}
                                  </span>
                                </div>
                              )}
                              {isSub && (
                                <div className="flex items-center gap-2.5 flex-row-reverse text-left">
                                  <div className="flex flex-col items-center leading-none shrink-0 border border-zinc-800 rounded bg-zinc-950 px-1 py-0.5">
                                    <span className="text-[8px] text-emerald-450 leading-none">▲</span>
                                    <span className="text-[8px] text-red-500 leading-none">▼</span>
                                  </div>
                                  <div className="flex flex-col text-left">
                                    {evt.extraPlayers && evt.extraPlayers.length > 0 && (
                                      <span className="text-xs sm:text-sm font-bold text-emerald-450 leading-tight">
                                        {getPlayerName(evt.extraPlayers[0])}
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-sm font-bold text-red-400 leading-tight">
                                      {getPlayerName(evt.playerId)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Center column (Minute Circle) */}
                        <div className="flex justify-center z-10">
                          <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] sm:text-xs font-black text-zinc-300 font-mono shadow-md shadow-black/20">
                            {evt.gameTime}
                          </div>
                        </div>

                        {/* Right column (Home Team Side) */}
                        <div className="flex justify-start pl-2 sm:pl-4">
                          {isHome && (
                            <>
                              {isGoal && (
                                <div className="flex items-center gap-2.5 text-right">
                                  <span className="text-base sm:text-lg">⚽</span>
                                  <div className="flex flex-col text-right">
                                    <span className="text-xs sm:text-sm font-bold text-zinc-150 leading-tight">
                                      {getPlayerName(evt.playerId)}
                                    </span>
                                    {evt.extraPlayers && evt.extraPlayers.length > 0 && (
                                      <span className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                                        مساعدة: {getPlayerName(evt.extraPlayers[0])}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {isYellow && (
                                <div className="flex items-center gap-2.5 text-right">
                                  <div className="w-2.5 h-3.5 bg-yellow-500 rounded-xs shadow-sm shrink-0" />
                                  <span className="text-xs sm:text-sm font-bold text-zinc-150 leading-tight">
                                    {getPlayerName(evt.playerId)}
                                  </span>
                                </div>
                              )}
                              {isRed && (
                                <div className="flex items-center gap-2.5 text-right">
                                  <div className="w-2.5 h-3.5 bg-red-600 rounded-xs shadow-sm shrink-0 animate-pulse" />
                                  <span className="text-xs sm:text-sm font-bold text-zinc-150 leading-tight">
                                    {getPlayerName(evt.playerId)}
                                  </span>
                                </div>
                              )}
                              {isSub && (
                                <div className="flex items-center gap-2.5 text-right">
                                  <div className="flex flex-col items-center leading-none shrink-0 border border-zinc-800 rounded bg-zinc-950 px-1 py-0.5">
                                    <span className="text-[8px] text-emerald-450 leading-none">▲</span>
                                    <span className="text-[8px] text-red-500 leading-none">▼</span>
                                  </div>
                                  <div className="flex flex-col text-right">
                                    {evt.extraPlayers && evt.extraPlayers.length > 0 && (
                                      <span className="text-xs sm:text-sm font-bold text-emerald-450 leading-tight">
                                        {getPlayerName(evt.extraPlayers[0])}
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-sm font-bold text-red-400 leading-tight">
                                      {getPlayerName(evt.playerId)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                <p className="text-sm text-zinc-400">لا توجد أحداث رئيسية مسجلة في هذا اللقاء حتى الآن.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Match Statistics */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              إحصائيات الاستحواذ والتسديدات الحية
            </h2>

            {statsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-zinc-900 rounded-xl border border-zinc-850" />
                ))}
              </div>
            ) : statsData && statsData.statistics && statsData.statistics.length > 0 ? (
              <div className="space-y-5 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-5 sm:p-6">

                {/* Group matching stats together (Possession, Corners, Shots etc) */}
                {(() => {
                  const uniqueStatIds = Array.from(new Set(statsData.statistics.map((s) => s.id)));
                  return uniqueStatIds.map((statId) => {
                    const homeStat = statsData.statistics.find((s) => s.id === statId && s.competitorId === homeId);
                    const awayStat = statsData.statistics.find((s) => s.id === statId && s.competitorId === awayId);

                    if (!homeStat || !awayStat) return null;

                    const { homeVal, awayVal, homeRatio, awayRatio } = parseStatValues(homeStat.value, awayStat.value);

                    return (
                      <div key={statId} className="space-y-2">
                        {/* Title and Labels */}
                        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-200">
                          <span className="font-mono text-zinc-100">{homeStat.value}</span>
                          <span className="text-zinc-400">{homeStat.name}</span>
                          <span className="font-mono text-zinc-100">{awayStat.value}</span>
                        </div>
                        {/* Progressive bar chart */}
                        <div className="flex h-2 w-full rounded-full bg-zinc-850 overflow-hidden">
                          <div
                            style={{ width: `${homeRatio}%` }}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                          />
                          <div
                            style={{ width: `${awayRatio}%` }}
                            className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  });
                })()}

              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                <p className="text-sm text-zinc-400">إحصائيات اللقاء التفصيلية ستظهر هنا فور بدء اللعب وتوافرها.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lineups Pitch Layout */}
        {activeTab === "lineups" && (
          <PitchLineups game={game} members={members} />
        )}

        {/* Tab 4: Head to Head & Standings */}
        {activeTab === "h2h" && (
          <div className="space-y-8">
            {/* ─── SUMMARY STATS (wins, draws, losses) ─── */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-md text-center space-y-4">
              <h3 className="text-xs sm:text-sm font-extrabold text-zinc-300 flex items-center justify-center gap-2 mb-2">
                <History className="h-4 w-4 text-emerald-450" />
                مواجهات سابقة
              </h3>

              {h2hLoading ? (
                <div className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
              ) : h2hData && h2hData.game?.h2hGames ? (
                (() => {
                  const games = h2hData.game.h2hGames;
                  const homeWins = games.filter((g) =>
                    (g.homeCompetitor?.id === homeId && (g.homeCompetitor?.isWinner === true || g.winner === 1)) ||
                    (g.awayCompetitor?.id === homeId && (g.awayCompetitor?.isWinner === true || g.winner === 2))
                  ).length;
                  const awayWins = games.filter((g) =>
                    (g.homeCompetitor?.id === awayId && (g.homeCompetitor?.isWinner === true || g.winner === 1)) ||
                    (g.awayCompetitor?.id === awayId && (g.awayCompetitor?.isWinner === true || g.winner === 2))
                  ).length;
                  const draws = games.length - homeWins - awayWins;

                  return (
                    <div className="flex items-center justify-center gap-8 sm:gap-12 max-w-lg mx-auto py-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0 w-24 sm:w-32">
                        <span className="text-xs sm:text-sm font-black text-zinc-150 text-center truncate w-full">
                          {game.homeCompetitor.name}
                        </span>
                      </div>

                      {/* Stat Numbers */}
                      <div className="flex items-center gap-5 sm:gap-8 border-x border-zinc-800/80 px-6 sm:px-10 py-1">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-black text-emerald-450 font-mono">{homeWins}</div>
                          <div className="text-[10px] text-zinc-500 font-bold mt-1">الانتصارات</div>
                        </div>
                        <div className="w-px h-8 bg-zinc-800" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-black text-zinc-300 font-mono">{draws}</div>
                          <div className="text-[10px] text-zinc-500 font-bold mt-1">تعادلات</div>
                        </div>
                        <div className="w-px h-8 bg-zinc-800" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-black text-red-400 font-mono">{awayWins}</div>
                          <div className="text-[10px] text-zinc-500 font-bold mt-1">الانتصارات</div>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0 w-24 sm:w-32">
                        <span className="text-xs sm:text-sm font-black text-zinc-150 text-center truncate w-full">
                          {game.awayCompetitor.name}
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-zinc-500 text-xs py-2">لا تتوفر إحصائيات مواجهات حالياً.</div>
              )}
            </div>

            {/* ─── HISTORICAL MEETINGS LIST ─── */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-455" />
                المواجهات التاريخية الأخيرة
              </h3>

              {h2hLoading ? (
                <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
              ) : h2hData && h2hData.game?.h2hGames && h2hData.game.h2hGames.length > 0 ? (
                <div className="space-y-3">
                  {h2hData.game.h2hGames.map((historyGame) => {
                    return (
                      <div
                        key={historyGame.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900/60 transition-all"
                      >
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-zinc-500 font-bold mb-1">{historyGame.competitionName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.homeCompetitor.name}</span>
                            <span className="font-mono text-xs sm:text-sm font-extrabold text-zinc-200 bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-850">
                              {historyGame.homeCompetitor.score} - {historyGame.awayCompetitor.score}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.awayCompetitor.name}</span>
                          </div>
                        </div>
                        <div className="text-left font-mono text-[10px] sm:text-xs text-zinc-500">
                          {formatHistoryDate(historyGame.startTime)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                  <p className="text-xs text-zinc-500">لا تتوفر سجلات مواجهات سابقة بين الفريقين حالياً.</p>
                </div>
              )}
            </div>

            {/* ─── HOME TEAM RECENT GAMES (أداء فرنسا) ─── */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-450" />
                أداء {game.homeCompetitor.name}
              </h3>

              {h2hLoading ? (
                <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
              ) : h2hData && h2hData.game?.homeCompetitor?.recentGames && h2hData.game.homeCompetitor.recentGames.length > 0 ? (
                (() => {
                  const recent = h2hData.game.homeCompetitor.recentGames;
                  const visibleGames = showMoreHome ? recent.slice(0, 10) : recent.slice(0, 5);

                  return (
                    <div className="space-y-3">
                      <div className="space-y-3">
                        {visibleGames.map((historyGame) => {
                          const res = (() => {
                            const isHome = historyGame.homeCompetitor.id === homeId;
                            const teamWon = isHome ? (historyGame.homeCompetitor.isWinner === true || historyGame.winner === 1) : (historyGame.awayCompetitor.isWinner === true || historyGame.winner === 2);
                            const teamLost = isHome ? (historyGame.awayCompetitor.isWinner === true || historyGame.winner === 2) : (historyGame.homeCompetitor.isWinner === true || historyGame.winner === 1);
                            if (teamWon) return "win";
                            if (teamLost) return "loss";
                            return "draw";
                          })();

                          return (
                            <div
                              key={historyGame.id}
                              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900/60 transition-all"
                            >
                              {/* Left Badge */}
                              <div className="flex items-center gap-3">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white shrink-0 ${res === "win" ? "bg-emerald-500 shadow-sm shadow-emerald-950/20" :
                                    res === "loss" ? "bg-red-500 shadow-sm shadow-red-950/20" :
                                      "bg-zinc-600"
                                  }`}>
                                  {res === "win" ? "ف" : res === "loss" ? "خ" : "ت"}
                                </span>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] text-zinc-500 font-bold mb-1">{historyGame.competitionName}</span>
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.homeCompetitor.name}</span>
                                    <span className="font-mono text-xs text-zinc-400 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-850">
                                      {historyGame.homeCompetitor.score} - {historyGame.awayCompetitor.score}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-zinc-300">{historyGame.awayCompetitor.name}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Date */}
                              <div className="text-left font-mono text-[10px] sm:text-xs text-zinc-500">
                                {formatHistoryDate(historyGame.startTime)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {recent.length > 5 && (
                        <button
                          onClick={() => setShowMoreHome(!showMoreHome)}
                          className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          {showMoreHome ? "شاهد أقل" : "شاهد المزيد"}
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                  <p className="text-xs text-zinc-500">لا تتوفر نتائج مباريات أخيرة لهذا الفريق حالياً.</p>
                </div>
              )}
            </div>

            {/* ─── AWAY TEAM RECENT GAMES (أداء إنجلترا) ─── */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-450" />
                أداء {game.awayCompetitor.name}
              </h3>

              {h2hLoading ? (
                <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
              ) : h2hData && h2hData.game?.awayCompetitor?.recentGames && h2hData.game.awayCompetitor.recentGames.length > 0 ? (
                (() => {
                  const recent = h2hData.game.awayCompetitor.recentGames;
                  const visibleGames = showMoreAway ? recent.slice(0, 10) : recent.slice(0, 5);

                  return (
                    <div className="space-y-3">
                      <div className="space-y-3">
                        {visibleGames.map((historyGame) => {
                          const res = (() => {
                            const isHome = historyGame.homeCompetitor.id === awayId;
                            const teamWon = isHome ? (historyGame.homeCompetitor.isWinner === true || historyGame.winner === 1) : (historyGame.awayCompetitor.isWinner === true || historyGame.winner === 2);
                            const teamLost = isHome ? (historyGame.awayCompetitor.isWinner === true || historyGame.winner === 2) : (historyGame.homeCompetitor.isWinner === true || historyGame.winner === 1);
                            if (teamWon) return "win";
                            if (teamLost) return "loss";
                            return "draw";
                          })();

                          return (
                            <div
                              key={historyGame.id}
                              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900/60 transition-all"
                            >
                              {/* Left Badge */}
                              <div className="flex items-center gap-3">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white shrink-0 ${res === "win" ? "bg-emerald-500 shadow-sm shadow-emerald-950/20" :
                                    res === "loss" ? "bg-red-500 shadow-sm shadow-red-950/20" :
                                      "bg-zinc-600"
                                  }`}>
                                  {res === "win" ? "ف" : res === "loss" ? "خ" : "ت"}
                                </span>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] text-zinc-500 font-bold mb-1">{historyGame.competitionName}</span>
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.homeCompetitor.name}</span>
                                    <span className="font-mono text-xs text-zinc-400 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-850">
                                      {historyGame.homeCompetitor.score} - {historyGame.awayCompetitor.score}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.awayCompetitor.name}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Date */}
                              <div className="text-left font-mono text-[10px] sm:text-xs text-zinc-500">
                                {formatHistoryDate(historyGame.startTime)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {recent.length > 5 && (
                        <button
                          onClick={() => setShowMoreAway(!showMoreAway)}
                          className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          {showMoreAway ? "شاهد أقل" : "شاهد المزيد"}
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                  <p className="text-xs text-zinc-500">لا تتوفر نتائج مباريات أخيرة لهذا الفريق حالياً.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Details (التفاصيل) */}
        {activeTab === "details" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-5 sm:p-8 shadow-xl">
              <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                <Award className="h-4 w-4 text-emerald-400" />
                تفاصيل اللقاء
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400">البطولة</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200">{leagueName}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400">وقت المباراة</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200 font-mono">
                    {formatTime(game.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400">تاريخ المباراة</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200 font-mono">
                    {formatDate(game.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400">حالة اللقاء</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200">{game.statusText || "منتهية"}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400">القناة الناقلة</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200">
                    {(() => {
                      if (streamData?.channel && streamData.channel !== "غير محدد") {
                        return streamData.channel;
                      }
                      if (game.tvNetworks && Array.isArray(game.tvNetworks) && game.tvNetworks.length > 0) {
                        return game.tvNetworks.map((n: any) => n.name).join(" - ");
                      }
                      return "غير محدد";
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-bold text-zinc-400">المعلق</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200">
                    {getAssignedCommentator(activeStreamData?.commentator || streamData?.commentator, game.id)}
                  </span>
                </div>
              </div>

              {/* Head to Head Meetings inside Details tab */}
              <div className="mt-8">
                <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-400" />
                  آخر لقاءات بين الفريقين
                </h3>
                {h2hLoading ? (
                  <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
                ) : h2hData && h2hData.game?.h2hGames ? (
                  <div className="space-y-3">
                    {h2hData.game.h2hGames.slice(0, 3).map((historyGame) => {
                      const histDate = formatHistoryDate(historyGame.startTime);
                      return (
                        <div key={historyGame.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-850">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-semibold mb-0.5">{historyGame.competitionName}</span>
                            <span className="text-xs text-zinc-400 font-medium font-mono">{histDate}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.homeCompetitor.name}</span>
                            <span className="font-black text-sm bg-zinc-850 px-2 py-0.5 rounded font-mono text-zinc-100">
                              {historyGame.homeCompetitor.score} - {historyGame.awayCompetitor.score}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-350">{historyGame.awayCompetitor.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500">لا تتوفر بيانات عن مباريات سابقة!</p>
                  </div>
                )}
              </div>

              {/* Dynamic Match SEO Preview & Internal Linking Section */}
              <article className="mt-8 rounded-2xl bg-zinc-950/60 border border-zinc-800 p-5 sm:p-7 text-zinc-300 space-y-4 shadow-xl leading-relaxed">
                <header className="border-b border-zinc-800/80 pb-3">
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                    تقديم مباراة {homeCompetitor.name} ضد {awayCompetitor.name} اليوم | يلا شوت Yalla Shoot
                  </h3>
                </header>

                <p className="text-xs sm:text-sm text-zinc-300">
                  تتجه أنظار عشاق كرة القدم اليوم نحو مواجهة قوية تجمع بين نادِ{" "}
                  <Link href={`/team/${homeCompetitor.id}`} className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">
                    {homeCompetitor.name}
                  </Link>{" "}
                  ومنافسه نادِ{" "}
                  <Link href={`/team/${awayCompetitor.id}`} className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">
                    {awayCompetitor.name}
                  </Link>{" "}
                  ضمن منافسات بطولة{" "}
                  <Link href={`/standings/${game.competitionId}`} className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">
                    {leagueName}
                  </Link>
                  . تنطلق صافرة البداية في تمام الساعة{" "}
                  <strong className="text-white font-mono font-bold">{formatTime(game.startTime)}</strong> بتوقيت  المحلي ({formatDate(game.startTime)}).
                </p>

                <p className="text-xs sm:text-sm text-zinc-300">
                  يقدم موقع <strong className="text-white font-bold">يلا شوت (Yalla Shoot)</strong> الرسمي عبر منصة{" "}
                  <span className="text-emerald-400 font-bold">yallashoot</span> متابعة حصرية للمباراة بدون تقطيع مع تغطية شاملة لجميع أحداث اللقاء لحظة بلحظة، وتحديث فوري للتشكيلة الرسمية وإحصائيات الاستحواذ والتسديدات.
                </p>

                <p className="text-xs sm:text-sm text-zinc-300">
                  تُنقل المباراة عبر شاشة{" "}
                  <strong className="text-zinc-100 font-semibold">
                    {(() => {
                      if (streamData?.channel && streamData.channel !== "غير محدد") return streamData.channel;
                      if (game.tvNetworks && Array.isArray(game.tvNetworks) && game.tvNetworks.length > 0) return game.tvNetworks.map((n: any) => n.name).join(" - ");
                      return "القنوات الرياضية الناقلة";
                    })()}
                  </strong>{" "}
                  بصوت المعلق الرياضي{" "}
                  <strong className="text-zinc-100 font-semibold">
                    {getAssignedCommentator(activeStreamData?.commentator || streamData?.commentator, game.id)}
                  </strong>
                  .
                </p>

                {/* Internal Links Navigation Hub */}
                <div className="pt-4 border-t border-zinc-800/80">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                    روابط ذات صلة وتغطية إضافية
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <Link
                      href={`/team/${homeCompetitor.id}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                          نادي {homeCompetitor.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">التشكيلة والنتائج السابقة</span>
                      </div>
                    </Link>

                    <Link
                      href={`/team/${awayCompetitor.id}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                          نادي {awayCompetitor.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">التشكيلة والنتائج السابقة</span>
                      </div>
                    </Link>

                    <Link
                      href={`/standings/${game.competitionId}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                          ترتيب {leagueName}
                        </span>
                        <span className="text-[10px] text-zinc-500">جدول النقاط والمراكز</span>
                      </div>
                    </Link>

                    <Link
                      href="/live"
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition">
                        <Tv className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                          مباريات اليوم بث مباشر
                        </span>
                        <span className="text-[10px] text-zinc-500">جدول المباريات الحية</span>
                      </div>
                    </Link>

                    <Link
                      href="/highlights"
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition">
                        <Film className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                          ملخصات وأهداف
                        </span>
                        <span className="text-[10px] text-zinc-500">فيديوهات أهداف المباريات</span>
                      </div>
                    </Link>

                    <Link
                      href="/news"
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition">
                        <Newspaper className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition">
                          أخبار الرياضة
                        </span>
                        <span className="text-[10px] text-zinc-500">تقارير وأخبار حصرية</span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Hashtags & Queries */}
                <div className="flex flex-wrap gap-1.5 pt-2 text-[10px] sm:text-[11px] font-bold text-zinc-400">
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># مباراة {homeCompetitor.name} اليوم</span>
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># مباراة {awayCompetitor.name}</span>
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># بث مباشر {homeCompetitor.name}</span>
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># {homeCompetitor.name} ضد {awayCompetitor.name}</span>
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># يلا شوت</span>
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># Yalla Shoot</span>
                  <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"># yallashoot</span>
                </div>
              </article>
            </div>
          </div>
        )}

        {/* Tab 7: Standings (الترتيب) */}
        {activeTab === "standings" && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" />
              ترتيب الدوري
            </h3>
            {standingsLoading ? (
              <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" />
            ) : standingsData && standingsData.standings && standingsData.standings.length > 0 ? (
              <div className="space-y-6">
                {standingsData.standings.map((table, tIdx) => {
                  const hasGroups = table.groups && table.groups.length > 0;

                  const renderTable = (rows: typeof table.rows, groupName?: string) => (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="bg-zinc-900/60 px-5 py-4 border-b border-zinc-800">
                        <span className="text-sm font-extrabold text-zinc-200">
                          {groupName ? `${table.displayName || "الترتيب"} - ${groupName}` : (table.displayName || "جدول الترتيب")}
                        </span>
                      </div>

                      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <table className="w-full text-right border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-900/20">
                              <th className="p-3.5 text-center w-12">#</th>
                              <th className="p-3.5">الفريق</th>
                              <th className="p-3.5 text-center">لعب</th>
                              <th className="p-3.5 text-center">فاز</th>
                              <th className="p-3.5 text-center">تعادل</th>
                              <th className="p-3.5 text-center">خسر</th>
                              <th className="p-3.5 text-center font-mono">له/عليه</th>
                              <th className="p-3.5 text-center">النقاط</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-850/40">
                            {rows.map((row) => {
                              const isTarget = row.competitor.id === homeId || row.competitor.id === awayId;
                              const destColor = table.destinations?.find((d) => d.num === row.destinationNum)?.color;

                              return (
                                <tr
                                  key={row.competitor.id}
                                  className={`transition-colors ${isTarget ? "bg-emerald-950/30 font-bold" : "text-zinc-400 hover:bg-zinc-900/10"
                                    }`}
                                >
                                  <td className="p-3.5 text-center font-black">
                                    <span
                                      style={{ borderRightColor: destColor }}
                                      className={`inline-block w-full border-r-3 pr-1 ${destColor ? "" : "border-r-transparent"}`}
                                    >
                                      {row.position}
                                    </span>
                                  </td>
                                  <td className="p-3.5 font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_50,h_50,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${row.competitor.id}`}
                                        alt={row.competitor.name}
                                        className="h-5 w-5 object-contain"
                                        loading="lazy"
                                      />
                                      <span>{row.competitor.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-center font-mono">{row.gamePlayed}</td>
                                  <td className="p-3.5 text-center font-mono">{row.gamesWon}</td>
                                  <td className="p-3.5 text-center font-mono">{row.gamesEven}</td>
                                  <td className="p-3.5 text-center font-mono">{row.gamesLost}</td>
                                  <td className="p-3.5 text-center font-mono text-zinc-500">
                                    {row.for}/{row.against}
                                  </td>
                                  <td className={`p-3.5 text-center font-black ${isTarget ? "text-emerald-400" : "text-zinc-200"}`}>
                                    {row.points}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );

                  if (hasGroups && table.groups) {
                    return (
                      <div key={tIdx} className="space-y-6">
                        {table.groups.map((group) => {
                          const groupRows = table.rows.filter((r) => r.groupNum === group.num);
                          if (groupRows.length === 0) return null;
                          return (
                            <div key={group.num}>
                              {renderTable(groupRows, group.name)}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  return <div key={tIdx}>{renderTable(table.rows)}</div>;
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-500">لا يتوفر ترتيب الدوري لهذه البطولة حالياً.</p>
              </div>
            )}
          </div>
        )}

        {/* Native Sponsor / Recommended News Banner */}
        <AdsterraNative className="my-8" />
      </div>
    </div>
  );
}
