import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      const article = await Article.findOne({ slug, status: "published" }).lean();
      if (!article) {
        return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: article });
    }

    if (id) {
      const article = await Article.findById(id).lean();
      if (!article) {
        return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: article });
    }

    const articles = await Article.find({ status: "published" })
      .sort({ published_at: -1, created_at: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    console.error("Error fetching news in yallashoot API:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب الأخبار" },
      { status: 500 }
    );
  }
}