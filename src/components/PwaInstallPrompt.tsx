"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, ShieldCheck, Zap, Share, PlusSquare } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone mode (installed)
    const isInStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    setIsStandalone(isInStandalone);
    if (isInStandalone) return; // Don't show if already installed

    // 2. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW registration error:", err));
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Check if user permanently dismissed widget
    const isWidgetDismissed = localStorage.getItem("pwa_widget_dismissed") === "true";

    // SMART UX: Never auto-open intrusive full-screen modal on first load!
    // Show only a sleek, non-intrusive floating button/badge
    if (!isWidgetDismissed) {
      setShowWidget(true);
    }

    // 5. Intercept Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isWidgetDismissed) {
        setShowWidget(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User choice result: ${outcome}`);
    setDeferredPrompt(null);
    setShowModal(false);
    if (outcome === "accepted") {
      setShowWidget(false);
      localStorage.setItem("pwa_widget_dismissed", "true");
    }
  };

  const handleDismissModal = () => {
    setShowModal(false);
  };

  const handleDismissWidget = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWidget(false);
    setShowModal(false);
    localStorage.setItem("pwa_widget_dismissed", "true");
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Sleek, Non-Intrusive Bottom Floating Action Badge (SofaScore / BeIN Sports Style) */}
      {showWidget && (
        <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 flex items-center animate-fadeIn select-none">
          <div className="relative group">
            {/* Tiny Dismiss (x) button */}
            <button
              onClick={handleDismissWidget}
              className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition shadow-md cursor-pointer"
              title="إخفاء النهائي"
              aria-label="إخفاء التثبيت"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Smart Floating Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:border-emerald-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md"
              title="تثبيت تطبيق يلا شوت لايف"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-sm shrink-0">
                <Download className="h-4 w-4" />
              </div>
              <span className="text-xs font-black text-zinc-150 hidden sm:inline">
                تثبيت التطبيق 📱
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Install Modal Dialog (Opened ONLY when user voluntarily clicks floating badge) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fadeIn select-none">
          <div
            className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden text-right"
            dir="rtl"
          >
            {/* Top glowing ambient effect */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

            {/* Close button */}
            <button
              onClick={handleDismissModal}
              className="absolute top-4 left-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              title="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-emerald-500/40 p-2 shadow-xl">
                  <img src="/logo.svg" alt="يلا شوت لايف" className="h-full w-full object-contain" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-md">
                  <Download className="h-3 w-3" />
                </span>
              </div>

              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full w-fit mb-1">
                  <Smartphone className="h-3 w-3" />
                  تطبيق أندرويد و آيفون الرسمي
                </span>
                <h3 className="text-lg font-black text-zinc-100 leading-tight">
                  تثبيت تطبيق يلا شوت لايف
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-5">
              قم بتثبيت تطبيق <strong className="text-emerald-400">يلا شوت لايف</strong> على جهازك لمتابعة مباريات اليوم والبث المباشر بدون إعلانات وبسرعة فائقة.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] font-bold text-zinc-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>بث مباشر فوري ⚡</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>بدون إعلانات 🛡️</span>
              </div>
            </div>

            {/* iOS Specific Instructions vs Android/Desktop Native Install Button */}
            {isIos ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2 mb-2">
                <span className="font-extrabold text-emerald-400 block mb-1">طريقة التثبيت على آيفون (iOS):</span>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black">1</span>
                  <span>اضغط على زر المشاركة <Share className="h-3.5 w-3.5 inline mx-1 text-emerald-400" /> في متصفح Safari.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black">2</span>
                  <span>اختر <PlusSquare className="h-3.5 w-3.5 inline mx-1 text-emerald-400" /> <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-450 active:scale-98 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/25 mb-3"
              >
                <Download className="h-4 w-4" />
                <span>تثبيت التطبيق الآن (مجاناً)</span>
              </button>
            )}

            {/* Dismiss Option */}
            <button
              onClick={handleDismissModal}
              className="w-full py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition text-center cursor-pointer"
            >
              لاحقاً، تصفح الموقع
            </button>
          </div>
        </div>
      )}
    </>
  );
}
