import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import LayoutAdBanner from "@/components/ads/LayoutAdBanner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.yallahsoot.com"),
  title: {
    default: "يلا شوت | Yalla Shoot | أهم مباريات اليوم بث مباشر | yallashoot يلاشوت",
    template: "%s | يلا شوت - Yalla Shoot",
  },
  description: "موقع يلا شوت (Yalla Shoot) الرسمي لمتابعة أهم مباريات اليوم بث مباشر بدون تقطيع، نتائج حية وجدول مباريات الدوريات والبطولات وتفاصيل المباريات عبر yallashoot حصرياً.",
  keywords: [
    "يلا شوت",
    "Yalla Shoot",
    "yallashoot",
    "yalla shoot",
    "yalla shoot live",
    "يلاشوت",
    "يلا شوت لايف",
    "مباريات اليوم بث مباشر",
    "أهم مباريات اليوم",
    "بث مباشر",
    "كورة لايف",
    "نتائج المباريات",
    "جدول مباريات اليوم",
    "yallashoot.com",
    "yallahsoot"
  ],
  authors: [{ name: "Yalla Shoot Team" }],
  manifest: "/manifest.json",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: "https://www.yallahsoot.com",
    title: "يلا شوت | Yalla Shoot | أهم مباريات اليوم بث مباشر | yallashoot يلاشوت",
    description: "موقع يلا شوت (Yalla Shoot) لمتابعة أهم مباريات اليوم بث مباشر بدون تقطيع، نتائج حية وجدول المباريات عبر yallashoot.",
    siteName: "يلا شوت - Yalla Shoot",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        type: "image/png",
        alt: "يلا شوت | Yalla Shoot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "يلا شوت | Yalla Shoot | أهم مباريات اليوم بث مباشر | yallashoot",
    description: "موقع يلا شوت (Yalla Shoot) لمتابعة أهم مباريات اليوم بث مباشر بدون تقطيع، نتائج حية وجدول المباريات.",
    images: ["/logo-512.png"],
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
    title: "يلا شوت - Yalla Shoot",
  },
  icons: {
    icon: [
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
      { url: "/fav-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
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
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.yallahsoot.com/#website",
        "name": "يلا شوت | Yalla Shoot",
        "alternateName": [
          "yallashoot",
          "yalla shoot",
          "يلاشوت",
          "يلا شوت لايف",
          "yallahsoot",
          "yalla shoot live"
        ],
        "url": "https://www.yallahsoot.com",
        "description": "موقع يلا شوت (Yalla Shoot) الرسمي لمتابعة أهم مباريات اليوم بث مباشر بدون تقطيع، نتائج حية وجدول المباريات.",
        "inLanguage": "ar",
        "image": "https://www.yallahsoot.com/logo-512.png",
        "thumbnailUrl": "https://www.yallahsoot.com/logo-512.png",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.yallahsoot.com/news?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SportsOrganization",
        "@id": "https://www.yallahsoot.com/#organization",
        "name": "يلا شوت - Yalla Shoot",
        "url": "https://www.yallahsoot.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.yallahsoot.com/logo-512.png",
          "width": 512,
          "height": 512
        },
        "image": "https://www.yallahsoot.com/logo-512.png"
      }
    ]
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
        
        {/* Search Engine Snippet Thumbnail Tags (Bing & Google Rich Results) */}
        <meta name="thumbnail" content="https://www.yallahsoot.com/logo-512.png" />
        <link rel="image_src" href="https://www.yallahsoot.com/logo-512.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${cairo.className} bg-zinc-950 text-zinc-50 min-h-full flex flex-col selection:bg-emerald-500 selection:text-zinc-950`}>
        <Providers>
          <Header />
          <LayoutAdBanner />
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
