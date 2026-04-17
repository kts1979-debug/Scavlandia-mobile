// src/components/LiveLeaderboard.tsx
// Shows real-time scores for all session participants.
// Uses Firestore onSnapshot for live updates.

import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SessionParticipant } from "../services/leaderboardService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

interface LiveLeaderboardProps {
  sessionCode: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LiveLeaderboard({ sessionCode }: LiveLeaderboardProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionCode) return;

    // Import getFirestore correctly
    const {
      getFirestore,
      collection,
      onSnapshot,
      orderBy,
      query,
    } = require("firebase/firestore");
    const db = getFirestore();

    const participantsRef = collection(
      db,
      "sessions",
      sessionCode,
      "participants",
    );
    const q = query(participantsRef, orderBy("score", "desc"));

    // Real-time listener — updates automatically as scores change
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => doc.data() as SessionParticipant,
        );
        setParticipants(data);
        setLoading(false);
      },
      (error) => {
        console.error("Leaderboard listener error:", error.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [sessionCode]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  if (participants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No participants yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Live Leaderboard</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {participants.map((participant, index) => {
        const isCurrentUser = participant.userId === user?.uid;
        const medal = MEDALS[index];
        const displayLabel =
          participant.isTeam && participant.teamName
            ? participant.teamName
            : participant.displayName;

        return (
          <View
            key={participant.userId}
            style={[
              styles.row,
              isCurrentUser && styles.rowHighlighted,
              index === 0 && styles.rowFirst,
            ]}
          >
            {/* Rank */}
            <Text style={styles.rank}>{medal || `${index + 1}`}</Text>

            {/* Name and city */}
            <View style={styles.info}>
              <Text
                style={[styles.name, isCurrentUser && styles.nameHighlighted]}
                numberOfLines={1}
              >
                {displayLabel}
                {isCurrentUser ? " (you)" : ""}
              </Text>
              <Text style={styles.city}>
                📍 {participant.city?.split(",")[0]} ·{" "}
                {participant.stopsComplete} stops
              </Text>
            </View>

            {/* Score */}
            <View style={styles.scoreContainer}>
              <Text style={[styles.score, index === 0 && styles.scoreFirst]}>
                {participant.score}
              </Text>
              <Text style={styles.scorePts}>pts</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  loadingContainer: {
    padding: SPACING.md,
    alignItems: "center",
    gap: SPACING.sm,
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingText: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  emptyContainer: { padding: SPACING.md, alignItems: "center" },
  emptyText: { fontSize: FONTS.sizes.sm, color: "#AED6F1" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  liveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  rowHighlighted: { backgroundColor: "rgba(232,98,42,0.25)" },
  rowFirst: { backgroundColor: "rgba(243,156,18,0.2)" },
  rank: { fontSize: 20, width: 32, textAlign: "center" },
  info: { flex: 1 },
  name: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  nameHighlighted: { color: COLORS.accent },
  city: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  scoreContainer: { alignItems: "flex-end" },
  score: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  scoreFirst: { color: COLORS.gold },
  scorePts: { fontSize: FONTS.sizes.xs, color: "rgba(255,255,255,0.6)" },
});
