import { NextRequest, NextResponse } from "next/server";
import { signSecureStreamUrl } from "@/lib/crypto";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { extractIdFromSlug } from "@/lib/matchSlug";

export const dynamic = "force-dynamic";

/**
 * POST /api/refresh-url
 * Body: { slug: string, serverIndex?: number }
 *
 * Signs the stream URL with the actual client User-Agent (from the browser request),
 * ensuring the MD5 hash matches what Nginx expects.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, serverIndex = 0, startTime } = body || {};

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Extract real User-Agent from browser request (critical for Nginx MD5 match)
    const userAgent = request.headers.get("user-agent") || "";
    const streamDomain = process.env.VPS_STREAM_DOMAIN || "stream.yalashout.online";
    const secret = process.env.STREAM_SECRET_KEY;

    // Helper to fetch and sign the 24/7 main stream as fallback
    const getMainStreamUrl = async () => {
      const mongoose = require("mongoose");
      const StreamSchema = new mongoose.Schema(
        { outputUrl: String, isMainStream: Boolean, status: String },
        { strict: false }
      );
      const Stream = mongoose.models.Stream || mongoose.model("Stream", StreamSchema);
      const mainStream = await Stream.findOne({ isMainStream: true }).lean();

      if (!mainStream || !mainStream.outputUrl) return null;

      let cleanUrl = mainStream.outputUrl.replace("stream.chofmatch.live", streamDomain);
      try {
        const urlObj = new URL(cleanUrl);
        urlObj.searchParams.delete("md5");
        urlObj.searchParams.delete("expires");
        cleanUrl = urlObj.toString();
      } catch {}

      if (cleanUrl.includes(".m3u8") && secret && cleanUrl.includes(streamDomain)) {
        return signSecureStreamUrl(cleanUrl, secret, userAgent);
      }
      return cleanUrl;
    };

    // Handle 24/7 Main Stream refresh request
    if (slug === "main-stream-247") {
      await dbConnect();
      const signedUrl = await getMainStreamUrl();
      if (!signedUrl) {
        return NextResponse.json({ error: "Main stream not active" }, { status: 404 });
      }
      return NextResponse.json({ url: signedUrl }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      });
    }

    const id = extractIdFromSlug(slug);
    const queryOr: any[] = [
      { "matches.slug": slug },
      { "matches.id": slug },
      { "matches.id": String(id) },
    ];
    if (Number(id)) {
      queryOr.push({ "matches.id": Number(id) });
    }

    await dbConnect();
    const liveMatchDoc = await LiveMatch.findOne({
      $or: queryOr,
    })
      .sort({ _id: -1 })
      .lean();

    const match = liveMatchDoc ? (liveMatchDoc as any).matches.find(
      (m: any) => m.slug === slug || String(m.id) === String(id) || String(m.id) === String(slug)
    ) : null;

    // Anti-Bot / Anti-DMCA check: Lock stream until 30 minutes before kickoff
    const matchStartTimeStr = match?.startTime || startTime;
    if (matchStartTimeStr) {
      const matchTime = new Date(matchStartTimeStr).getTime();
      const now = Date.now();
      const UNLOCK_WINDOW_MS = 30 * 60 * 1000;
      const isFinished = match?.status === "finished" || match?.statusGroup === 4;
      const isLive = match?.status === "live" || match?.statusGroup === 3;

      if (!isLive && !isFinished && !isNaN(matchTime) && matchTime - now > UNLOCK_WINDOW_MS) {
        const remainingSeconds = Math.max(0, Math.floor((matchTime - UNLOCK_WINDOW_MS - now) / 1000));
        return NextResponse.json(
          {
            locked: true,
            message: "البث المباشر سيبدأ قبل 30 دقيقة من انطلاق المباراة",
            unlocksInSeconds: remainingSeconds,
            unlockTime: new Date(matchTime - UNLOCK_WINDOW_MS).toISOString(),
            startTime: matchStartTimeStr,
          },
          {
            status: 200,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
              Pragma: "no-cache",
            },
          }
        );
      }
    }

    // Get all available stream URLs (primary + alternates)
    const allUrls: string[] = [];
    if (match) {
      if (match.streamUrl && match.streamUrl.trim() !== "" && match.streamUrl !== "غير محدد") {
        allUrls.push(match.streamUrl);
      }
      if (Array.isArray(match.alternateStreamUrls)) {
        match.alternateStreamUrls.forEach((u: string) => {
          if (u && u.trim() !== "") allUrls.push(u);
        });
      }
    }

    const rawUrl = allUrls[serverIndex] || allUrls[0];
    if (!rawUrl) {
      // Fall back seamlessly to 24/7 Main Stream if match has no custom stream!
      const fallbackSignedUrl = await getMainStreamUrl();
      if (fallbackSignedUrl) {
        return NextResponse.json({ url: fallbackSignedUrl });
      }
      return NextResponse.json({ error: "Stream not available" }, { status: 404 });
    }

    // Replace legacy domain and strip old params
    let cleanUrl = rawUrl.replace("stream.chofmatch.live", streamDomain);
    try {
      const urlObj = new URL(cleanUrl);
      urlObj.searchParams.delete("md5");
      urlObj.searchParams.delete("expires");
      cleanUrl = urlObj.toString();
    } catch {
      // keep as-is
    }

    // Sign with the browser's actual User-Agent
    const isHls = cleanUrl.includes(".m3u8");
    let signedUrl = cleanUrl;
    if (isHls && secret && cleanUrl.includes(streamDomain)) {
      signedUrl = signSecureStreamUrl(cleanUrl, secret, userAgent);
    }

    return NextResponse.json(
      {
        url: signedUrl,
        serverIndex,
        serverCount: Math.max(allUrls.length, 1),
        servers: allUrls.map((_, i) => ({ id: i, label: `خادم ${i + 1}` })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error("POST /api/refresh-url error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}