"use client";

import React from "react";
import { GameDetails, Member, LineupMember } from "@/types/api";
import { User } from "lucide-react";

interface PitchLineupsProps {
  game: GameDetails;
  members: Member[];
}

export default function PitchLineups({ game, members }: PitchLineupsProps) {
  // Helper to find player details by ID
  const getPlayerDetails = (id: number) => {
    return members.find((m) => m.id === id) || { id, name: "لاعب" };
  };

  // Helper to construct player image URL dynamically (using athleteId and NationalTeam condition)
  const getPlayerImageUrl = (playerMember: LineupMember | { id: number }) => {
    const details = getPlayerDetails(playerMember.id);
    const athleteId = details.athleteId || playerMember.id;
    const imageVersion = details.imageVersion || 1;
    
    const isNationalTeam = game.homeCompetitor.type === 2;
    const pathSuffix = isNationalTeam 
      ? `NationalTeam/${athleteId}` 
      : `${athleteId}`;

    return `https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v${imageVersion}/Athletes/${pathSuffix}`;
  };

  const homeLineups = game.homeCompetitor.lineups;
  const awayLineups = game.awayCompetitor.lineups;

  // Filter starters (status === 1) and substitutes (status === 2)
  const homeStarters = homeLineups?.members.filter((m) => m.status === 1) || [];
  const homeSubs = homeLineups?.members.filter((m) => m.status === 2) || [];

  const awayStarters = awayLineups?.members.filter((m) => m.status === 1) || [];
  const awaySubs = awayLineups?.members.filter((m) => m.status === 2) || [];

  // Helper to get coordinates on pitch (as percentage strings)
  const getPlayerCoordinates = (player: LineupMember, isHome: boolean) => {
    const yard = player.yardFormation;
    if (!yard) return { left: "50%", top: "50%" };

    // fieldSide is horizontal position (0 to 100), mapped to 8% to 92%
    const xPercent = 8 + (yard.fieldSide * 0.84);
    
    // fieldLine is vertical position (0 to 100), mapped to bottom half for home, top half for away
    const yPercent = isHome 
      ? 90 - (yard.fieldLine * 0.35) 
      : 10 + (yard.fieldLine * 0.35);

    return {
      left: `${xPercent}%`,
      top: `${yPercent}%`,
    };
  };

  return (
    <div className="space-y-8">
      
      {/* Visual Pitch Layout */}
      {homeLineups && awayLineups ? (
        <div className="relative mx-auto w-full max-w-[480px] aspect-[3/4] bg-emerald-950/75 border-2 border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl p-4">
          {/* Grass lines stripe layout */}
          <div className="absolute inset-0 opacity-10 bg-repeat bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_40px] pointer-events-none" />
          
          {/* Tactical Field Lines (Markings) */}
          <div className="absolute inset-4 border border-white/20 pointer-events-none">
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 border border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-white/30 rounded-full" />

            {/* Top Penalty Area (Away Side) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-44 border-r border-l border-b border-white/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-24 border-r border-l border-b border-white/25" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-white/30 rounded-full" />
            {/* Penalty Arc */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 h-12 w-20 border-b border-white/20 rounded-full clip-path-arc-bottom" />

            {/* Bottom Penalty Area (Home Side) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-20 w-44 border-r border-l border-t border-white/20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-8 w-24 border-r border-l border-t border-white/25" />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Render Away Starters (Top Half) */}
          {awayStarters.map((player) => {
            const details = getPlayerDetails(player.id);
            const { left, top } = getPlayerCoordinates(player, false);
            
            return (
              <div
                key={player.id}
                style={{ left, top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
              >
                {/* Player node with face image & jersey number overlay */}
                <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-zinc-900 border-2 border-red-500 shadow-md shadow-black/40 group-hover:scale-110 transition duration-200 overflow-visible">
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img
                      src={getPlayerImageUrl(player)}
                      alt={details.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {player.shirtNumber && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[8px] font-black text-red-400 shadow-sm font-mono select-none">
                      {player.shirtNumber}
                    </span>
                  )}
                </div>
                {/* Name Label */}
                <span className="mt-1.5 px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-850 text-[9px] sm:text-[10px] font-semibold text-zinc-200 text-center truncate max-w-[85px] shadow-sm backdrop-blur-xs select-none leading-none">
                  {details.name}
                </span>
              </div>
            );
          })}

          {/* Render Home Starters (Bottom Half) */}
          {homeStarters.map((player) => {
            const details = getPlayerDetails(player.id);
            const { left, top } = getPlayerCoordinates(player, true);
            
            return (
              <div
                key={player.id}
                style={{ left, top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
              >
                {/* Player node with face image & jersey number overlay */}
                <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-950 border-2 border-emerald-400 shadow-md shadow-black/40 group-hover:scale-110 transition duration-200 overflow-visible">
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img
                      src={getPlayerImageUrl(player)}
                      alt={details.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {player.shirtNumber && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[8px] font-black text-emerald-400 shadow-sm font-mono select-none">
                      {player.shirtNumber}
                    </span>
                  )}
                </div>
                {/* Name Label */}
                <span className="mt-1.5 px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-850 text-[9px] sm:text-[10px] font-semibold text-zinc-200 text-center truncate max-w-[85px] shadow-sm backdrop-blur-xs select-none leading-none">
                  {details.name}
                </span>
              </div>
            );
          })}

          {/* Home Formation Banner */}
          <div className="absolute bottom-2 right-2 bg-emerald-950/90 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-450 z-20">
            {game.homeCompetitor.name}: {homeLineups?.formation || "-"}
          </div>
          
          {/* Away Formation Banner */}
          <div className="absolute top-2 left-2 bg-red-950/95 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-red-400 z-20">
            {game.awayCompetitor.name}: {awayLineups?.formation || "-"}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-400">التشكيلة الرسمية للمباراة غير متوفرة حالياً.</p>
        </div>
      )}

      {/* Substitutes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Home Subs */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-extrabold text-sm text-emerald-400 border-b border-zinc-800 pb-3 mb-4">
            احتياط {game.homeCompetitor.name}
          </h3>
          {homeSubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {homeSubs.map((sub) => {
                const details = getPlayerDetails(sub.id);
                return (
                  <div key={sub.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-850">
                    <div className="relative h-7 w-7 rounded-full bg-emerald-950 border border-emerald-500/20 overflow-hidden shrink-0">
                      <img
                        src={getPlayerImageUrl(sub)}
                        alt={details.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {sub.shirtNumber && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-zinc-950 text-[7px] font-black text-emerald-400 border border-zinc-800">
                          {sub.shirtNumber}
                        </span>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-200">{details.name}</div>
                      <div className="text-[9px] text-zinc-500">{sub.position?.name || "بديل"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-4">لا يوجد لاعبين بدلاء مسجلين.</p>
          )}
        </div>

        {/* Away Subs */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-extrabold text-sm text-red-400 border-b border-zinc-800 pb-3 mb-4">
            احتياط {game.awayCompetitor.name}
          </h3>
          {awaySubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {awaySubs.map((sub) => {
                const details = getPlayerDetails(sub.id);
                return (
                  <div key={sub.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-850">
                    <div className="h-7 w-7 rounded-full bg-red-950 border border-red-500/20 overflow-hidden shrink-0">
                      <img
                        src={getPlayerImageUrl(sub)}
                        alt={details.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-200">{details.name}</div>
                      <div className="text-[9px] text-zinc-500">{sub.position?.name || "بديل"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-4">لا يوجد لاعبين بدلاء مسجلين.</p>
          )}
        </div>
      </div>

    </div>
  );
}
