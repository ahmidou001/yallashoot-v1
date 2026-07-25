"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Trophy, ChevronLeft, ChevronRight, X } from "lucide-react";

interface StandingsBracketsProps {
  brackets: any;
  leagueId: number;
}

export default function StandingsBrackets({ brackets, leagueId }: StandingsBracketsProps) {
  const bracketsScrollRef = useRef<HTMLDivElement>(null);

  const scrollBrackets = (direction: "left" | "right") => {
    if (bracketsScrollRef.current) {
      const amount = direction === "left" ? -280 : 280;
      bracketsScrollRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  // Check if brackets stage 2 (Round of 32) exists
  const hasR32 = useMemo(() => {
    return brackets && Array.isArray(brackets.stages) && brackets.stages.some((s: any) => s.num === 2);
  }, [brackets]);

  // Helper to render bracket match cards with clickable links
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
          <div className="flex items-center gap-2 min-w-0">
            {p1.competitorId ? (
              <Link href={`/team/${p1.competitorId}`} className="flex items-center gap-2 min-w-0 group/item">
                <img 
                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p1.competitorId}`} 
                  className="w-5 h-5 rounded-full object-cover shrink-0 transition-transform group-hover/item:scale-105" 
                  alt="" 
                />
                <span className={`font-bold truncate text-right group-hover/item:text-emerald-400 transition-colors ${
                  hasPlayed 
                    ? (isWinner1 && highlightWinner ? "text-white" : "text-gray-500 font-medium") 
                    : "text-gray-300"
                }`}>
                  {p1.name}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
                <span className="font-bold truncate text-right text-gray-300">
                  {p1.name}
                </span>
              </div>
            )}
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
          <div className="flex items-center gap-2 min-w-0">
            {p2.competitorId ? (
              <Link href={`/team/${p2.competitorId}`} className="flex items-center gap-2 min-w-0 group/item">
                <img 
                  src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p2.competitorId}`} 
                  className="w-5 h-5 rounded-full object-cover shrink-0 transition-transform group-hover/item:scale-105" 
                  alt="" 
                />
                <span className={`font-bold truncate text-right group-hover/item:text-emerald-400 transition-colors ${
                  hasPlayed 
                    ? (isWinner2 && highlightWinner ? "text-white" : "text-gray-500 font-medium") 
                    : "text-gray-300"
                }`}>
                  {p2.name}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
                <span className="font-bold truncate text-right text-gray-300">
                  {p2.name}
                </span>
              </div>
            )}
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

  if (!brackets || !Array.isArray(brackets.stages)) {
    return null;
  }

  const heightVal = hasR32 ? "1200px" : "600px";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn" dir="rtl">
      <div className="relative bg-[#0d0f12] border border-zinc-800 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
            {brackets.knockoutTitle || "الأدوار الإقصائية"}
          </h3>
          <Link 
            href={`/standings/${leagueId}?tab=standings`}
            className="text-zinc-400 hover:text-white bg-zinc-850 hover:bg-zinc-800 p-2 rounded-xl border border-zinc-800 transition flex items-center justify-center"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Scroll Buttons & Brackets columns */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col justify-start min-h-0 bg-zinc-950/20">
          {/* Scroll Navigation Arrows */}
          {hasR32 && (
            <div className="absolute top-4 left-6 right-6 flex justify-between z-20 pointer-events-none">
              <button 
                onClick={() => scrollBrackets("left")} 
                className="p-2 bg-gray-850 hover:bg-gray-800 text-white rounded-xl border border-gray-800 transition-all cursor-pointer pointer-events-auto active:scale-95 flex items-center justify-center shadow-lg"
                title="الرجوع للنهائي"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <button 
                onClick={() => scrollBrackets("right")} 
                className="p-2 bg-gray-850 hover:bg-gray-800 text-white rounded-xl border border-gray-800 transition-all cursor-pointer pointer-events-auto active:scale-95 flex items-center justify-center shadow-lg"
                title="عرض دور الـ 32"
              >
                <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          )}

          {/* Brackets Columns */}
          <div 
            ref={bracketsScrollRef}
            className="flex flex-row-reverse items-start justify-start gap-0 overflow-x-auto py-16 px-6 select-none scrollbar-none min-w-[900px] h-full"
          >
            {/* Column 0: Round of 32 (دور الـ 32) */}
            {hasR32 && brackets.stages.find((s: any) => s.num === 2) && (
              <div className="flex flex-col items-center shrink-0 z-10 w-[200px]">
                <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                  دور الـ 32
                </div>
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
                <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                  دور الـ 16
                </div>
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
                <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                  ربع النهائي
                </div>
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
                <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                  نصف النهائي
                </div>
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
                <div className="w-full text-center pb-2 border-b border-gray-800 mb-6 font-bold text-gray-400 text-xs">
                  النهائي
                </div>
                <div className="flex flex-col justify-between w-full" style={{ height: heightVal }}>
                  {/* Final match card */}
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
                          <div className="text-[10px] text-gray-500 font-semibold mb-3 text-right">
                            {dateFormatted} • {timeFormatted}
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  {p1.competitorId ? (
                                    <Link href={`/team/${p1.competitorId}`} className="flex items-center gap-2 min-w-0 group/item">
                                      <img 
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p1.competitorId}`} 
                                        className="w-5 h-5 rounded-full object-cover shrink-0" 
                                        alt="" 
                                      />
                                      <span className={`font-bold truncate text-right group-hover/item:text-emerald-400 transition-colors ${hasPlayed ? (isWinner1 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                        {p1.name}
                                      </span>
                                    </Link>
                                  ) : (
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
                                      <span className="font-bold truncate text-right text-gray-300">
                                        {p1.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {hasPlayed && (
                                  <span className={`font-bold ${isWinner1 ? "text-white text-sm" : "text-gray-500 text-sm"}`}>
                                    {score1}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  {p2.competitorId ? (
                                    <Link href={`/team/${p2.competitorId}`} className="flex items-center gap-2 min-w-0 group/item">
                                      <img 
                                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p2.competitorId}`} 
                                        className="w-5 h-5 rounded-full object-cover shrink-0" 
                                        alt="" 
                                      />
                                      <span className={`font-bold truncate text-right group-hover/item:text-emerald-400 transition-colors ${hasPlayed ? (isWinner2 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                        {p2.name}
                                      </span>
                                    </Link>
                                  ) : (
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
                                      <span className="font-bold truncate text-right text-gray-300">
                                        {p2.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {hasPlayed && (
                                  <span className={`font-bold ${isWinner2 ? "text-white text-sm" : "text-gray-500 text-sm"}`}>
                                    {score2}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-center pr-2 border-r border-gray-800/80 h-10">
                              <Trophy className="w-8 h-8 text-yellow-500 animate-pulse" />
                            </div>
                          </div>

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
                          <div className="text-[10px] text-gray-500 font-semibold mb-3 text-right">
                            {dateFormatted} • {timeFormatted}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                {p1.competitorId ? (
                                  <Link href={`/team/${p1.competitorId}`} className="flex items-center gap-2 min-w-0 group/item">
                                    <img 
                                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p1.competitorId}`} 
                                      className="w-5 h-5 rounded-full object-cover shrink-0" 
                                      alt="" 
                                    />
                                    <span className={`font-bold truncate text-right group-hover/item:text-emerald-400 transition-colors ${hasPlayed ? (isWinner1 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                      {p1.name}
                                    </span>
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
                                    <span className="font-bold truncate text-right text-gray-300">
                                      {p1.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className={`font-bold ${hasPlayed ? (isWinner1 ? "text-white text-sm" : "text-gray-500 text-sm") : "text-gray-500 text-sm"}`}>
                                {hasPlayed ? score1 : "-"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                {p2.competitorId ? (
                                  <Link href={`/team/${p2.competitorId}`} className="flex items-center gap-2 min-w-0 group/item">
                                    <img 
                                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_24,h_24,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${p2.competitorId}`} 
                                      className="w-5 h-5 rounded-full object-cover shrink-0" 
                                      alt="" 
                                    />
                                    <span className={`font-bold truncate text-right group-hover/item:text-emerald-400 transition-colors ${hasPlayed ? (isWinner2 ? "text-white" : "text-gray-500") : "text-gray-300"}`}>
                                      {p2.name}
                                    </span>
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-5 h-5 rounded-full bg-gray-850 shrink-0" />
                                      <span className="font-bold truncate text-right text-gray-300">
                                        {p2.name}
                                      </span>
                                  </div>
                                )}
                              </div>
                              <span className={`font-bold ${hasPlayed ? (isWinner2 ? "text-white text-sm" : "text-gray-500 text-sm") : "text-gray-500 text-sm"}`}>
                                {hasPlayed ? score2 : "-"}
                              </span>
                            </div>
                          </div>

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
        </div>
      </div>
    </div>
  );
}
