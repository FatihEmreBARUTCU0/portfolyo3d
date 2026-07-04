"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/portfolio-data";

interface SiteNavProps {
  heroScrollRef: React.RefObject<HTMLElement | null>;
}

export function SiteNav({ heroScrollRef }: SiteNavProps) {
  const [visible, setVisible] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById("site-nav");
    if (!nav) return;

    const syncNavHeight = () => {
      document.documentElement.style.setProperty(
        "--nav-height",
        `${Math.ceil(nav.getBoundingClientRect().height)}px`
      );
    };

    syncNavHeight();

    const observer = new ResizeObserver(syncNavHeight);
    observer.observe(nav);
    window.addEventListener("resize", syncNavHeight, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncNavHeight);
    };
  }, []);

  useEffect(() => {
    const heroScroll = heroScrollRef.current;
    if (!heroScroll) return;

    const navLayoutCache = { heroBottom: 0 };

    const refreshNavLayoutCache = () => {
      navLayoutCache.heroBottom = heroScroll.offsetTop + heroScroll.offsetHeight;
    };

    const updateNav = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      setVisible(scrollY > window.innerHeight * 0.85);
      setSolid(scrollY > navLayoutCache.heroBottom - 120);
    };

    refreshNavLayoutCache();
    updateNav();

    const onResize = () => {
      refreshNavLayoutCache();
      updateNav();
    };

    window.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", onResize);
    };
  }, [heroScrollRef]);

  return (
    <nav
      className={`site-nav${visible ? " is-visible" : ""}${solid ? " is-solid" : ""}`}
      id="site-nav"
      aria-label="Ana menü"
    >
      <a href="#" className="site-nav-brand">
        {SITE.name}
      </a>
      <button
        className="site-nav-toggle"
        id="site-nav-toggle"
        aria-expanded={menuOpen}
        aria-controls="site-nav-menu"
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menü
      </button>
      <ul
        className={`site-nav-menu${menuOpen ? " is-open" : ""}`}
        id="site-nav-menu"
      >
        <li>
          <a
            href="#about"
            className="site-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Hakkımda
          </a>
        </li>
        <li>
          <a
            href="#work"
            className="site-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Projeler
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="site-nav-link site-nav-link--accent"
            onClick={() => setMenuOpen(false)}
          >
            İletişim
          </a>
        </li>
      </ul>
    </nav>
  );
}
