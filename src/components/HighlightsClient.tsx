"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Search, Film, X, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { toLatinNumerals } from "@/components/providers";

interface HighlightItem {
  _id: string;
  gameId?: string;
  title: string;
  iframeUrl: string;
  thumbnailUrl?: string;
  competition?: string;
  homeTeam?: string;
  awayTeam?: string;
  isFeatured?: boolean;
  viewsCount?: number;
  createdAt: string;
}

export default function HighlightsClient() {
  const [search, setSearch] = useState("");
  const [activePlayer, setActivePlayer] = useState<HighlightItem | null>(null);

  const { data: highlights = [], isLoading } = useQuery<HighlightItem[]>({
    queryKey: ["publicHighlights"],
    queryFn: async () => {
      const res = await fetch("/api/highlights");
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const filteredHighlights = highlights.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.competition && item.competition.toLowerCase().includes(term)) ||
      (item.homeTeam && item.homeTeam.toLowerCase().includes(term)) ||
      (item.awayTeam && item.awayTeam.toLowerCase().includes(term))
    );
  });

  const featuredHighlight = highlights.find((h) => h.isFeatured) || highlights[0];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تغطية متميزة وفيديو HD</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-zinc-100 tracking-tight">
              ملخصات وأهداف المباريات
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              شاهد أهداف وملخصات أهم مباريات اليوم والدوريات العالمية والأفريقية مجاناً وبجودة عالية مباشرة بدون إعلانات مزعجة.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مباراة أو بطولة..."
              className="w-full pl-4 pr-10 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Featured Video Highlight Banner (If Available & No Search) */}
      {!search && featuredHighlight && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Thumbnail Player Trigger */}
            <div
              className="lg:col-span-7 relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden group border border-zinc-800 shadow-xl cursor-pointer"
              onClick={() => setActivePlayer(featuredHighlight)}
            >
              {featuredHighlight.thumbnailUrl ? (
                <img
                  src={featuredHighlight.thumbnailUrl}
                  alt={featuredHighlight.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                  <Film className="w-16 h-16" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>

              <span className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                فيديو مميز
              </span>
            </div>

            {/* Right: Info & Play */}
            <div className="lg:col-span-5 space-y-4 text-right">
              {featuredHighlight.competition && (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <Trophy className="w-3.5 h-3.5" />
                  {featuredHighlight.competition}
                </span>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 leading-snug">
                {featuredHighlight.title}
              </h2>

              {(featuredHighlight.homeTeam || featuredHighlight.awayTeam) && (
                <div className="text-sm font-bold text-zinc-400">
                  {featuredHighlight.homeTeam} ضد {featuredHighlight.awayTeam}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setActivePlayer(featuredHighlight)}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-6 py-3 rounded-2xl text-sm transition duration-200 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>مشاهدة الملخص الآن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Highlights Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-black text-zinc-200 flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-400" />
            أحدث الملخصات والأهداف
          </h2>
          <span className="text-xs text-zinc-400 font-bold">
            {filteredHighlights.length} ملخص
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 bg-zinc-900 rounded-2xl border border-zinc-800" />
            ))}
          </div>
        ) : filteredHighlights.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHighlights.map((item) => (
              <div
                key={item._id}
                onClick={() => setActivePlayer(item)}
                className="group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600">
                      <Film className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-zinc-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {item.competition && (
                    <span className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-full">
                      {item.competition}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <h3 className="font-extrabold text-xs sm:text-sm text-zinc-150 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-850">
                    <span dir="ltr" className="font-mono">
                      {toLatinNumerals(new Date(item.createdAt).toLocaleDateString("ar-EG-u-nu-latn"))}
                    </span>
                    {item.gameId && (
                      <Link
                        href={`/match/${item.gameId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald-400 hover:underline font-bold"
                      >
                        تفاصيل المباراة ↗
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-3xl">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 font-bold">لا تتوفر ملخصات مباريات طابق هذا البحث حالياً.</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activePlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-100 line-clamp-1">
                  {activePlayer.title}
                </h3>
              </div>

              <button
                onClick={() => setActivePlayer(null)}
                className="p-2 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative w-full bg-black aspect-video">
              <iframe
                src={activePlayer.iframeUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
                allowFullScreen
                title={activePlayer.title}
              />
            </div>

            {/* Modal Footer with Direct Link Fallback */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-zinc-400">
                إذا ظهرت لك رسالة حظر من المصدر، يمكنك الفتح مباشرة:
              </span>
              {(() => {
                let directUrl = activePlayer.iframeUrl;
                const ytMatch = directUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
                if (ytMatch && ytMatch[1]) {
                  directUrl = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
                }
                return (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-md shrink-0"
                  >
                    <span>مشاهدة الفيديو مباشرة على المصدر ↗</span>
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
