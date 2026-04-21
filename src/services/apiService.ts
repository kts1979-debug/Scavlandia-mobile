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
// Runs before EVERY API call.
// Gets the current user's fresh token and adds it to the request header.
// If no user is logged in, the request is sent without a token
// (the backend will return 401 Unauthorized).
api.interceptors.request.use(async (requestConfig) => {
  const user = auth.currentUser;
  if (user) {
    // getIdToken() always returns a fresh, valid token
    // If the token is about to expire, Firebase refreshes it automatically
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

// Fetch nearby city suggestions when current city has too few locations
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
// ── Fetch a saved hunt by ID ──────────────────────────────────────
export const getHunt = async (huntId: string) => {
  const response = await api.get(`/api/hunts/${huntId}`);
  return response.data;
};

// Fetch nearby museums
export const getNearbyMuseums = async (
  lat: number,
  lng: number,
): Promise<any[]> => {
  const response = await api.get("/api/hunts/nearby-museums", {
    params: { lat, lng },
  });
  return response.data.museums || [];
};

// Generate a museum hunt
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
// ── Fetch all hunts for the current user ──────────────────────────
export const getUserHunts = async () => {
  const response = await api.get("/api/hunts/user/my-hunts");
  return response.data;
};

// ── Submit a completed stop ───────────────────────────────────────
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

// ── Save user profile ─────────────────────────────────────────────
export const saveUserProfile = async (displayName: string) => {
  const response = await api.post("/api/users/profile", { displayName });
  return response.data;
};

// ── TypeScript type definitions ───────────────────────────────────
export interface GroupProfile {
  ages: number;
  groupSize: number;
  interests: string[];
  tone: string;
  mobility: string;
}

export const saveHuntPhotos = async (
  huntId: string,
  stopPhotos: Record<string, string>,
) => {
  const response = await api.post(`/api/hunts/${huntId}/save-photos`, {
    stopPhotos,
  });
  return response.data;
};

export interface HuntStop {
  order: number;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  clue: string;
  task: string;
  funFact: string;
  pointValue: number;
  hints?: string[];
}

export interface Hunt {
  huntId: string;
  huntTitle: string;
  huntDescription: string;
  estimatedDurationMinutes: number;
  totalPossiblePoints: number;
  city: string;
  stops: HuntStop[];
  groupProfile?: {
    // ← add this entire block
    ages: number;
    groupSize: number;
    interests: string[];
    tone: string;
    mobility: string;
    difficulty?: string;
    theme?: string;
  };
}
