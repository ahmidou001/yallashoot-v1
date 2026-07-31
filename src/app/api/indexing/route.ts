import { NextRequest, NextResponse } from "next/server";
import { notifyAllSearchEngines, notifyGoogleIndexing, notifyIndexNow } from "@/lib/indexing";

export const dynamic = "force-dynamic";

/**
 * POST /api/indexing - Send instant crawl notification to Google & Bing
 * Body: { url: "https://www.yallahsoot.com/news/article-slug", target?: "all" | "google" | "bing" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, target = "all" } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "Missing or invalid url parameter" }, { status: 400 });
    }

    let result = { google: false, indexNow: false };

    if (target === "google") {
      result.google = await notifyGoogleIndexing(url);
    } else if (target === "bing") {
      result.indexNow = await notifyIndexNow(url);
    } else {
      result = await notifyAllSearchEngines(url);
    }

    return NextResponse.json({
      success: true,
      message: "Indexing request sent successfully",
      url,
      result,
    });
  } catch (error: any) {
    console.error("Indexing API route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
