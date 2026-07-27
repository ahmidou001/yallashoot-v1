import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "يلا شوت لايف - نتائج المباريات والبث المباشر",
  description: "موقع وتطبيق يلا شوت لايف لمتابعة نتائج مباريات كرة القدم مباشرة وجداول ترتيب الدوريات وتفاصيل المباريات والتشكيلة الحية.",
  keywords: ["يلا شوت", "مباريات اليوم", "بث مباشر", "تطبيق يلا شوت", "نتائج حية", "كرة القدم"],
  authors: [{ name: "Kora Live Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "يلا شوت",
  },
  icons: {
    icon: "/fav-icon.svg",
    apple: "/fav-icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="bg-zinc-950 text-zinc-50 min-h-full flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
        <Providers>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <MobileBottomNav />
          <PwaInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
