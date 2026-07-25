"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, Award, Star, Trophy, Clock, 
  ArrowLeftRight, Info, Shield, Users, 
  TrendingUp, Activity, HelpCircle, ChevronDown, 
  ChevronUp, Newspaper, Network, ChevronLeft, ChevronRight
} from "lucide-react";
import { generateMatchSlug } from "@/lib/matchSlug";

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
  const [isFollowed, setIsFollowed] = useState(false);
  const [followCount, setFollowCount] = useState(team.popularityRank || 86200);

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
            <span className={`font-bold truncate text-right ${
              hasPlayed 
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
            <span className={`font-bold truncate text-right ${
              hasPlayed 
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
        .replace(/365/g, "yallashoot");
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

  // Categories in competitor stats
  const statCategories = React.useMemo(() => {
    if (stats && Array.isArray(stats.athletesStats)) {
      return stats.athletesStats.map((cat: any) => {
        let arabicName = cat.name;
        if (cat.id === 1) arabicName = "الأهداف";
        else if (cat.id === 10) arabicName = "التمريرات الحاسمة";
        else if (cat.id === 3) arabicName = "البطاقات الصفراء";
        else if (cat.id === 4) arabicName = "البطاقات الحمراء";

        return {
          id: cat.id,
          name: arabicName,
          rows: cat.rows || [],
        };
      });
    }
    return [];
  }, [stats]);

  const activeStatCategory = React.useMemo(() => {
    return statCategories.find((c: any) => c.id === selectedStatTypeId) || statCategories[0] || null;
  }, [statCategories, selectedStatTypeId]);

  const handleFollowToggle = () => {
    if (isFollowed) {
      setIsFollowed(false);
      setFollowCount((prev: number) => prev - 1);
    } else {
      setIsFollowed(true);
      setFollowCount((prev: number) => prev + 1);
    }
  };

  const teamColor = team.color || "#075C9C";

  // Dynamic news generated dynamically based on team name
  const newsList = React.useMemo(() => {
    return [
      {
        title: `تقرير شامل: آخر تطورات صفقات ${team.name} في فترة الانتقالات الحالية`,
        time: "منذ ساعتين",
        source: "يلا شوت دوت كوم",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: `المدرب يؤكد جاهزية لاعبي ${team.name} التامة للمواجهة المقبلة الصعبة`,
        time: "منذ 5 ساعات",
        source: "أخبار كرة القدم",
        image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: `رسمياً: الكشف عن التصميم البديل لقميص ${team.name} للموسم الرياضي الجديد`,
        time: "منذ 8 ساعات",
        source: "يلا شوت الرياضي",
        image: "https://images.unsplash.com/photo-1577223625856-74558e918770?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: `ترقب جماهيري كبير لحضور جماهير ${team.name} في مباراة القمة نهاية هذا الأسبوع`,
        time: "منذ يوم واحد",
        source: "صحيفة الملاعب",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop"
      }
    ];
  }, [team.name]);

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
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md mb-2 flex items-center justify-center sm:justify-start gap-3">
                  {team.name}
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full">
                    {team.symbolicName}
                  </span>
                </h1>
                <div className="text-gray-400 text-sm sm:text-base flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4.5 h-4.5 text-gray-500" />
                    {team.type === 2 ? "منتخب وطني" : `تأسس في ${team.createdAt ? new Date(team.createdAt).getFullYear() : "غير معروف"}`}
                  </span>
                  <span>•</span>
                  <span>{followCount.toLocaleString()} متابع</span>
                </div>
              </div>
            </div>

            {/* Actions (Follow button) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
                  isFollowed 
                    ? "bg-transparent border border-green-500 text-green-500" 
                    : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 active:scale-95"
                }`}
              >
                <Star className={`w-5 h-5 ${isFollowed ? "fill-green-500" : ""}`} />
                {isFollowed ? "متابع" : "متابعة"}
              </button>
            </div>
          </div>

          {/* Tab bar navigation */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-gray-800/85 mt-10">
            {[
              { id: "overview", label: "التفاصيل", icon: Shield },
              { id: "matches", label: "المباريات", icon: Calendar },
              { id: "standings", label: "الترتيب", icon: Trophy },
              { id: "news", label: "أخبار", icon: Newspaper },
              { id: "knockout", label: "خروج المغلوب", icon: Network },
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
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    isActive 
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
                      {new Date(nextMatch.startTime).toLocaleDateString("ar-MA", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                        className={`flex-1 min-w-[70px] flex flex-col items-center p-3 rounded-xl border ${
                          item.result === "W" 
                            ? "bg-green-950/20 border-green-500/30" 
                            : item.result === "L" 
                              ? "bg-red-950/20 border-red-500/30" 
                              : "bg-gray-800/30 border-gray-700/30"
                        }`}
                      >
                        <span className={`text-base font-black mb-2 ${
                          item.result === "W" ? "text-green-400" : item.result === "L" ? "text-red-400" : "text-gray-400"
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
                    className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all cursor-pointer ${
                      matchesSubTab === "fixtures" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    جدول المباريات
                  </button>
                  <button
                    onClick={() => setMatchesSubTab("results")}
                    className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all cursor-pointer ${
                      matchesSubTab === "results" ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-white"
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
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-gray-500 font-semibold">{game.competitionDisplayName}</div>
                        
                        <div className="flex items-center gap-6 justify-center w-full sm:w-auto">
                          <div className="flex items-center gap-3 text-right">
                            <span className="font-extrabold text-sm sm:text-base">{game.homeCompetitor.name}</span>
                            <img src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`} className="w-8 h-8 object-contain" alt="" />
                          </div>

                          {matchesSubTab === "results" ? (
                            <div className="flex items-center gap-2 font-black text-lg bg-gray-850 px-4 py-1.5 rounded-xl border border-gray-800 text-green-400">
                              <span>{game.homeCompetitor.score}</span>
                              <span className="text-gray-600 font-normal">-</span>
                              <span>{game.awayCompetitor.score}</span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="block font-bold text-sm text-green-400">
                                {new Date(game.startTime).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="block text-xxs text-gray-400 mt-0.5 whitespace-nowrap">
                                {new Date(game.startTime).toLocaleDateString("ar-MA", { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-left">
                            <img src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`} className="w-8 h-8 object-contain" alt="" />
                            <span className="font-extrabold text-sm sm:text-base">{game.awayCompetitor.name}</span>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-gray-400 bg-gray-850 border border-gray-800 px-3 py-1 rounded-full shrink-0">
                          {game.statusText || "مجدولة"}
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
                                className={`hover:bg-gray-800/20 transition-all ${
                                  isCurrentTeam ? "bg-green-500/10 font-bold border-r-4 border-r-emerald-500" : ""
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
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-green-500" />
              أحدث الأخبار والتقارير الرياضية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsList.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-[#131722]/90 border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 flex flex-col sm:flex-row group hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="sm:w-1/3 h-44 sm:h-auto relative overflow-hidden bg-gray-950 shrink-0">
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">رياضة</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-white mt-2 leading-snug line-clamp-3">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-xxs text-gray-500 font-semibold border-t border-gray-800/50 pt-3 mt-4">
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "knockout" && (
          <div className="space-y-6 animate-fadeIn">
            {brackets && Array.isArray(brackets.stages) ? (
              <div className="bg-[#131722]/90 border border-gray-800/60 p-6 rounded-2xl shadow-xl shadow-black/20">
                {/* Competition name as title and navigation arrows */}
                <div className="flex items-center justify-between mb-8 border-b border-gray-800/60 pb-4">
                  {/* Left Arrow Button */}
                  <div className="w-10">
                    {hasR32 && (
                      <button 
                        onClick={() => scrollBrackets("left")} 
                        className="p-2 bg-gray-850 hover:bg-gray-800 text-white rounded-xl border border-gray-800 transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center"
                        title="الرجوع للنهائي"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
                      </button>
                    )}
                  </div>

                  {/* Center Title */}
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />
                    {brackets.knockoutTitle || "الأدوار الإقصائية"}
                  </h3>

                  {/* Right Arrow Button */}
                  <div className="w-10 text-left">
                    {hasR32 && (
                      <button 
                        onClick={() => scrollBrackets("right")} 
                        className="p-2 bg-gray-850 hover:bg-gray-800 text-white rounded-xl border border-gray-800 transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center"
                        title="عرض دور الـ 32"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Brackets horizontal columns wrapper */}
                {(() => {
                  const heightVal = hasR32 ? "1200px" : "600px";

                  return (
                    <div 
                      ref={bracketsScrollRef}
                      className="flex flex-row-reverse items-start justify-start gap-0 overflow-x-auto py-12 px-4 select-none scrollbar-none min-w-[900px] relative"
                    >
                      {/* Column 0: Round of 32 (دور الـ 32) */}
                      {hasR32 && brackets.stages.find((s: any) => s.num === 2) && (
                        <div className="flex flex-col items-center shrink-0 z-10 w-[200px]">
                          {/* Header */}
                          <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                            دور الـ 32
                          </div>
                          {/* Matches */}
                          <div className="flex flex-col justify-around w-full" style={{ height: heightVal }}>
                            {brackets.stages.find((s: any) => s.num === 2).groups.slice(0, 16).map((group: any, i: number) => (
                              <div key={i} className="flex justify-center">
                                {renderBracketCard(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SVG Connector 0 (R32 to R16) */}
                      {hasR32 && brackets.stages.find((s: any) => s.num === 2) && brackets.stages.find((s: any) => s.num === 3) && (
                        <div className="hidden md:flex flex-col justify-around w-12 shrink-0 relative z-0 mt-[44px]" style={{ height: heightVal }}>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <svg key={i} className="w-full h-[150px] text-gray-700/60" viewBox="0 0 48 150" fill="none">
                              <path d="M 0 37.5 L 24 37.5 L 24 112.5 L 0 112.5 M 24 75 L 48 75" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          ))}
                        </div>
                      )}

                      {/* Column 1: Round of 16 (دور الـ 16) */}
                      {brackets.stages.find((s: any) => s.num === 3) && (
                        <div className="flex flex-col items-center shrink-0 z-10 w-[200px]">
                          {/* Header */}
                          <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                            دور الـ 16
                          </div>
                          {/* Matches */}
                          <div className="flex flex-col justify-around w-full" style={{ height: heightVal }}>
                            {brackets.stages.find((s: any) => s.num === 3).groups.slice(0, 8).map((group: any, i: number) => (
                              <div key={i} className="flex justify-center">
                                {renderBracketCard(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SVG Connector 1 (R16 to QF) */}
                      {brackets.stages.find((s: any) => s.num === 3) && brackets.stages.find((s: any) => s.num === 4) && (
                        <div className="hidden md:flex flex-col justify-around w-12 shrink-0 relative z-0 mt-[44px]" style={{ height: heightVal }}>
                          {Array.from({ length: 4 }).map((_, i) => {
                            const svgHeight = hasR32 ? 300 : 150;
                            const viewboxY = hasR32 ? 300 : 150;
                            const p1y = hasR32 ? 75 : 37.5;
                            const p2y = hasR32 ? 225 : 112.5;
                            const midy = hasR32 ? 150 : 75;
                            return (
                              <svg key={i} className="w-full text-gray-700/60" style={{ height: `${svgHeight}px` }} viewBox={`0 0 48 ${viewboxY}`} fill="none">
                                <path d={`M 0 ${p1y} L 24 ${p1y} L 24 ${p2y} L 0 ${p2y} M 24 ${midy} L 48 ${midy}`} stroke="currentColor" strokeWidth="2" />
                              </svg>
                            );
                          })}
                        </div>
                      )}

                      {/* Column 2: Quarter-finals (ربع النهائي) */}
                      {brackets.stages.find((s: any) => s.num === 4) && (
                        <div className="flex flex-col items-center shrink-0 z-10 w-[200px]">
                          {/* Header */}
                          <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                            ربع النهائي
                          </div>
                          {/* Matches */}
                          <div className="flex flex-col justify-around w-full" style={{ height: heightVal }}>
                            {brackets.stages.find((s: any) => s.num === 4).groups.slice(0, 4).map((group: any, i: number) => (
                              <div key={i} className="flex justify-center">
                                {renderBracketCard(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SVG Connector 2 (QF to SF) */}
                      {brackets.stages.find((s: any) => s.num === 4) && brackets.stages.find((s: any) => s.num === 5) && (
                        <div className="hidden md:flex flex-col justify-around w-12 shrink-0 relative z-0 mt-[44px]" style={{ height: heightVal }}>
                          {Array.from({ length: 2 }).map((_, i) => {
                            const svgHeight = hasR32 ? 600 : 300;
                            const viewboxY = hasR32 ? 600 : 300;
                            const p1y = hasR32 ? 150 : 75;
                            const p2y = hasR32 ? 450 : 225;
                            const midy = hasR32 ? 300 : 150;
                            return (
                              <svg key={i} className="w-full text-gray-700/60" style={{ height: `${svgHeight}px` }} viewBox={`0 0 48 ${viewboxY}`} fill="none">
                                <path d={`M 0 ${p1y} L 24 ${p1y} L 24 ${p2y} L 0 ${p2y} M 24 ${midy} L 48 ${midy}`} stroke="currentColor" strokeWidth="2" />
                              </svg>
                            );
                          })}
                        </div>
                      )}

                      {/* Column 3: Semi-finals (نصف النهائي) */}
                      {brackets.stages.find((s: any) => s.num === 5) && (
                        <div className="flex flex-col items-center shrink-0 z-10 w-[200px]">
                          {/* Header */}
                          <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                            نصف النهائي
                          </div>
                          {/* Matches */}
                          <div className="flex flex-col justify-around w-full" style={{ height: heightVal }}>
                            {brackets.stages.find((s: any) => s.num === 5).groups.slice(0, 2).map((group: any, i: number) => (
                              <div key={i} className="flex justify-center">
                                {renderBracketCard(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SVG Connector 3 (SF to Final) */}
                      {brackets.stages.find((s: any) => s.num === 5) && brackets.stages.find((s: any) => s.num === 6) && (
                        <div className="hidden md:flex flex-col justify-around w-12 shrink-0 relative z-0 mt-[44px]" style={{ height: heightVal }}>
                          {(() => {
                            const svgHeight = hasR32 ? 1200 : 600;
                            const viewboxY = hasR32 ? 1200 : 600;
                            const p1y = hasR32 ? 300 : 150;
                            const p2y = hasR32 ? 900 : 450;
                            const midy = hasR32 ? 600 : 300;
                            return (
                              <svg className="w-full text-gray-700/60" style={{ height: `${svgHeight}px` }} viewBox={`0 0 48 ${viewboxY}`} fill="none">
                                <path d={`M 0 ${p1y} L 24 ${p1y} L 24 ${p2y} L 0 ${p2y} M 24 ${midy} L 48 ${midy}`} stroke="currentColor" strokeWidth="2" />
                              </svg>
                            );
                          })()}
                        </div>
                      )}

                      {/* Column 4: Final & Third Place (النهائي) */}
                      {brackets.stages.find((s: any) => s.num === 6) && (
                        <div className="flex flex-col items-center shrink-0 z-10 w-[280px]">
                          {/* Header */}
                          <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                            النهائي
                          </div>

                          <div className="flex flex-col justify-between w-full" style={{ height: heightVal }}>
                             {/* Final match card (Large & Premium in the center) */}
                             {(() => {
                               const finalGroup = brackets.stages.find((s: any) => s.num === 6).groups[0];
                               if (!finalGroup) return null;
                               const p1 = finalGroup.participants?.[0] || { name: "مجهول" };
                               const p2 = finalGroup.participants?.[1] || { name: "مجهول" };
                               const score1 = finalGroup.score?.[0];
                               const score2 = finalGroup.score?.[1];
                               const hasPlayed = score1 !== undefined && score1 !== null && score1 !== -1;
                               const gameRecord = finalGroup.games?.[0];

                               const isWinner1 = finalGroup.toQualify === 1;
                               const isWinner2 = finalGroup.toQualify === 2;
                               
                               const dateFormatted = gameRecord?.startTime 
                                 ? new Date(gameRecord.startTime).toLocaleDateString("ar-MA", { weekday: 'short', day: 'numeric', month: 'short' })
                                 : "الأحد, 19 يوليو";
                               
                               const timeFormatted = gameRecord?.startTime
                                 ? new Date(gameRecord.startTime).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })
                                 : "08:00 م";

                               return (
                                 <div className="flex justify-center flex-1 flex-col justify-center">
                                   <div className="bg-[#121214] border border-yellow-500/20 rounded-2xl p-4 w-[240px] shrink-0 text-xs flex flex-col relative shadow-xl shadow-yellow-950/5">
                                     {/* Date/Time Header */}
                                     <div className="text-[10px] text-gray-500 font-semibold mb-3 text-right">
                                       {dateFormatted} • {timeFormatted}
                                     </div>

                                     <div className="flex items-center justify-between gap-3">
                                       {/* Teams list */}
                                       <div className="flex-1 flex flex-col gap-2.5 min-w-0">
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
                                             <span className={`font-bold truncate text-right ${hasPlayed ? (isWinner1 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                               {p1.name}
                                             </span>
                                           </div>
                                           {hasPlayed && (
                                             <span className={`font-bold ${isWinner1 ? "text-white text-sm" : "text-gray-500 text-sm"}`}>
                                               {score1}
                                             </span>
                                           )}
                                         </div>

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
                                             <span className={`font-bold truncate text-right ${hasPlayed ? (isWinner2 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                               {p2.name}
                                             </span>
                                           </div>
                                           {hasPlayed && (
                                             <span className={`font-bold ${isWinner2 ? "text-white text-sm" : "text-gray-500 text-sm"}`}>
                                               {score2}
                                             </span>
                                           )}
                                         </div>
                                       </div>

                                       {/* Trophy */}
                                       <div className="flex items-center justify-center pr-2 border-r border-gray-800/80 h-10">
                                         <Trophy className="w-8 h-8 text-yellow-500 animate-pulse" />
                                       </div>
                                     </div>

                                     {/* Badge */}
                                     <div className="mt-3 flex items-center justify-center">
                                       <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-full">
                                         النهائي
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                               );
                             })()}

                             {/* Third place play-off */}
                             {(() => {
                               const thirdGroup = brackets.stages.find((s: any) => s.num === 6).groups[1];
                               if (!thirdGroup) return <div className="h-20" />;
                               const p1 = thirdGroup.participants?.[0] || { name: "مجهول" };
                               const p2 = thirdGroup.participants?.[1] || { name: "مجهول" };
                               const score1 = thirdGroup.score?.[0];
                               const score2 = thirdGroup.score?.[1];
                               const hasPlayed = score1 !== undefined && score1 !== null && score1 !== -1;
                               const gameRecord = thirdGroup.games?.[0];

                               const isWinner1 = hasPlayed && score1 > score2;
                               const isWinner2 = hasPlayed && score2 > score1;

                               const dateFormatted = gameRecord?.startTime 
                                 ? new Date(gameRecord.startTime).toLocaleDateString("ar-MA", { weekday: 'short', day: 'numeric', month: 'short' })
                                 : "السبت, 18 يوليو";
                               
                               const timeFormatted = gameRecord?.startTime
                                 ? new Date(gameRecord.startTime).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })
                                 : "10:00 م";

                               return (
                                 <div className="flex justify-center pb-4 shrink-0">
                                   <div className="bg-[#121214] border border-gray-800/80 rounded-2xl p-4 w-[240px] shrink-0 text-xs flex flex-col relative shadow-lg">
                                     {/* Date/Time Header */}
                                     <div className="text-[10px] text-gray-500 font-semibold mb-3 text-right">
                                       {dateFormatted} • {timeFormatted}
                                     </div>

                                     <div className="flex flex-col gap-2.5">
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
                                           <span className={`font-bold truncate text-right ${hasPlayed ? (isWinner1 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                             {p1.name}
                                           </span>
                                         </div>
                                         <span className={`font-bold ${hasPlayed ? (isWinner1 ? "text-white text-sm" : "text-gray-500 text-sm") : "text-gray-500 text-sm"}`}>
                                           {hasPlayed ? score1 : "-"}
                                         </span>
                                       </div>

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
                                           <span className={`font-bold truncate text-right ${hasPlayed ? (isWinner2 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                             {p2.name}
                                           </span>
                                         </div>
                                         <span className={`font-bold ${hasPlayed ? (isWinner2 ? "text-white text-sm" : "text-gray-500 text-sm") : "text-gray-500 text-sm"}`}>
                                           {hasPlayed ? score2 : "-"}
                                         </span>
                                       </div>
                                     </div>

                                     {/* Badge */}
                                     <div className="mt-3 flex items-center justify-center">
                                       <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2.5 py-0.5 rounded-full">
                                         المركز الثالث
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                               );
                             })()}
                           </div>
                        </div>
                      )}

                    </div>
                  );
                })()}


              </div>
            ) : (
              <div className="bg-[#131722]/80 border border-gray-800/60 p-12 rounded-2xl text-center text-gray-400">
                <Network className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                لا تتوفر تفاصيل خروج مغلوب (Brackets) حالياً للفريق في هذا الموسم.
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#131722]/90 border border-gray-800/60 rounded-2xl p-6 shadow-xl shadow-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  إحصائيات أداء اللاعبين الفردية
                </h3>

                {/* Category selector dropdown */}
                {statCategories.length > 0 && (
                  <div className="relative inline-block w-48 text-xs sm:text-sm">
                    <select
                      value={selectedStatTypeId}
                      onChange={(e) => setSelectedStatTypeId(Number(e.target.value))}
                      className="w-full bg-gray-850 border border-gray-800 text-white rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-green-500 transition-all font-bold appearance-none"
                    >
                      {statCategories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                )}
              </div>

              {activeStatCategory && activeStatCategory.rows.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeStatCategory.rows.map((row: any, index: number) => (
                    <div 
                      key={index}
                      className="bg-gray-800/20 border border-gray-800/40 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700/60 transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative shrink-0">
                        <img 
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/${row.entity.id}`} 
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/default";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-extrabold text-sm sm:text-base text-white truncate">{row.entity.name}</span>
                        <span className="text-xxs text-gray-450 mt-0.5 block">{row.entity.positionName || "لاعب"}</span>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="block text-lg font-black text-green-400">{row.stats?.[0]?.value || "0"}</span>
                        <span className="text-xxs text-gray-500 font-semibold">{activeStatCategory.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  لا تتوفر إحصائيات لهذه الفئة حالياً.
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#131722]/80 border border-gray-800/60 p-6 rounded-2xl text-center text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-xs leading-relaxed">
                  يتم تحديث الإحصائيات الفردية للاعبين تلقائياً بعد نهاية كل مباراة في البطولات الرسمية.
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
                            {new Date(item.time).toLocaleDateString("ar-MA", { year: 'numeric', month: 'short', day: 'numeric' })}
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
                            {new Date(item.time).toLocaleDateString("ar-MA", { year: 'numeric', month: 'short', day: 'numeric' })}
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
      </div>
    </div>
  );
}
