import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Tv, ChevronLeft, Play, AlertCircle } from "lucide-react";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { getGameDetails } from "@/services/api";
import { generateMatchSlug } from "@/lib/matchSlug";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "بث مباشر للمباريات اليوم | جدول المباريات والنتائج الحية لحظة بلحظة",
  description: "تابع البث المباشر لأهم مباريات اليوم وجدول النتائج الحية لحظة بلحظة لجميع الدوريات العالمية والبطولات العربية مع تغطية حصرية وإحصائيات دقيقة ومباشرة الآن.",
  alternates: {
    canonical: "https://www.yallahsoot.com/live",
  },
  openGraph: {
    title: "بث مباشر للمباريات اليوم | يلا شوت",
    description: "تابع البث المباشر لأهم مباريات اليوم وجدول النتائج الحية لحظة بلحظة لجميع الدوريات العالمية والبطولات العربية مع تغطية حصرية وإحصائيات دقيقة ومباشرة الآن.",
    url: "https://www.yallahsoot.com/live",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LiveMatchesPage() {
  let detailedMatches: any[] = [];
  try {
    await dbConnect();

    // Group date in GMT+1 (Morocco time)
    const now = new Date();
    const gmtPlus1 = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const dateStr = gmtPlus1.toISOString().split("T")[0]; // YYYY-MM-DD
    const utcDateStr = now.toISOString().split("T")[0];

    // Find LiveMatch document for today
    let liveMatchDoc = await LiveMatch.findOne({ date: dateStr }).lean();
    if (!liveMatchDoc && dateStr !== utcDateStr) {
      liveMatchDoc = await LiveMatch.findOne({ date: utcDateStr }).lean();
    }
    if (!liveMatchDoc) {
      liveMatchDoc = await LiveMatch.findOne({}).sort({ date: -1 }).lean();
    }

    // Include ALL matches of today without requiring streamUrl (just like site2)
    const dbMatches: any[] = (liveMatchDoc?.matches as any[]) || [];

    // Fetch live details from 365scores API for each match
    detailedMatches = await Promise.all(
      dbMatches.map(async (m: any) => {
        try {
          const details = await getGameDetails(m.id);
          const game = details?.game || null;
          const comp = details?.competitions?.find((c) => c.id === game?.competitionId);
          return {
            ...m,
            game,
            competitionName: comp?.name || m.league || m.tournament?.name || m.competitionName || "الدوري",
          };
        } catch {
          return {
            ...m,
            game: null,
            competitionName: m.league || m.tournament?.name || m.competitionName || "الدوري",
          };
        }
      })
    );
  } catch (error) {
    console.error("Failed to load live matches list from DB/API:", error);
  }

  const liveMatchesCount = detailedMatches.filter(
    (m) => m.game?.statusGroup === 3 || m.status === "LIVE" || m.game?.statusText === "مباشر" || m.statusText?.includes("'")
  ).length;

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

      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 mb-8 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md">
            <Tv className="h-6 w-6 animate-pulse" />
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-black text-zinc-150 flex items-center gap-2">
              مباريات البث المباشر اليوم
            </h1>
            <p className="text-xs text-zinc-450 mt-1">المباريات الجارية والمجدولة التي يتوفر لها بث مباشر حصري</p>
          </div>
        </div>
        
        {detailedMatches.length > 0 && (
          <div className="flex items-center gap-2">
            {liveMatchesCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-950/80 border border-red-500/30 px-3.5 py-1 text-xs font-black text-red-400 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {liveMatchesCount} جارية الآن
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 live-glow-badge" />
              {detailedMatches.length} مباراة اليوم
            </span>
          </div>
        )}
      </div>

      {/* Matches Content Grid */}
      {detailedMatches.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center p-12 sm:p-20 rounded-2xl bg-zinc-900/30 border border-zinc-850 shadow-lg">
          <AlertCircle className="h-14 w-14 text-zinc-650 mb-4" />
          <h3 className="text-base sm:text-lg font-black text-zinc-300">لا توجد مباريات بث مباشر حالياً</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-md leading-relaxed">
            لم يتم تفعيل أو بث أي مباريات بعد من لوحة التحكم لهذا اليوم. يرجى متابعة جدول المباريات في الصفحة الرئيسية لمعرفة مواعيد انطلاق البث المباشر.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 transition"
          >
            مشاهدة جدول مباريات اليوم
          </Link>
        </div>
      ) : (
        /* Live Streams List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailedMatches.map((m) => {
            const hasGameData = !!m.game;
            const isLive = hasGameData ? m.game.statusGroup === 3 : m.status === "LIVE";
            const isFinished = hasGameData ? m.game.statusGroup === 4 : m.status === "ENDED";
            
            // Team Names
            const homeName = hasGameData ? m.game.homeCompetitor.name : m.teamHome?.name || m.home?.name || "مستضيف";
            const awayName = hasGameData ? m.game.awayCompetitor.name : m.teamAway?.name || m.away?.name || "ضيف";

            // Team IDs
            const homeId = hasGameData ? m.game.homeCompetitor.id : m.teamHome?.id || m.home?.id;
            const awayId = hasGameData ? m.game.awayCompetitor.id : m.teamAway?.id || m.away?.id;

            // Logos
            const homeLogo = homeId
              ? `https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${homeId}`
              : "https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/default.png";
            const awayLogo = awayId
              ? `https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${awayId}`
              : "https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/default.png";

            // Scores
            const homeScoreRaw = hasGameData ? m.game.homeCompetitor.score : m.score?.fullTime?.home ?? m.home?.score;
            const awayScoreRaw = hasGameData ? m.game.awayCompetitor.score : m.score?.fullTime?.away ?? m.away?.score;
            const homeScore = homeScoreRaw !== undefined && homeScoreRaw !== -1 ? homeScoreRaw : 0;
            const awayScore = awayScoreRaw !== undefined && awayScoreRaw !== -1 ? awayScoreRaw : 0;

            // Kickoff display time (e.g. 17:30)
            let displayTime = m.time || "";
            if (!displayTime && (m.startTime || m.game?.startTime)) {
              try {
                const rawTime = m.startTime || m.game?.startTime;
                const d = new Date(rawTime);
                displayTime = d.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Africa/Casablanca",
                });
              } catch {
                displayTime = "20:00";
              }
            }
            if (!displayTime) displayTime = "20:00";

            // Live minute (matches Image 2: مباشر '45)
            const gameTime = hasGameData ? m.game.gameTime : m.minute;
            let liveStatusLabel = "مباشر";
            if (gameTime && String(gameTime) !== "-1") {
              liveStatusLabel = `مباشر ${gameTime}'`;
            } else if (hasGameData && m.game.statusText && m.game.statusText !== "لم تبدأ بعد" && m.game.statusText !== "انتهت") {
              liveStatusLabel = m.game.statusText.startsWith("مباشر")
                ? m.game.statusText
                : `مباشر ${m.game.statusText}`;
            }

            // Channel
            const channel = m.channel && m.channel !== "غير محدد" ? m.channel : null;

            // Slug
            const homeObj = hasGameData ? m.game.homeCompetitor : { id: homeId, name: homeName };
            const awayObj = hasGameData ? m.game.awayCompetitor : { id: awayId, name: awayName };
            const slug = generateMatchSlug(homeObj, awayObj, String(m.id));

            return (
              <div 
                key={m.id}
                className="group p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850/20 hover:border-zinc-800 hover:shadow-xl hover:shadow-emerald-950/5 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: League on right, Channel on left */}
                  <div className="flex justify-between items-center text-[11px] text-zinc-500 mb-4 border-b border-zinc-850/80 pb-2.5">
                    <span className="font-extrabold text-zinc-400">{m.competitionName}</span>
                    <div className="flex items-center gap-2">
                      {channel && (
                        <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">
                          {channel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Score Grid (Matching site2 structure) */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2 select-none">
                    {/* Right side: Home Team */}
                    <div className="flex flex-col items-center text-center min-w-0">
                      <div className="w-13 h-13 sm:w-16 sm:h-16 flex items-center justify-center p-2 bg-zinc-850/60 rounded-2xl border border-zinc-800 group-hover:scale-105 transition-transform duration-200">
                        <img
                          src={homeLogo}
                          alt={homeName}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full max-h-12"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-zinc-200 mt-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {homeName}
                      </span>
                    </div>

                    {/* Center Column: Kickoff Time, Red Pulse Badge + Minute, Score (Exact Site 2 Structure) */}
                    <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4 min-w-[110px] text-center">
                      {/* Kickoff Time */}
                      <span className="text-xs sm:text-sm font-black text-zinc-300 font-mono tracking-tight">
                        {displayTime}
                      </span>

                      {/* Status Badge */}
                      <div className="mt-1.5">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black bg-red-600 text-white animate-pulse shadow-sm tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            {liveStatusLabel}
                          </span>
                        ) : isFinished ? (
                          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-zinc-800 text-zinc-300">
                            انتهت
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-zinc-800 text-zinc-200 shadow-xs">
                            لم تبدأ بعد
                          </span>
                        )}
                      </div>

                      {/* Scores (if live or finished) */}
                      {(isLive || isFinished) && (
                        <div className="mt-1.5 text-sm sm:text-base font-black text-white font-mono tracking-wider">
                          {homeScore} - {awayScore}
                        </div>
                      )}
                    </div>

                    {/* Left side: Away Team */}
                    <div className="flex flex-col items-center text-center min-w-0">
                      <div className="w-13 h-13 sm:w-16 sm:h-16 flex items-center justify-center p-2 bg-zinc-850/60 rounded-2xl border border-zinc-800 group-hover:scale-105 transition-transform duration-200">
                        <img
                          src={awayLogo}
                          alt={awayName}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full max-h-12"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-zinc-200 mt-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {awayName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Watch Stream Button */}
                <Link
                  href={`/match/${slug}`}
                  className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/5 group-hover:shadow-emerald-500/10"
                >
                  <Play className="h-3.5 w-3.5 text-zinc-950 fill-zinc-950" />
                  <span>مشاهدة البث المباشر</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
