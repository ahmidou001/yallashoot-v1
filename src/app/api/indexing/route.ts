import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow, notifyGoogleIndexing } from "@/lib/indexing";

export const dynamic = "force-dynamic";

/**
 * POST /api/indexing - Secure IndexNow & Google indexing trigger
 * Protected via INDEXING_PING_SECRET / CRON_SECRET token
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Security Token Validation
    const authHeader = request.headers.get("authorization");
    const secretKey = request.headers.get("x-secret-key") || request.nextUrl.searchParams.get("secret");
    const validSecret = process.env.INDEXING_PING_SECRET || process.env.CRON_SECRET;

    const isAuthorized =
      (authHeader && authHeader.replace("Bearer ", "") === validSecret) ||
      secretKey === validSecret;

    if (validSecret && !isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized request: Invalid or missing secret token" },
        { status: 401 }
      );
    }

    // 2. Extract & Filter URLs
    const body = await request.json();
    const { url, urls, urlList, target = "all" } = body;

    let targetUrls: string[] = [];
    if (Array.isArray(urlList)) {
      targetUrls = urlList.filter((u) => typeof u === "string" && u.trim() !== "");
    } else if (Array.isArray(urls)) {
      targetUrls = urls.filter((u) => typeof u === "string" && u.trim() !== "");
    } else if (typeof url === "string" && url.trim() !== "") {
      targetUrls = [url.trim()];
    }

    if (targetUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid url/urlList parameter" },
        { status: 400 }
      );
    }

    // 3. Dispatch Indexing Requests by Target
    if (target === "indexnow" || target === "bing") {
      const indexNowResult = await submitToIndexNow(targetUrls);
      return NextResponse.json({
        success: indexNowResult.success,
        message: indexNowResult.message,
        status: indexNowResult.status,
        urlList: targetUrls,
        result: { indexNow: indexNowResult },
      });
    }

    if (target === "google") {
      const googleResults = await Promise.all(
        targetUrls.map(async (u) => ({ url: u, success: await notifyGoogleIndexing(u) }))
      );
      const allSuccess = googleResults.every((r) => r.success);
      return NextResponse.json({
        success: allSuccess,
        urlList: targetUrls,
        result: { google: googleResults },
      });
    }

    // Default target === "all"
    const [indexNowResult, googleResults] = await Promise.all([
      submitToIndexNow(targetUrls),
      Promise.all(targetUrls.map(async (u) => ({ url: u, success: await notifyGoogleIndexing(u) }))),
    ]);

    return NextResponse.json({
      success: indexNowResult.success,
      message: "Indexing requests processed",
      urlList: targetUrls,
      result: {
        indexNow: indexNowResult,
        google: googleResults,
      },
    });
  } catch (error: any) {
    console.error("Indexing API route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
