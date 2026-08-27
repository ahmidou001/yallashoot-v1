import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.yallahsoot.com"),
  title: {
    default: "يلا شوت لايف - نتائج المباريات والبث المباشر",
    template: "%s | يلا شوت لايف",
  },
  description: "موقع وتطبيق يلا شوت لايف لمتابعة نتائج مباريات كرة القدم مباشرة وجداول ترتيب الدوريات وتفاصيل المباريات والتشكيلة الحية.",
  keywords: ["يلا شوت", "يلا شوت لايف", "yallashoot", "مباريات اليوم", "بث مباشر", "تطبيق يلا شوت", "نتائج حية", "كرة القدم"],
  authors: [{ name: "Kora Live Team" }],
  manifest: "/manifest.json",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: "https://www.yallahsoot.com",
    title: "يلا شوت لايف - نتائج المباريات والبث المباشر",
    description: "موقع وتطبيق يلا شوت لايف لمتابعة نتائج مباريات كرة القدم مباشرة وجداول ترتيب الدوريات وتفاصيل المباريات والتشكيلة الحية.",
    siteName: "يلا شوت لايف",
    images: [
      {
        url: "/fav-icon.svg",
        width: 512,
        height: 512,
        alt: "يلا شوت لايف",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "يلا شوت لايف - نتائج المباريات والبث المباشر",
    description: "موقع وتطبيق يلا شوت لايف لمتابعة نتائج مباريات كرة القدم مباشرة وجداول ترتيب الدوريات وتفاصيل المباريات.",
    images: ["/fav-icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "يلا شوت لايف",
    "url": "https://www.yallahsoot.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.yallahsoot.com/news?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "description": "موقع وتطبيق يلا شوت لايف لمتابعة نتائج مباريات كرة القدم مباشرة وجداول ترتيب الدوريات."
  };

  return (
    <html lang="ar" dir="rtl" className={`h-full antialiased ${cairo.variable}`}>
      <head>
        <GoogleAnalytics />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://imagecache.365scores.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://imagecache.365scores.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#10b981" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${cairo.className} bg-zinc-950 text-zinc-50 min-h-full flex flex-col selection:bg-emerald-500 selection:text-zinc-950`}>
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
