"use client";

import React from "react";
import StreamSection from "./StreamSection";

interface ServerItem {
  id?: number;
  label: string;
  signedUrl: string;
}

interface SecurePlayerProps {
  gameId: string;
  matchSlug?: string;
  streamType?: "iframe" | "hls" | "youtube" | "other";
  streamUrl?: string;
  tokenRequired?: boolean;
  token?: string;
  expires?: number;
  isLive?: boolean;
  isFinished?: boolean;
  highlightUrl?: string | null;
  matchTime?: string;
  matchStartTime?: string | number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  channelName?: string;
  commentatorName?: string;
  competitionName?: string;
  serverCount?: number;
  iframeHtml?: string | null;
  servers?: ServerItem[];
}

export default function SecurePlayer({
  gameId,
  matchSlug,
  streamType,
  streamUrl,
  isLive = false,
  isFinished = false,
  highlightUrl,
  matchTime,
  matchStartTime,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
  channelName,
  commentatorName,
  competitionName,
  serverCount = 1,
  iframeHtml,
  servers = [],
}: SecurePlayerProps) {
  const slug = matchSlug || gameId;
  const matchStatus = isFinished ? "finished" : isLive ? "live" : "";

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      <StreamSection
        slug={slug}
        servers={servers}
        serverCount={serverCount}
        iframeHtml={iframeHtml || (streamType === "iframe" ? streamUrl : undefined)}
        matchStatus={matchStatus}
        matchTime={matchTime}
        matchStartTime={matchStartTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeTeamLogo={homeTeamLogo}
        awayTeamLogo={awayTeamLogo}
        channelName={channelName}
        commentatorName={commentatorName}
        competitionName={competitionName}
      />
    </div>
  );
}


