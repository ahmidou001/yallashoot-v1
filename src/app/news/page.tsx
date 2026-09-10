import Link from "next/link";
import { BookOpen, ChevronRight, Clock, Tag, Flame } from "lucide-react";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { Metadata } from "next";
import NewsImage from "@/components/NewsImage";
import { toLatinNumerals } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "أحدث الأخبار الرياضية كورة لايف | يلا شوت",
  description: "تابع أحدث أخبار كرة القدم الأوروبية والعربية المترجمة والمحدثة لحظة بلحظة على يلا شوت.",
  alternates: {
    canonical: "/news",
  },
};

export default async function NewsArchivePage() {
  await connectDB();

  const articles = await Article.find({ status: "published" })
    .sort({ published_at: -1, created_at: -1 })
    .limit(30)
    .lean();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            أرشيف الأخبار الرياضية
          </h1>
          <p className="text-xs text-zinc-450 mt-1">
            تغطية إخبارية شاملة لأهم الأحداث والانتقالات الكروية العالمية والعربية
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-350 transition bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-2 rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article: any) => (
            <Link
              key={article._id}
              href={`/news/${article.slug || article._id}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition duration-200 shadow-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                <NewsImage
                  src={article.image_url}
                  alt={article.headline_ar}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  fallbackSrc="/new.png"
                />
                <span className="absolute bottom-2 right-2 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[9px] font-bold text-zinc-300 border border-zinc-800 backdrop-blur-xs">
                  {article.source || "أنباء رياضية"}
                </span>
                {article.score >= 8 && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-black text-white border border-red-500 animate-pulse">
                    عاجل
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-150 leading-snug group-hover:text-emerald-400 transition line-clamp-2">
                  {article.headline_ar}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-zinc-550 font-bold select-none border-t border-zinc-850 pt-2.5">
                  <span className="font-mono">
                    {toLatinNumerals(new Date(article.published_at || article.created_at).toLocaleDateString("ar-EG-u-nu-latn", {
                      day: "numeric",
                      month: "short",
                    }))}
                  </span>
                  <span className="text-emerald-400 group-hover:underline">اقرأ الخبر كامل &larr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/40 border border-zinc-850 rounded-2xl">
          لا تتوفر مقالات في الوقت الحالي.
        </div>
      )}
    </div>
  );
}
