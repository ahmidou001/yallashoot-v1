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

    if (!doc) {
      return NextResponse.json({ success: false, message: "No active stream found for this match" }, { status: 404 });
    }

    // Find the specific match details
    const match = doc.matches.find((m: any) => String(m.id) === String(gameId));
    const streamUrlRaw = match?.streamUrl;

    if (!streamUrlRaw || streamUrlRaw === "غير محدد" || streamUrlRaw.trim() === "") {
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
    let streamType: "iframe" | "hls" | "youtube" | "other" = "iframe";
    if (streamUrlRaw.includes(".m3u8")) {
      streamType = "hls";
    } else if (streamUrlRaw.includes("youtube.com") || streamUrlRaw.includes("youtu.be")) {
      streamType = "youtube";
    }

    // Nginx Secure URL Signing
    const streamDomain = process.env.VPS_STREAM_DOMAIN || "stream.yalashout.online";
    const secret = process.env.STREAM_SECRET_KEY;
    const userAgent = request.headers.get("user-agent") || "";
    
    let signedStreamUrl = streamUrlRaw;
    const isSecureDomain = signedStreamUrl.includes("stream.chofmatch.live") || signedStreamUrl.includes(streamDomain);

    if (isSecureDomain && secret) {
      // Replace fallback domain if matching
      signedStreamUrl = signedStreamUrl.replace("stream.chofmatch.live", streamDomain);
      
      // Perform MD5 secure link signing
      signedStreamUrl = signSecureStreamUrl(signedStreamUrl, secret, userAgent);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          gameId,
          homeTeam: match.teamHome?.name || "",
          awayTeam: match.teamAway?.name || "",
          streamType,
          streamUrl: signedStreamUrl,
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
