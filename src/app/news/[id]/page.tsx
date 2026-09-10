import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, ExternalLink, Tag, Clock, Share2, Sparkles, BookOpen } from "lucide-react";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { Metadata } from "next";
import NewsImage from "@/components/NewsImage";
import { toLatinNumerals } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  await connectDB();
  const article = await Article.findOne({
    $or: [{ slug: id }, { _id: mongooseId(id) }],
    status: "published",
  }).lean();

  if (!article) {
    return { title: "مقال غير موجود - يلا شوت" };
  }

  return {
    title: `${article.headline_ar} | يلا شوت - أخبار الرياضة`,
    description: article.body_ar.slice(0, 150),
    alternates: {
      canonical: `/news/${article.slug || id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: article.headline_ar,
      description: article.body_ar.slice(0, 150),
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

function mongooseId(id: string) {
  return id.match(/^[0-9a-fA-F]{24}$/) ? id : null;
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  await connectDB();

  const article = await Article.findOne({
    $or: [{ slug: id }, { _id: mongooseId(id) }],
    status: "published",
  }).lean();

  if (!article) {
    notFound();
  }

  const relatedArticles = await Article.find({
    status: "published",
    _id: { $ne: article._id },
  })
    .sort({ published_at: -1, created_at: -1 })
    .limit(4)
    .lean();

  const formattedDate = toLatinNumerals(
    new Date(article.published_at || article.created_at).toLocaleDateString(
      "ar-EG-u-nu-latn",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )
  );

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.headline_ar,
    "description": article.body_ar.slice(0, 150),
    "image": article.image_url ? [article.image_url] : [],
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.published_at || article.created_at,
    "author": [{
      "@type": "Organization",
      "name": article.source || "يلا شوت لايف",
      "url": "https://www.yallahsoot.com"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "يلا شوت لايف",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.yallahsoot.com/fav-icon.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.yallahsoot.com/news/${article.slug || id}`
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-350 transition bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-2 rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
          العودة لجدول المباريات والأخبار
        </Link>
        <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-zinc-400" />
          {formattedDate}
        </span>
      </div>

      {/* Main Article Container */}
      <article className="overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        {/* Cover Image */}
        {article.image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
            <NewsImage
              src={article.image_url}
              alt={article.headline_ar}
              className="h-full w-full object-cover"
              fallbackSrc="/new.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />
            <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between">
              <span className="rounded-lg bg-emerald-950/90 px-3 py-1 text-xs font-extrabold text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                {article.source || "أنباء رياضية"}
              </span>
              {article.score >= 8 && (
                <span className="rounded-lg bg-red-600/90 px-3 py-1 text-xs font-black text-white border border-red-500 backdrop-blur-md animate-pulse">
                  خبر عاجل 🔥
                </span>
              )}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Article Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-100 leading-snug">
            {article.headline_ar}
          </h1>

          {/* Tags List */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-b border-zinc-800/80 pb-4">
              {article.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 rounded-lg"
                >
                  <Tag className="h-3 w-3 text-emerald-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-invert max-w-none text-zinc-200 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
            {article.body_ar}
          </div>
        </div>
      </article>

      {/* Related News Section */}
      {relatedArticles.length > 0 && (
        <div className="mt-12 space-y-4">
          <h3 className="font-extrabold text-base sm:text-lg text-zinc-150 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            أخبار رياضية ذات صلة
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel: any) => (
              <Link
                key={rel._id}
                href={`/news/${rel.slug || rel._id}`}
                className="group flex gap-3.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition duration-200"
              >
                <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-zinc-950 shrink-0">
                  <NewsImage
                    src={rel.image_url}
                    alt={rel.headline_ar}
                    width={112}
                    height={80}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    fallbackSrc="/new.png"
                  />
                </div>
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-200 leading-tight group-hover:text-emerald-400 transition line-clamp-2">
                    {rel.headline_ar}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-bold">{rel.source}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}