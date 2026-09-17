import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, ChevronLeft, Trophy, Star, Clock, Play } from "lucide-react";
import { getCompetitionStandings, getCompetitionGames, getCompetitionScorers, getCompetitionBrackets } from "@/services/api";
import SidebarLeagues from "@/components/SidebarLeagues";
import StandingsBrackets from "@/components/StandingsBrackets";
import { toLatinNumerals } from "@/lib/utils";
import ResponsiveAdBanner from "@/components/ads/ResponsiveAdBanner";

type RouteParams = {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ live?: string; tab?: string }>;
};

/**
 * Dynamic SEO Metadata for Standings page
 */
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { leagueId } = await params;
  try {
    const data = await getCompetitionStandings(leagueId, false);
    if (!data || !data.standings || data.standings.length === 0) {
      return {
        title: "جدول ترتيب الدوري - يلا شوت لايف",
        alternates: {
          canonical: `/standings/${leagueId}`,
        },
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    const leagueName = data.standings[0].displayName || "الدوري";
    const titleText = `جدول ترتيب ${leagueName} | الترتيب العام والمؤهلات`;
    const descText = `جدول ترتيب ${leagueName} بالتفصيل مع عدد النقاط، المباريات الملعوبة، الأهداف المسجلة والمستقبلة، والفرق المتأهلة للبطولات القارية.`;

    return {
      title: titleText,
      description: descText,
      alternates: {
        canonical: `/standings/${leagueId}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "ترتيب الدوري - يلا شوت لايف",
      alternates: {
        canonical: `/standings/${leagueId}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

/**
 * Standings Page Component
 */
export default async function StandingsPage({ params, searchParams }: RouteParams) {
  const { leagueId } = await params;
  const { live, tab } = await searchParams;
  const isLive = live === "true";

  const numLeagueId = parseInt(leagueId, 10);

  // Parallel fetch: standings table, games/results, scorers stats, and brackets data
  const [standingsData, currentGames, scorers, bracketsRes] = await Promise.all([
    getCompetitionStandings(leagueId, isLive),
    getCompetitionGames(leagueId),
    getCompetitionScorers(leagueId),
    getCompetitionBrackets(leagueId).catch(() => null)
  ]);

  let brackets = null;
  if (bracketsRes && bracketsRes.brackets) {
    brackets = Array.isArray(bracketsRes.brackets)
      ? bracketsRes.brackets[0]
      : bracketsRes.brackets;
  }
  const hasBrackets = !!(brackets && Array.isArray(brackets.stages) && brackets.stages.length > 0);
  const hasStandings = !!(standingsData && standingsData.standings && standingsData.standings.length > 0);
  const hasGames = !!(currentGames && currentGames.length > 0);
  const hasScorers = !!(scorers && scorers.length > 0);

  // 404 only if all sources are empty
  if (!hasStandings && !hasGames && !hasBrackets && !hasScorers) {
    notFound();
  }

  // Dynamic default tab depending on what data exists
  let defaultTab = "standings";
  if (!hasStandings) {
    if (hasBrackets) {
      defaultTab = "knockout";
    } else if (hasGames) {
      const completedGames = currentGames.filter((g: any) => g.statusGroup === 4);
      if (completedGames.length > 0) {
        defaultTab = "results";
      } else {
        defaultTab = "fixtures";
      }
    } else {
      defaultTab = "scorers";
    }
  }

  const activeTab = tab || defaultTab;

  const getLeagueNameFallback = (id: number) => {
    const map: Record<number, string> = {
      5930: "كأس العالم",
      572: "دوري أبطال أوروبا",
      7: "الدوري الإنجليزي الممتاز",
      11: "الدوري الإسباني",
      649: "الدوري السعودي",
      624: "دوري أبطال أفريقيا",
      557: "البطولة المغربية الاحترافية",
      8935: "الدوري المصري الممتاز",
      623: "دوري أبطال آسيا",
      329: "الدوري الأوروبي",
      167: "كأس أمم أفريقيا",
      17: "الدوري الإيطالي",
      25: "الدوري الألماني",
      35: "الدوري الفرنسي",
      573: "كأس أمم أوروبا",
    };
    return map[id] || "جدول ترتيب الدوري";
  };

  let leagueName = "";
  if (hasStandings) {
    leagueName = standingsData.standings[0].displayName || "جدول ترتيب الدوري";
  } else if (hasGames) {
    const firstGame = currentGames[0];
    if (firstGame.competition && firstGame.competition.name) {
      leagueName = firstGame.competition.name;
    }
  }
  if (!leagueName) {
    leagueName = getLeagueNameFallback(numLeagueId);
  }

  const visibleTabs = [];
  if (hasStandings) visibleTabs.push("standings");
  visibleTabs.push("scorers");
  visibleTabs.push("results");
  visibleTabs.push("fixtures");

  const tabColsClass = 
    visibleTabs.length === 4 ? "grid-cols-2 sm:grid-cols-4" :
    "grid-cols-3";

  const getLeagueCountry = (id: number) => {
    const map: Record<number, string> = {
      5930: "دولي",
      572: "أوروبا",
      7: "إنجلترا",
      11: "إسبانيا",
      649: "السعودية",
      624: "أفريقيا",
      557: "المغرب",
      8935: "مصر",
      623: "آسيا",
      329: "أوروبا",
      167: "أفريقيا",
      17: "إيطاليا",
      25: "ألمانيا",
      35: "فرنسا",
      573: "أوروبا",
    };
    return map[id] || "دولي";
  };

  // Process tables: If a competition has multiple groups mapped inside a single table (e.g. World Cup),
  // split them into distinct tables dynamically for a proper layout.
  let processedTables: Array<{ displayName: string; rows: any[]; destinations?: any[] }> = [];

  if (hasStandings) {
    standingsData.standings.forEach((table) => {
      if (table.groups && table.groups.length > 1) {
        table.groups.forEach((g: any) => {
          const groupRows = table.rows.filter((row: any) => row.groupNum === g.num);
          processedTables.push({
            displayName: g.name,
            rows: groupRows,
            destinations: table.destinations
          });
        });
      } else {
        processedTables.push({
          displayName: table.displayName || "الترتيب",
          rows: table.rows,
          destinations: table.destinations
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">

      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 mb-6 transition"
      >
        <ChevronLeft className="h-4 w-4" />
        العودة للرئيسية
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar leagues */}
        <SidebarLeagues activeLeagueId={numLeagueId} />

        {/* Standings Grid Area */}
        <div className="flex-1 space-y-6">

          {/* Header Card (League Banner) */}
          <div className="relative overflow-hidden bg-gradient-to-l from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-row items-center justify-between shadow-xl">
            <div className="z-10 text-right">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                {leagueName} 2026/2027
              </h1>
              <span className="inline-block text-xs font-bold text-emerald-450 mt-2 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30">
                {getLeagueCountry(numLeagueId)}
              </span>
            </div>

            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-zinc-900 border border-zinc-800 p-2.5 flex items-center justify-center shadow-inner shrink-0 z-10">
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${leagueId}`}
                alt={leagueName}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Subtle background glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Tabs Navigation */}
          <div className={`grid ${tabColsClass} gap-2 sm:gap-3 bg-zinc-900/20 p-1.5 rounded-2xl border border-zinc-900`}>
            {hasStandings && (
              <Link
                href={`/standings/${leagueId}`}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-center transition cursor-pointer ${activeTab === "standings"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                    : "bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-850 text-zinc-300 hover:text-white"
                  }`}
              >
                ترتيب الفرق
              </Link>
            )}
            <Link
              href={`/standings/${leagueId}?tab=scorers`}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-center transition cursor-pointer ${activeTab === "scorers"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                  : "bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-850 text-zinc-300 hover:text-white"
                }`}
            >
              ترتيب الهدافين
            </Link>
            <Link
              href={`/standings/${leagueId}?tab=results`}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-center transition cursor-pointer ${activeTab === "results"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                  : "bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-850 text-zinc-300 hover:text-white"
                }`}
            >
              نتائج المباريات
            </Link>
            <Link
              href={`/standings/${leagueId}?tab=fixtures`}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-center transition cursor-pointer ${activeTab === "fixtures"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10"
                  : "bg-zinc-900/60 hover:bg-zinc-850/80 border border-zinc-850 text-zinc-300 hover:text-white"
                }`}
            >
              المباريات القادمة
            </Link>

          </div>

          {/* Active Tab Content Area */}
          <div className="space-y-6">
            {activeTab === "standings" && (
              <div className="space-y-6">
                {/* Live Table Toggle */}
                <div className="flex justify-end bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 shadow-md">
                  <Link
                    href={isLive ? `/standings/${leagueId}` : `/standings/${leagueId}?live=true`}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all ${isLive
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                        : "bg-zinc-900 border-zinc-850 text-zinc-350 hover:bg-zinc-800"
                      }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-400 live-glow-badge" : "bg-zinc-500"}`} />
                    الترتيب المباشر (أثناء المباريات)
                  </Link>
                </div>

                {/* Loop tables */}
                {processedTables.map((table, tableIdx) => {
                  return (
                    <div
                      key={tableIdx}
                      className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm"
                    >
                      {/* Table/Group Name Header */}
                      {processedTables.length > 1 && (
                        <div className="bg-zinc-950/50 px-5 py-4 border-b border-zinc-850/80">
                          <h3 className="font-extrabold text-sm text-emerald-400">{table.displayName}</h3>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-450 font-bold uppercase tracking-wider">
                              <th className="p-3 text-center w-12 sm:w-14">المركز</th>
                              <th className="p-3 text-right">الفريق</th>
                              <th className="p-3 text-center">لعب</th>
                              <th className="p-3 text-center">فاز</th>
                              <th className="p-3 text-center">تعادل</th>
                              <th className="p-3 text-center">خسر</th>
                              <th className="p-3 text-center">له</th>
                              <th className="p-3 text-center">عليه</th>
                              <th className="p-3 text-center font-mono">الفرق</th>
                              <th className="p-3 text-center">النقاط</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-850/40">
                            {table.rows.map((row) => {
                              const destColor = table.destinations?.find((d) => d.num === row.destinationNum)?.color;

                              return (
                                <tr
                                  key={row.competitor.id}
                                  className="hover:bg-zinc-900/20 transition-colors"
                                >
                                  <td className="p-3 text-center font-black">
                                    <span
                                      style={{ borderRightColor: destColor }}
                                      className={`inline-flex items-center justify-center w-full border-r-3 pr-1 text-zinc-300 ${destColor ? "" : "border-r-transparent"
                                        }`}
                                    >
                                      {row.position}
                                    </span>
                                  </td>

                                  <td className="p-3 font-extrabold text-zinc-150">
                                    <Link href={`/team/${row.competitor.id}`} className="flex items-center gap-2 group hover:text-emerald-400 transition-colors">
                                      <img
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_50,h_50,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${row.competitor.id}`}
                                        alt={row.competitor.name}
                                        className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
                                        loading="lazy"
                                      />
                                      <span className="truncate">{row.competitor.name}</span>
                                    </Link>
                                  </td>

                                  <td className="p-3 text-center font-semibold font-mono text-zinc-300">{row.gamePlayed}</td>
                                  <td className="p-3 text-center font-semibold font-mono text-zinc-300">{row.gamesWon}</td>
                                  <td className="p-3 text-center font-semibold font-mono text-zinc-300">{row.gamesEven}</td>
                                  <td className="p-3 text-center font-semibold font-mono text-zinc-300">{row.gamesLost}</td>
                                  <td className="p-3 text-center font-mono text-zinc-400">{row.for}</td>
                                  <td className="p-3 text-center font-mono text-zinc-400">{row.against}</td>
                                  <td className={`p-3 text-center font-black font-mono ${row.ratio > 0 ? "text-emerald-450" : row.ratio < 0 ? "text-red-400" : "text-zinc-500"
                                    }`}>
                                    {row.ratio > 0 ? `+${row.ratio}` : row.ratio}
                                  </td>
                                  <td className="p-3 text-center font-black text-emerald-400 text-sm">{row.points}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Destinations Key Info Footer */}
                      {table.destinations && table.destinations.length > 0 && (
                        <div className="bg-zinc-950/40 p-4 border-t border-zinc-850 border-dashed grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {table.destinations.map((dest) => (
                            <div key={dest.num} className="flex items-center gap-2 text-xs">
                              <span
                                style={{ backgroundColor: dest.color }}
                                className="h-3 w-3 rounded-sm shrink-0 border border-white/10"
                              />
                              <span className="text-zinc-450 font-medium">{dest.guaranteedText}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "scorers" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="bg-zinc-900/60 px-5 py-4 border-b border-zinc-800/60">
                  <h3 className="font-extrabold text-sm text-zinc-200">ترتيب هدافي البطولة</h3>
                </div>
                {scorers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-450 font-bold uppercase tracking-wider">
                          <th className="p-3 text-center w-12 sm:w-14">الترتيب</th>
                          <th className="p-3 text-right">اللاعب</th>
                          <th className="p-3 text-right">الفريق</th>
                          <th className="p-3 text-center">الأهداف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/40">
                        {scorers.map((scorer, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-3 text-center font-black text-zinc-300">{scorer.rank}</td>
                            <td className="p-3 font-extrabold text-zinc-150">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={`https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v${scorer.imageVersion}/Athletes/${scorer.isNational ? `NationalTeam/${scorer.athleteId}` : `${scorer.athleteId}`}`}
                                  alt={scorer.name}
                                  className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
                                  loading="lazy"
                                />
                                <span className="text-xs sm:text-sm font-extrabold text-zinc-150">{scorer.name}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-zinc-350">
                              <Link href={`/team/${scorer.teamId}`} className="flex items-center gap-2 group hover:text-emerald-400 transition-colors">
                                <img
                                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${scorer.teamId}`}
                                  alt={scorer.teamName}
                                  className="h-5 w-5 object-contain transition-transform group-hover:scale-105"
                                  loading="lazy"
                                />
                                <span className="text-xs">{scorer.teamName}</span>
                              </Link>
                            </td>
                            <td className="p-3 text-center font-black text-emerald-450 text-sm">{scorer.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-550">لا توجد إحصائيات هدافين متوفرة حالياً.</div>
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="bg-zinc-900/60 px-5 py-4 border-b border-zinc-800/60">
                  <h3 className="font-extrabold text-sm text-zinc-200">نتائج المباريات الأخيرة</h3>
                </div>
                {currentGames.filter((g: any) => g.statusGroup === 4).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                    {currentGames
                      .filter((g: any) => g.statusGroup === 4)
                      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((game: any) => {
                        const gameDate = new Date(game.startTime);
                        const dateStr = toLatinNumerals(gameDate.toLocaleDateString("ar-EG-u-nu-latn", {
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        }));
                        const timeStr = toLatinNumerals(gameDate.toLocaleTimeString("ar-EG-u-nu-latn", {
                          hour: "2-digit",
                          minute: "2-digit"
                        }));
                        return (
                          <div key={game.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850 flex flex-col justify-between hover:border-zinc-800 transition">
                            <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-3 border-b border-zinc-850 pb-2">
                              <span>{game.roundName} {game.roundNum || ""}</span>
                              <span>{dateStr} | {timeStr}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <Link href={`/team/${game.homeCompetitor.id}`} className="flex-1 flex items-center gap-2 text-right group hover:text-emerald-400 transition-colors overflow-hidden">
                                <img
                                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_50,h_50,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
                                  alt=""
                                  className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
                                />
                                <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">{game.homeCompetitor.name}</span>
                              </Link>
                              <div className="px-3 py-1 rounded bg-zinc-850 text-xs font-black font-mono text-zinc-150 shrink-0">
                                {game.homeCompetitor.score} - {game.awayCompetitor.score}
                              </div>
                              <Link href={`/team/${game.awayCompetitor.id}`} className="flex-1 flex items-center justify-end gap-2 text-left group hover:text-emerald-400 transition-colors overflow-hidden">
                                <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">{game.awayCompetitor.name}</span>
                                <img
                                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_50,h_50,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
                                  alt=""
                                  className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
                                />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500">لا توجد نتائج مباريات متوفرة حالياً.</div>
                )}
              </div>
            )}

            {activeTab === "fixtures" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="bg-zinc-900/60 px-5 py-4 border-b border-zinc-800/60">
                  <h3 className="font-extrabold text-sm text-zinc-200">المباريات القادمة</h3>
                </div>
                {currentGames.filter((g: any) => g.statusGroup !== 4).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                    {currentGames
                      .filter((g: any) => g.statusGroup !== 4)
                      .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((game: any) => {
                        const gameDate = new Date(game.startTime);
                        const dateStr = toLatinNumerals(gameDate.toLocaleDateString("ar-EG-u-nu-latn", {
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        }));
                        const timeStr = toLatinNumerals(gameDate.toLocaleTimeString("ar-EG-u-nu-latn", {
                          hour: "2-digit",
                          minute: "2-digit"
                        }));
                        return (
                          <div key={game.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850 flex flex-col justify-between hover:border-zinc-800 transition">
                            <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-3 border-b border-zinc-850 pb-2">
                              <span>{game.roundName} {game.roundNum || ""}</span>
                              <span>{dateStr} | {timeStr}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <Link href={`/team/${game.homeCompetitor.id}`} className="flex-1 flex items-center gap-2 text-right group hover:text-emerald-400 transition-colors overflow-hidden">
                                <img
                                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_50,h_50,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.homeCompetitor.id}`}
                                  alt=""
                                  className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
                                />
                                <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">{game.homeCompetitor.name}</span>
                              </Link>
                              <div className="px-3 py-1 rounded bg-zinc-850 text-xs font-black text-emerald-450 shrink-0">
                                {timeStr}
                              </div>
                              <Link href={`/team/${game.awayCompetitor.id}`} className="flex-1 flex items-center justify-end gap-2 text-left group hover:text-emerald-400 transition-colors overflow-hidden">
                                <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">{game.awayCompetitor.name}</span>
                                <img
                                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_50,h_50,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${game.awayCompetitor.id}`}
                                  alt=""
                                  className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
                                />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500">لا توجد مباريات قادمة مجدولة.</div>
                )}
              </div>
            )}

            {/* Contextual In-Page Responsive Ad Banner */}
            <ResponsiveAdBanner className="mt-6" />
          </div>

        </div>

      </div>

    </div>
  );
}
