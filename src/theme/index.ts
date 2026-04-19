// src/theme/index.ts
// The single source of truth for all design decisions in Daytripper.
// Import from this file in every screen instead of hardcoding values.

// ── COLOR PALETTE ────────────────────────────────────────────────
// Playful, adventurous palette — deep navy + energetic orange
export const COLORS = {
  // Primary brand colors
  primary: "#1A3A5C", // Deep navy — main background and headers
  primaryLight: "#2E5F8A", // Lighter navy — cards and secondary backgrounds
  accent: "#E8622A", // Energetic orange — buttons and highlights
  accentLight: "#FF8C5A", // Lighter orange — hover states
  accentPale: "#FEF0E8", // Very pale orange — backgrounds
  lred: "#FADBD8", // Pale red — answer reveal background
  lgreen: "#D5F5E3", // Pale green — success backgrounds

  // Gameplay colors
  gold: "#F39C12", // Gold — points and achievements
  goldLight: "#FEF9E7", // Pale gold — achievement backgrounds
  success: "#27AE60", // Green — completed stops
  successLight: "#D5F5E3", // Pale green — success backgrounds
  danger: "#E74C3C", // Red — warnings and urgent states
  dangerLight: "#FADBD8", // Pale red — warning backgrounds
  hint: "#8E44AD", // Purple — hints
  hintLight: "#E8DAEF", // Pale purple — hint backgrounds

  // Neutral colors
  white: "#FFFFFF",
  offWhite: "#F8F9FA",
  lightGray: "#F0F2F5",
  midGray: "#BDC3C7",
  darkGray: "#566573",
  black: "#1A1A2E",

  // Stop marker colors
  markerActive: "#F39C12", // Gold — current stop
  markerComplete: "#27AE60", // Green — finished stops
  markerFuture: "#BDC3C7", // Gray — upcoming stops
};

// ── TYPOGRAPHY ───────────────────────────────────────────────────
export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    bold: "700" as const,
    heavy: "900" as const,
  },
};

// ── SPACING ───────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ── BORDER RADIUS ─────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999, // Makes fully rounded pill shapes
};

// ── SHADOWS ───────────────────────────────────────────────────────
// Apply these as style props to add drop shadows to cards
export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ── DIFFICULTY SETTINGS ───────────────────────────────────────────
export const DIFFICULTY = {
  easy: {
    label: "Easy",
    emoji: "🟢",
    color: "#27AE60",
    multiplier: 1.0,
    hintCount: 3,
    timerMinutes: null, // No timer for Easy
    description: "Simple clues, 3 hints",
  },
  medium: {
    label: "Medium",
    emoji: "🟡",
    color: "#F39C12",
    multiplier: 1.5,
    hintCount: 3,
    timerMinutes: null, // No timer for Medium
    description: "Trickier clues, 3 hints",
  },
  hard: {
    label: "Amazing Race",
    emoji: "🔴",
    color: "#E74C3C",
    multiplier: 2.0,
    hintCount: 2,
    timerMinutes: 120, // 2 hour timer for Amazing Race only
    description: "Cryptic clues, 2 hints, 2hr timer",
  },
};

// ── HUNT THEMES ───────────────────────────────────────────────────
export const THEMES = {
  adventure: {
    label: "Adventure",
    emoji: "🗺️",
    color: "#E8622A",
    description: "Explore the city like an explorer",
  },
  mystery: {
    label: "Mystery",
    emoji: "🔍",
    color: "#8E44AD",
    description: "Solve clues like a detective",
  },
  foodie: {
    label: "Foodie",
    emoji: "🍕",
    color: "#E67E22",
    description: "Discover the best eats",
  },
  history: {
    label: "History",
    emoji: "🏛️",
    color: "#1A5276",
    description: "Uncover the city's past",
  },
  kids: {
    label: "Family Fun",
    emoji: "🎈",
    color: "#27AE60",
    description: "Simple and fun for all ages",
  },
};
