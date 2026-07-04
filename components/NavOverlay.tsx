"use client";

import { useEffect, useState } from "react";
import { CONTACT } from "@/lib/portfolio-data";

interface NavOverlayProps {
  visible: boolean;
  open: boolean;
}

export function NavOverlay({ visible, open }: NavOverlayProps) {
  return (
    <nav
      className={`nav-overlay${visible ? " is-visible" : ""}${open ? " is-open" : ""}`}
      id="nav-overlay"
      aria-label="Full screen menu"
    >
      <div className="nav-overlay-inner">
        <ul className="nav-links">
          <li>
            <a href="#">ana sayfa</a>
          </li>
          <li>
            <a href="#about">hakkımda</a>
          </li>
          <li>
            <a href="#work">projeler</a>
          </li>
          <li>
            <a href={`mailto:${CONTACT.email}`} className="nav-email">
              {CONTACT.email}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export function useSmoothAnchorScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const section = document.querySelector(id);
      if (!section) return;

      event.preventDefault();
      section.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
