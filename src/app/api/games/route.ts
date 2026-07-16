import { NextRequest, NextResponse } from "next/server";
import { getGamesList } from "@/services/api";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";

export const dynamic = "force-dynamic";

/**
 * GET /api/games?date=DD/MM/YYYY
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let date = searchParams.get("date");

    if (!date) {
      // Default to today's date in DD/MM/YYYY format
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      date = `${dd}/${mm}/${yyyy}`;
    }

    // Call service to fetch games from 365scores
    const gamesData = await getGamesList(date);

    // Cross-reference with saved dashboard matches to verify active streams
    try {
      await dbConnect();
      
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = date.split("/");
      if (parts.length === 3) {
        const dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        const liveMatchDoc = await LiveMatch.findOne({ date: dateStr }).lean();
        
        if (liveMatchDoc && Array.isArray(liveMatchDoc.matches)) {
          const activeStreamIds = new Set(
            liveMatchDoc.matches
              .filter((m: any) => m.streamUrl && m.streamUrl !== "غير محدد" && m.streamUrl.trim() !== "")
              .map((m: any) => String(m.id))
          );
          
          // Append isStream property to games
          if (gamesData && Array.isArray(gamesData.games)) {
            gamesData.games = gamesData.games.map((game: any) => ({
              ...game,
              hasStream: activeStreamIds.has(String(game.id)),
            }));
          }
        }
      }
    } catch (dbError) {
      console.error("Database error while merging stream flags:", dbError);
      // Fallback: Return original 365scores data without stream indicators if DB is down
    }

    return NextResponse.json({ success: true, data: gamesData });
  } catch (error: any) {
    console.error("GET games route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch games list" },
      { status: 500 }
    );
  }
}
