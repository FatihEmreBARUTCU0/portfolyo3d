(function () {
  "use strict";

  var LOADING_DURATION = 6000;
  var LOADING_MIN_MS = 400;
  var VIDEO_SRC = "assets/hero-scrub.mp4";
  var LERP = 0.18;
  var SEEK_THRESHOLD = 0.012;
  var HERO_STATES = [
    { start: 0, end: 0.22 },
    { start: 0.22, end: 0.48 },
    { start: 0.48, end: 0.72 },
    { start: 0.72, end: 1 },
  ];

  var loadingWrap = document.getElementById("loading-wrap");
  var loadingText = document.getElementById("loading-text");
  var loadingCircle = document.querySelector(".loading-bar-circle");
  var bodyWrap = document.getElementById("body-wrap");
  var heroScroll = document.getElementById("hero-scroll");
  var heroVideo = document.getElementById("hero-video");
  var heroCopy = document.getElementById("hero-copy");
  var navOverlay = document.getElementById("nav-overlay");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var videoReady = false;
  var rafActive = false;
  var isSeeking = false;
  var targetTime = 0;
  var displayTime = 0;
  var activeStateIndex = 0;
  var layoutCache = { heroTop: 0, scrollRange: 1 };
  var loadStartedAt = Date.now();
  var loadingBarTimer = null;
  var heroBooted = false;
  var repairInProgress = false;
  var repairScheduled = false;
  var seekableRepairCount = 0;
  var MAX_SEEKABLE_REPAIRS = 1;

  function syncVideoReady() {
    if (!heroVideo || heroVideo.error) {
      videoReady = false;
      return false;
    }

    videoReady = canSeekVideo();
    return videoReady;
  }

  function easeLoading(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function setLoadingProgress(timeMs) {
    var progress = Math.round(easeLoading((timeMs + 50) / LOADING_DURATION) * 100);
    loadingText.textContent = progress + "%";
    if (loadingCircle) {
      var radius = 40;
      var circumference = Math.PI * (radius * 2);
      loadingCircle.style.strokeDashoffset = String(((100 - progress) / 100) * circumference);
    }
  }

  function runLoadingBar() {
    loadingBarTimer = window.setInterval(function () {
      var elapsed = Date.now() - loadStartedAt;
      setLoadingProgress(Math.min(elapsed, LOADING_DURATION - 50));
    }, 50);
  }

  function stopLoadingBar() {
    if (loadingBarTimer) {
      window.clearInterval(loadingBarTimer);
      loadingBarTimer = null;
    }
    setLoadingProgress(LOADING_DURATION);
  }

  function finishLoading() {
    stopLoadingBar();
    loadingWrap.classList.add("is-hidden");
    loadingWrap.setAttribute("aria-hidden", "true");
    bodyWrap.classList.add("is-ready");
  }

  function minLoadingDelay() {
    return new Promise(function (resolve) {
      var elapsed = Date.now() - loadStartedAt;
      window.setTimeout(resolve, Math.max(0, LOADING_MIN_MS - elapsed));
    });
  }

  function refreshLayoutCache() {
    if (!heroScroll) return;
    layoutCache.heroTop = heroScroll.offsetTop;
    layoutCache.scrollRange = Math.max(heroScroll.offsetHeight - window.innerHeight, 1);
  }

  function getHeroProgress() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var scrolled = Math.min(Math.max(scrollY - layoutCache.heroTop, 0), layoutCache.scrollRange);
    return scrolled / layoutCache.scrollRange;
  }

  function canSeekVideo() {
    if (!heroVideo || heroVideo.error) {
      return false;
    }

    if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
      return false;
    }

    if (heroVideo.readyState < 2) {
      return false;
    }

    if (heroVideo.seekable && heroVideo.seekable.length > 0) {
      var end = heroVideo.seekable.end(heroVideo.seekable.length - 1);
      return end > 0.05;
    }

    return false;
  }

  function getBufferedEnd() {
    if (!heroVideo || !heroVideo.buffered || heroVideo.buffered.length === 0) {
      return 0;
    }

    return heroVideo.buffered.end(heroVideo.buffered.length - 1);
  }

  function needsSeekableRepair() {
    if (!heroVideo || heroVideo.error || canSeekVideo()) {
      return false;
    }

    if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
      return false;
    }

    if (seekableRepairCount >= MAX_SEEKABLE_REPAIRS) {
      return false;
    }

    return getBufferedEnd() >= heroVideo.duration - 0.1;
  }

  function repairVideoSeekable() {
    if (!heroVideo || repairInProgress || !needsSeekableRepair()) {
      return Promise.resolve(canSeekVideo());
    }

    repairInProgress = true;
    seekableRepairCount += 1;
    var src = heroVideo.currentSrc || heroVideo.getAttribute("src") || VIDEO_SRC;

    return new Promise(function (resolve) {
      var settled = false;

      function finish() {
        if (settled) {
          return;
        }
        settled = true;
        repairInProgress = false;
        syncVideoReady();
        resolve(canSeekVideo());
      }

      heroVideo.addEventListener("canplaythrough", finish, { once: true });
      heroVideo.addEventListener("error", finish, { once: true });

      heroVideo.removeAttribute("src");
      heroVideo.load();
      heroVideo.src = src;
      heroVideo.load();

      window.setTimeout(finish, 12000);
    });
  }

  function scheduleSeekableRepair() {
    if (repairScheduled || repairInProgress || !needsSeekableRepair()) {
      return;
    }

    repairScheduled = true;
    repairVideoSeekable().then(function (ok) {
      repairScheduled = false;
      if (ok) {
        showFirstFrame();
      }
    });
  }

  function showFirstFrame() {
    if (!heroVideo) return Promise.resolve();

    heroVideo.pause();

    return new Promise(function (resolve) {
      function trySeek() {
        if (!canSeekVideo()) {
          return false;
        }

        try {
          heroVideo.currentTime = 0.001;
          displayTime = 0.001;
          targetTime = 0.001;
        } catch (err) {
          /* ignore */
        }

        return true;
      }

      function finish() {
        trySeek();
        resolve();
      }

      if (trySeek()) {
        resolve();
        return;
      }

      function onReady() {
        heroVideo.removeEventListener("progress", onProgress);
        heroVideo.removeEventListener("canplaythrough", onReady);
        finish();
      }

      function onProgress() {
        if (canSeekVideo()) {
          onReady();
        }
      }

      heroVideo.addEventListener("progress", onProgress);
      heroVideo.addEventListener("canplaythrough", onReady, { once: true });
      heroVideo.addEventListener("error", resolve, { once: true });
      window.setTimeout(finish, 10000);
    });
  }

  function waitUntilSeekable() {
    return new Promise(function (resolve) {
      if (syncVideoReady()) {
        resolve();
        return;
      }

      var attempts = 0;
      var maxAttempts = 50;

      function finish() {
        if (needsSeekableRepair()) {
          repairVideoSeekable().then(function () {
            syncVideoReady();
            resolve();
          });
          return;
        }

        syncVideoReady();
        resolve();
      }

      function onProgress() {
        if (syncVideoReady()) {
          heroVideo.removeEventListener("progress", onProgress);
          heroVideo.removeEventListener("canplaythrough", onCanPlayThrough);
          finish();
        }
      }

      function onCanPlayThrough() {
        heroVideo.removeEventListener("progress", onProgress);
        finish();
      }

      heroVideo.addEventListener("progress", onProgress);
      heroVideo.addEventListener("canplaythrough", onCanPlayThrough, { once: true });

      function check() {
        if (syncVideoReady()) {
          heroVideo.removeEventListener("progress", onProgress);
          finish();
          return;
        }

        if (heroVideo.error) {
          videoReady = false;
          resolve();
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          finish();
          return;
        }

        window.setTimeout(check, 100);
      }

      check();
    });
  }

  function loadVideoSource(src) {
    return fetch(src)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Video fetch failed");
        }
        return response.blob();
      })
      .then(function (blob) {
        heroVideo.src = URL.createObjectURL(blob);
        heroVideo.load();

        return new Promise(function (resolve, reject) {
          heroVideo.addEventListener(
            "error",
            function () {
              reject(new Error("Video failed to load"));
            },
            { once: true }
          );

          heroVideo.addEventListener("canplaythrough", resolve, { once: true });

          var pollAttempts = 0;
          (function pollReady() {
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
          })();
        });
      })
      .then(function () {
        return waitUntilSeekable();
      })
      .then(function () {
        return showFirstFrame();
      });
  }

  function prepareVideo() {
    return loadVideoSource(VIDEO_SRC);
  }

  function bindVideoRecovery() {
    if (!heroVideo) return;

    function onVideoProgress() {
      syncVideoReady();
      if (!videoReady) {
        scheduleSeekableRepair();
      }
    }

    heroVideo.addEventListener("progress", onVideoProgress, { passive: true });
    heroVideo.addEventListener("canplay", onVideoProgress, { passive: true });
    heroVideo.addEventListener("canplaythrough", onVideoProgress, { passive: true });
    heroVideo.addEventListener("loadeddata", onVideoProgress, { passive: true });
  }

  function bindSeekGate() {
    var seekTimeout = null;

    heroVideo.addEventListener("seeking", function () {
      isSeeking = true;
      if (seekTimeout) {
        window.clearTimeout(seekTimeout);
      }
      seekTimeout = window.setTimeout(function () {
        seekTimeout = null;
        isSeeking = false;
      }, 400);
    });

    heroVideo.addEventListener("seeked", function () {
      if (seekTimeout) {
        window.clearTimeout(seekTimeout);
        seekTimeout = null;
      }
      isSeeking = false;
      displayTime = heroVideo.currentTime;
    });
  }

  function applyVideoSeek(time) {
    if (!heroVideo || !Number.isFinite(heroVideo.duration)) {
      return;
    }

    var clamped = Math.min(Math.max(time, 0), Math.max(heroVideo.duration - 0.001, 0));

    if (Math.abs(heroVideo.currentTime - clamped) < SEEK_THRESHOLD) {
      displayTime = heroVideo.currentTime;
      return;
    }

    if (isSeeking) {
      return;
    }

    heroVideo.pause();

    try {
      heroVideo.currentTime = clamped;
    } catch (err) {
      /* ignore transient seek failures */
    }
  }

  function setHeroState(index) {
    if (index === activeStateIndex) return;
    activeStateIndex = index;
    var states = heroCopy.querySelectorAll(".hero-state");
    for (var i = 0; i < states.length; i++) {
      states[i].classList.toggle("is-active", i === index);
    }
  }

  function resolveHeroState(progress) {
    for (var i = 0; i < HERO_STATES.length; i++) {
      var state = HERO_STATES[i];
      if (progress >= state.start && progress < state.end) {
        return i;
      }
    }
    return HERO_STATES.length - 1;
  }

  function updateHeroUi(progress) {
    setHeroState(resolveHeroState(progress));

    if (progress > 0.9 && !navOverlay.classList.contains("is-open")) {
      navOverlay.classList.add("is-visible");
    } else if (progress <= 0.82 && !navOverlay.classList.contains("is-open")) {
      navOverlay.classList.remove("is-visible");
    }

    if (progress >= 0.995) {
      document.body.classList.add("hero-complete");
    } else {
      document.body.classList.remove("hero-complete");
    }
  }

  function animationLoop() {
    rafActive = true;

    var progress = getHeroProgress();
    var duration = heroVideo && Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0;

    if (duration > 0 && videoReady && !prefersReducedMotion) {
      targetTime = progress * duration;
      displayTime += (targetTime - displayTime) * LERP;

      if (!isSeeking && Math.abs(displayTime - heroVideo.currentTime) > SEEK_THRESHOLD) {
        applyVideoSeek(displayTime);
      }
    } else if (!videoReady && heroVideo && !prefersReducedMotion) {
      syncVideoReady();
      if (!videoReady) {
        scheduleSeekableRepair();
      }
    } else if (prefersReducedMotion && duration > 0) {
      targetTime = 0;
      displayTime = 0;
    }

    updateHeroUi(progress);

    window.requestAnimationFrame(animationLoop);
  }

  function startAnimationLoop() {
    if (!rafActive) {
      window.requestAnimationFrame(animationLoop);
    }
  }

  function bindScroll() {
    if (heroBooted) return;
    heroBooted = true;

    refreshLayoutCache();
    window.addEventListener("resize", refreshLayoutCache, { passive: true });
    window.addEventListener("load", refreshLayoutCache, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        refreshLayoutCache();
      });
    }

    window.requestAnimationFrame(function () {
      refreshLayoutCache();
      startAnimationLoop();
    });
  }

  function bootHero() {
    Promise.all([prepareVideo(), minLoadingDelay()])
      .then(function () {
        syncVideoReady();
        refreshLayoutCache();
        finishLoading();
        bindScroll();
        bindLogoNavToggle();
      })
      .catch(function () {
        window.setTimeout(function () {
          prepareVideo()
            .then(function () {
              syncVideoReady();
              refreshLayoutCache();
              if (!bodyWrap.classList.contains("is-ready")) {
                finishLoading();
              }
              bindScroll();
              bindLogoNavToggle();
            })
            .catch(function () {
              refreshLayoutCache();
              finishLoading();
              bindScroll();
              bindLogoNavToggle();
            });
        }, 1500);
      });
  }

  function bindLogoNavToggle() {
    var logo = document.querySelector(".logo-link");
    if (!logo) return;

    logo.addEventListener("click", function (event) {
      event.preventDefault();
      var isOpen = navOverlay.classList.toggle("is-open");
      navOverlay.classList.toggle("is-visible", isOpen);
    });
  }

  runLoadingBar();
  bindSeekGate();
  bindVideoRecovery();
  bootHero();
})();
