import { NextRequest, NextResponse } from "next/server";
import { getHeadToHead } from "@/services/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/match/[id]/h2h?matchupId=... - Proxy to 365scores H2H
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const { searchParams } = new URL(request.url);
    const matchupId = searchParams.get("matchupId");

    if (!id || !matchupId) {
      return NextResponse.json({ success: false, error: "Missing game ID or matchup ID" }, { status: 400 });
    }

    const data = await getHeadToHead(id, matchupId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`GET match ${id} H2H error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch head-to-head records" },
      { status: 500 }
    );
  }
}
