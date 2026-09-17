import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { submitToIndexNow } from "@/lib/indexing";
import { generateMatchSlug } from "@/lib/matchSlug";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.yallahsoot.com";

/**
 * GET /api/cron/indexnow
 * Triggered every hour by Vercel Cron (see vercel.json).
 * Submits all recent match URLs + important team/page URLs to IndexNow (Bing).
 * Security: protected by CRON_SECRET header set by Vercel.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const urlsToSubmit = new Set<string>();

    // 1. Static high-priority pages
    ["/", "/live", "/news", "/highlights", "/standings"].forEach((p) =>
      urlsToSubmit.add(`${BASE_URL}${p}`)
    );

    // 2. Recent match pages from last 60 days
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const docs = await LiveMatch.find({ date: { $gte: cutoff } })
      .sort({ date: -1 })
      .lean();

    const teamIdsSeen = new Set<string>();

    docs.forEach((doc: any) => {
      if (!Array.isArray(doc.matches)) return;
      doc.matches.forEach((m: any) => {
        if (!m || !m.id) return;

        const home = m.homeCompetitor || m.teamHome || m.home || { name: "team1" };
        const away = m.awayCompetitor || m.teamAway || m.away || { name: "team2" };

        const slug = m.slug || generateMatchSlug(home, away, m.id);
        urlsToSubmit.add(`${BASE_URL}/match/${slug}`);
        if (!slug.endsWith(`-${m.id}`)) {
          urlsToSubmit.add(`${BASE_URL}/match/${slug}-${m.id}`);
        }

        const homeId = (home.id || m.homeCompetitorId)?.toString();
        const awayId = (away.id || m.awayCompetitorId)?.toString();
        if (homeId) teamIdsSeen.add(homeId);
        if (awayId) teamIdsSeen.add(awayId);
      });
    });

    // 3. Important team pages (base + dynamically collected)
    ["1339", "227", "1224", "8633", "8634", "8456", "8455", "8464",
      "8543", "8548", "8650", "8649", "8648", "8871", "8852", "8853",
      "104", "106", "132", "139"].forEach((id) => teamIdsSeen.add(id));
    teamIdsSeen.forEach((id) => urlsToSubmit.add(`${BASE_URL}/team/${id}`));

    // 4. Standings league pages
    [5930, 572, 7, 11, 649, 557, 8935, 17, 25, 35, 624, 623].forEach((id) =>
      urlsToSubmit.add(`${BASE_URL}/standings/${id}`)
    );

    // 5. Submit in batches of 100
    const urlArray = Array.from(urlsToSubmit);
    const BATCH_SIZE = 100;
    const results = [];

    for (let i = 0; i < urlArray.length; i += BATCH_SIZE) {
      const batch = urlArray.slice(i, i + BATCH_SIZE);
      const result = await submitToIndexNow(batch);
      results.push({
        batch: i / BATCH_SIZE + 1,
        count: batch.length,
        success: result.success,
        status: result.status,
      });
    }

    const allSuccess = results.every((r) => r.success);
    return NextResponse.json({
      success: allSuccess,
      totalUrls: urlArray.length,
      batches: results,
      message: `Submitted ${urlArray.length} URLs to IndexNow in ${results.length} batch(es)`,
    });
  } catch (error: any) {
    console.error("[Cron/IndexNow] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
