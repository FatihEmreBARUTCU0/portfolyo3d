"use client";

interface LoadingScreenProps {
  progress: number;
  hidden: boolean;
}

export function LoadingScreen({ progress, hidden }: LoadingScreenProps) {
  const radius = 40;
  const circumference = Math.PI * (radius * 2);
  const strokeDashoffset = ((100 - progress) / 100) * circumference;

  return (
    <div
      id="loading-wrap"
      className={`loading-wrap${hidden ? " is-hidden" : ""}`}
      aria-hidden={hidden ? "true" : "false"}
    >
      <div className="loading-inner">
        <div className="loading-gradient" aria-hidden="true" />
        <div className="loading-bar" id="loading-bar">
          <svg width="82" height="82" viewBox="0 0 82 82" aria-hidden="true">
            <circle r="40" cx="41" cy="41" fill="transparent" stroke="#d5ff3f" strokeWidth="1" />
            <circle
              r="40"
              cx="41"
              cy="41"
              fill="transparent"
              stroke="#d5ff3f"
              strokeWidth="1"
              strokeDasharray="251.327"
              strokeDashoffset={strokeDashoffset}
              className="loading-bar-circle"
            />
          </svg>
          <div className="loading-bar-text" id="loading-text">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}
