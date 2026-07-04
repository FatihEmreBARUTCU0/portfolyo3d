"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LOADING_DURATION,
  LOADING_MIN_MS,
  LERP,
  SEEK_THRESHOLD,
  HERO_STATE_RANGES,
} from "@/lib/hero-config";
import { VIDEO_SRC } from "@/lib/portfolio-data";

const MAX_SEEKABLE_REPAIRS = 1;

function easeLoading(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function useHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroScrollRef = useRef<HTMLElement>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [activeHeroState, setActiveHeroState] = useState(0);
  const [navOverlayVisible, setNavOverlayVisible] = useState(false);
  const [navOverlayOpen, setNavOverlayOpen] = useState(false);
  const [heroComplete, setHeroComplete] = useState(false);

  const activeStateIndexRef = useRef(0);
  const layoutCacheRef = useRef({ heroTop: 0, scrollRange: 1 });
  const loadStartedAtRef = useRef(0);
  const videoReadyRef = useRef(false);
  const isSeekingRef = useRef(false);
  const targetTimeRef = useRef(0);
  const displayTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const loadingBarTimerRef = useRef<number | null>(null);
  const heroBootedRef = useRef(false);
  const repairInProgressRef = useRef(false);
  const repairScheduledRef = useRef(false);
  const seekableRepairCountRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);
  const seekTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef(false);

  const canSeekVideo = useCallback(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo || heroVideo.error) return false;
    if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) return false;
    if (heroVideo.readyState < 2) return false;
    if (heroVideo.seekable && heroVideo.seekable.length > 0) {
      const end = heroVideo.seekable.end(heroVideo.seekable.length - 1);
      return end > 0.05;
    }
    return false;
  }, []);

  const syncVideoReady = useCallback(() => {
    videoReadyRef.current = canSeekVideo();
    return videoReadyRef.current;
  }, [canSeekVideo]);

  const getBufferedEnd = useCallback(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo || !heroVideo.buffered || heroVideo.buffered.length === 0) return 0;
    return heroVideo.buffered.end(heroVideo.buffered.length - 1);
  }, []);

  const needsSeekableRepair = useCallback(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo || heroVideo.error || canSeekVideo()) return false;
    if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) return false;
    if (seekableRepairCountRef.current >= MAX_SEEKABLE_REPAIRS) return false;
    return getBufferedEnd() >= heroVideo.duration - 0.1;
  }, [canSeekVideo, getBufferedEnd]);

  const showFirstFrame = useCallback(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo) return Promise.resolve();

    heroVideo.pause();

    return new Promise<void>((resolve) => {
      const trySeek = () => {
        if (!canSeekVideo()) return false;
        try {
          heroVideo.currentTime = 0.001;
          displayTimeRef.current = 0.001;
          targetTimeRef.current = 0.001;
        } catch {
          /* ignore */
        }
        return true;
      };

      const finish = () => {
        trySeek();
        resolve();
      };

      if (trySeek()) {
        resolve();
        return;
      }

      const onReady = () => {
        heroVideo.removeEventListener("progress", onProgress);
        heroVideo.removeEventListener("canplaythrough", onReady);
        finish();
      };

      const onProgress = () => {
        if (canSeekVideo()) onReady();
      };

      heroVideo.addEventListener("progress", onProgress);
      heroVideo.addEventListener("canplaythrough", onReady, { once: true });
      heroVideo.addEventListener("error", () => resolve(), { once: true });
      window.setTimeout(finish, 10000);
    });
  }, [canSeekVideo]);

  const repairVideoSeekable = useCallback(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo || repairInProgressRef.current || !needsSeekableRepair()) {
      return Promise.resolve(canSeekVideo());
    }

    repairInProgressRef.current = true;
    seekableRepairCountRef.current += 1;
    const src = heroVideo.currentSrc || heroVideo.getAttribute("src") || VIDEO_SRC;

    return new Promise<boolean>((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        repairInProgressRef.current = false;
        syncVideoReady();
        resolve(canSeekVideo());
      };

      heroVideo.addEventListener("canplaythrough", finish, { once: true });
      heroVideo.addEventListener("error", finish, { once: true });

      heroVideo.removeAttribute("src");
      heroVideo.load();
      heroVideo.src = src;
      heroVideo.load();

      window.setTimeout(finish, 12000);
    });
  }, [canSeekVideo, needsSeekableRepair, syncVideoReady]);

  const scheduleSeekableRepair = useCallback(() => {
    if (repairScheduledRef.current || repairInProgressRef.current || !needsSeekableRepair()) {
      return;
    }

    repairScheduledRef.current = true;
    repairVideoSeekable().then((ok) => {
      repairScheduledRef.current = false;
      if (ok) showFirstFrame();
    });
  }, [needsSeekableRepair, repairVideoSeekable, showFirstFrame]);

  const waitUntilSeekable = useCallback(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo) return Promise.resolve();

    return new Promise<void>((resolve) => {
      if (syncVideoReady()) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;

      const finish = () => {
        if (needsSeekableRepair()) {
          repairVideoSeekable().then(() => {
            syncVideoReady();
            resolve();
          });
          return;
        }
        syncVideoReady();
        resolve();
      };

      const onProgress = () => {
        if (syncVideoReady()) {
          heroVideo.removeEventListener("progress", onProgress);
          heroVideo.removeEventListener("canplaythrough", onCanPlayThrough);
          finish();
        }
      };

      const onCanPlayThrough = () => {
        heroVideo.removeEventListener("progress", onProgress);
        finish();
      };

      heroVideo.addEventListener("progress", onProgress);
      heroVideo.addEventListener("canplaythrough", onCanPlayThrough, { once: true });

      const check = () => {
        if (syncVideoReady()) {
          heroVideo.removeEventListener("progress", onProgress);
          finish();
          return;
        }
        if (heroVideo.error) {
          videoReadyRef.current = false;
          resolve();
          return;
        }
        attempts += 1;
        if (attempts >= maxAttempts) {
          finish();
          return;
        }
        window.setTimeout(check, 100);
      };

      check();
    });
  }, [needsSeekableRepair, repairVideoSeekable, syncVideoReady]);

  const loadVideoSource = useCallback(
    (src: string) =>
      fetch(src)
        .then((response) => {
          if (!response.ok) throw new Error("Video fetch failed");
          return response.blob();
        })
        .then((blob) => {
          const heroVideo = videoRef.current;
          if (!heroVideo) throw new Error("Video element missing");

          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          blobUrlRef.current = URL.createObjectURL(blob);
          heroVideo.src = blobUrlRef.current;
          heroVideo.load();

          return new Promise<void>((resolve, reject) => {
            heroVideo.addEventListener(
              "error",
              () => reject(new Error("Video failed to load")),
              { once: true }
            );
            heroVideo.addEventListener("canplaythrough", () => resolve(), { once: true });

            let pollAttempts = 0;
            const pollReady = () => {
              if (canSeekVideo()) {
                resolve();
                return;
              }
              if (heroVideo.error) {
                reject(new Error("Video failed to load"));
                return;
              }
              pollAttempts += 1;
              if (pollAttempts >= 300) {
                resolve();
                return;
              }
              window.setTimeout(pollReady, 100);
            };
            pollReady();
          });
        })
        .then(() => waitUntilSeekable())
        .then(() => showFirstFrame()),
    [canSeekVideo, showFirstFrame, waitUntilSeekable]
  );

  const prepareVideo = useCallback(() => loadVideoSource(VIDEO_SRC), [loadVideoSource]);

  const refreshLayoutCache = useCallback(() => {
    const heroScroll = heroScrollRef.current;
    if (!heroScroll) return;
    layoutCacheRef.current.heroTop = heroScroll.offsetTop;
    layoutCacheRef.current.scrollRange = Math.max(
      heroScroll.offsetHeight - window.innerHeight,
      1
    );
  }, []);

  const getHeroProgress = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const { heroTop, scrollRange } = layoutCacheRef.current;
    const scrolled = Math.min(Math.max(scrollY - heroTop, 0), scrollRange);
    return scrolled / scrollRange;
  }, []);

  const applyVideoSeek = useCallback((time: number) => {
    const heroVideo = videoRef.current;
    if (!heroVideo || !Number.isFinite(heroVideo.duration)) return;

    const clamped = Math.min(
      Math.max(time, 0),
      Math.max(heroVideo.duration - 0.001, 0)
    );

    if (Math.abs(heroVideo.currentTime - clamped) < SEEK_THRESHOLD) {
      displayTimeRef.current = heroVideo.currentTime;
      return;
    }

    if (isSeekingRef.current) return;

    heroVideo.pause();

    try {
      heroVideo.currentTime = clamped;
    } catch {
      /* ignore transient seek failures */
    }
  }, []);

  const resolveHeroState = useCallback((progress: number) => {
    for (let i = 0; i < HERO_STATE_RANGES.length; i++) {
      const state = HERO_STATE_RANGES[i];
      if (progress >= state.start && progress < state.end) return i;
    }
    return HERO_STATE_RANGES.length - 1;
  }, []);

  const updateHeroUi = useCallback(
    (progress: number) => {
      const nextState = resolveHeroState(progress);
      if (nextState !== activeStateIndexRef.current) {
        activeStateIndexRef.current = nextState;
        setActiveHeroState(nextState);
      }

      if (progress > 0.9 && !navOverlayOpen) {
        setNavOverlayVisible(true);
      } else if (progress <= 0.82 && !navOverlayOpen) {
        setNavOverlayVisible(false);
      }

      setHeroComplete(progress >= 0.995);
    },
    [navOverlayOpen, resolveHeroState]
  );

  const animationLoop = useCallback(() => {
    const heroVideo = videoRef.current;
    const progress = getHeroProgress();
    const duration =
      heroVideo && Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0;

    if (duration > 0 && videoReadyRef.current && !prefersReducedMotionRef.current) {
      targetTimeRef.current = progress * duration;
      displayTimeRef.current +=
        (targetTimeRef.current - displayTimeRef.current) * LERP;

      if (
        !isSeekingRef.current &&
        Math.abs(displayTimeRef.current - heroVideo!.currentTime) > SEEK_THRESHOLD
      ) {
        applyVideoSeek(displayTimeRef.current);
      }
    } else if (!videoReadyRef.current && heroVideo && !prefersReducedMotionRef.current) {
      syncVideoReady();
      if (!videoReadyRef.current) scheduleSeekableRepair();
    } else if (prefersReducedMotionRef.current && duration > 0) {
      targetTimeRef.current = 0;
      displayTimeRef.current = 0;
    }

    updateHeroUi(progress);
    rafIdRef.current = window.requestAnimationFrame(animationLoop);
  }, [applyVideoSeek, getHeroProgress, scheduleSeekableRepair, syncVideoReady, updateHeroUi]);

  const startAnimationLoop = useCallback(() => {
    if (rafIdRef.current === null) {
      rafIdRef.current = window.requestAnimationFrame(animationLoop);
    }
  }, [animationLoop]);

  const finishLoading = useCallback(() => {
    if (loadingBarTimerRef.current) {
      window.clearInterval(loadingBarTimerRef.current);
      loadingBarTimerRef.current = null;
    }
    setLoadingProgress(100);
    setIsReady(true);
  }, []);

  const minLoadingDelay = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const elapsed = Date.now() - loadStartedAtRef.current;
        window.setTimeout(resolve, Math.max(0, LOADING_MIN_MS - elapsed));
      }),
    []
  );

  const bindScroll = useCallback(() => {
    if (heroBootedRef.current) return;
    heroBootedRef.current = true;

    refreshLayoutCache();
    window.addEventListener("resize", refreshLayoutCache, { passive: true });
    window.addEventListener("load", refreshLayoutCache, { passive: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(refreshLayoutCache);
    }

    window.requestAnimationFrame(() => {
      refreshLayoutCache();
      startAnimationLoop();
    });
  }, [refreshLayoutCache, startAnimationLoop]);

  const bootHero = useCallback(() => {
    Promise.all([prepareVideo(), minLoadingDelay()])
      .then(() => {
        syncVideoReady();
        refreshLayoutCache();
        finishLoading();
        bindScroll();
      })
      .catch(() => {
        window.setTimeout(() => {
          prepareVideo()
            .then(() => {
              syncVideoReady();
              refreshLayoutCache();
              finishLoading();
              bindScroll();
            })
            .catch(() => {
              refreshLayoutCache();
              finishLoading();
              bindScroll();
            });
        }, 1500);
      });
  }, [bindScroll, finishLoading, minLoadingDelay, prepareVideo, refreshLayoutCache, syncVideoReady]);

  const toggleNavOverlay = useCallback(() => {
    setNavOverlayOpen((open) => {
      const next = !open;
      if (next) setNavOverlayVisible(true);
      return next;
    });
  }, []);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    loadStartedAtRef.current = Date.now();

    const setLoadingProgressFromElapsed = () => {
      const elapsed = Date.now() - loadStartedAtRef.current;
      const progress = Math.round(
        easeLoading((Math.min(elapsed, LOADING_DURATION - 50) + 50) / LOADING_DURATION) * 100
      );
      setLoadingProgress(progress);
    };

    loadingBarTimerRef.current = window.setInterval(setLoadingProgressFromElapsed, 50);

    const heroVideo = videoRef.current;
    if (!heroVideo) return;

    const onSeeking = () => {
      isSeekingRef.current = true;
      if (seekTimeoutRef.current) window.clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = window.setTimeout(() => {
        seekTimeoutRef.current = null;
        isSeekingRef.current = false;
      }, 400);
    };

    const onSeeked = () => {
      if (seekTimeoutRef.current) {
        window.clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
      isSeekingRef.current = false;
      if (heroVideo) displayTimeRef.current = heroVideo.currentTime;
    };

    const onVideoProgress = () => {
      syncVideoReady();
      if (!videoReadyRef.current) scheduleSeekableRepair();
    };

    heroVideo.addEventListener("seeking", onSeeking);
    heroVideo.addEventListener("seeked", onSeeked);
    heroVideo.addEventListener("progress", onVideoProgress, { passive: true });
    heroVideo.addEventListener("canplay", onVideoProgress, { passive: true });
    heroVideo.addEventListener("canplaythrough", onVideoProgress, { passive: true });
    heroVideo.addEventListener("loadeddata", onVideoProgress, { passive: true });

    bootHero();

    return () => {
      if (loadingBarTimerRef.current) window.clearInterval(loadingBarTimerRef.current);
      if (rafIdRef.current !== null) window.cancelAnimationFrame(rafIdRef.current);
      if (seekTimeoutRef.current) window.clearTimeout(seekTimeoutRef.current);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

      heroVideo.removeEventListener("seeking", onSeeking);
      heroVideo.removeEventListener("seeked", onSeeked);
      heroVideo.removeEventListener("progress", onVideoProgress);
      heroVideo.removeEventListener("canplay", onVideoProgress);
      heroVideo.removeEventListener("canplaythrough", onVideoProgress);
      heroVideo.removeEventListener("loadeddata", onVideoProgress);
      window.removeEventListener("resize", refreshLayoutCache);
      window.removeEventListener("load", refreshLayoutCache);
    };
  }, [
    bootHero,
    refreshLayoutCache,
    scheduleSeekableRepair,
    syncVideoReady,
  ]);

  useEffect(() => {
    document.body.classList.toggle("hero-complete", heroComplete);
  }, [heroComplete]);

  return {
    videoRef,
    heroScrollRef,
    loadingProgress,
    isReady,
    activeHeroState,
    navOverlayVisible,
    navOverlayOpen,
    toggleNavOverlay,
  };
}
