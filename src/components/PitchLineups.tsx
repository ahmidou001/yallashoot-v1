"use client";

import React, { useState } from "react";
import { GameDetails, Member, LineupMember } from "@/types/api";
import { User, Users } from "lucide-react";

interface PitchLineupsProps {
  game: GameDetails;
  members: Member[];
}

export default function PitchLineups({ game, members }: PitchLineupsProps) {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");

  // Helper to find player details by ID
  const getPlayerDetails = (id: number) => {
    return members.find((m) => m.id === id) || { id, name: "لاعب" };
  };

  // Helper to construct player image URL dynamically
  const getPlayerImageUrl = (playerMember: LineupMember | { id: number }) => {
    const details = getPlayerDetails(playerMember.id);
    const athleteId = details.athleteId || playerMember.id;
    const imageVersion = details.imageVersion || 1;

    const isNationalTeam = game.homeCompetitor.type === 2;
    const pathSuffix = isNationalTeam
      ? `NationalTeam/${athleteId}`
      : `${athleteId}`;

    return `https://imagecache.365scores.com/image/upload/f_png,w_120,h_120,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v${imageVersion}/Athletes/${pathSuffix}`;
  };

  const activeCompetitor = selectedTeam === "home" ? game.homeCompetitor : game.awayCompetitor;
  const activeLineup = activeCompetitor.lineups;

  // Filter starters (status === 1) and substitutes (status === 2)
  const starters = activeLineup?.members.filter((m) => m.status === 1) || [];
  const substitutes = activeLineup?.members.filter((m) => m.status === 2) || [];

  // Helper to resolve coach name from competitor or lineup
  const getCoachName = (competitor: any, lineup: any) => {
    if (competitor?.coach?.name) return competitor.coach.name;
    if (competitor?.manager?.name) return competitor.manager.name;
    if (lineup?.coach?.name) return lineup.coach.name;
    if (lineup?.manager?.name) return lineup.manager.name;
    return null;
  };

  // Coordinates mapping on the 3D perspective pitch (GK at bottom, Forwards at top)
  const getPlayerCoordinates = (player: LineupMember, index: number, total: number) => {
    const yard = player.yardFormation;
    if (yard && typeof yard.fieldSide === "number" && typeof yard.fieldLine === "number") {
      // fieldSide is horizontal 0..100 -> bounded 12% to 88%
      const x = Math.min(88, Math.max(12, 12 + yard.fieldSide * 0.76));
      // fieldLine is 0..100 (GK at 0..10 near bottom, FW at 80..100 near top)
      const y = Math.min(90, Math.max(12, 88 - yard.fieldLine * 0.74));
      return { left: `${x}%`, top: `${y}%` };
    }

    // Fallback: organize by role/index if yardFormation is missing
    const yPercent = index === 0 ? 88 : Math.max(15, 80 - Math.floor((index - 1) / 3) * 22);
    const colIndex = index === 0 ? 1 : (index - 1) % 3;
    const xPercent = index === 0 ? 50 : 20 + colIndex * 30;
    return { left: `${xPercent}%`, top: `${yPercent}%` };
  };

  return (
    <div className="space-y-6">
      {/* 1. Team Selector Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedTeam("home")}
          className={`flex-1 sm:flex-initial sm:min-w-[170px] py-2.5 px-6 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer text-center ${
            selectedTeam === "home"
              ? "bg-teal-400 text-zinc-950 shadow-lg shadow-teal-400/20"
              : "bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850 border border-zinc-800"
          }`}
        >
          {game.homeCompetitor.name}
        </button>
        <button
          type="button"
          onClick={() => setSelectedTeam("away")}
          className={`flex-1 sm:flex-initial sm:min-w-[170px] py-2.5 px-6 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer text-center ${
            selectedTeam === "away"
              ? "bg-teal-400 text-zinc-950 shadow-lg shadow-teal-400/20"
              : "bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850 border border-zinc-800"
          }`}
        >
          {game.awayCompetitor.name}
        </button>
      </div>

      {/* 2. Formation Capsule */}
      <div className="flex justify-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-bold shadow-sm font-mono">
          الخطة : ({activeLineup?.formation || "4-3-3"})
        </div>
      </div>

      {/* 3. 3D Perspective Pitch */}
      {starters.length > 0 ? (
        <div className="relative mx-auto w-full max-w-[540px] px-2" style={{ perspective: "1000px" }}>
          <div
            className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden border border-emerald-500/25 shadow-2xl transition-transform duration-300"
            style={{
              transform: "rotateX(18deg)",
              transformOrigin: "bottom center",
              background: "radial-gradient(ellipse at 50% 100%, #17632e 0%, #0d461f 55%, #072e13 100%)",
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,0,0,0.45)",
            }}
          >
            {/* Horizontal Grass Mowing Stripes */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 36px, transparent 36px, transparent 72px)",
              }}
            />

            {/* Pitch Tactical Markings */}
            <div className="absolute inset-4 sm:inset-6 border border-white/25 rounded-md pointer-events-none">
              {/* Half-pitch Center Line (Top) */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/25" />
              {/* Center Circle Arc at Top */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 h-28 w-28 border border-white/25 rounded-full" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-white/35 rounded-full" />

              {/* Bottom Penalty Area (GK Side) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-52 border-r border-l border-t border-white/25" />
              {/* 6-Yard Box */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-10 w-28 border-r border-l border-t border-white/30" />
              {/* Penalty Spot */}
              <div className="absolute bottom-18 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-white/40 rounded-full" />
              {/* Penalty Arc */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 h-12 w-24 border-t border-white/25 rounded-full" />
            </div>

            {/* Starters Nodes */}
            {starters.map((player, idx) => {
              const details = getPlayerDetails(player.id);
              const { left, top } = getPlayerCoordinates(player, idx, starters.length);

              return (
                <div
                  key={player.id}
                  style={{ left, top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10 transition-transform duration-150 hover:scale-110 hover:z-20 cursor-default"
                >
                  {/* Player circular avatar with jersey number overlay */}
                  <div className="relative flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-zinc-900 border-2 border-white shadow-lg shadow-black/70 overflow-visible">
                    <div className="h-full w-full rounded-full overflow-hidden bg-zinc-800">
                      <img
                        src={getPlayerImageUrl(player)}
                        alt={details.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,d_Athletes:default.png/v1/Athletes/default.png";
                        }}
                      />
                    </div>

                    {/* Top-Right Number Badge (Matching Image 2) */}
                    {player.shirtNumber && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-zinc-950 border border-zinc-700 text-[9px] sm:text-[10px] font-black text-white shadow font-mono select-none">
                        {player.shirtNumber}
                      </span>
                    )}
                  </div>

                  {/* Player Name Label Beneath Avatar */}
                  <span className="mt-1 text-[10px] sm:text-xs font-bold text-white text-center leading-tight drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.95)] max-w-[85px] sm:max-w-[100px] truncate select-none px-1">
                    {details.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-400">التشكيلة الرسمية لهذا الفريق غير متوفرة حالياً.</p>
        </div>
      )}

      {/* 4. Coach / المدير الفني Section (Matching Image 2) */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-5 shadow-lg">
        <h3 className="font-extrabold text-sm text-zinc-300 border-b border-zinc-800 pb-3 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-teal-400" />
          المدير الفني
        </h3>
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-850 max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-400 font-bold shrink-0 shadow-inner">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">
              {getCoachName(activeCompetitor, activeLineup) || `مدرب ${activeCompetitor.name}`}
            </div>
            <div className="text-xs text-zinc-400 font-medium">مدرب {activeCompetitor.name}</div>
          </div>
        </div>
      </div>

      {/* 5. Substitutes Section */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-5 shadow-lg">
        <h3 className="font-extrabold text-sm text-zinc-300 border-b border-zinc-800 pb-3 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-teal-400" />
          دكة البدلاء ({activeCompetitor.name})
        </h3>
        {substitutes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {substitutes.map((sub) => {
              const details = getPlayerDetails(sub.id);
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:border-zinc-750 transition"
                >
                  <div className="relative h-9 w-9 rounded-full bg-zinc-950 border border-zinc-750 overflow-hidden shrink-0">
                    <img
                      src={getPlayerImageUrl(sub)}
                      alt={details.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,d_Athletes:default.png/v1/Athletes/default.png";
                      }}
                    />
                    {sub.shirtNumber && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-900 text-[8px] font-black text-white border border-zinc-700">
                        {sub.shirtNumber}
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-zinc-200 truncate">{details.name}</div>
                    <div className="text-[10px] text-zinc-400 font-medium">
                      {sub.position?.name || "بديل"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-4">لا توجد بيانات بدلاء مسجلة لهذا الفريق.</p>
        )}
      </div>
    </div>
  );
}
