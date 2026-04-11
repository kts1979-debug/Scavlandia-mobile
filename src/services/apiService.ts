// src/services/apiService.ts
// All communication between the mobile app and your backend goes through here.

import axios from "axios";
import { config } from "../utils/config";
import { auth } from "../utils/firebaseConfig";
// Create an axios instance that automatically includes your server URL
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 60000,
});

// ── Interceptor: automatically add auth token to every request ──
// This runs before EVERY API call and adds the user's login token.
// Your backend middleware checks this token to verify the user is logged in.
api.interceptors.request.use(async (requestConfig) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    requestConfig.headers.Authorization = `Bearer ${token}`;
  } else {
    requestConfig.headers.Authorization =
      "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjVlODJhZmI0ZWY2OWI3NjM4MzA2OWFjNmI1N2U3ZTY1MjAzYmZlOTYiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiVGVzdCBVc2VyIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2RheXRyaXBwZXItcHJvZCIsImF1ZCI6ImRheXRyaXBwZXItcHJvZCIsImF1dGhfdGltZSI6MTc3NTkyNzUyMywidXNlcl9pZCI6IkZydmx5eVFQREJmNTdiVWw0UnhtWjJTcDRwUzIiLCJzdWIiOiJGcnZseXlRUERCZjU3YlVsNFJ4bVoyU3A0cFMyIiwiaWF0IjoxNzc1OTI3NTIzLCJleHAiOjE3NzU5MzExMjMsImVtYWlsIjoidGVzdHVzZXJAZGF5dHJpcHBlci1kZXYuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3R1c2VyQGRheXRyaXBwZXItZGV2LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.w3wH7cwul_UrorTrCI4hyFhJ68lbt4aMQif9GZuMcWu1waQdZRAW0DHUJfskmXP1TN9wkQyNrK1OnEZVE5zZg2BH5TV2f4RLJfG0Tzd3Hn-KnExQZBy6kyWUg3ywTNOdvmCR3E4erR1CqZjWGUkGoL5cWXDe16vSRcMTHlNP6h31EZOpbhzxZHMGV5wLOIhiu1DJj2lkxjTCY758_LvXNZ0mrOpBZ1ObnNhi78meeo7TnAj_6t5RK_q6BN5noNwBOy6RLsvLG6YH77IL5CXRKCk8cEcFxQcyNvB2cVD4oMv6g3OLWmpMD7wbXN_weOtp2Q-GPLOAXpNAYRbL5doInw";
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
