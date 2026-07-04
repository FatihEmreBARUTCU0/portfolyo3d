"use client";

import { useEffect, useRef, useState } from "react";
import { BIO, EDUCATION, EXPERIENCE, SITE, SKILLS } from "@/lib/portfolio-data";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
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

  return { ref, visible };
}

function RevealBlock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

export function AboutSection() {
  return (
    <section className="section section--about" id="about" aria-labelledby="about-heading">
      <div className="section-inner">
        <div className="about-grid">
          <div className="about-copy">
            <RevealBlock>
              <p className="section-eyebrow">Hakkımda</p>
              <h2 className="section-title" id="about-heading">
                {SITE.name}
              </h2>
              <p className="section-body">{BIO}</p>
            </RevealBlock>

            <div id="skills-groups" className="skills-groups">
              {SKILLS.map((group) => (
                <RevealBlock key={group.category}>
                  <div className="skills-group">
                    <h3>{group.category}</h3>
                    <ul className="skills-list">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </RevealBlock>
              ))}
            </div>

            <RevealBlock className="about-subsection">
              <h3 className="about-subheading">Deneyim</h3>
              <div id="experience-list" className="timeline-list">
                {EXPERIENCE.map((item) => (
                  <article key={`${item.role}-${item.period}`} className="timeline-card">
                    <div className="timeline-meta">
                      <span>{item.period}</span>
                      <span>{item.location}</span>
                    </div>
                    <h3>{item.role}</h3>
                    <p className="timeline-company">{item.company}</p>
                    <p className="timeline-desc">{item.description}</p>
                  </article>
                ))}
              </div>
            </RevealBlock>

            <RevealBlock className="about-subsection">
              <h3 className="about-subheading">Eğitim</h3>
              <div id="education-list" className="edu-list">
                {EDUCATION.map((item) => (
                  <article key={`${item.school}-${item.period}`} className="edu-card">
                    <h3>{item.degree}</h3>
                    <p className="edu-school">{item.school}</p>
                    <p className="edu-meta">
                      {item.period} · {item.location}
                    </p>
                  </article>
                ))}
              </div>
            </RevealBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
