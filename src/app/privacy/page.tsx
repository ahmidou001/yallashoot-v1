import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Shield, Lock, Eye, Cookie, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية - يلا شوت لايف",
  description: "سياسة الخصوصية الخاصة بموقع وتطبيق يلا شوت لايف. تعرف على كيفية حماية بيانات الزوار واستخدام ملفات الكوكيز وسياسات الأمان.",
  openGraph: {
    title: "سياسة الخصوصية - يلا شوت لايف",
    description: "نحن نلتزم بحماية خصوصية بيانات زوارنا وفقاً لأعلى معايير الأمان الشاملة.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" dir="rtl">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <Link
          href="/"
          aria-label="العودة للرئيسية"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-350 transition bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-2 rounded-xl min-h-[44px]"
        >
          <ChevronRight className="h-4 w-4" />
          العودة للرئيسية
        </Link>
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
          <Shield className="h-4 w-4 text-emerald-400" />
          حماية البيانات والخصوصية
        </span>
      </div>

      {/* Header Title */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
          <Lock className="h-4 w-4" />
          سياسة الخصوصية والأمان
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
          سياسة الخصوصية - يلا شوت لايف (yallahsoot.com)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          آخر تحديث: {new Date().toLocaleDateString("ar-MA", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Content Sections */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
        
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Eye className="h-5 w-5 text-emerald-400" />
            1. مقدمة واستخدام البيانات
          </h2>
          <p>
            نحن في **يلا شوت لايف (yallahsoot.com)** نولي أهمية قصوى لخصوصية زوارنا الكرام. تصف هذه الوثيقة أنواع المعلومات الشخصية التي يتم استلامها وجمعها وكيفية استخدامها لحماية وتطوير تجربة التصفح الخاصة بك.
          </p>
        </section>

        {/* Log Files */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            2. ملفات السجل (Log Files)
          </h2>
          <p>
            مثل العديد من المواقع الإلكترونية الأخرى، يستعمل موقع **يلا شوت لايف** ملفات السجل. تشمل المعلومات داخل ملفات السجل: عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، مزود خدمة الإنترنت (ISP)، التاريخ/الوقت، وصفحات الإحالة/الخروج لتجميع البيانات الديموغرافية وتحليل الاتجاهات دون التعرف على هوية الزائر الشخصية.
          </p>
        </section>

        {/* Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Cookie className="h-5 w-5 text-emerald-400" />
            3. ملفات تعريف الارتباط (Cookies)
          </h2>
          <p>
            موقعنا يستخدم ملفات تعريف الارتباط لتخزين المعلومات حول تفضيلات الزوار (مثل اختيار التوقيت المحلي والأندية المفضلة)، وتسجيل معلومات مخصصة عن الصفحات التي يصل إليها الزائر لتخصيص محتوى الصفحة وفقاً لنوع المتصفح.
          </p>
        </section>

        {/* Ad Networks */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            4. الشركاء الإعلانيون وأطراف ثالثة
          </h2>
          <p>
            قد يخدم خوادم الإعلانات التابعة لأطراف ثالثة أو شبكات الإعلانات إعلانات متوافقة تظهر على موقعنا. تستخدم هذه الشركات تكنولوجيا لإرسال الإعلانات والروابط مباشرة إلى متصفحك. لا يملك موقعنا أي وصول أو سيطرة على هذه الكوكيز التي تستخدمها الإعلانات الخارجيّة.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3 border-t border-zinc-800 pt-6">
          <h2 className="text-lg font-extrabold text-zinc-100">5. التواصل معنا</h2>
          <p>
            إذا كنت بحاجة إلى مزيد من المعلومات أو لديك أي أسئلة عن سياسة الخصوصية الخاصة بنا، لا تتردد في الاتصال بنا عبر صفحة <Link href="/contact" className="text-emerald-400 font-bold hover:underline">اتصل بنا</Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
