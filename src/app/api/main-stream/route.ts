import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import mongoose from "mongoose";
import { signSecureStreamUrl } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/main-stream - Retrieve the active 24/7 main live stream
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Find the stream document with isMainStream: true
    const collection = mongoose.connection.db?.collection("streams");
    if (!collection) {
      return NextResponse.json({ success: false, error: "Database collection not ready" }, { status: 500 });
    }

    const mainStreamDoc = await collection.findOne({ isMainStream: true });

    if (!mainStreamDoc) {
      return NextResponse.json(
        { success: false, message: "No 24/7 main stream currently selected" },
        {
          headers: {
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        }
      );
    }

    const rawUrl = mainStreamDoc.outputUrl || "";
    const userAgent = request.headers.get("user-agent") || "";
    const secret = process.env.STREAM_SECRET_KEY || "fallback_secret_key_123456";

    // Sign the secure output URL
    let signedUrl = rawUrl;
    if (rawUrl && rawUrl.includes(".m3u8")) {
      signedUrl = signSecureStreamUrl(rawUrl, secret, userAgent);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: mainStreamDoc._id.toString(),
          streamId: mainStreamDoc.streamId,
          label: mainStreamDoc.label || "البث المباشر الرئيسي 24/7",
          status: mainStreamDoc.status || "stopped",
          outputUrl: signedUrl,
          mode: mainStreamDoc.mode || "copy",
          isMainStream: true,
          updatedAt: mainStreamDoc.updatedAt || new Date(),
        },
      },
      {
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  } catch (error: any) {
    console.error("GET main-stream API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      {
        status: 500,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }
}
