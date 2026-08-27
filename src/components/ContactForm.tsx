"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "استفسار عام",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
      {submitted ? (
        <div className="text-center py-12 space-y-4">
          <div className="h-16 w-16 bg-emerald-950 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100">تم استلام رسالتك بنجاح!</h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            شكراً لتواصلك معنا. سيقوم فريق دعم يلا شوت لايف بمراجعة رسالتك والرد عليك عبر البريد الإلكتروني في أقرب وقت.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", subject: "استفسار عام", message: "" });
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition cursor-pointer"
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-zinc-300">الاسم الكامل *</label>
              <input
                id="name"
                type="text"
                required
                placeholder="أدخل اسمك الكريم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-zinc-300">البريد الإلكتروني *</label>
              <input
                id="email"
                type="email"
                required
                placeholder="example@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label htmlFor="subject" className="text-xs font-bold text-zinc-300">موضوع الرسالة</label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none transition cursor-pointer"
            >
              <option value="استفسار عام">استفسار عام</option>
              <option value="اقتراح تطويري">اقتراح لتطوير الموقع</option>
              <option value="بلاغ عن مشكلة فنية">بلاغ عن مشكلة فنية</option>
              <option value="إشعار حقوق النشر DMCA">إشعار حقوق النشر (DMCA Notice)</option>
              <option value="شراكة أو إعلانات">طلب إعلان أو شراكة</option>
            </select>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-xs font-bold text-zinc-300">الرسالة *</label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="اكتب تفاصيل رسالتك هنا..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/10 min-h-[48px]"
          >
            <Send className="h-4 w-4" />
            إرسال الرسالة الآن
          </button>
        </form>
      )}
    </div>
  );
}
