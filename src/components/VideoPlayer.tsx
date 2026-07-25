"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls, { type ManifestParsedData, type ErrorData } from "hls.js";
import {
  Settings,
  Check,
  Maximize,
  Minimize,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";

interface VideoPlayerProps {
  signedUrl: string;
  slug: string;
  poster?: string;
}

export default function VideoPlayer({ signedUrl, slug, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volBarRef = useRef<HTMLDivElement>(null);
  const currentUrlRef = useRef(signedUrl);
  const refreshAttemptsRef = useRef(0);
  const networkRetryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinnerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Detects when video is stuck mid-buffer after manifest loads
  const stuckRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror of isBuffering to avoid stale closures inside setTimeout
  const isBufferingRef = useRef(!!signedUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(!!signedUrl);

  // Keep ref in sync so timeouts always see the real current value
  const setBuffering = useCallback((val: boolean) => {
    isBufferingRef.current = val;
    setIsBuffering(val);
  }, []);
  const [volume, setVolume] = useState(1);
  // Start unmuted since user click is forced
  const [isMuted, setIsMuted] = useState(false);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualities, setQualities] = useState<
    { id: number; height: number; bitrate: number; label: string }[]
  >([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [streamError, setStreamError] = useState(false);
  const [streamKilled, setStreamKilled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Shows a manual retry button after 8s of stuck buffering
  const [showRetryHint, setShowRetryHint] = useState(false);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  }, [isPlaying]);

  /**
   * Fix #4: Silent URL refresh on 403/410 (expired signed URL).
   * Uses the lightweight /api/refresh-url endpoint.
   */
  const refreshSignedUrl = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`/api/refresh-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  }, [slug]);

  /** Refresh the current stream (reload same server) */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setBuffering(true);
    setStreamError(false);
    setShowRetryHint(false);

    // Clear stuck-buffer detector
    if (stuckRetryTimeoutRef.current) clearTimeout(stuckRetryTimeoutRef.current);

    // Reset safety timeout on manual refresh
    if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
    spinnerTimeoutRef.current = setTimeout(() => {
      if (isBufferingRef.current) {
        setBuffering(false);
        setStreamError(true);
      }
    }, 15000);

    const url = currentUrlRef.current;
    if (hlsRef.current) {
      hlsRef.current.loadSource(url);
      hlsRef.current.startLoad();
    } else {
      const video = videoRef.current;
      if (video) {
        video.load();
        video.play().catch(() => {});
      }
    }
    setTimeout(() => setIsRefreshing(false), 1200);
  }, []);

  // Initialize HLS — no more client-side fetch, signed URL comes from SSR
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedUrl) return;

    let cancelled = false;
    currentUrlRef.current = signedUrl;

    // ── Spinner safety timeout: stop spinning after 15s if nothing plays ──
    if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
    spinnerTimeoutRef.current = setTimeout(() => {
      if (!cancelled && isBufferingRef.current) {
        setBuffering(false);
        setStreamError(true);
      }
    }, 15000);

    // ── Fix #5: Performance Instrumentation ──
    performance.mark("player:init");

    function initStream() {
      if (cancelled) return;

      performance.mark("player:hls-init");

      if (Hls.isSupported()) {
        // ── Fix #3: Optimized hls.js config for minimum TTFF ──
        const hls = new Hls({
          // Player sizing
          capLevelToPlayerSize: true,

          // Assume 5 Mbps — prevents starting at lowest quality
          abrEwmaDefaultEstimate: 5_000_000,

          // Buffer tuning for fast TTFF
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          maxBufferSize: 30 * 1000 * 1000,

          // Live stream: stay close to live edge
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 5,

          // Fast retries
          fragLoadingMaxRetry: 3,
          manifestLoadingMaxRetry: 3,
          levelLoadingMaxRetry: 3,
          p2pConfig: {
            logLevel: 'none',
            token: 'ZRIuQBfvg',
            trackerZone: 'eu',
          }
        } as any);

        hlsRef.current = hls;

        const win = window as any;
        const useP2P = typeof window !== "undefined" && win.P2PEngineHls?.isSupported();
        if (useP2P) {
          try {
            new win.P2PEngineHls(hls, {
              logLevel: 'none', // Disable console noise for production
              token: 'ZRIuQBfvg',
              trackerZone: 'eu',
            });
            console.log("[P2P] CDNBye engine successfully attached to Hls instance.");
          } catch (e) {
            console.error("[P2P] Failed to attach CDNBye engine:", e);
          }
        }

        hls.loadSource(currentUrlRef.current);
        performance.mark("player:hls-load-source");
        hls.attachMedia(video!);

        hls.on(
          Hls.Events.MANIFEST_PARSED,
          (_event: string, data: ManifestParsedData) => {
            refreshAttemptsRef.current = 0;
            networkRetryCountRef.current = 0;
            performance.mark("player:manifest-parsed");
            performance.measure(
              "player:manifest-fetch",
              "player:hls-load-source",
              "player:manifest-parsed"
            );

            // Clear spinner timeout — stream is healthy
            if (spinnerTimeoutRef.current) {
              clearTimeout(spinnerTimeoutRef.current);
              spinnerTimeoutRef.current = null;
            }
            setBuffering(false);
            const availableQualities = data.levels.map((l, index) => ({
              id: index,
              height: l.height,
              bitrate: l.bitrate,
              label:
                l.height >= 720 ? "HD" : l.height >= 480 ? "SD" : "Low",
            }));
            setQualities(availableQualities.reverse());

            // Autoplay now that we have a user gesture from the first click!
            if (video) {
              video.muted = false;
              video.play()
                .then(() => {
                  setIsPlaying(true);
                })
                .catch((err) => {
                  console.log("[VideoPlayer] Autoplay blocked, requiring click:", err);
                });
            }
          },
        );

        // ── Fix #5: First segment instrumentation ──
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (!performance.getEntriesByName("player:first-frag").length) {
            performance.mark("player:first-frag");
            performance.measure(
              "player:first-segment",
              "player:manifest-parsed",
              "player:first-frag"
            );
          }
        });

        // ── Fix #4: Enhanced error handler with URL refresh on 403/410 ──
        hls.on(Hls.Events.ERROR, (_event: string, data: ErrorData) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR: {
                const status = (data as any).response?.code;
                if (status === 403 || status === 410) {
                  if (refreshAttemptsRef.current >= 3) {
                    console.error("[VideoPlayer] Max URL refresh attempts reached. Stopping stream loading.");
                    setStreamError(true);
                    setBuffering(false);
                    return;
                  }
                  refreshAttemptsRef.current += 1;
                  console.log(`[VideoPlayer] URL expired (status: ${status}), refreshing (attempt ${refreshAttemptsRef.current}/3)...`);
                  
                  if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
                  retryTimeoutRef.current = setTimeout(() => {
                    refreshSignedUrl().then((newUrl) => {
                      if (newUrl && hlsRef.current && !cancelled) {
                        currentUrlRef.current = newUrl;
                        hlsRef.current.loadSource(newUrl);
                        hlsRef.current.startLoad();
                      } else {
                        setStreamError(true);
                        setBuffering(false);
                      }
                    });
                  }, 2000);
                  return;
                }
                
                // Other fatal network errors (like 404, CORS block, or VPS connection timeout)
                if (networkRetryCountRef.current >= 5) {
                  console.error("[VideoPlayer] Max network retry attempts reached. Stopping.");
                  setStreamError(true);
                  setBuffering(false);
                  return;
                }
                networkRetryCountRef.current += 1;
                console.warn(`[VideoPlayer] Fatal network error encountered, retrying after delay (attempt ${networkRetryCountRef.current}/5)...`);
                
                if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = setTimeout(() => {
                  if (hlsRef.current && !cancelled) {
                    hlsRef.current.startLoad();
                  }
                }, 2500);
                break;
              }
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("[VideoPlayer] Media error encountered, recovering...");
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setStreamError(true);
                setBuffering(false);
                break;
            }
          }
        });
      } else if (video?.canPlayType("application/vnd.apple.mpegurl")) {
        // iOS Safari native HLS branch
        video.src = currentUrlRef.current;
        video.muted = false;
        video.addEventListener("loadedmetadata", () => {
          setBuffering(false);
          // Provide a fake quality entry so the UI doesn't show empty menu
          setQualities([{ id: 0, height: 0, bitrate: 0, label: "Auto" }]);
          
          // Autoplay on iOS
          video.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.log("[VideoPlayer] iOS Autoplay blocked:", err);
            });
        });
      }
    }

    // ── Fix #5: "playing" event instrumentation ──
    const onPlaying = () => {
      refreshAttemptsRef.current = 0;
      networkRetryCountRef.current = 0;
      if (!performance.getEntriesByName("player:playing").length) {
        performance.mark("player:playing");
        performance.measure("player:total-ttff", "player:init", "player:playing");

        // Log complete waterfall
        const measures = performance.getEntriesByType("measure")
          .filter((m) => m.name.startsWith("player:"));
        console.log("[VideoPlayer] TTFF Waterfall:");
        console.table(
          measures.map((m) => ({
            name: m.name,
            duration: `${m.duration.toFixed(0)}ms`,
          }))
        );
      }
    };
    video.addEventListener("playing", onPlaying, { once: true });

    // Load CDNBye script dynamically if not already loaded
    const win = window as any;
    if (typeof window !== "undefined" && !win.P2PEngineHls) {
      const existingScript = document.getElementById("cdnbye-p2p-script") as HTMLScriptElement;
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cdnbye-p2p-script";
        script.src = "/hlsjs-p2p-engine.min.js";
        script.async = true;
        script.onload = () => {
          if (!cancelled) {
            console.log("[P2P] CDNBye library loaded dynamically.");
            initStream();
          }
        };
        script.onerror = () => {
          if (!cancelled) {
            console.error("[P2P] Failed to load CDNBye, falling back to standard HLS.");
            initStream();
          }
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          if (!cancelled) {
            initStream();
          }
        });
        existingScript.addEventListener("error", () => {
          if (!cancelled) {
            initStream();
          }
        });
      }
    } else {
      initStream();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("playing", onPlaying);
      if (hlsRef.current) hlsRef.current.destroy();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
      if (stuckRetryTimeoutRef.current) clearTimeout(stuckRetryTimeoutRef.current);
      // Clear video source on unmount for security
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [signedUrl, refreshSignedUrl]);

  // DevTools detection bypass to improve performance and remove user-unfriendly traps
  useEffect(() => {
    // DevTools detection completely disabled
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
      setShowUnmuteHint(false);
    } else {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowSettings(false);
    }
  };

  // Fullscreen with iOS Safari fallback
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const container = containerRef.current;
      if (container?.requestFullscreen) {
        container.requestFullscreen();
      } else {
        // iOS Safari: only <video>.webkitEnterFullscreen works
        const video = videoRef.current as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };
        video?.webkitEnterFullscreen?.();
      }
    } else {
      document.exitFullscreen();
    }
  };

  const toggleLandscapeFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      try { screen.orientation?.unlock?.(); } catch { /* ignore */ }
      document.exitFullscreen();
    } else {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
        try {
          // @ts-expect-error - lock() exists on mobile browsers but not in all TS defs
          await screen.orientation?.lock?.("landscape");
        } catch { /* orientation lock not supported */ }
      } else {
        // iOS Safari fallback for landscape button too
        const video = videoRef.current as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };
        video?.webkitEnterFullscreen?.();
      }
    }
  };

  // On mobile, first tap shows controls; second tap toggles play
  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-controls]")) return;
    if (!showControls) {
      // First tap: just reveal controls, don't toggle playback
      resetHideTimer();
      return;
    }
    togglePlay();
  };

  const handleContainerTouch = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("[data-controls]")) return;
    if (!showControls && !controlsLocked) {
      setControlsLocked(true);
      resetHideTimer();
      setTimeout(() => setControlsLocked(false), 400);
    }
  };

  const handleContainerMove = () => resetHideTimer();

  if (streamKilled) {
    return (
      <div className="h-full w-full bg-black" />
    );
  }

  if (streamError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0e0e12]">
        <p className="text-sm text-white/30">حدث خطأ في تحميل البث</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="relative w-full h-full bg-black select-none font-sans cursor-pointer"
      onClick={handleContainerClick}
      onMouseMove={handleContainerMove}
      onTouchStart={handleContainerTouch}
    >
      {/* Video — no src attribute in DOM, loaded via JS only */}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => {
          setBuffering(true);
          setShowRetryHint(false);
          // Stuck-buffer detector: if no progress after 8s, auto-unstick HLS + show retry
          if (stuckRetryTimeoutRef.current) clearTimeout(stuckRetryTimeoutRef.current);
          stuckRetryTimeoutRef.current = setTimeout(() => {
            if (isBufferingRef.current) {
              // Try to auto-recover HLS first
              if (hlsRef.current) hlsRef.current.startLoad(-1);
              // Show manual retry button as fallback
              setShowRetryHint(true);
            }
          }, 8000);
        }}
        onPlaying={() => {
          setBuffering(false);
          setShowRetryHint(false);
          if (stuckRetryTimeoutRef.current) {
            clearTimeout(stuckRetryTimeoutRef.current);
            stuckRetryTimeoutRef.current = null;
          }
        }}
        playsInline
        muted={isMuted}
      />

      {/* Buffering spinner — with timed retry hint */}
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 gap-4">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14">
            <div className="absolute inset-0 rounded-full border-[2.5px] border-white/5" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-primary animate-spin" />
          </div>
          {showRetryHint && (
            <button
              data-controls
              className="pointer-events-auto text-xs text-white/70 hover:text-white bg-black/60 hover:bg-black/80 px-4 py-2 rounded-full backdrop-blur-sm border border-white/15 hover:border-white/30 transition-all duration-200 flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            >
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              التحميل بطيء — اضغط للمحاولة مجدداً
            </button>
          )}
        </div>
      )}

      {/* Unmute banner — shown after muted autoplay */}
      {showUnmuteHint && isMuted && (
        <button
          data-controls
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-black/80 transition-all"
          aria-label="Unmute"
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>اضغط لتشغيل الصوت</span>
        </button>
      )}


      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-primary/90 shadow-[0_0_30px_rgba(124,107,245,0.4)] backdrop-blur-sm transition-transform duration-200 hover:scale-105 pointer-events-auto cursor-pointer focus:outline-hidden"
            aria-label="Play stream"
          >
            <Play className="h-5 w-5 sm:h-7 sm:w-7 fill-white text-white ml-0.5" />
          </button>
        </div>
      )}

      {/* Mobile landscape fullscreen button */}
      {!isFullscreen && (
        <button
          data-controls
          onClick={(e) => {
            e.stopPropagation();
            toggleLandscapeFullscreen();
          }}
          className="absolute top-3 left-3 z-30 flex sm:hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-sm text-white/80 active:bg-white/15 transition-all"
          aria-label="ملء الشاشة أفقياً"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4.5 h-4.5"
          >
            {/* Phone body rotated 45deg */}
            <rect
              x="5"
              y="3"
              width="14"
              height="18"
              rx="2.5"
              transform="rotate(-45 12 12)"
            />
            {/* Top-right arrow */}
            <path d="M17.5 3.5a6 6 0 0 1 3 3" />
            <polyline
              points="20.5 3.5 20.5 6.5 17.5 6.5"
              transform="translate(0 -1)"
            />
            {/* Bottom-left arrow */}
            <path d="M6.5 20.5a6 6 0 0 1-3-3" />
            <polyline
              points="3.5 20.5 3.5 17.5 6.5 17.5"
              transform="translate(0 1)"
            />
          </svg>
        </button>
      )}

      {/* Bottom controls */}
      <div
        data-controls
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-3 pt-10 sm:px-5 sm:pb-4 sm:pt-14">
          <div className="flex items-center justify-between gap-2">
            {/* Left controls */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-white/90 hover:text-white transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  )}
                </button>
                <div className="hidden sm:flex items-center overflow-hidden w-0 group-hover/vol:w-28 transition-all duration-300">
                  <div
                    ref={volBarRef}
                    className="relative w-24 mx-2 h-8 flex items-center cursor-pointer"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const updateVolume = (clientX: number) => {
                        const bar = volBarRef.current;
                        if (!bar) return;
                        const rect = bar.getBoundingClientRect();
                        const val = Math.min(
                          Math.max((clientX - rect.left) / rect.width, 0),
                          1,
                        );
                        setVolume(val);
                        setIsMuted(val === 0);
                        if (videoRef.current) videoRef.current.volume = val;
                      };
                      updateVolume(e.clientX);
                      const onMove = (ev: MouseEvent) =>
                        updateVolume(ev.clientX);
                      const onUp = () => {
                        document.removeEventListener("mousemove", onMove);
                        document.removeEventListener("mouseup", onUp);
                      };
                      document.addEventListener("mousemove", onMove);
                      document.addEventListener("mouseup", onUp);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Track background */}
                    <div className="absolute left-0 right-0 h-0.75 rounded-full bg-white/15" />
                    {/* Track fill */}
                    <div
                      className="absolute left-0 h-0.75 rounded-full bg-primary-light"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                    {/* Thumb dot */}
                    <div
                      className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_6px_rgba(165,153,255,0.6)] -translate-x-1/2 transition-transform hover:scale-125"
                      style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* LIVE badge */}
              <div className="flex items-center gap-1.5 rounded-md bg-red-500/15 border border-red-500/20 px-2 py-1 sm:px-2.5 sm:py-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(248,113,113,0.6)]" />
                <span className="text-red-400 text-[10px] sm:text-[11px] font-bold font-mono tracking-wider">
                  LIVE
                </span>
              </div>

              {/* Refresh button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
                aria-label="تحديث البث"
                title="تحديث البث"
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              {/* Quality picker */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings(!showSettings);
                  }}
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all ${
                    showSettings
                      ? "text-primary-light bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Quality settings"
                >
                  <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                {showSettings && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-12 right-0 w-44 rounded-xl border border-white/10 bg-[#0c0e18]/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_1px_rgba(124,107,245,0.25)] z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-white/6">
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-mono">
                        الجودة
                      </span>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="text-white/30 hover:text-white text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Options */}
                    <div className="py-1">
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs hover:bg-white/6 transition-colors"
                      >
                        <span
                          className={
                            currentQuality === -1
                              ? "text-primary-light font-semibold"
                              : "text-white/70"
                          }
                        >
                          تلقائي
                        </span>
                        {currentQuality === -1 && (
                          <Check className="w-3.5 h-3.5 text-primary-light" />
                        )}
                      </button>

                      {qualities.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => handleQualityChange(q.id)}
                          className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs hover:bg-white/6 transition-colors"
                        >
                          <span
                            className={
                              currentQuality === q.id
                                ? "text-primary-light font-semibold"
                                : "text-white/70"
                            }
                          >
                            {q.height}p
                            {q.label === "HD" && (
                              <span className="inline-block ml-1.5 text-[9px] font-bold text-primary-light/70 bg-primary/15 rounded px-1 py-px">
                                HD
                              </span>
                            )}
                          </span>
                          {currentQuality === q.id && (
                            <Check className="w-3.5 h-3.5 text-primary-light" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
