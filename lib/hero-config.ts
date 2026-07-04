export const HERO_STATE_RANGES = [
  { start: 0, end: 0.22 },
  { start: 0.22, end: 0.48 },
  { start: 0.48, end: 0.72 },
  { start: 0.72, end: 1 },
] as const;

export const HERO_STATES = [
  {
    id: 0,
    titleLines: ["DENEYİMLER", "TASARLIYORUZ"],
    subtitle: "full-stack geliştirici",
  },
  {
    id: 1,
    titleLines: ["WEB İÇİN", "GELİŞTİR"],
    subtitle: "Next.js · TypeScript · Node.js",
  },
  {
    id: 2,
    titleLines: ["MOBİLE", "TAŞI"],
    subtitle: "Flutter · React Native",
  },
  {
    id: 3,
    titleLines: ["AI", "ENTEGRASYONU"],
    subtitle: "canlıya hazır teslim",
  },
] as const;

export const LOADING_DURATION = 6000;
export const LOADING_MIN_MS = 400;
export const LERP = 0.18;
export const SEEK_THRESHOLD = 0.012;
