import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch("https://webws.365scores.com/web/games/featured/?appTypeId=5&langId=27&timezoneName=Africa/Casablanca&userCountryId=127&sports=1&showOdds=true&numberOfGames=4&context=1");
    if (!res.ok) throw new Error("Failed to fetch featured games from 365scores");
    const json = await res.json();
    
    // Return all featured games
    const games = json.games || [];
    
    return NextResponse.json({
      success: true,
      data: games
    });
  } catch (err: any) {
    console.error("Featured game API error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
