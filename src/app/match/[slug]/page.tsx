import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getGameDetails } from "@/services/api";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { signSecureStreamUrl, generateStreamToken } from "@/lib/crypto";
import MatchDetailsClient from "@/components/MatchDetailsClient";
import { extractIdFromSlug } from "@/lib/matchSlug";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * Dynamically queries Dailymotion for beIN Sports highlights of the match
 */
async function getMatchHighlightIframe(homeTeam: string, awayTeam: string): Promise<string | null> {
  try {
    const searchString = `beIN Sports ملخص مباراة ${homeTeam} ${awayTeam}`;
    const query = encodeURIComponent(searchString);
    const res = await fetch(`https://api.dailymotion.com/videos?fields=id,title&search=${query}&limit=5`, {
      next: { revalidate: 3600 } // Cache results for 1 hour
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    
    if (json && Array.isArray(json.list) && json.list.length > 0) {
      // Find the best matching title that has at least one of the team names
      const bestVideo = json.list.find((v: any) => {
        const title = v.title.toLowerCase();
        return title.includes(homeTeam.toLowerCase()) || title.includes(awayTeam.toLowerCase());
      }) || json.list[0];
      
      return `https://geo.dailymotion.com/player/xakml.html?video=${bestVideo.id}&customConfig%5Bpremium%5D=false`;
    }
  } catch (error) {
    console.error("Highlight scraper error:", error);
  }
  return null;
}

/**
 * Generate Dynamic SEO Metadata for Match Details Page
 */
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  try {
    const data = await getGameDetails(id);
    if (!data || !data.game) {
      return {
        title: "المباراة غير موجودة - يلا شوت لايف",
      };
    }

    const { homeCompetitor, awayCompetitor } = data.game;
    const titleText = `بث مباشر مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} | نتائج المباريات والتشكيلة`;
    const descText = `تابع التغطية المباشرة والبث المباشر لمباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم مع التشكيلة الرسمية والإحصائيات الحية لحظة بلحظة.`;

    return {
      title: titleText,
      description: descText,
      openGraph: {
        title: titleText,
        description: descText,
        type: "video.other",
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "تفاصيل المباراة - يلا شوت لايف",
    };
  }
}

/**
 * Server Page Component
 */
export default async function MatchPage({ params }: RouteParams) {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);

  // 1. Fetch match details from upstream API
  let detailsData;
  try {
    detailsData = await getGameDetails(id);
  } catch (error) {
    console.error("Failed to load match details on server:", error);
  }

  if (!detailsData || !detailsData.game) {
    notFound();
  }

  // 2. Query stream config from LiveMatch collection
  let streamData = null;
  try {
    await dbConnect();
    const doc = await LiveMatch.findOne({ "matches.id": id });
    
    if (doc && Array.isArray(doc.matches)) {
      const match = doc.matches.find((m: any) => String(m.id) === String(id));
      const streamUrlRaw = match?.streamUrl;
      
      if (streamUrlRaw && streamUrlRaw !== "غير محدد" && streamUrlRaw.trim() !== "") {
        const streamDomain = process.env.VPS_STREAM_DOMAIN || "stream.yalashout.online";
        const secret = process.env.STREAM_SECRET_KEY;
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "";
        
        let signedStreamUrl = streamUrlRaw;
        const isSecureDomain = signedStreamUrl.includes("stream.chofmatch.live") || signedStreamUrl.includes(streamDomain);

        if (isSecureDomain && secret) {
          signedStreamUrl = signedStreamUrl.replace("stream.chofmatch.live", streamDomain);
          signedStreamUrl = signSecureStreamUrl(signedStreamUrl, secret, userAgent);
        }

        const { token, expires } = generateStreamToken(id);

        streamData = {
          streamType: (signedStreamUrl.includes(".m3u8") ? "hls" : signedStreamUrl.includes("youtube.com") || signedStreamUrl.includes("youtu.be") ? "youtube" : "iframe") as "hls" | "youtube" | "iframe" | "other",
          streamUrl: signedStreamUrl,
          tokenRequired: true,
          token,
          expires,
          channel: match?.channel || null,
          commentator: match?.commentator || null,
        };
      }
    }
  } catch (error) {
    console.error("Failed to connect to Mongo or query stream slots:", error);
  }

  // 3. If finished, fetch or build match summary iframe URL
  let highlightUrl = null;
  if (detailsData.game.statusGroup === 4) {
    // Check if the streamUrl was entered in the dashboard (might be the highlight embed code or url)
    if (streamData && streamData.streamUrl) {
      highlightUrl = streamData.streamUrl;
    } else {
      // Scrape from Dailymotion
      highlightUrl = await getMatchHighlightIframe(
        detailsData.game.homeCompetitor.name,
        detailsData.game.awayCompetitor.name
      );
    }
    
    // Default fallback
    if (!highlightUrl) {
      highlightUrl = `https://geo.dailymotion.com/player/xakml.html?video=k1ARtcE08LXlXBHI2Ge&customConfig%5Bpremium%5D=false`;
    }
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <MatchDetailsClient
        initialDetails={detailsData}
        gameId={id}
        streamData={streamData}
        highlightUrl={highlightUrl}
      />
    </div>
  );
}
