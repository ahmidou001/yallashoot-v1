import Link from "next/link";
import { BookOpen, ChevronRight, ChevronLeft, Clock, Tag, Flame } from "lucide-react";
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

interface NewsArchivePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsArchivePage({ searchParams }: NewsArchivePageProps) {
  const resolvedParams = await searchParams;
  const rawPage = parseInt(resolvedParams?.page || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const pageSize = 12;

  await connectDB();

  const totalArticles = await Article.countDocuments({ status: "published" });
  const totalPages = Math.max(1, Math.ceil(totalArticles / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * pageSize;

  const articles = await Article.find({ status: "published" })
    .sort({ published_at: -1, created_at: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  // Helper to build page window (e.g. 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

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
        <>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-850">
              <div className="text-xs text-zinc-400">
                صفحة <span className="font-mono font-bold text-zinc-200">{toLatinNumerals(safePage)}</span> من{" "}
                <span className="font-mono font-bold text-zinc-200">{toLatinNumerals(totalPages)}</span> ({toLatinNumerals(totalArticles)} خبر)
              </div>

              <div className="flex items-center gap-1.5 select-none">
                {/* Previous Button (Right arrow in RTL) */}
                {safePage > 1 ? (
                  <Link
                    href={`/news?page=${safePage - 1}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>السابق</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-900/40 border border-zinc-850/40 cursor-not-allowed">
                    <ChevronRight className="h-4 w-4" />
                    <span>السابق</span>
                  </span>
                )}

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-zinc-500 text-xs">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === safePage;
                    return (
                      <Link
                        key={`page-${p}`}
                        href={`/news?page=${p}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-mono font-bold transition ${
                          isCurrent
                            ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black scale-105"
                            : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-850 hover:text-white"
                        }`}
                      >
                        {toLatinNumerals(p)}
                      </Link>
                    );
                  })}
                </div>

                {/* Next Button (Left arrow in RTL) */}
                {safePage < totalPages ? (
                  <Link
                    href={`/news?page=${safePage + 1}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white transition"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-900/40 border border-zinc-850/40 cursor-not-allowed">
                    <span>التالي</span>
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/40 border border-zinc-850 rounded-2xl">
          لا تتوفر مقالات في الوقت الحالي.
        </div>
      )}
    </div>
  );
}
