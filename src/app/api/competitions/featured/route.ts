import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId") || "5930";

  try {
    const res = await fetch(`https://webws.365scores.com/web/stats/?appTypeId=5&langId=27&timezoneName=Africa/Casablanca&userCountryId=127&competitions=${competitionId}&statsTypes=1`);
    if (!res.ok) throw new Error("Failed to fetch stats from 365scores");
    const json = await res.json();
    
    const goalsCategory = json.stats?.athletesStats?.find((s: any) => s.id === 1);
    const competitors = json.competitors || [];
    
    const list = (goalsCategory?.rows || []).slice(0, 3).map((row: any) => {
      const team = competitors.find((c: any) => c.id === row.entity.competitorId) || { name: "غير معروف", id: row.entity.competitorId, type: 1 };
      return {
        rank: row.position + 1,
        name: row.entity.name,
        athleteId: row.entity.id,
        teamId: team.id,
        teamName: team.name,
        isNational: team.type === 2,
        value: parseInt(row.stats?.[0]?.value || "0", 10),
        imageVersion: row.entity.imageVersion || 1
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        competitionId,
        stats: list
      }
    });
  } catch (err: any) {
    console.error("Scorers API error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
