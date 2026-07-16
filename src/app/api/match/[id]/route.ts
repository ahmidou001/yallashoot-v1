import { NextRequest, NextResponse } from "next/server";
import { getGameDetails } from "@/services/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/match/[id] - Proxy to 365scores game details
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

    const data = await getGameDetails(id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`GET match details error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch match details" },
      { status: 500 }
    );
  }
}
