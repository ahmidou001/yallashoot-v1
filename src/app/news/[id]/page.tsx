import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" dir="rtl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 mb-6 transition"
      >
        <ChevronLeft className="h-4 w-4" />
        العودة للرئيسية
      </Link>
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 text-center text-zinc-400 text-sm">
        <p>تعذر تحميل المقال. الرجاء المحاولة مرة أخرى.</p>
      </div>
    </div>
  );
}