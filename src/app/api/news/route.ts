import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/news?competitionId=XXX&langId=27
 * Proxy news articles from 365scores
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get("competitionId") || "";
    const langId = searchParams.get("langId") || "27";
    const page = searchParams.get("page") || "1";

    const apiUrl = `https://webws.365scores.com/web/articles/?appTypeId=5&langId=${langId}&timezoneName=Africa%2FCasablanca&userCountryId=127&competitions=${competitionId}&page=${page}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch news" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/news error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}