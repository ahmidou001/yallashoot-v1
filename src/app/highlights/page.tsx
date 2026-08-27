import React from "react";
import { Metadata } from "next";
import HighlightsClient from "@/components/HighlightsClient";

export const metadata: Metadata = {
  title: "ملخصات وأهداف المباريات | يلا شوت لايف",
  description: "شاهد أهداف وملخصات أهم مباريات اليوم والدوريات العالمية والأفريقية مجاناً وبجودة عالية مباشرة بدون إعلانات مزعجة على يلا شوت.",
  alternates: {
    canonical: "/highlights",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ملخصات وأهداف المباريات | يلا شوت لايف",
    description: "شاهد أهداف وملخصات أهم مباريات اليوم والدوريات العالمية والأفريقية مجاناً وبجودة عالية.",
    url: "https://www.yallahsoot.com/highlights",
  },
};

export default function HighlightsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
      <HighlightsClient />
    </div>
  );
}
