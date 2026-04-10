// src/services/apiService.ts
// All communication between the mobile app and your backend goes through here.

import axios from "axios";
import { getAuth } from "firebase/auth";
import { config } from "../utils/config";

// Create an axios instance that automatically includes your server URL
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 60000, // 60 seconds — hunt generation takes up to 30 seconds
});

// ── Interceptor: automatically add auth token to every request ──
// This runs before EVERY API call and adds the user's login token.
// Your backend middleware checks this token to verify the user is logged in.
api.interceptors.request.use(async (requestConfig) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// ── Hunt generation ─────────────────────────────────────────────
// Called when user taps 'Generate Hunt' after filling in their group profile
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

// ── Fetch a saved hunt ───────────────────────────────────────────
// Called when user wants to replay a past hunt
export const getHunt = async (huntId: string) => {
  const response = await api.get(`/api/hunts/${huntId}`);
  return response.data;
};

// ── Submit a completed stop ──────────────────────────────────────
// Called when user takes a photo at a stop
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

// ── User profile ─────────────────────────────────────────────────
export const saveUserProfile = async (displayName: string) => {
  const response = await api.post("/api/users/profile", { displayName });
  return response.data;
};

// ── TypeScript type definitions ──────────────────────────────────
// These define the shape of data your app uses — like a blueprint
export interface GroupProfile {
  ages: number;
  groupSize: number;
  interests: string[];
  tone: string;
  mobility: string;
}

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
}

export interface Hunt {
  huntId: string;
  huntTitle: string;
  huntDescription: string;
  estimatedDurationMinutes: number;
  totalPossiblePoints: number;
  city: string;
  stops: HuntStop[];
}
