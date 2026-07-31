import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileCheck, AlertTriangle, Copyright, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "شروط الاستخدام وحقوق النشر - يلا شوت لايف",
  description: "اتفاقية وشروط الاستخدام وسياسة حقوق النشر لموقع وتطبيق يلا شوت لايف yallahsoot.",
  openGraph: {
    title: "شروط الاستخدام وحقوق النشر - يلا شوت لايف",
    description: "الأحكام الشروط القانونية لاستخدام منصة وتطبيق يلا شوت لايف.",
  },
};

export default function TermsPage() {
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
          <Scale className="h-4 w-4 text-emerald-400" />
          الشروط والأحكام
        </span>
      </div>

      {/* Header Title */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
          <FileCheck className="h-4 w-4" />
          اتفاقية الاستخدام
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
          شروط الاستخدام وسياسة الملكية - يلا شوت لايف
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          دخولك واستخدامك لمنصة **yallahsoot.com** يعني موافقتك الكاملة على الشروط المدونة أدناه.
        </p>
      </div>

      {/* Content Sections */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Scale className="h-5 w-5 text-emerald-400" />
            1. القواعد العامة والتصفح
          </h2>
          <p>
            يُتفق على أن استخدام موقع **يلا شوت لايف** يقتصر على الأغراض المشرعة والرياضية فقط. يُحظر استخدام الموقع بأي طريقة من شأنها إلحاق الضرر بالخوادم أو تعطيل الخدمة للزوار الآخرين.
          </p>
        </section>

        {/* Section 2: Intellectual Property & DMCA */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Copyright className="h-5 w-5 text-emerald-400" />
            2. الملكية الفكرية وحقوق النشر (DMCA Notice)
          </h2>
          <p>
            جميع الشعارات والعلامات التجارية الخاصة بالأندية والدوريات المعروضة هي ملك لأصحابها وتستخدم لأغراض التعريف التوضيحي الرياضي فقط. 
          </p>
          <p>
            موقع **يلا شوت لايف** لا يقوم باستضافة أي بث مباشر أو فيديوهات على خوادمه الخاصة إطلاقاً، بل يعمل كمحرك بحث ومجمع للروابط والبيانات الرياضية المتاحة علنياً على الإنترنت. إذا كنت تعتقد وجود أي انتهاك لحقوق النشر، يرجى مراسلتنا فوراً عبر صفحة <Link href="/contact" className="text-emerald-400 font-bold hover:underline">اتصل بنا</Link> ليتم التعامل مع الطلب وحذفه في غضون 24 ساعة.
          </p>
        </section>

        {/* Section 3: Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <AlertTriangle className="h-5 w-5 text-emerald-400" />
            3. إخلاء المسؤولية
          </h2>
          <p>
            نحن نبذل قصارى جهدنا لضمان دقة وتحديث التواريخ والأوقات ونتائج المباريات والإحصائيات، لكن المنصة غير مسؤولة عن أي تغييرات طارئة في جداول اللقاءات الصادرة عن الاتحادات الكروية الرسمية.
          </p>
        </section>

      </div>
    </div>
  );
}
