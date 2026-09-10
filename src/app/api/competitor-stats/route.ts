import { NextResponse } from "next/server";
import { getCompetitorStats } from "@/services/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") || searchParams.get("competitorId");
    const competitionId = searchParams.get("competitionId");

    if (!teamId) {
      return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
    }

    const data = await getCompetitorStats(teamId, competitionId || undefined);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching competitor stats API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch competitor stats" },
      { status: 500 }
    );
  }
}
