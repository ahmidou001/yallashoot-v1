"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Calendar, Award, Star, Trophy, Clock,
  ArrowLeftRight, Info, Shield, Users,
  TrendingUp, Activity, HelpCircle, ChevronDown,
  ChevronUp, Newspaper, Network, ChevronLeft, ChevronRight
} from "lucide-react";
import { generateMatchSlug } from "@/lib/matchSlug";
import { toLatinNumerals } from "@/components/providers";
import ResponsiveAdBanner from "@/components/ads/ResponsiveAdBanner";

interface TeamDetailsClientProps {
  team: any;
  squad: any;
  transfers: any;
  games: any[];
  standings: any;
  stats: any;
  seo: any;
  related: any;
  brackets?: any;
}

export default function TeamDetailsClient({
  team,
  squad,
  transfers,
  games,
  standings,
  stats,
  seo,
  related,
  brackets,
}: TeamDetailsClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [matchesSubTab, setMatchesSubTab] = useState("fixtures");
  const [statsViewMode, setStatsViewMode] = useState<"cards" | "table">("cards");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [isCompDropdownOpen, setIsCompDropdownOpen] = useState(false);
  const compDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close competition dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (compDropdownRef.current && !compDropdownRef.current.contains(e.target as Node)) {
        setIsCompDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bracketsScrollRef = React.useRef<HTMLDivElement>(null);
  const scrollBrackets = (direction: "left" | "right") => {
    if (bracketsScrollRef.current) {
      const amount = direction === "left" ? -450 : 450;
      bracketsScrollRef.current.scrollBy({
        left: amount,
        behavior: "smooth"
      });
    }
  };

  // Process standings into separate tables for group stages (e.g. World Cup group stages)
  const processedTables = React.useMemo(() => {
    const list: Array<{ displayName: string; rows: any[]; destinations?: any[] }> = [];
    if (!standings) return list;

    if (standings.groups && standings.groups.length > 1) {
      standings.groups.forEach((g: any) => {
        const groupRows = (standings.rows || []).filter((row: any) => row.groupNum === g.num);
        list.push({
          displayName: g.name,
          rows: groupRows,
          destinations: standings.destinations
        });
      });
    } else {
      list.push({
        displayName: standings.displayName || "جدول الترتيب",
        rows: standings.rows || [],
        destinations: standings.destinations
      });
    }
    return list;
  }, [standings]);

  // Stats view category filter
  const [selectedStatTypeId, setSelectedStatTypeId] = useState<number>(1); // Default to Goals (typeId: 1)

  // FAQ Accordion open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Helper to render bracket match cards
  const renderBracketCard = (group: any, highlightWinner = true) => {
    if (!group) return null;
    const p1 = group.participants?.[0] || { name: "مجهول" };
    const p2 = group.participants?.[1] || { name: "مجهول" };
    const score1 = group.score?.[0];
    const score2 = group.score?.[1];

    const hasPlayed = score1 !== undefined && score1 !== null && score1 !== -1;

    const isWinner1 = group.toQualify === 1;
    const isWinner2 = group.toQualify === 2;

    const penScore1 = p1.penaltiesScore;
    const penScore2 = p2.penaltiesScore;

    return (
      <div className="bg-[#121214] border border-gray-800/80 rounded-xl p-3 w-[220px] shrink-0 text-xs flex flex-col gap-2.5 hover:border-gray-700 transition-all duration-300 shadow-md shadow-black/15">
        {/* Participant 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-row-reverse">
            {p1.competitorId ? (
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p1.competitorId}`}
                className="w-5 h-5 rounded-full object-cover shrink-0"
                alt=""
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
            )}
            <span className={`font-bold truncate text-right ${hasPlayed
                ? (isWinner1 && highlightWinner ? "text-white" : "text-gray-500 font-medium")
                : "text-gray-300"
              }`}>
              {p1.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-bold">
            {penScore1 !== undefined && penScore1 !== null && (
              <span className="text-[10px] text-gray-500 font-semibold">({penScore1})</span>
            )}
            <span className={hasPlayed ? (isWinner1 && highlightWinner ? "text-white text-sm" : "text-gray-500 text-sm") : "text-gray-500 text-sm"}>
              {hasPlayed ? score1 : "-"}
            </span>
          </div>
        </div>

        {/* Participant 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-row-reverse">
            {p2.competitorId ? (
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p2.competitorId}`}
                className="w-5 h-5 rounded-full object-cover shrink-0"
                alt=""
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
            )}
            <span className={`font-bold truncate text-right ${hasPlayed
                ? (isWinner2 && highlightWinner ? "text-white" : "text-gray-500 font-medium")
                : "text-gray-300"
              }`}>
              {p2.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-bold">
            {penScore2 !== undefined && penScore2 !== null && (
              <span className="text-[10px] text-gray-500 font-semibold">({penScore2})</span>
            )}
            <span className={hasPlayed ? (isWinner2 && highlightWinner ? "text-white text-sm" : "text-gray-500 text-sm") : "text-gray-500 text-sm"}>
              {hasPlayed ? score2 : "-"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Mapped lists for Transfers
  const athletesMap = React.useMemo(() => {
    const map = new Map<number, any>();
    if (transfers && Array.isArray(transfers.athletes)) {
      transfers.athletes.forEach((ath: any) => map.set(ath.id, ath));
    }
    return map;
  }, [transfers]);

  const competitorsMap = React.useMemo(() => {
    const map = new Map<number, any>();
    if (transfers && Array.isArray(transfers.competitors)) {
      transfers.competitors.forEach((c: any) => map.set(c.id, c));
    }
    return map;
  }, [transfers]);

  // Group squad players by position
  const squadByPosition = React.useMemo(() => {
    const groups: Record<string, any[]> = {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: [],
      others: []
    };

    if (squad && Array.isArray(squad.squads) && squad.squads.length > 0) {
      const athletes = squad.squads[0].athletes || [];
      athletes.forEach((athlete: any) => {
        const posId = athlete.position?.id;
        if (posId === 1) {
          groups.goalkeepers.push(athlete);
        } else if (posId === 2) {
          groups.defenders.push(athlete);
        } else if (posId === 3) {
          groups.midfielders.push(athlete);
        } else if (posId === 4) {
          groups.forwards.push(athlete);
        } else {
          groups.others.push(athlete);
        }
      });
    }
    return groups;
  }, [squad]);

  // Filter transfers into arrivals vs departures
  const mappedTransfers = React.useMemo(() => {
    const incoming: any[] = [];
    const outgoing: any[] = [];

    if (transfers && Array.isArray(transfers.transfers)) {
      transfers.transfers.forEach((tr: any) => {
        const athlete = athletesMap.get(tr.athleteId) || { name: "لاعب غير معروف" };
        const originClub = competitorsMap.get(tr.origin);
        const targetClub = competitorsMap.get(tr.target);

        const record = {
          ...tr,
          athlete,
          originClub,
          targetClub,
        };

        if (tr.isArrival) {
          incoming.push(record);
        } else if (tr.isDeparture) {
          outgoing.push(record);
        }
      });
    }

    return { incoming, outgoing };
  }, [transfers, athletesMap, competitorsMap]);

  // Extract SEO elements and sanitize 365Scores and club/national-team wording
  const { descriptionHTML, faqElements } = React.useMemo(() => {
    let desc = "";
    let faqs: any[] = [];

    if (seo && Array.isArray(seo.sections)) {
      const descSection = seo.sections.find((s: any) => s.name === "ENTITY_DESCRIPTION");
      if (descSection && descSection.elements && descSection.elements.length > 0) {
        // Combine elements value if multiple
        desc = descSection.elements.map((el: any) => el.value).join("<br/>");
      }

      const faqSection = seo.sections.find((s: any) => s.name === "FAQ");
      if (faqSection && faqSection.elements) {
        // Group elements into Q&A pairs (Q1 matches A1, etc.)
        const elements = faqSection.elements;
        const qMap = new Map<string, string>();
        const aMap = new Map<string, string>();

        elements.forEach((el: any) => {
          if (el.name.includes("_Q")) {
            const index = el.name.split("_Q")[1];
            qMap.set(index, el.value);
          } else if (el.name.includes("_A")) {
            const index = el.name.split("_A")[1];
            aMap.set(index, el.value);
          }
        });

        qMap.forEach((question, index) => {
          const answer = aMap.get(index);
          if (answer) {
            faqs.push({ question, answer });
          }
        });
      }
    }

    const sanitizeText = (txt: string) => {
      if (!txt) return "";
      let cleaned = txt
        .replace(/365Scores/gi, "yallashoot")
        .replace(/365 Scores/gi, "yallashoot")
        .replace(/365/g, "");
      if (team.type === 2) {
        cleaned = cleaned.replace(/نادي/g, "منتخب");
      }
      return cleaned;
    };

    const cleanDesc = sanitizeText(desc);
    const cleanFaqs = faqs.map((faq) => ({
      question: sanitizeText(faq.question),
      answer: sanitizeText(faq.answer),
    }));

    return { descriptionHTML: cleanDesc, faqElements: cleanFaqs };
  }, [seo, team.type]);

  // Split matches list into fixtures vs results
  const { fixturesList, resultsList } = React.useMemo(() => {
    const fixtures: any[] = [];
    const results: any[] = [];

    games.forEach((game: any) => {
      const isFinished = game.statusGroup === 4;
      if (isFinished) {
        results.push(game);
      } else {
        fixtures.push(game);
      }
    });

    // Sort results descending (latest first) and fixtures ascending (soonest first)
    results.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    fixtures.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return { fixturesList: fixtures, resultsList: results };
  }, [games]);

  // Extract recent form from last 5 results
  const recentForm = React.useMemo(() => {
    return resultsList.slice(0, 5).map((game: any) => {
      const isHome = game.homeCompetitor.id === team.id;
      const ourScore = isHome ? game.homeCompetitor.score : game.awayCompetitor.score;
      const theirScore = isHome ? game.awayCompetitor.score : game.homeCompetitor.score;
      const opponent = isHome ? game.awayCompetitor : game.homeCompetitor;

      let result: "W" | "D" | "L" = "D";
      if (ourScore > theirScore) result = "W";
      else if (ourScore < theirScore) result = "L";

      return {
        game,
        result,
        scoreText: `${ourScore} - ${theirScore}`,
        opponent,
      };
    });
  }, [resultsList, team.id]);

  // Check if brackets stage 2 (Round of 32) exists
  const hasR32 = React.useMemo(() => {
    return brackets && Array.isArray(brackets.stages) && brackets.stages.some((s: any) => s.num === 2);
  }, [brackets]);

  // Next match
  const nextMatch = React.useMemo(() => {
    return fixturesList[0];
  }, [fixturesList]);

  // Initial default competition ID from server stats
  const initialCompetitionId = stats?.competitions?.[0]?.id;

  // Dynamically fetch statistics if user selects a different competition
  const { data: dynamicStatsData, isFetching: isStatsLoading } = useQuery({
    queryKey: ["competitorStats", team.id, selectedCompetitionId],
    queryFn: async () => {
      if (!selectedCompetitionId) return null;
      const res = await fetch(`/api/competitor-stats?teamId=${team.id}&competitionId=${selectedCompetitionId}`);
      if (!res.ok) throw new Error("Failed to fetch competitor stats");
      const json = await res.json();
      return json.data;
    },
    enabled: activeTab === "stats" && !!selectedCompetitionId && selectedCompetitionId !== initialCompetitionId,
    staleTime: 5 * 60 * 1000,
  });

  const currentStats = (selectedCompetitionId && selectedCompetitionId !== initialCompetitionId && dynamicStatsData)
    ? dynamicStatsData
    : stats;

  // Competitions list in competitor stats
  const statsCompetitions = React.useMemo(() => {
    return stats?.competitions || currentStats?.competitions || [];
  }, [stats, currentStats]);

  const activeCompetition = React.useMemo(() => {
    if (selectedCompetitionId) {
      return statsCompetitions.find((c: any) => c.id === selectedCompetitionId) || statsCompetitions[0] || null;
    }
    return statsCompetitions[0] || null;
  }, [statsCompetitions, selectedCompetitionId]);

  // Countries lookup map
  const countriesMap = React.useMemo(() => {
    const map = new Map<number, string>();
    const list = [
      ...(stats?.countries || []),
      ...(currentStats?.countries || []),
      ...(squad?.countries || [])
    ];
    list.forEach((c: any) => {
      if (c?.id && c?.name) map.set(c.id, c.name);
    });
    return map;
  }, [stats, currentStats, squad]);

  // Categories in competitor stats
  const statCategories = React.useMemo(() => {
    const rawList = currentStats?.stats?.athletesStats || currentStats?.athletesStats || stats?.stats?.athletesStats || stats?.athletesStats || [];
    if (Array.isArray(rawList)) {
      return rawList.map((cat: any) => {
        let arabicName = cat.name;
        if (cat.id === 1) arabicName = "الأهداف";
        else if (cat.id === 10) arabicName = "التمريرات الحاسمة";
        else if (cat.id === 3) arabicName = "البطاقات الصفراء";
        else if (cat.id === 4) arabicName = "البطاقات الحمراء";
        else if (cat.id === 13 || cat.name?.includes("متوقعة")) arabicName = "أهداف متوقعة";

        return {
          id: cat.id,
          name: arabicName,
          rows: cat.rows || [],
        };
      });
    }
    return [];
  }, [currentStats, stats]);

  const teamColor = team.color || "#075C9C";

  // Fetch real team sports news from MongoDB API (filtered by team name tag, with fallback to general news)
  const { data: teamNewsArticles, isLoading: isTeamNewsLoading } = useQuery({
    queryKey: ["teamNews", team.name],
    queryFn: async () => {
      const res = await fetch(`/api/news?tag=${encodeURIComponent(team.name)}&limit=6`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: activeTab === "news",
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white font-sans pb-12" dir="rtl">
      {/* Premium Header Backdrop with team primary color glow */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#13171f] to-[#0d0f12] border-b border-gray-800/60 pb-6 pt-8">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none blur-3xl scale-125"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${teamColor} 0%, transparent 60%)`
          }}
        />

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Team details wrapper */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
              {/* Team Logo */}
              <div className="relative p-2 bg-[#1b202c]/80 border border-gray-700/50 rounded-2xl shadow-xl shadow-black/40">
                <img
                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${team.id}`}
                  alt={team.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.svg";
                  }}
                />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center justify-center sm:justify-start gap-3">
                  {team.name}
                  {team.symbolicName && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full">
                      {team.symbolicName}
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          {/* Tab bar navigation */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-gray-800/85 mt-10">
            {[
              { id: "overview", label: "التفاصيل", icon: Shield },
              { id: "matches", label: "المباريات", icon: Calendar },
              { id: "standings", label: "الترتيب", icon: Trophy },
              { id: "news", label: "أخبار", icon: Newspaper },
              { id: "stats", label: "الإحصائيات", icon: Activity },
              { id: "squad", label: "قائمة الفريق", icon: Users },
              { id: "transfers", label: "انتقالات", icon: ArrowLeftRight },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${isActive
                      ? "border-green-500 text-green-500 bg-green-500/5"
                      : "border-transparent text-gray-400 hover:text-white"
                    }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details Widgets */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description from SEO API */}
              {descriptionHTML && (
                <div className="bg-[#131722]/90 border border-gray-800/60 p-6 rounded-2xl shadow-xl shadow-black/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-green-500" />
                    {team.type === 2 ? "نبذة عن المنتخب" : "نبذة عن النادي"}
                  </h3>
                  <div
                    className="text-gray-300 text-sm leading-relaxed antialiased"
                    dangerouslySetInnerHTML={{ __html: descriptionHTML }}
                  />
                </div>
              )}

              {/* Next Match Widget */}
              {nextMatch ? (
                <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                  <div className="p-4 bg-gradient-to-l from-gray-800/30 to-transparent border-b border-gray-800/40 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                      <Clock className="w-4.5 h-4.5" />
                      المباراة القادمة
                    </span>
                    <span className="text-xs text-gray-400">
                      {nextMatch.competitionDisplayName}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between gap-4 max-w-md">
                      {/* Home Team */}
                      <Link href={`/team/${nextMatch.homeCompetitor.id}`} className="flex-1 flex flex-col items-center text-center gap-2 group">
                        <img
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${nextMatch.homeCompetitor.id}`}
                          alt={nextMatch.homeCompetitor.name}
                          className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="text-sm font-extrabold line-clamp-1 group-hover:text-green-400 transition-colors">{nextMatch.homeCompetitor.name}</span>
                      </Link>

                      {/* VS / Info */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400 font-bold">VS</div>
                        <span className="text-xs text-gray-400 font-semibold mt-1">
                          {new Date(nextMatch.startTime).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Away Team */}
                      <Link href={`/team/${nextMatch.awayCompetitor.id}`} className="flex-1 flex flex-col items-center text-center gap-2 group">
                        <img
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${nextMatch.awayCompetitor.id}`}
                          alt={nextMatch.awayCompetitor.name}
                          className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="text-sm font-extrabold line-clamp-1 group-hover:text-green-400 transition-colors">{nextMatch.awayCompetitor.name}</span>
                      </Link>
                    </div>

                    <div className="mt-6 text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      {toLatinNumerals(new Date(nextMatch.startTime).toLocaleDateString("ar-EG-u-nu-latn", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#131722]/80 border border-gray-800/60 p-8 rounded-2xl text-center text-gray-400">
                  لا توجد مباريات مجدولة قادمة حالياً.
                </div>
              )}

              {/* Form Widget */}
              {recentForm.length > 0 && (
                <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-6 shadow-xl shadow-black/20">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    أداء الفريق الأخير
                  </h3>

                  <div className="flex flex-wrap items-center gap-3">
                    {recentForm.map((item, index) => (
                      <div
                        key={index}
                        className={`flex-1 min-w-[70px] flex flex-col items-center p-3 rounded-xl border ${item.result === "W"
                            ? "bg-green-950/20 border-green-500/30"
                            : item.result === "L"
                              ? "bg-red-950/20 border-red-500/30"
                              : "bg-gray-800/30 border-gray-700/30"
                          }`}
                      >
                        <span className={`text-base font-black mb-2 ${item.result === "W" ? "text-green-400" : item.result === "L" ? "text-red-400" : "text-gray-400"
                          }`}>
                          {item.result === "W" ? "فوز" : item.result === "L" ? "خسارة" : "تعادل"}
                        </span>
                        <img
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${item.opponent.id}`}
                          alt={item.opponent.name}
                          className="w-8 h-8 object-contain mb-1"
                        />
                        <span className="text-xs text-gray-400 font-semibold">{item.scoreText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Accordion from SEO API */}
              {faqElements.length > 0 && (
                <div className="bg-[#131722]/90 border border-gray-800/60 p-6 rounded-2xl shadow-xl shadow-black/20">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-yellow-500" />
                    الأسئلة الشائعة
                  </h3>

                  <div className="space-y-3">
                    {faqElements.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-gray-800/60 rounded-xl overflow-hidden bg-gray-900/10"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full p-4 flex items-center justify-between gap-4 font-bold text-sm text-right text-white hover:bg-gray-800/20 transition-all cursor-pointer"
                          >
                            <span>{faq.question}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
                          </button>

                          {isOpen && (
                            <div
                              className="p-4 border-t border-gray-800/40 text-xs sm:text-sm text-gray-450 leading-relaxed bg-[#0d0f12]/30"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Related rivals, recent matches list */}
            <div className="lg:col-span-1 space-y-6">
              {/* Rivals / Related Teams */}
              {related && Array.isArray(related.competitors) && related.competitors.length > 0 && (
                <div className="bg-[#131722]/90 border border-gray-800/60 p-5 rounded-2xl shadow-xl shadow-black/20">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-green-500" />
                    فرق منافسة
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {related.competitors.slice(0, 6).map((comp: any) => (
                      <Link
                        key={comp.id}
                        href={`/team/${comp.id}`}
                        className="p-3 bg-gray-900/30 border border-gray-800/50 rounded-xl flex flex-col items-center text-center gap-2 hover:border-gray-700/60 hover:shadow-lg transition-all duration-300"
                      >
                        <img
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${comp.id}`}
                          alt=""
                          className="w-10 h-10 object-contain"
                        />
                        <span className="text-xxs sm:text-xs font-bold line-clamp-1 text-zinc-300">{comp.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Results sidebar */}
              {resultsList.length > 0 && (
                <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                  <div className="p-4 bg-gradient-to-l from-gray-800/30 to-transparent border-b border-gray-800/40">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4.5 h-4.5 text-green-500" />
                      آخر النتائج
                    </h3>
                  </div>

                  <div className="p-4 divide-y divide-gray-800/50 max-h-[400px] overflow-y-auto scrollbar-none">
                    {resultsList.slice(0, 8).map((game: any, index) => {
                      const slug = generateMatchSlug(game.homeCompetitor, game.awayCompetitor, game.id);
                      return (
                        <Link
                          key={index}
                          href={`/match/${slug}`}
                          className="py-3 flex items-center justify-between hover:bg-gray-800/20 px-2 rounded-xl transition-all duration-200"
                        >
                          <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <img src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`} className="w-5 h-5 object-contain" alt="" />
                              <span className={`text-xs sm:text-sm font-semibold line-clamp-1 ${game.homeCompetitor.id === team.id ? "font-bold text-white" : "text-gray-400"}`}>{game.homeCompetitor.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`} className="w-5 h-5 object-contain" alt="" />
                              <span className={`text-xs sm:text-sm font-semibold line-clamp-1 ${game.awayCompetitor.id === team.id ? "font-bold text-white" : "text-gray-400"}`}>{game.awayCompetitor.name}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center font-bold px-3 py-1 bg-gray-800/40 rounded-lg text-green-400 text-sm shrink-0">
                            <span>{game.homeCompetitor.score}</span>
                            <span className="text-gray-600 border-t border-gray-700/60 my-0.5 w-4" />
                            <span>{game.awayCompetitor.score}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Fixtures vs Results sub-tabs */}
              <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-black/10">
                <div className="flex bg-gray-850 p-1 rounded-xl w-full max-w-xs border border-gray-800/60">
                  <button
                    onClick={() => setMatchesSubTab("fixtures")}
                    className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all cursor-pointer ${matchesSubTab === "fixtures" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                      }`}
                  >
                    جدول المباريات
                  </button>
                  <button
                    onClick={() => setMatchesSubTab("results")}
                    className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all cursor-pointer ${matchesSubTab === "results" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                      }`}
                  >
                    النتائج
                  </button>
                </div>
              </div>

              {/* Match list */}
              <div className="space-y-4">
                {(matchesSubTab === "fixtures" ? fixturesList : resultsList).map((game: any, index) => {
                  const slug = generateMatchSlug(game.homeCompetitor, game.awayCompetitor, game.id);
                  return (
                    <Link
                      key={index}
                      href={`/match/${slug}`}
                      className="block bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-4 sm:p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                        {/* 1. Right: Competition Name (md:col-span-2) */}
                        <div className="col-span-1 md:col-span-2 text-right">
                          <span className="text-xs text-gray-500 font-semibold truncate block">
                            {game.competitionDisplayName}
                          </span>
                        </div>

                        {/* 2. Center Match Block (md:col-span-8): Perfect 12-col subgrid */}
                        <div className="col-span-1 md:col-span-8 grid grid-cols-12 items-center">
                          {/* Home Team (col-span-5): Logo on outer right, name on inner */}
                          <div className="col-span-5 flex items-center justify-start gap-2.5 min-w-0">
                            <img
                              src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
                              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                              alt=""
                              loading="lazy"
                            />
                            <span className="font-extrabold text-xs sm:text-sm text-zinc-100 truncate text-right">
                              {game.homeCompetitor.name}
                            </span>
                          </div>

                          {/* Center Score / Time (col-span-2): Exactly centered! */}
                          <div className="col-span-2 flex flex-col items-center justify-center text-center px-1">
                            {matchesSubTab === "results" ? (
                              <div className="flex items-center gap-1.5 font-black text-sm sm:text-base bg-gray-850 px-3 py-1 rounded-xl border border-gray-800 text-emerald-400 font-mono">
                                <span>{game.homeCompetitor.score}</span>
                                <span className="text-gray-600 font-normal">-</span>
                                <span>{game.awayCompetitor.score}</span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className="block font-bold text-xs sm:text-sm text-emerald-400 font-mono">
                                  {toLatinNumerals(new Date(game.startTime).toLocaleTimeString("ar-EG-u-nu-latn", { hour: '2-digit', minute: '2-digit' }))}
                                </span>
                                <span className="block text-[10px] text-gray-400 mt-0.5 whitespace-nowrap font-mono">
                                  {toLatinNumerals(new Date(game.startTime).toLocaleDateString("ar-EG-u-nu-latn", { month: 'short', day: 'numeric' }))}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Away Team (col-span-5): Name on inner, Logo on outer left */}
                          <div className="col-span-5 flex items-center justify-end gap-2.5 min-w-0">
                            <span className="font-extrabold text-xs sm:text-sm text-zinc-100 truncate text-left">
                              {game.awayCompetitor.name}
                            </span>
                            <img
                              src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
                              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
                              alt=""
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* 3. Left: Status Badge (md:col-span-2) */}
                        <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end">
                          <span className="text-xs font-semibold text-gray-400 bg-gray-850 border border-gray-800 px-3 py-1 rounded-full shrink-0">
                            {game.statusText || "لم تبدأ"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#131722]/80 border border-gray-800/60 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-3">حول المباريات</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  هنا تجد جدول المباريات والنتائج التفصيلية للفريق في جميع البطولات المشارك بها. انقر على أي مباراة لعرض البث والتحليلات.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "standings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Standings Tables */}
            <div className="lg:col-span-2 space-y-6">
              {processedTables.length > 0 ? (
                processedTables.map((table, tableIdx) => (
                  <div key={tableIdx} className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                    <div className="p-4 bg-gradient-to-l from-gray-800/30 to-transparent border-b border-gray-800/40">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {table.displayName || "جدول الترتيب"}
                      </h3>
                    </div>

                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-right border-collapse text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gray-800/30 text-gray-400 text-xs sm:text-sm font-semibold border-b border-gray-800">
                            <th className="py-3 px-4 text-center w-12">#</th>
                            <th className="py-3 px-4">الفريق</th>
                            <th className="py-3 px-2 text-center">لعب</th>
                            <th className="py-3 px-2 text-center">فوز</th>
                            <th className="py-3 px-2 text-center">تعادل</th>
                            <th className="py-3 px-2 text-center">خسارة</th>
                            <th className="py-3 px-2 text-center">له/عليه</th>
                            <th className="py-3 px-4 text-center font-bold text-white">النقاط</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/40">
                          {table.rows.map((row: any, i: number) => {
                            const isCurrentTeam = row.competitor.id === team.id;
                            return (
                              <tr
                                key={i}
                                className={`hover:bg-gray-800/20 transition-all ${isCurrentTeam ? "bg-green-500/10 font-bold border-r-4 border-r-emerald-500" : ""
                                  }`}
                              >
                                <td className="py-4 px-4 text-center text-xs sm:text-sm text-gray-400">
                                  {row.position}
                                </td>
                                <td className="py-4 px-4">
                                  <Link
                                    href={`/team/${row.competitor.id}`}
                                    className="flex items-center gap-3"
                                  >
                                    <img
                                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${row.competitor.id}`}
                                      alt=""
                                      className="w-6 h-6 object-contain"
                                    />
                                    <span className={isCurrentTeam ? "text-green-450 font-black animate-pulse" : "text-white"}>
                                      {row.competitor.name}
                                    </span>
                                  </Link>
                                </td>
                                <td className="py-4 px-2 text-center text-gray-300 font-semibold">{row.gamePlayed}</td>
                                <td className="py-4 px-2 text-center text-gray-400">{row.gamesWon}</td>
                                <td className="py-4 px-2 text-center text-gray-400">{row.gamesDrawn || row.gamesEven}</td>
                                <td className="py-4 px-2 text-center text-gray-400">{row.gamesLost}</td>
                                <td className="py-4 px-2 text-center text-gray-400 text-xs">
                                  {row.goalsFor !== undefined ? `${row.goalsFor}-${row.goalsAgainst}` : `${row.for}-${row.against}`}
                                </td>
                                <td className="py-4 px-4 text-center font-black text-green-400">{row.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-8 text-center text-gray-400 text-sm">
                  لا يتوفر جدول ترتيب حالياً لهذا الفريق.
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#131722]/80 border border-gray-800/60 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-3">دليل الألوان</h4>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                    المراكز المؤهلة لدوري أبطال أوروبا
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full" />
                    المراكز المؤهلة للدوري الأوروبي
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full" />
                    مراكز الهبوط
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-emerald-400" />
                أحدث الأخبار والتقارير الرياضية الخاصّة بـ {team.name}
              </h3>
              <Link href="/news" className="text-xs font-bold text-emerald-400 hover:underline">
                أرشيف الأخبار الكامل &larr;
              </Link>
            </div>

            {isTeamNewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse bg-[#131722]/90 border border-gray-800/60 rounded-2xl h-36" />
                ))}
              </div>
            ) : teamNewsArticles && teamNewsArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamNewsArticles.map((item: any) => (
                  <Link
                    key={item._id || item.slug}
                    href={`/news/${item.slug || item._id}`}
                    className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 flex flex-col sm:flex-row group hover:shadow-xl hover:shadow-black/30"
                  >
                    <div className="sm:w-1/3 h-44 sm:h-auto relative overflow-hidden bg-gray-950 shrink-0">
                      <img
                        src={
                          item.image_url && item.image_url.includes("res.cloudinary.com")
                            ? decodeURIComponent(item.image_url.split("/image/fetch/f_auto,q_auto/")[1] || item.image_url)
                            : item.image_url || "/new.png"
                        }
                        alt={item.headline_ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e: any) => {
                          e.currentTarget.src = "/new.png";
                        }}
                      />
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {item.source || "أنباء رياضية"}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-white mt-2 leading-snug group-hover:text-emerald-400 transition line-clamp-3">
                          {item.headline_ar}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 font-semibold border-t border-gray-800/50 pt-3 mt-4">
                        <span>{item.source}</span>
                        <span className="font-mono">
                          {item.published_at || item.created_at
                            ? toLatinNumerals(new Date(item.published_at || item.created_at).toLocaleDateString("ar-EG-u-nu-latn", {
                              day: "numeric",
                              month: "short",
                            }))
                            : "مباشر"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs bg-[#131722]/90 border border-gray-800/60 rounded-2xl">
                لا تتوفر أخبار لهذا الفريق حالياً.
              </div>
            )}
          </div>
        )}



        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Competition Selector with custom dark dropdown */}
              {activeCompetition && (
                <div ref={compDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (statsCompetitions.length > 1) {
                        setIsCompDropdownOpen(!isCompDropdownOpen);
                      }
                    }}
                    className={`w-full bg-[#131722]/90 border border-gray-800/70 rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-black/20 transition ${
                      statsCompetitions.length > 1 ? "hover:border-emerald-500/50 cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${activeCompetition.id}`}
                        alt={activeCompetition.name}
                        className="w-8 h-8 object-contain rounded-lg bg-zinc-900 border border-zinc-800 p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="font-extrabold text-sm sm:text-base text-white">
                        {activeCompetition.name}
                      </span>
                      {isStatsLoading && (
                        <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin shrink-0" />
                      )}
                    </div>

                    {statsCompetitions.length > 1 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                        <span>تغيير البطولة</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCompDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                    )}
                  </button>

                  {/* Dark Custom Dropdown Menu (Solves white background issue) */}
                  {isCompDropdownOpen && statsCompetitions.length > 1 && (
                    <div className="absolute top-full right-0 left-0 mt-2 z-50 rounded-2xl border border-zinc-750 bg-zinc-950/98 backdrop-blur-md p-2 shadow-2xl space-y-1 animate-fadeIn">
                      {statsCompetitions.map((comp: any) => {
                        const isSelected = comp.id === activeCompetition.id;
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setSelectedCompetitionId(comp.id);
                              setIsCompDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${comp.id}`}
                                alt=""
                                className="w-6 h-6 object-contain rounded bg-zinc-900 border border-zinc-800 p-0.5"
                              />
                              <span>{comp.name}</span>
                            </div>
                            {isSelected && (
                              <span className="text-emerald-400 text-xs font-black">✓ الحالي</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* View Mode Toggle: Image 3 Cards vs Table */}
              <div className="flex items-center justify-between gap-3 bg-[#131722]/60 border border-gray-800/40 rounded-xl p-2.5">
                <span className="text-xs font-bold text-gray-400">طريقة عرض الإحصائيات:</span>
                <div className="flex items-center gap-1 bg-gray-850 p-1 rounded-lg border border-gray-800 select-none">
                  <button
                    onClick={() => setStatsViewMode("cards")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      statsViewMode === "cards" ? "bg-emerald-500 text-zinc-950 font-black shadow-xs" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    بطاقات اللاعبين
                  </button>
                  <button
                    onClick={() => setStatsViewMode("table")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      statsViewMode === "table" ? "bg-emerald-500 text-zinc-950 font-black shadow-xs" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    جدول تفصيلي
                  </button>
                </div>
              </div>

              {/* Categories Display */}
              {isStatsLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 bg-[#131722]/90 border border-gray-800/60 rounded-2xl shadow-xl shadow-black/20">
                  <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm text-gray-300 font-bold">
                    جاري تحميل إحصائيات {activeCompetition?.name}...
                  </span>
                </div>
              ) : statCategories.length > 0 ? (
                <div className="space-y-6">
                  {statCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
                    >
                      {/* Category Header */}
                      <div className="p-4 bg-gradient-to-l from-gray-850/50 to-transparent border-b border-gray-800/60 flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-400" />
                          {category.name}
                        </h3>
                        <span className="text-xs text-gray-400 font-mono font-bold">
                          {category.rows.length} لاعبين
                        </span>
                      </div>

                      {/* Image 3 Style Cards View: Player on RIGHT, Stat badge on LEFT */}
                      {statsViewMode === "cards" ? (
                        <div className="divide-y divide-gray-800/40">
                          {category.rows.map((row: any, rIdx: number) => {
                            const statValue = row.stats?.[0]?.value ?? "0";
                            const countryName =
                              countriesMap.get(row.entity.countryId) ||
                              (row.entity.countryId === 16
                                ? "بلجيكا"
                                : row.entity.countryId === 2
                                ? "إسبانيا"
                                : row.entity.countryName || "");

                            return (
                              <div
                                key={rIdx}
                                className="flex items-center justify-between p-4 hover:bg-gray-800/20 transition-all group"
                              >
                                {/* Right Side (First child in RTL): Player Avatar + Info */}
                                <div className="flex items-center gap-3.5 min-w-0 text-right">
                                  {/* Circular Avatar on outer right edge */}
                                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-gray-700/60 bg-zinc-900 shrink-0 shadow-md">
                                    <img
                                      src={`https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_2,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v${row.entity.imageVersion || 1}/Athletes/${row.entity.id}`}
                                      alt={row.entity.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_Athletes:default.png/v1/Athletes/default";
                                      }}
                                      loading="lazy"
                                    />
                                  </div>

                                  {/* Text Info: Name & Position, Nationality */}
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-400 transition truncate">
                                        {row.entity.name}
                                      </span>
                                      {row.entity.positionName && (
                                        <span className="text-xs text-gray-400 font-medium">
                                          {row.entity.positionName}
                                        </span>
                                      )}
                                    </div>
                                    {countryName && (
                                      <span className="text-xs text-gray-400 font-semibold mt-0.5">
                                        {countryName}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Left Side (Second child in RTL): Bold dark stat badge */}
                                <div className="flex items-center justify-center min-w-[52px] px-3.5 py-2 rounded-xl bg-black/95 border border-zinc-800 text-white font-mono font-black text-sm sm:text-base shadow-inner group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition shrink-0">
                                  {statValue}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Table View */
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-sm">
                            <thead>
                              <tr className="border-b border-gray-800/60 bg-gray-850/40 text-xs font-semibold text-gray-400">
                                <th className="py-3 px-4 w-12 text-center">#</th>
                                <th className="py-3 px-4">اللاعب</th>
                                <th className="py-3 px-4">المركز</th>
                                <th className="py-3 px-4">الجنسية</th>
                                <th className="py-3 px-4 text-center font-bold text-emerald-400">
                                  {category.name}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/40">
                              {category.rows.map((row: any, rIdx: number) => {
                                const countryName =
                                  countriesMap.get(row.entity.countryId) ||
                                  (row.entity.countryId === 16
                                    ? "بلجيكا"
                                    : row.entity.countryId === 2
                                    ? "إسبانيا"
                                    : row.entity.countryName || "");

                                return (
                                  <tr
                                    key={rIdx}
                                    className="hover:bg-gray-800/30 transition-colors group"
                                  >
                                    <td className="py-3 px-4 text-center text-xs text-gray-400 font-mono">
                                      {rIdx + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700 bg-zinc-900 shrink-0">
                                          <img
                                            src={`https://imagecache.365scores.com/image/upload/f_png,w_80,h_80,c_limit,q_auto:eco,dpr_2,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v${row.entity.imageVersion || 1}/Athletes/${row.entity.id}`}
                                            alt={row.entity.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.src =
                                                "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_Athletes:default.png/v1/Athletes/default";
                                            }}
                                            loading="lazy"
                                          />
                                        </div>
                                        <span className="font-bold text-white group-hover:text-emerald-400 transition">
                                          {row.entity.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-xs text-gray-400">{row.entity.positionName || "-"}</td>
                                    <td className="py-3 px-4 text-xs text-gray-400">{countryName || "-"}</td>
                                    <td className="py-3 px-4 text-center font-black font-mono text-emerald-400 text-sm">
                                      {row.stats?.[0]?.value || "0"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-10 text-center text-gray-400 text-sm">
                  لا تتوفر إحصائيات للاعبين حالياً في {activeCompetition?.name || "هذه البطولة"}.
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#131722]/80 border border-gray-800/60 p-6 rounded-2xl text-center text-gray-400 shadow-xl shadow-black/20">
                <TrendingUp className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-2">إحصائيات مباشرة ومحدثة</h4>
                <p className="text-xs leading-relaxed text-zinc-400">
                  يتم تحديث الإحصائيات الفردية للاعبين (الأهداف، الأهداف المتوقعة، التمريرات، والبطاقات) تلقائياً بعد نهاية كل مباراة في البطولات الرسمية.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "squad" && (
          <div className="space-y-8">
            {[
              { title: "حراس المرمى", players: squadByPosition.goalkeepers },
              { title: "المدافعون", players: squadByPosition.defenders },
              { title: "خط الوسط", players: squadByPosition.midfielders },
              { title: "المهاجمون", players: squadByPosition.forwards },
              { title: "أعضاء آخرون", players: squadByPosition.others },
            ].map((section, idx) => {
              if (section.players.length === 0) return null;
              return (
                <div key={idx} className="space-y-4">
                  <h3 className="text-lg font-black text-green-400 border-r-4 border-green-500 pr-3">
                    {section.title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {section.players.map((player: any) => (
                      <div
                        key={player.id}
                        className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-700/60 hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                      >
                        <div className="absolute top-2 left-3 text-xxs font-black text-gray-600 group-hover:text-green-500/30 transition-all">
                          #{player.id}
                        </div>

                        {/* Player Avatar */}
                        <div className="w-14 h-14 bg-gray-800 rounded-full overflow-hidden border border-gray-700/40 relative shrink-0">
                          <img
                            src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/${player.id}`}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/default";
                            }}
                          />
                        </div>

                        {/* Player details */}
                        <div className="flex-1 min-w-0">
                          <span className="block font-extrabold text-sm text-white truncate">{player.name}</span>
                          <div className="flex items-center gap-2 mt-1 text-xxs text-gray-400 font-semibold">
                            <span>العمر: {player.age}</span>
                            <span>•</span>
                            <span className="text-green-400">الرقم: {player.jerseyNum || "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "transfers" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Arrivals (قدوم) */}
            <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h3 className="text-lg font-black text-green-400 border-r-4 border-green-500 pr-3 mb-6">
                قدوم (القادمون الجدد)
              </h3>

              {mappedTransfers.incoming.length > 0 ? (
                <div className="space-y-4">
                  {mappedTransfers.incoming.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-850/40 border border-gray-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative border border-gray-700/50 shrink-0">
                          <img
                            src={`https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/${item.athleteId}`}
                            alt={item.athlete?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/default";
                            }}
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-sm sm:text-base text-white">{item.athlete?.name}</span>
                          <span className="text-xxs text-gray-500 block mt-0.5">
                            {toLatinNumerals(new Date(item.time).toLocaleDateString("ar-EG-u-nu-latn", { year: 'numeric', month: 'short', day: 'numeric' }))}
                          </span>
                        </div>
                      </div>

                      {/* Direction and price */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0 shrink-0">
                        {item.originClub && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xxs text-gray-400">من</span>
                            <img
                              src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${item.originClub.id}`}
                              alt=""
                              className="w-5 h-5 object-contain"
                            />
                            <span className="text-xs text-gray-400 truncate max-w-[80px]">{item.originClub.name}</span>
                          </div>
                        )}

                        <div className="text-right">
                          <span className="block text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                            {item.price || "انتقال حر"}
                          </span>
                          <span className="text-xxs text-gray-500 block mt-0.5">{item.statusName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  لا توجد صفقات قدوم مسجلة مؤخراً.
                </div>
              )}
            </div>

            {/* Departures (مغادرة) */}
            <div className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h3 className="text-lg font-black text-red-400 border-r-4 border-red-500 pr-3 mb-6">
                مغادرة (المغادرون)
              </h3>

              {mappedTransfers.outgoing.length > 0 ? (
                <div className="space-y-4">
                  {mappedTransfers.outgoing.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-850/40 border border-gray-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative border border-gray-700/50 shrink-0">
                          <img
                            src={`https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/${item.athleteId}`}
                            alt={item.athlete?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/default";
                            }}
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-sm sm:text-base text-white">{item.athlete?.name}</span>
                          <span className="text-xxs text-gray-500 block mt-0.5">
                            {toLatinNumerals(new Date(item.time).toLocaleDateString("ar-EG-u-nu-latn", { year: 'numeric', month: 'short', day: 'numeric' }))}
                          </span>
                        </div>
                      </div>

                      {/* Direction and price */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0 shrink-0">
                        {item.targetClub && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xxs text-gray-400">إلى</span>
                            <img
                              src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${item.targetClub.id}`}
                              alt=""
                              className="w-5 h-5 object-contain"
                            />
                            <span className="text-xs text-gray-400 truncate max-w-[80px]">{item.targetClub.name}</span>
                          </div>
                        )}

                        <div className="text-right">
                          <span className="block text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            {item.price || "انتقال حر"}
                          </span>
                          <span className="text-xxs text-gray-500 block mt-0.5">{item.statusName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  لا توجد صفقات مغادرة مسجلة مؤخراً.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contextual In-Page Responsive Banner */}
        <ResponsiveAdBanner className="mt-8" />
      </div>
    </div>
  );
}
