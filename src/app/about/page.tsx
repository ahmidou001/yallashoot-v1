import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Trophy, Zap, Globe, HeartHandshake, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "من نحن - يلا شوت لايف",
  description: "تعرف على موقع وتطبيق يلا شوت لايف، منصتك الأولى لمتابعة نتائج مباريات كرة القدم المباشرة، جداول الترتيب، وإحصائيات الدوري الإسباني والإنجليزي والعربي.",
  openGraph: {
    title: "من نحن - يلا شوت لايف",
    description: "تغطية رياضية حية وشاملة لأبرز المباريات والدوريات العالمية والعربية.",
  },
};

export default function AboutPage() {
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
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          منصة رياضية موثوقة
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
          <Trophy className="h-4 w-4" />
          يلا شوت لايف yallahsoot
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 leading-snug">
          من نحن - عن منصة يلا شوت الرياضية
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
          موقع وتطبيق **يلا شوت لايف** هو منصة رياضية عربية متكاملة تهدف إلى تقديم تغطية لحظية وشاملة لكافة مباريات كرة القدم المحلية والعالمية، من خلال متابعة دقيقة لنتائج اللقاءات حية، جداول الترتيب، قائمة الهدافين، والتحليلات الفنية بمختلف المناطق الزمنية.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="font-extrabold text-base text-zinc-150">نتائج حية وتحديث فوري</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            نعتمد على أفضل خوادم البيانات الرياضية لنقل نتائج المباريات والأهداف والإنذارات لحظة بلحظة دون أي تأخير.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe className="h-5 w-5" />
          </div>
          <h2 className="font-extrabold text-base text-zinc-150">تغطية لكل الدوريات</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            تغطية شاملة لجميع الدوريات الكبرى كالدوري الإنجليزي والإسباني والسعودي، بالإضافة للبطولة المغربية وكأس العالم.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="font-extrabold text-base text-zinc-150">مساحة تفاعلية للجمهور</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            نوفر للزوار مساحة للتعليق والتفاعل مع المباريات واختيار الأندية المفضلة للحصول على إشعارات مخصصة.
          </p>
        </div>
      </div>

      {/* Mission & Vision Detailed Text */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 text-zinc-300 text-sm leading-relaxed">
        <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
          <HeartHandshake className="h-5 w-5 text-emerald-400" />
          رؤيتنا ورسالتنا
        </h2>
        <p>
          يسعى فريق **يلا شوت لايف** لتوفير تجربة تصفح سلسة وسريعة على كافة أجهزة الهواتف والحواسيب، مع الالتزام التام بمعايير السرعة، الأمان، والشفافية. نحن نعمل باستمرار على تطوير خدماتنا وإتاحة كافة البيانات الرياضية بدقة ووضوح.
        </p>
        <p>
          إذا كان لديك أي استفسار أو اقتراح لتطوير خدماتنا، يسعدنا تواصلك معنا مباشرة عبر صفحة <Link href="/contact" className="text-emerald-400 font-bold hover:underline">اتصل بنا</Link>.
        </p>
      </div>
    </div>
  );
}
