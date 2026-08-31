import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Highlight from "@/models/Highlight";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const competition = searchParams.get("competition");
    const search = searchParams.get("search");

    const query: any = { status: "published" };

    if (gameId) {
      query.gameId = String(gameId);
    }
    if (competition) {
      query.competition = { $regex: competition, $options: "i" };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { competition: { $regex: search, $options: "i" } },
        { homeTeam: { $regex: search, $options: "i" } },
        { awayTeam: { $regex: search, $options: "i" } },
      ];
    }

    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    let queryExec = Highlight.find(query).sort({ isFeatured: -1, createdAt: -1 });
    if (limit && limit > 0) {
      queryExec = queryExec.limit(limit);
    }

    const highlights = await queryExec.lean();

    return NextResponse.json({ success: true, data: highlights });
  } catch (error: any) {
    console.error("Error fetching public highlights:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch highlights" },
      { status: 500 }
    );
  }
}
