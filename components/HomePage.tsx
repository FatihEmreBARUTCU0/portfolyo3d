"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
import { HeroCopy } from "@/components/HeroCopy";
import { NavOverlay, useSmoothAnchorScroll } from "@/components/NavOverlay";
import { SiteNav } from "@/components/SiteNav";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { PortfolioFooter } from "@/components/PortfolioFooter";
import { useHeroVideo } from "@/hooks/useHeroVideo";

export function HomePage() {
  const {
    videoRef,
    heroScrollRef,
    loadingProgress,
    isReady,
    activeHeroState,
    navOverlayVisible,
    navOverlayOpen,
    toggleNavOverlay,
  } = useHeroVideo();

  useSmoothAnchorScroll();

  return (
    <>
      <LoadingScreen progress={loadingProgress} hidden={isReady} />

      <div id="body-wrap" className={`body-wrap${isReady ? " is-ready" : ""}`}>
        <header className="site-header">
          <a
            href="#"
            className="logo-link"
            aria-label="Ana sayfa"
            onClick={(event) => {
              event.preventDefault();
              toggleNavOverlay();
            }}
          >
            <img
              src="/logo.svg"
              alt=""
              className="site-logo"
              width={80}
              height={80}
            />
          </a>
        </header>

        <SiteNav heroScrollRef={heroScrollRef} />

        <section className="hero-scroll" id="hero-scroll" aria-label="Hero" ref={heroScrollRef}>
          <div className="hero-pin">
            <video
              id="hero-video"
              ref={videoRef}
              className="hero-video"
              muted
              playsInline
              preload="none"
              aria-hidden="true"
            />
            <div className="hero-watermark-mask" aria-hidden="true" />
            <div className="hero-vignette" aria-hidden="true" />

            <HeroCopy activeState={activeHeroState} />

            <div className="hero-scroll-hint">
              <img
                src="/scroll-hint.gif"
                alt=""
                className="scroll-gif"
                width={100}
                height={100}
              />
              <span>keşfetmek için kaydır</span>
            </div>
          </div>
        </section>

        <NavOverlay visible={navOverlayVisible} open={navOverlayOpen} />

        <div className="portfolio" id="portfolio">
          <AboutSection />
          <ProjectsSection />
          <ContactSection />
          <PortfolioFooter />
        </div>
      </div>
    </>
  );
}
