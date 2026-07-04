"use client";

import { useEffect, useRef, useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function statusClass(status?: ProjectStatus) {
  if (status === "CANLI") return "status-badge--live";
  if (status === "YAPIM AŞAMASINDA") return "status-badge--wip";
  return "";
}

interface BrowserCardProps {
  project: Project;
  compact?: boolean;
}

export function BrowserCard({ project, compact = false }: BrowserCardProps) {
  const alt = `${project.title} — ekran görüntüsü`;

  return (
    <article className={`browser-card${compact ? " browser-card--compact" : ""} reveal is-visible`}>
      <div className="browser-chrome">
        <div className="browser-dots" aria-hidden="true">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="browser-url">{displayUrl(project.url)}</div>
      </div>

      {project.screenshotSrc ? (
        <img
          className="browser-screenshot-img"
          src={project.screenshotSrc}
          alt={alt}
          loading="lazy"
        />
      ) : (
        <div
          className="browser-screenshot placeholder-media"
          role="img"
          aria-label={alt}
          style={{ aspectRatio: "16 / 10" }}
        >
          <span className="placeholder-label">Yerine koy: {project.screenshotFile}</span>
        </div>
      )}

      <div className="browser-body">
        <div className="browser-title-row">
          <h3>{project.title}</h3>
          {project.status ? (
            <span className={`status-badge ${statusClass(project.status)}`}>
              {project.status}
            </span>
          ) : null}
        </div>
        <p className="browser-desc">{project.description}</p>
        <a
          href={project.url}
          className="browser-visit"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ziyaret Et ↗
        </a>
      </div>
    </article>
  );
}

export function RevealBrowserCard({ project, compact = false }: BrowserCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const alt = `${project.title} — ekran görüntüsü`;

  return (
    <article
      ref={ref}
      className={`browser-card${compact ? " browser-card--compact" : ""} reveal${visible ? " is-visible" : ""}`}
    >
      <div className="browser-chrome">
        <div className="browser-dots" aria-hidden="true">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="browser-url">{displayUrl(project.url)}</div>
      </div>

      {project.screenshotSrc ? (
        <img
          className="browser-screenshot-img"
          src={project.screenshotSrc}
          alt={alt}
          loading="lazy"
        />
      ) : (
        <div
          className="browser-screenshot placeholder-media"
          role="img"
          aria-label={alt}
          style={{ aspectRatio: "16 / 10" }}
        >
          <span className="placeholder-label">Yerine koy: {project.screenshotFile}</span>
        </div>
      )}

      <div className="browser-body">
        <div className="browser-title-row">
          <h3>{project.title}</h3>
          {project.status ? (
            <span className={`status-badge ${statusClass(project.status)}`}>
              {project.status}
            </span>
          ) : null}
        </div>
        <p className="browser-desc">{project.description}</p>
        <a
          href={project.url}
          className="browser-visit"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ziyaret Et ↗
        </a>
      </div>
    </article>
  );
}
