import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { getGameDetails } from "@/services/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/streams - Retrieve all stream records across all dates
 */
export async function GET() {
  try {
    await dbConnect();
    // Fetch all documents that have matches
    const docs = await LiveMatch.find({});
    
    const streamsList: any[] = [];
    docs.forEach((doc) => {
      if (Array.isArray(doc.matches)) {
        doc.matches.forEach((m: any) => {
          if (m.streamUrl && m.streamUrl !== "غير محدد" && m.streamUrl.trim() !== "") {
            streamsList.push({
              gameId: m.id?.toString(),
              homeTeam: m.teamHome?.name || m.homeTeam?.name || "مستضيف",
              awayTeam: m.teamAway?.name || m.awayTeam?.name || "ضيف",
              streamType: m.streamUrl.includes(".m3u8") ? "hls" : m.streamUrl.includes("youtube.com") || m.streamUrl.includes("youtu.be") ? "youtube" : "iframe",
              streamUrl: m.streamUrl,
              isActive: m.status !== "canceled",
              tokenRequired: true, // Mark secure by default
              updatedAt: doc.updatedAt || doc.createdAt || new Date(),
            });
          }
        });
      }
    });

    return NextResponse.json({ success: true, data: streamsList });
  } catch (error: any) {
    console.error("GET streams API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/streams - Add or update a stream in LiveMatch daily document (upsert)
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { gameId, homeTeam, awayTeam, streamUrl } = body;
    
    if (!gameId || !streamUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: gameId, streamUrl" },
        { status: 400 }
      );
    }

    // 1. Fetch match details from 365scores to obtain the kickoff date (YYYY-MM-DD)
    const matchData = await getGameDetails(gameId);
    if (!matchData || !matchData.game) {
      return NextResponse.json({ success: false, error: "Match not found in 365scores" }, { status: 404 });
    }

    const kickoffDate = new Date(matchData.game.startTime);
    // Group date in GMT+1, mirroring the dashboard 4-hour offset rule
    const localTime = new Date(kickoffDate.getTime() + 1 * 60 * 60 * 1000);
    const adjustedTime = new Date(localTime.getTime() - 4 * 60 * 60 * 1000);
    const dateStr = adjustedTime.toISOString().split("T")[0]; // YYYY-MM-DD

    // 2. Fetch the LiveMatch document for this date
    let liveMatchDoc = await LiveMatch.findOne({ date: dateStr });
    if (!liveMatchDoc) {
      liveMatchDoc = new LiveMatch({ date: dateStr, matches: [] });
    }

    const matchesList = [...(liveMatchDoc.matches || [])];
    const matchIndex = matchesList.findIndex((m: any) => String(m.id) === String(gameId));

    const matchPayload = {
      id: String(gameId),
      streamUrl: streamUrl,
      teamHome: { name: homeTeam },
      teamAway: { name: awayTeam },
      status: matchData.game.statusGroup === 3 ? "LIVE" : matchData.game.statusGroup === 4 ? "ENDED" : "COMING_SOON",
      time: new Date(matchData.game.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      startTime: matchData.game.startTime,
    };

    if (matchIndex > -1) {
      // Update existing match slot
      matchesList[matchIndex] = {
        ...matchesList[matchIndex],
        ...matchPayload,
      };
    } else {
      // Add new match
      matchesList.push(matchPayload);
    }

    liveMatchDoc.matches = matchesList;
    liveMatchDoc.updatedAt = new Date();
    await liveMatchDoc.save();

    return NextResponse.json({ success: true, data: matchPayload });
  } catch (error: any) {
    console.error("POST streams API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/streams - Remove match stream from LiveMatch document matches list
 */
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: gameId" },
        { status: 400 }
      );
    }

    // Find the daily document containing this gameId
    const doc = await LiveMatch.findOne({ "matches.id": gameId });
    if (!doc) {
      return NextResponse.json({ success: false, error: "Stream slot not found" }, { status: 404 });
    }

    // Remove the match or clean up the streamUrl field
    doc.matches = doc.matches.filter((m: any) => String(m.id) !== String(gameId));
    doc.updatedAt = new Date();
    await doc.save();

    return NextResponse.json({ success: true, message: "Stream slot deleted successfully" });
  } catch (error: any) {
    console.error("DELETE streams API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
