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
    const tag = searchParams.get("tag") || searchParams.get("team");

    if (slug) {
      const article = await Article.findOne({
        slug,
        status: "published",
        targetSite: "yallahsoot.com",
      }).lean();
      if (!article) {
        return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: article });
    }

    if (id) {
      const article = await Article.findOne({
        _id: id,
        status: "published",
        targetSite: "yallahsoot.com",
      }).lean();
      if (!article) {
        return NextResponse.json({ success: false, error: "المقال غير موجود" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: article });
    }

    if (tag) {
      const cleanTag = tag.trim();
      const regex = new RegExp(cleanTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      let teamArticles = await Article.find({
        status: "published",
        targetSite: "yallahsoot.com",
        $or: [{ tags: { $in: [regex] } }, { headline_ar: regex }],
      })
        .sort({ published_at: -1, created_at: -1 })
        .limit(limit)
        .lean();

      // Fallback: If no articles match this team/tag, return latest general published sports news
      if (!teamArticles || teamArticles.length === 0) {
        teamArticles = await Article.find({
          status: "published",
          targetSite: "yallahsoot.com",
        })
          .sort({ published_at: -1, created_at: -1 })
          .limit(limit)
          .lean();
      }

      return NextResponse.json(
        { success: true, data: teamArticles },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const articles = await Article.find({
      status: "published",
      targetSite: "yallahsoot.com",
    })
      .sort({ published_at: -1, created_at: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(
      { success: true, data: articles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching news in yallashoot API:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب الأخبار" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/news - Create/Save a news article and automatically notify Google & Bing Indexing APIs
 */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { headline_ar, body_ar, slug, image_url, source, tags, score } = body;

    if (!headline_ar || !body_ar) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: headline_ar, body_ar" },
        { status: 400 }
      );
    }

    const articleSlug = slug || headline_ar.toLowerCase().replace(/[^\w\u0621-\u064A]+/g, "-");

    const newArticle = await Article.create({
      headline_ar,
      body_ar,
      slug: articleSlug,
      image_url: image_url || "",
      source: source || "يلا شوت",
      tags: tags || [],
      score: score || 5,
      status: "published",
      published_at: new Date(),
    });

    // Auto-trigger instant indexing to Google & Bing
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yallahsoot.com";
    const articleUrl = `${siteUrl}/news/${newArticle.slug || newArticle._id}`;

    // Non-blocking call to notify search engines
    const { notifyAllSearchEngines } = await import("@/lib/indexing");
    notifyAllSearchEngines(articleUrl).catch((err) => {
      console.error("Auto indexing notification failed silently:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Article created and indexing notified successfully",
      data: newArticle,
      articleUrl,
    });
  } catch (error: any) {
    console.error("Error creating news article:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create article" },
      { status: 500 }
    );
  }
}