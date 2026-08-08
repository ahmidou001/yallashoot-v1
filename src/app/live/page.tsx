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
  title: "مباريات البث المباشر | يلا شوت لايف",
  description: "جدول مباريات اليوم التي يتوفر لها بث مباشر وحصري على موقع يلا شوت لايف بجودة عالية وبدون تقطيع.",
  alternates: {
    canonical: "/live",
  },
};

export default async function LiveMatchesPage() {
  // Connect to DB and fetch selected matches for today
  let detailedMatches: any[] = [];
  try {
    await dbConnect();
    
    // Group date in GMT+1, mirroring the dashboard 4-hour offset rule
    const kickoffDate = new Date();
    const localTime = new Date(kickoffDate.getTime() + 1 * 60 * 60 * 1000);
    const adjustedTime = new Date(localTime.getTime() - 4 * 60 * 60 * 1000);
    const dateStr = adjustedTime.toISOString().split("T")[0]; // YYYY-MM-DD
    
    const liveMatchDoc = await LiveMatch.findOne({ date: dateStr }).lean();
    const dbMatches = liveMatchDoc?.matches || [];
    
    // Filter matches that have a stream URL configured
    const activeStreamMatches = dbMatches.filter(
      (m: any) => m.streamUrl && m.streamUrl !== "غير محدد" && m.streamUrl.trim() !== ""
    );
    
    // Fetch live details from 365scores API for each match
    detailedMatches = await Promise.all(
      activeStreamMatches.map(async (m: any) => {
        try {
          const details = await getGameDetails(m.id);
          return {
            ...m,
            game: details?.game || null,
            competitionName: details?.competitions?.find((c) => c.id === details?.game?.competitionId)?.name || "بطولة"
          };
        } catch {
          return {
            ...m,
            game: null,
            competitionName: "بطولة"
          };
        }
      })
    );
  } catch (error) {
    console.error("Failed to load live matches list from DB/API:", error);
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
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 live-glow-badge" />
            {detailedMatches.length} مباريات نشطة
          </span>
        )}
      </div>

      {/* Matches Content Grid */}
      {detailedMatches.length === 0 ? (
        /* Empty State Placeholder */
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
            
            // Resolve game info
            const homeName = hasGameData ? m.game.homeCompetitor.name : m.teamHome?.name || "مستضيف";
            const awayName = hasGameData ? m.game.awayCompetitor.name : m.teamAway?.name || "ضيف";
            const homeScore = hasGameData ? m.game.homeCompetitor.score : 0;
            const awayScore = hasGameData ? m.game.awayCompetitor.score : 0;
            const gameTime = hasGameData ? m.game.gameTime : "";
            const statusText = hasGameData ? m.game.statusText : m.status === "COMING_SOON" ? "لم تبدأ" : m.status === "ENDED" ? "انتهت" : "مباشر";
            
            // Image URLs
            const homeLogo = hasGameData 
              ? `https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${m.game.homeCompetitor.id}`
              : `https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/default.png`;
            const awayLogo = hasGameData 
              ? `https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${m.game.awayCompetitor.id}`
              : `https://imagecache.365scores.com/image/upload/f_auto,w_100,h_100,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/default.png`;

            // Slug URL
            const homeObj = hasGameData ? m.game.homeCompetitor : homeName;
            const awayObj = hasGameData ? m.game.awayCompetitor : awayName;
            const slug = generateMatchSlug(homeObj, awayObj, m.id);

            return (
              <div 
                key={m.id}
                className="group p-5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850/15 hover:border-zinc-800 hover:shadow-xl hover:shadow-emerald-950/5 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar Info */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-4 border-b border-zinc-850/80 pb-2">
                    <span className="font-extrabold text-zinc-400">{m.competitionName}</span>
                    <div className="flex items-center gap-1.5">
                      {isLive ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/20 text-[9px] font-black text-red-400 animate-pulse">
                          مباشر
                        </span>
                      ) : isFinished ? (
                        <span className="px-2 py-0.5 rounded bg-zinc-850 text-[9px] font-black text-zinc-450">
                          انتهت
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-850 text-[9px] font-black text-emerald-450">
                          بث مباشر مجدول
                        </span>
                      )}
                      <span className="font-semibold">{m.time}</span>
                    </div>
                  </div>

                  {/* Center Score Grid */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
                    {/* Home Competitor */}
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={homeLogo}
                        alt={homeName}
                        className="h-12 w-12 object-contain bg-zinc-800/30 p-1.5 rounded-xl border border-zinc-800"
                        loading="lazy"
                      />
                      <span className="text-xs font-black text-zinc-200 mt-2 truncate max-w-[100px]">{homeName}</span>
                    </div>

                    {/* Middle Score area */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="flex items-center gap-3.5">
                        <span className="text-xl sm:text-2xl font-black font-mono text-zinc-100">
                          {hasGameData && (m.game.homeCompetitor.score !== -1) ? homeScore : "-"}
                        </span>
                        <span className="text-zinc-650 font-black text-lg">:</span>
                        <span className="text-xl sm:text-2xl font-black font-mono text-zinc-100">
                          {hasGameData && (m.game.awayCompetitor.score !== -1) ? awayScore : "-"}
                        </span>
                      </div>
                      
                      <span className="text-[9px] font-extrabold text-zinc-500 bg-zinc-850 px-2.5 py-0.5 rounded-full mt-2.5">
                        {statusText || (isLive ? `${gameTime}'` : "لم تبدأ")}
                      </span>
                    </div>

                    {/* Away Competitor */}
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={awayLogo}
                        alt={awayName}
                        className="h-12 w-12 object-contain bg-zinc-800/30 p-1.5 rounded-xl border border-zinc-800"
                        loading="lazy"
                      />
                      <span className="text-xs font-black text-zinc-200 mt-2 truncate max-w-[100px]">{awayName}</span>
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
