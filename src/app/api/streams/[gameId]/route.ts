import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { verifyStreamToken, signSecureStreamUrl } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/streams/[gameId] - Fetch stream details for a specific game from LiveMatch
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    await dbConnect();
    const { gameId } = await context.params;

    if (!gameId) {
      return NextResponse.json({ success: false, error: "Missing gameId parameter" }, { status: 400 });
    }

    // Find the day document that contains this match ID in the matches array
    const queryOr: any[] = [{ "matches.id": String(gameId) }];
    if (Number(gameId)) queryOr.push({ "matches.id": Number(gameId) });

    const doc = await LiveMatch.findOne({ $or: queryOr }).sort({ _id: -1 }).lean();

    const getMainStreamFallback = async () => {
      const mongoose = require("mongoose");
      const StreamSchema = new mongoose.Schema(
        { outputUrl: String, isMainStream: Boolean, status: String },
        { strict: false }
      );
      const Stream = mongoose.models.Stream || mongoose.model("Stream", StreamSchema);
      const mainStream = await Stream.findOne({ isMainStream: true }).lean();

      if (!mainStream || !mainStream.outputUrl) return null;

      const streamDomain = process.env.VPS_STREAM_DOMAIN || "stream.yalashout.online";
      const secret = process.env.STREAM_SECRET_KEY;
      const userAgent = request.headers.get("user-agent") || "";
      let signedUrl = mainStream.outputUrl.replace("stream.chofmatch.live", streamDomain);
      if (signedUrl.includes(".m3u8") && secret && signedUrl.includes(streamDomain)) {
        signedUrl = signSecureStreamUrl(signedUrl, secret, userAgent);
      }
      return signedUrl;
    };

    if (!doc) {
      const fallbackUrl = await getMainStreamFallback();
      if (fallbackUrl) {
        return NextResponse.json({
          success: true,
          data: { gameId, streamType: "hls", streamUrl: fallbackUrl },
        });
      }
      return NextResponse.json({ success: false, message: "No active stream found for this match" }, { status: 404 });
    }

    // Find the specific match details
    const match = doc.matches.find((m: any) => String(m.id) === String(gameId));

    // Anti-Bot / Anti-DMCA check: Lock stream until 30 minutes before kickoff
    const matchStartTimeStr = match?.startTime;
    if (matchStartTimeStr) {
      const matchTime = new Date(matchStartTimeStr).getTime();
      const now = Date.now();
      const UNLOCK_WINDOW_MS = 30 * 60 * 1000;
      const isFinished = match?.status === "finished" || match?.statusGroup === 4;
      const isLive = match?.status === "live" || match?.statusGroup === 3;

      if (!isLive && !isFinished && !isNaN(matchTime) && matchTime - now > UNLOCK_WINDOW_MS) {
        const remainingSeconds = Math.max(0, Math.floor((matchTime - UNLOCK_WINDOW_MS - now) / 1000));
        return NextResponse.json({
          success: false,
          locked: true,
          message: "البث المباشر سيبدأ قبل 30 دقيقة من انطلاق المباراة",
          unlocksInSeconds: remainingSeconds,
          unlockTime: new Date(matchTime - UNLOCK_WINDOW_MS).toISOString(),
          startTime: matchStartTimeStr,
        });
      }
    }

    const streamUrlRaw = match?.streamUrl;

    if (!streamUrlRaw || streamUrlRaw === "غير محدد" || streamUrlRaw.trim() === "") {
      const fallbackUrl = await getMainStreamFallback();
      if (fallbackUrl) {
        return NextResponse.json({
          success: true,
          data: {
            gameId,
            homeTeam: match?.teamHome?.name || "",
            awayTeam: match?.teamAway?.name || "",
            streamType: "hls",
            streamUrl: fallbackUrl,
          },
        });
      }
      return NextResponse.json({ success: false, message: "No active stream found for this match" }, { status: 404 });
    }

    // Route protection: If the page requested token protection, verify the page token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const expiresStr = searchParams.get("expires");

    if (token && expiresStr) {
      const expires = parseInt(expiresStr, 10);
      const isValid = verifyStreamToken(gameId, token, expires);

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Playback token is invalid or has expired" },
          { status: 403 }
        );
      }
    }

    // Auto-detect stream type
    // Gather all valid server URLs
    const allUrls: string[] = [];
    if (streamUrlRaw && streamUrlRaw !== "غير محدد" && streamUrlRaw.trim() !== "") {
      allUrls.push(streamUrlRaw.trim());
    }
    if (Array.isArray(match?.alternateStreamUrls)) {
      match.alternateStreamUrls.forEach((u: string) => {
        if (typeof u === "string" && u.trim() !== "" && u !== "غير محدد" && !allUrls.includes(u.trim())) {
          allUrls.push(u.trim());
        }
      });
    }

    const streamDomain = process.env.VPS_STREAM_DOMAIN || "stream.yalashout.online";
    const secret = process.env.STREAM_SECRET_KEY;
    const userAgent = request.headers.get("user-agent") || "";

    const servers = allUrls.map((raw, idx) => {
      let url = raw;
      let sType: "iframe" | "hls" | "youtube" | "other" = "iframe";
      if (url.includes(".m3u8")) {
        sType = "hls";
        if (url.includes("stream.chofmatch.live")) {
          url = url.replace("stream.chofmatch.live", streamDomain);
        }
        if (secret && url.includes(streamDomain)) {
          url = signSecureStreamUrl(url, secret, userAgent);
        }
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        sType = "youtube";
      }
      return {
        id: idx,
        label: `خادم ${idx + 1}`,
        signedUrl: url,
        streamType: sType,
      };
    });

    const primaryServer = servers[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          gameId,
          homeTeam: match.teamHome?.name || "",
          awayTeam: match.teamAway?.name || "",
          streamType: primaryServer?.streamType || "iframe",
          streamUrl: primaryServer?.signedUrl || streamUrlRaw,
          serverCount: servers.length,
          servers,
          tokenRequired: !!token,
        },
      },
      {
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  } catch (error: any) {
    console.error(`GET stream for gameId ${context.params} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { 
        status: 500,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }
}
