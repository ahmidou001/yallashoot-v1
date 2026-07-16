import { NextRequest, NextResponse } from "next/server";
import { getGameStats } from "@/services/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/match/[id]/stats - Proxy to 365scores game stats
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing game ID" }, { status: 400 });
    }

    const data = await getGameStats(id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`GET match ${id} stats error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch match statistics" },
      { status: 500 }
    );
  }
}
