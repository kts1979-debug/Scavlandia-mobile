// src/theme/index.ts
// The single source of truth for all design decisions in Scavlandia.
// Import from this file in every screen instead of hardcoding values.

// ── COLOR PALETTE ────────────────────────────────────────────────
// Scavlandia brand palette — teal + blue + purple
export const COLORS = {
  // Primary brand colors
  primary: "#3c89d6", // Brand blue — main background and headers
  primaryLight: "#5fa8e8", // Lighter blue — cards and secondary backgrounds
  accent: "#5acba6", // Brand teal — buttons and highlights
  accentLight: "#7ddcba", // Lighter teal — hover states
  accentPale: "#e6f9f4", // Very pale teal — backgrounds
  purple: "#7f78de", // Brand purple — special accents
  purpleLight: "#a09ae8", // Lighter purple — hover states
  purplePale: "#eeecfb", // Very pale purple — backgrounds
  lred: "#FADBD8", // Pale red — answer reveal background
  lgreen: "#D5F5E3", // Pale green — success backgrounds
  lyellow: "#FEF9E7",

  // Gameplay colors
  gold: "#F39C12", // Gold — points and achievements
  goldLight: "#FEF9E7", // Pale gold — achievement backgrounds
  success: "#27AE60", // Green — completed stops
  successLight: "#D5F5E3", // Pale green — success backgrounds
  danger: "#E74C3C", // Red — warnings and urgent states
  dangerLight: "#FADBD8", // Pale red — warning backgrounds
  hint: "#7f78de", // Purple — hints (now brand purple)
  hintLight: "#eeecfb", // Pale purple — hint backgrounds

  // Neutral colors
  white: "#FFFFFF",
  offWhite: "#E8F8F7", // Light teal tint — page backgrounds
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
  round: 999,
};

// ── SHADOWS ───────────────────────────────────────────────────────
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
    timerMinutes: null,
    description: "Simple clues, 3 hints",
  },
  medium: {
    label: "Medium",
    emoji: "🟡",
    color: "#F39C12",
    multiplier: 1.5,
    hintCount: 3,
    timerMinutes: null,
    description: "Trickier clues, 3 hints",
  },
  hard: {
    label: "Hard",
    emoji: "🔴",
    color: "#E74C3C",
    multiplier: 2.0,
    hintCount: 2,
    timerMinutes: 120,
    description: "Cryptic clues, 2 hints, 2hr timer",
  },
};

// ── SPECIALTY HUNTS ────────────────────────────────────────────────
export const SPECIALTY_HUNTS = {
  bar_crawl: {
    label: "Bar & Pub Crawl",
    emoji: "🍺",
    color: "#C0392B",
    description: "Bars, breweries & hidden watering holes",
    clueTheme: "fun and social",
    huntVibe: "bar crawl",
    spotFocus:
      "oldest bars, historic taverns, speakeasies, craft breweries, cocktail lounges, dive bars, jazz bars, celebrity haunt bars",
  },
  food_tour: {
    label: "Food Tour",
    emoji: "🍽️",
    color: "#E67E22",
    description: "The best bites and local food culture",
    clueTheme: "fun and educational",
    huntVibe: "food tour",
    spotFocus:
      "oldest restaurants, James Beard award winners, dish-invented-here landmarks, historic markets, famous bakeries, iconic diners, multi-generation family restaurants",
  },
  ghost_true_crime: {
    label: "Ghost & True Crime",
    emoji: "👻",
    color: "#8E44AD",
    description: "Dark history, hauntings & notorious stories",
    clueTheme: "mysterious, ghostly and true crime",
    huntVibe: "eerie and mysterious",
    spotFocus:
      "haunted hotels, historic jails, famous crime scenes, execution sites, haunted theaters, gangster landmarks, haunted cemeteries, paranormal investigation sites",
  },
  date_night: {
    label: "Date Night",
    emoji: "💑",
    color: "#E91E8C",
    description: "Romantic spots and intimate discoveries",
    clueTheme: "romantic and intimate",
    huntVibe: "romantic and charming",
    spotFocus:
      "intimate restaurants, scenic viewpoints, secret gardens, jazz clubs, rooftop bars, botanical gardens, famous proposal spots, hidden wine bars, waterfront promenades",
  },
  art_culture: {
    label: "Art & Culture",
    emoji: "🎨",
    color: "#3c89d6",
    description: "Galleries, murals and creative spaces",
    clueTheme: "educational and creative",
    huntVibe: "artistic and inspiring",
    spotFocus:
      "art museums, public sculpture, landmark murals, artist studios, mosaic buildings, gallery districts, cultural centers, historic theaters, arts foundations",
  },
  family_adventure: {
    label: "Family Adventure",
    emoji: "🎈",
    color: "#27AE60",
    description: "Fun for all ages, kid-approved stops",
    clueTheme: "family friendly and fun",
    huntVibe: "wholesome and accessible for all ages",
    spotFocus:
      "children museums, zoos, aquariums, famous playgrounds, public fountains, carousels, science centers, giant public art, nature centers, historic fire stations",
  },
  active_outdoor: {
    label: "Active & Outdoor",
    emoji: "🏃",
    color: "#5acba6",
    description: "Parks, trails and outdoor adventures",
    clueTheme: "energetic and adventurous",
    huntVibe: "active and outdoorsy",
    spotFocus:
      "urban trails, waterfalls, scenic overlooks, river access, urban forests, ancient trees, birding hotspots, rock formations, botanical trails, elevated walkways",
  },
  mystery_escape: {
    label: "Mystery & Escape Room",
    emoji: "🔐",
    color: "#7f78de",
    description: "Solve a mystery across every stop",
    clueTheme: "challenging and following a storyline across stops",
    huntVibe: "solving a mystery or on a mission feel",
    spotFocus:
      "historic buildings with unusual details, libraries, underground tunnels, clock towers, former bank vaults, old churches, newspaper archive buildings, curiosity shops, observatories",
  },
  wellness_mindfulness: {
    label: "Wellness & Mindfulness",
    emoji: "🧘",
    color: "#5acba6",
    description: "A restorative walk through calming spaces",
    clueTheme: "gentle and restorative",
    huntVibe: "unhurried and contemplative",
    spotFocus:
      "secret gardens, Japanese gardens, labyrinths, historic bathhouses, meditation centers, quiet chapels, urban forests, rooftop gardens, healing gardens, contemplative parks",
  },
  bachelorette_bachelor: {
    label: "Bachelorette / Bachelor",
    emoji: "🥂",
    color: "#7f78de",
    description: "A celebratory night out to remember",
    clueTheme: "celebratory and slightly irreverent",
    huntVibe: "high energy group celebration",
    spotFocus:
      "best cocktail bars, rooftop bars, grand hotel bars, drag venues, famous photo spots, dance clubs, champagne bars, karaoke bars, late night desserts, speakeasies",
  },
  literary_bookshop: {
    label: "Literary & Bookshop Tour",
    emoji: "📚",
    color: "#3c89d6",
    description: "For readers, dreamers and word lovers",
    clueTheme: "prose-rich and contemplative",
    huntVibe: "quietly reverent of language",
    spotFocus:
      "independent bookshops, historic libraries, authors homes, literary cafes, publishing history sites, poetry landmarks, rare book dealers, writing society buildings, printing press history",
  },
  architecture_design: {
    label: "Architecture & Design Walk",
    emoji: "🏛️",
    color: "#2E4057",
    description: "Learn to look at buildings differently",
    clueTheme: "precise and architecturally focused",
    huntVibe: "intellectually curious design enthusiast",
    spotFocus:
      "art deco landmarks, gothic revival buildings, beaux arts buildings, famous architect signature buildings, first skyscrapers, brutalist landmarks, Victorian architecture, adaptive reuse landmarks, ornate facades",
  },
  music_heritage: {
    label: "Music Heritage Trail",
    emoji: "🎵",
    color: "#C0392B",
    description: "Follow the sounds that shaped the city",
    clueTheme: "electric and reverential",
    huntVibe: "music history pilgrimage",
    spotFocus:
      "historic recording studios, legendary music venues, musician birthplaces, genre birthplace neighborhoods, record stores, radio station history, music festival origin sites, album cover locations",
  },
  vintage_antique: {
    label: "Vintage & Antique Crawl",
    emoji: "🪙",
    color: "#784212",
    description: "Treasure hunting through the city's past",
    clueTheme: "curious and tactile",
    huntVibe: "treasure hunter obsessive",
    spotFocus:
      "antique markets, vintage clothing shops, estate sale specialists, flea markets, vintage record shops, antique furniture dealers, architectural salvage yards, vintage bookshops, collectibles dealers",
  },
  culinary_heritage: {
    label: "Culinary Heritage Tour",
    emoji: "🥘",
    color: "#A93226",
    description: "The immigrant food stories that built this city",
    clueTheme: "warm and culturally honoring",
    huntVibe: "human and community focused",
    spotFocus:
      "first generation immigrant restaurants, multi-generation family restaurants, ethnic neighborhood food anchors, cultural bakeries, historic food markets, immigrant grocery stores, cultural celebration food spots",
  },
} as const;

export type SpecialtyHuntKey = keyof typeof SPECIALTY_HUNTS;
