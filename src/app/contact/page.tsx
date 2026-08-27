import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "اتصل بنا - يلا شوت لايف",
  description: "تواصل مع إدارة موقع وتطبيق يلا شوت لايف لمتابعة الاستفسارات، الاقتراحات، والبلاغات الفنية وحقوق النشر.",
  alternates: {
    canonical: "/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "اتصل بنا - يلا شوت لايف",
    description: "تواصل مع إدارة موقع وتطبيق يلا شوت لايف لمتابعة الاستفسارات والاقتراحات والبلاغات.",
    url: "https://www.yallahsoot.com/contact",
  },
};

export default function ContactPage() {
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
          <Mail className="h-4 w-4 text-emerald-400" />
          خدمة التواصل والإدارة
        </span>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
          <MessageSquare className="h-4 w-4" />
          اتصل بنا
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
          اتصل بإدارة منصة يلا شوت لايف (yallahsoot.com)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          نحن هنا لمساعدتك! يسعدنا استلام استفساراتك، ملاحظاتك لتطوير الخدمة، أو البلاغات الفنية وحقوق النشر.
        </p>
      </div>

      {/* Form Container */}
      <ContactForm />

      {/* Direct Contact Notice */}
      <div className="bg-zinc-900/60 border border-zinc-850 rounded-2xl p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        يمكنك أيضاً المراسلة المباشرة عبر البريد الإلكتروني: <span className="font-mono text-emerald-400">contact@yallahsoot.com</span>
      </div>
    </div>
  );
}
