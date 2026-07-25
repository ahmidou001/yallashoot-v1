"use client";

import React from "react";
import StreamSection from "./StreamSection";

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
  serverCount?: number;
  iframeHtml?: string | null;
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
  serverCount = 1,
  iframeHtml,
}: SecurePlayerProps) {
  const slug = matchSlug || gameId;

  if (isFinished && highlightUrl) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
        <iframe
          src={highlightUrl}
          className="absolute inset-0 h-full w-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title="ملخص المباراة"
        />
      </div>
    );
  }

  const matchStatus = isFinished ? "finished" : isLive ? "live" : "";

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      <StreamSection
        slug={slug}
        serverCount={serverCount}
        iframeHtml={iframeHtml || (streamType === "iframe" ? streamUrl : undefined)}
        matchStatus={matchStatus}
        matchTime={matchTime}
      />
    </div>
  );
}

