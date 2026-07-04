"use client";

import { HERO_STATES } from "@/lib/hero-config";

interface HeroCopyProps {
  activeState: number;
}

export function HeroCopy({ activeState }: HeroCopyProps) {
  return (
    <div className="hero-copy" id="hero-copy">
      {HERO_STATES.map((state) => (
        <div
          key={state.id}
          className={`hero-state${activeState === state.id ? " is-active" : ""}`}
          data-state={state.id}
        >
          <h1 className="hero-title">
            {state.titleLines[0]}
            <br />
            {state.titleLines[1]}
          </h1>
          <p className="hero-subtitle">{state.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
