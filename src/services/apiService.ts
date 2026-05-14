// src/services/apiService.ts
// All API calls to your backend go through this file.
// The interceptor automatically adds the user's real Firebase token
// to every request — no more hardcoded test tokens.

import axios from "axios";
import { config } from "../utils/config";
import { auth } from "../utils/firebaseConfig";

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 90000,
});

// ── Auth interceptor ─────────────────────────────────────────────
api.interceptors.request.use(async (requestConfig) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// ── Hunt generation ──────────────────────────────────────────────
export const generateHunt = async (
  city: string,
  groupProfile: GroupProfile,
) => {
  const response = await api.post("/api/hunts/generate", {
    city,
    groupProfile,
  });
  return response.data;
};

export const generateMuseumHunt = async (
  museumName: string,
  museumAddress: string,
  museumLat: number,
  museumLng: number,
  groupProfile: GroupProfile,
) => {
  const response = await api.post("/api/hunts/generate-museum", {
    museumName,
    museumAddress,
    museumLat,
    museumLng,
    groupProfile,
  });
  return response.data;
};

export const generateMicroHunt = async (
  lat: number,
  lng: number,
  stopCount: number = 2,
  difficulty: string = "easy",
  theme: string = "adventure",
  vibe: string = "fun and engaging",
  interests: string[] = [],
) => {
  const response = await api.post("/api/hunts/generate-micro", {
    lat,
    lng,
    stopCount,
    difficulty,
    theme,
    vibe,
    interests,
  });
  return response.data;
};

export const generateRoadTripHunt = async (
  startLocation: string,
  endLocation: string,
  stopCount: number,
  interests: string[],
  tone: string,
  difficulty: string,
  timeBetweenStops: number,
  selectedStops: any[],
  totalDurationMinutes: number,
  totalDistanceMiles: number,
  unselectedCandidates: any[] = [],
  routePolyline: string = "",
  clueTheme: string = "",
  huntVibe: string = "",
) => {
  const response = await api.post("/api/hunts/generate-road-trip", {
    startLocation,
    endLocation,
    stopCount,
    interests,
    tone,
    difficulty,
    timeBetweenStops,
    selectedStops,
    totalDurationMinutes,
    totalDistanceMiles,
    unselectedCandidates,
    routePolyline,
    clueTheme,
    huntVibe,
    groupProfile: {
      unselectedCandidates,
      routePolyline,
      clueTheme,
      huntVibe,
      tone,
      difficulty,
      interests,
    },
  });
  return response.data;
};

export async function addStopToHunt(huntId: string, candidate: any) {
  const response = await api.post(`/api/hunts/${huntId}/add-stop`, {
    candidate,
  });
  return response.data;
}

// ── Nearby suggestions ───────────────────────────────────────────
export const getNearbyCities = async (
  lat: number,
  lng: number,
  currentCity: string,
): Promise<string[]> => {
  const response = await api.get("/api/hunts/nearby-cities", {
    params: { lat, lng, currentCity },
  });
  return response.data.nearbyCities || [];
};

export const getNearbyMuseums = async (
  lat: number,
  lng: number,
): Promise<any[]> => {
  const response = await api.get("/api/hunts/nearby-museums", {
    params: { lat, lng },
  });
  return response.data.museums || [];
};

// ── Hunt retrieval ───────────────────────────────────────────────
export const getHunt = async (huntId: string) => {
  const response = await api.get(`/api/hunts/${huntId}`);
  return response.data;
};

export const getUserHunts = async () => {
  const response = await api.get("/api/hunts/user/my-hunts");
  return response.data;
};

export const getActiveHunt = async () => {
  const response = await api.get("/api/hunts/active");
  return response.data;
};

// ── Hunt actions ─────────────────────────────────────────────────
export const submitStop = async (
  huntId: string,
  stopOrder: number,
  photoUrl: string,
  points: number,
) => {
  const response = await api.post("/api/submissions", {
    huntId,
    stopOrder,
    photoUrl,
    pointsEarned: points,
  });
  return response.data;
};

export const saveHuntPhotos = async (
  huntId: string,
  stopPhotos: Record<string, string>,
) => {
  const response = await api.post(`/api/hunts/${huntId}/save-photos`, {
    stopPhotos,
  });
  return response.data;
};

export const saveActiveHuntState = async (
  huntId: string,
  activeStopIndex: number,
  completedIndices: number[],
  totalPoints: number,
  stopPhotos: Record<string, string>,
  skippedStops: number[],
  swapsUsed: number,
) => {
  const response = await api.post(`/api/hunts/${huntId}/save-active-state`, {
    activeStopIndex,
    completedIndices,
    totalPoints,
    stopPhotos,
    skippedStops,
    swapsUsed,
  });
  return response.data;
};

export const clearActiveHuntState = async (huntId: string) => {
  const response = await api.delete(`/api/hunts/${huntId}/save-active-state`);
  return response.data;
};

export const completeHunt = async (
  huntId: string,
  visitedPlaceIds: string[],
) => {
  const response = await api.post(`/api/hunts/${huntId}/complete`, {
    visitedPlaceIds,
  });
  return response.data;
};

// ── User actions ─────────────────────────────────────────────────
export const saveUserProfile = async (displayName: string) => {
  const response = await api.post("/api/users/profile", { displayName });
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/api/users/account");
  return response.data;
};

// ── TypeScript interfaces ─────────────────────────────────────────
export interface GroupProfile {
  ages: number;
  groupSize: number;
  interests: string[];
  tone: string;
  mobility: string;
}

// ── Fetch road trip candidates ────────────────────────────────────
export const getRoadTripCandidates = async (
  startLocation: string,
  endLocation: string,
  interests: string[],
) => {
  const response = await api.get("/api/hunts/road-trip-candidates", {
    params: {
      startLocation,
      endLocation,
      interests: JSON.stringify(interests),
    },
  });
  return response.data;
};

export interface HuntStop {
  order: number;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  mapLat?: number; // offset coordinates for road trip navigation
  mapLng?: number; // offset coordinates for road trip navigation
  clue: string;
  task: string;
  funFact: string;
  pointValue: number;
  hints?: string[];
  galleryOrRoom?: string;
  photoUrl?: string;
  placeId?: string;
  driveTimeFromPrevious?: string;
  trivia?: {
    question: string;
    options: string[];
    answerIndex: number;
    funFact: string;
  };
}

export interface Hunt {
  huntId: string;
  huntTitle: string;
  huntDescription: string;
  estimatedDurationMinutes: number;
  totalPossiblePoints: number;
  city: string;
  stops: HuntStop[];
  reserveStops?: HuntStop[];
  isRoadTripHunt?: boolean;
  isMuseumHunt?: boolean;
  isMicroHunt?: boolean;
  startLocation?: string;
  endLocation?: string;
  totalDurationMinutes?: number;
  totalDistanceKm?: number;
  groupProfile?: {
    ages: number;
    groupSize: number;
    interests: string[];
    tone: string;
    mobility: string;
    difficulty?: string;
    theme?: string;
    timeBetweenStops?: number;
  };
}
