// src/services/leaderboardService.ts
// Handles all leaderboard API calls — sessions, scoring, and all-time stats.

import axios from "axios";
import { config } from "../utils/config";
import { auth } from "../utils/firebaseConfig";

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 15000,
});

// Auto-attach auth token to every request
api.interceptors.request.use(async (requestConfig) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// ── Session leaderboard ───────────────────────────────────────────────

export const createSession = async (
  huntTitle: string,
  city: string,
  isTeam: boolean,
  teamName?: string,
) => {
  const response = await api.post("/api/leaderboard/sessions/create", {
    huntTitle,
    city,
    isTeam,
    teamName,
  });
  return response.data; // { sessionCode }
};

export const joinSession = async (
  sessionCode: string,
  city: string,
  isTeam: boolean,
  teamName?: string,
) => {
  const response = await api.post("/api/leaderboard/sessions/join", {
    sessionCode,
    city,
    isTeam,
    teamName,
  });
  return response.data; // { sessionCode, huntTitle, city }
};

export const updateSessionScore = async (
  sessionCode: string,
  pointsEarned: number,
  stopsComplete: number,
  city: string,
) => {
  const response = await api.post(
    `/api/leaderboard/sessions/${sessionCode}/score`,
    { pointsEarned, stopsComplete, city },
  );
  return response.data;
};

export const getSessionParticipants = async (sessionCode: string) => {
  const response = await api.get(`/api/leaderboard/sessions/${sessionCode}`);
  return response.data; // { participants, sessionCode }
};

// ── All-time stats ────────────────────────────────────────────────────

export const updateAllTimeStats = async (
  totalPoints: number,
  city: string,
  huntTitle: string,
) => {
  const response = await api.post("/api/leaderboard/alltime/update", {
    totalPoints,
    city,
    huntTitle,
  });
  return response.data;
};

export const getCommunityLeaderboard = async () => {
  const response = await api.get("/api/leaderboard/alltime/community");
  return response.data; // { leaders: [...] }
};

export const getMyStats = async () => {
  const response = await api.get("/api/leaderboard/alltime/me");
  return response.data;
};

// ── TypeScript types ──────────────────────────────────────────────────

export interface SessionParticipant {
  userId: string;
  displayName: string;
  teamName?: string;
  isTeam: boolean;
  score: number;
  stopsComplete: number;
  city: string;
}

export interface AllTimeStats {
  userId: string;
  displayName: string;
  totalPoints: number;
  huntsCompleted: number;
  citiesExplored: string[];
  bestHuntScore: number;
  currentStreak: number;
  lastHuntDate?: any;
  memberSince?: any;
}

export interface CommunityLeader {
  rank: number;
  userId: string;
  displayName: string;
  totalPoints: number;
  huntsCompleted: number;
  citiesExplored: string[];
  bestHuntScore: number;
}
