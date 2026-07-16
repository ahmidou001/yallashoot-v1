"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, ShieldAlert, Loader2, AlertCircle, Clock } from "lucide-react";

interface SecurePlayerProps {
  gameId: string;
  streamType: "iframe" | "hls" | "youtube" | "other";
  streamUrl: string;
  tokenRequired?: boolean;
  token?: string;
  expires?: number;
  isLive?: boolean;
  isFinished?: boolean;
  highlightUrl?: string | null;
  matchTime?: string;
}

export default function SecurePlayer({
  gameId,
  streamType,
  streamUrl,
  tokenRequired = false,
  token,
  expires,
  isLive = false,
  isFinished = false,
  highlightUrl,
  matchTime,
}: SecurePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    // If not live (and no stream URL configured), finished, or not activated, do not initialize stream fetch
    const hasStream = !!streamUrl && streamUrl.trim() !== "";
    if ((!isLive && !hasStream) || isFinished || !isActivated) {
      setLoading(false);
      return;
    }

    async function loadStreamSource() {
      setLoading(true);
      setError(null);

      // If token protection is active, fetch the authenticated stream URL
      if (tokenRequired) {
        if (!token || !expires) {
          setError("خطأ في تشفير البث: الرمز المميز غير متوفر.");
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(`/api/streams/${gameId}?token=${token}&expires=${expires}`);
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "فشل التحقق من صلاحية البث.");
          }
          const json = await res.json();
          setPlaybackUrl(json.data.streamUrl);
        } catch (err: any) {
          setError(err.message || "حدث خطأ أثناء تحميل البث الآمن.");
        } finally {
          setLoading(false);
        }
      } else {
        setPlaybackUrl(streamUrl);
        setLoading(false);
      }
    }

    loadStreamSource();
  }, [gameId, streamUrl, tokenRequired, token, expires, isLive, isFinished, isActivated]);

  // HLS player implementation using hls.js from CDN
  useEffect(() => {
    const hasStream = !!streamUrl && streamUrl.trim() !== "";
    if (streamType !== "hls" || !playbackUrl || !videoRef.current || (!isLive && !hasStream) || isFinished || !isActivated) return;

    const video = videoRef.current;
    let hls: any = null;

    const initPlayer = () => {
      // Check if native HLS is supported (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
        });
      } 
      // Else load hls.js from CDN dynamically
      else {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        
        script.onload = () => {
          const Hls = (window as any).Hls;
          if (Hls.isSupported()) {
            hls = new Hls({
              maxMaxBufferLength: 10,
              enableWorker: true,
            });
            hls.loadSource(playbackUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, function (event: any, data: any) {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                  default:
                    setError("فشل تشغيل تدفق الفيديو HLS.");
                    break;
                }
              }
            });
          } else {
            setError("متصفحك لا يدعم تشغيل هذا النوع من الفيديو.");
          }
        };

        script.onerror = () => {
          setError("فشل تحميل مكتبة تشغيل البث.");
        };

        document.head.appendChild(script);
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [playbackUrl, streamType, isLive, isFinished, isActivated]);

  // Render Finished match state (highlights or placeholder)
  if (isFinished) {
    if (highlightUrl) {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
          <iframe
            src={highlightUrl}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title="ملخص المباراة"
          />
        </div>
      );
    }
    return (
      <div className="relative aspect-video w-full rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center p-6 select-none">
        <AlertCircle className="h-10 w-10 text-zinc-500 mb-3" />
        <h3 className="text-sm font-extrabold text-zinc-350">انتهت المباراة</h3>
        <p className="text-xs text-zinc-500 mt-1">البث المباشر غير متوفر بعد نهاية اللقاء.</p>
      </div>
    );
  }

  // Render Coming Soon state (not started)
  const hasStream = !!streamUrl && streamUrl.trim() !== "";
  if (!isLive && !hasStream) {
    return (
      <div className="relative aspect-video w-full rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg text-emerald-450 mb-4 animate-hover-spin">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-extrabold text-zinc-200">المباراة لم تبدأ بعد</h3>
        <p className="text-xs text-zinc-450 mt-1 max-w-sm leading-relaxed">
          ستبدأ المباراة عند الساعة <span className="font-bold text-emerald-400 font-mono">{matchTime || "—"}</span>. سيتوفر البث المباشر والقنوات الناقلة تلقائياً فور اقتراب موعد انطلاق اللقاء.
        </p>
      </div>
    );
  }

  // Render Click-to-Play Activation State
  if (!isActivated) {
    return (
      <button
        onClick={() => setIsActivated(true)}
        className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 flex flex-col items-center justify-center gap-4 cursor-pointer text-center select-none shadow-xl w-full"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.06)_0%,transparent_70%)]" />
        
        <div className="relative flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] font-black text-red-400 tracking-wider">LIVE</span>
        </div>
        
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 border border-emerald-400/35 shadow-[0_0_35px_rgba(16,185,129,0.25)] group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition duration-300">
          <Play className="h-6 w-6 fill-white text-white translate-x-0.5" />
        </div>
        
        <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition">انقر لتشغيل البث المباشر للمباراة</span>
      </button>
    );
  }

  // Render Loading state (during token refresh or stream initialization)
  if (loading) {
    return (
      <div className="relative aspect-video w-full rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-col text-center">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-3" />
        <span className="text-zinc-400 text-sm font-semibold">جاري تحضير البث المباشر للمباراة...</span>
      </div>
    );
  }

  // Render Error state
  if (error || !playbackUrl) {
    return (
      <div className="relative aspect-video w-full rounded-2xl bg-zinc-950 border border-red-500/20 flex items-center justify-center flex-col text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
        <h3 className="text-base font-extrabold text-red-400">خطأ في تشغيل البث</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md">{error || "البث المباشر غير متوفر للمباراة حالياً."}</p>
      </div>
    );
  }

  // Render YouTube Embed
  if (streamType === "youtube") {
    let embedUrl = playbackUrl;
    try {
      const urlObj = new URL(playbackUrl);
      if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
        embedUrl = `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
      } else if (urlObj.hostname.includes("youtu.be")) {
        const id = urlObj.pathname.split("/")[1];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }
    } catch {
      // use raw url if url parsing fails
    }

    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video stream"
        />
      </div>
    );
  }

  // Render Iframe Embed
  if (streamType === "iframe") {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
        <iframe
          src={playbackUrl}
          className="absolute inset-0 h-full w-full"
          allowFullScreen
          scrolling="no"
          allow="autoplay; encrypted-media"
          title="Iframe video stream"
        />
      </div>
    );
  }

  // Render HLS or HTML5 Video
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group">
      <video
        ref={videoRef}
        controls
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
      />
      {tokenRequired && (
        <div className="absolute top-3 left-3 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2 py-1 rounded backdrop-blur-sm pointer-events-none select-none">
          مشفر آمن
        </div>
      )}
    </div>
  );
}
