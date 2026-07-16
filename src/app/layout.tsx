import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Header from "@/components/Header";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "يلا شوت لايف - نتائج المباريات والبث المباشر",
  description: "موقع يلا شوت لايف لمتابعة نتائج مباريات كرة القدم مباشرة وجداول ترتيب الدوريات وتفاصيل المباريات والتشكيلة الحية.",
  keywords: ["يلا شوت", "مباريات اليوم", "بث مباشر", "نتائج حية", "كرة القدم", "الدوري الإنجليزي", "الدوري الإسباني"],
  authors: [{ name: "Kora Live Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="bg-zinc-950 text-zinc-50 min-h-full flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
