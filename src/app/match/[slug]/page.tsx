import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getGameDetails } from "@/services/api";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import MatchDetailsClient from "@/components/MatchDetailsClient";
import { extractIdFromSlug } from "@/lib/matchSlug";
import { signSecureStreamUrl } from "@/lib/crypto";

type RouteParams = {
  params: Promise<{ slug: string }>;
};



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

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const edgeDomain = process.env.VPS_STREAM_DOMAIN || "stream.yalashout.online";
  const secret = process.env.STREAM_SECRET_KEY || "MySuperSecretKeyForKooraLive2026";

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

  // 2. Query stream config & sign servers at SSR time (matches yalla_player architecture)
  let streamData: {
    hasStream: boolean;
    streamType: "hls" | "youtube" | "iframe" | "other";
    streamUrl?: string;
    iframeHtml?: string | null;
    channel?: string | null;
    commentator?: string | null;
    serverCount: number;
  } | null = null;

  let servers: { label: string; signedUrl: string }[] = [];

  try {
    await dbConnect();
    const queryOr: any[] = [
      { "matches.slug": slug },
      { "matches.id": slug },
      { "matches.id": String(id) },
    ];
    if (Number(id)) {
      queryOr.push({ "matches.id": Number(id) });
    }

    const doc = await LiveMatch.findOne({
      $or: queryOr,
    }).sort({ _id: -1 }).lean();

    if (doc && Array.isArray(doc.matches)) {
      const match = doc.matches.find(
        (m: any) => m.slug === slug || String(m.id) === String(id) || String(m.id) === String(slug)
      );
      const streamUrlRaw = match?.streamUrl;

      if (streamUrlRaw && streamUrlRaw !== "غير محدد" && streamUrlRaw.trim() !== "") {
        const isIframe = streamUrlRaw.trim().startsWith("<") || streamUrlRaw.includes("iframe");
        const isYoutube = streamUrlRaw.includes("youtube.com") || streamUrlRaw.includes("youtu.be");
        const isHls = streamUrlRaw.includes(".m3u8");

        const rawUrls: string[] = [
          ...(!isIframe ? [streamUrlRaw.replace("stream.chofmatch.live", edgeDomain)] : []),
          ...((match as any).alternateStreamUrls || [])
            .filter((u: string) => u && u.trim() !== "" && !u.includes("iframe"))
            .map((u: string) => u.replace("stream.chofmatch.live", edgeDomain)),
        ];

        servers = rawUrls.map((url, i) => ({
          label: i === 0 ? "خادم 1" : `خادم ${i + 1}`,
          signedUrl: signSecureStreamUrl(url, secret, userAgent) || url,
        }));

        streamData = {
          hasStream: true,
          streamType: isHls ? "hls" : isYoutube ? "youtube" : isIframe ? "iframe" : "other",
          streamUrl: isIframe ? undefined : streamUrlRaw,
          iframeHtml: isIframe ? streamUrlRaw : null,
          channel: match?.channel || null,
          commentator: match?.commentator || null,
          serverCount: servers.length > 0 ? servers.length : (isIframe ? 1 : 0),
        };
      }
    }
  } catch (error) {
    console.error("Failed to connect to Mongo or query stream slots:", error);
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <MatchDetailsClient
        initialDetails={detailsData}
        gameId={id}
        matchSlug={slug}
        streamData={streamData}
        servers={servers}
      />
    </div>
  );
}



