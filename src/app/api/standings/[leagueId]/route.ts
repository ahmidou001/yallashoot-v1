import { NextRequest, NextResponse } from "next/server";
import { getCompetitionStandings } from "@/services/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/standings/[leagueId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string }> }
) {
  const { leagueId } = await context.params;
  try {
    const { searchParams } = new URL(request.url);
    const live = searchParams.get("live") === "true";

    if (!leagueId) {
      return NextResponse.json({ success: false, error: "Missing league ID" }, { status: 400 });
    }

    const data = await getCompetitionStandings(leagueId, live);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`GET standings ${leagueId} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
