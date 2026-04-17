// src/screens/FinalLeaderboardScreen.tsx
// Shows final session results after a hunt is complete.

import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { SessionParticipant } from "../services/leaderboardService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const MEDALS = ["🥇", "🥈", "🥉"];
const POSITIONS = ["1st Place", "2nd Place", "3rd Place"];

export default function FinalLeaderboardScreen() {
  const params = useLocalSearchParams();
  const sessionCode = params.sessionCode as string;
  const myPoints = parseInt((params.myPoints as string) || "0");
  const { user } = useAuth();

  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "sessions", sessionCode, "participants"),
          orderBy("score", "desc"),
        );
        const snapshot = await getDocs(q);
        setParticipants(
          snapshot.docs.map((d) => d.data() as SessionParticipant),
        );
      } catch (err) {
        console.error("Failed to load final results:", err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionCode) loadResults();
    else setLoading(false);
  }, [sessionCode]);

  const myRank = participants.findIndex((p) => p.userId === user?.uid) + 1;
  const winner = participants[0];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading final results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Winner announcement */}
        {winner && (
          <View style={styles.winnerSection}>
            <Text style={styles.winnerEmoji}>🏆</Text>
            <Text style={styles.winnerLabel}>Winner!</Text>
            <Text style={styles.winnerName}>
              {winner.isTeam && winner.teamName
                ? winner.teamName
                : winner.displayName}
            </Text>
            <Text style={styles.winnerScore}>{winner.score} pts</Text>
            <Text style={styles.winnerCity}>
              📍 {winner.city?.split(",")[0]}
            </Text>
          </View>
        )}

        {/* My result */}
        {myRank > 0 && (
          <Card style={styles.myResult}>
            <Text style={styles.myResultTitle}>Your Result</Text>
            <View style={styles.myResultRow}>
              <Text style={styles.myRankEmoji}>
                {MEDALS[myRank - 1] || `#${myRank}`}
              </Text>
              <View>
                <Text style={styles.myPosition}>
                  {POSITIONS[myRank - 1] || `${myRank}th Place`}
                </Text>
                <Text style={styles.myPoints}>{myPoints} points earned</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Full leaderboard */}
        <Card style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>Final Standings</Text>
          <Text style={styles.sessionCode}>Session: {sessionCode}</Text>

          {participants.map((p, index) => {
            const isMe = p.userId === user?.uid;
            const displayName =
              p.isTeam && p.teamName ? p.teamName : p.displayName;

            return (
              <View
                key={p.userId}
                style={[
                  styles.row,
                  isMe && styles.rowMe,
                  index === 0 && styles.rowFirst,
                ]}
              >
                <Text style={styles.rowRank}>
                  {MEDALS[index] || `${index + 1}`}
                </Text>
                <View style={styles.rowInfo}>
                  <Text
                    style={[styles.rowName, isMe && styles.rowNameMe]}
                    numberOfLines={1}
                  >
                    {displayName}
                    {isMe ? " (you)" : ""}
                  </Text>
                  <Text style={styles.rowMeta}>
                    📍 {p.city?.split(",")[0]} · {p.stopsComplete} stops
                  </Text>
                </View>
                <Text
                  style={[styles.rowScore, index === 0 && styles.rowScoreFirst]}
                >
                  {p.score} pts
                </Text>
              </View>
            );
          })}
        </Card>

        <Button
          label="Back to Home"
          onPress={() => router.replace("/(tabs)")}
          variant="accent"
          size="lg"
          emoji="🏠"
          style={styles.homeBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
  },
  loadingText: { color: COLORS.white, fontSize: FONTS.sizes.md },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  winnerSection: {
    alignItems: "center",
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
  },
  winnerEmoji: { fontSize: 72, marginBottom: SPACING.sm },
  winnerLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gold,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
    letterSpacing: 2,
  },
  winnerName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
    textAlign: "center",
  },
  winnerScore: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.gold,
    marginBottom: 4,
  },
  winnerCity: { fontSize: FONTS.sizes.sm, color: "#AED6F1" },
  myResult: { marginBottom: SPACING.md },
  myResultTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  myResultRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  myRankEmoji: { fontSize: 40 },
  myPosition: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  myPoints: { fontSize: FONTS.sizes.md, color: COLORS.darkGray, marginTop: 2 },
  leaderboardCard: { marginBottom: SPACING.lg },
  leaderboardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  sessionCode: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
    fontFamily: "monospace",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: SPACING.sm,
  },
  rowFirst: {
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  rowMe: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  rowRank: { fontSize: 20, width: 32, textAlign: "center" },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  rowNameMe: { color: COLORS.accent },
  rowMeta: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  rowScore: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  rowScoreFirst: { color: COLORS.gold },
  homeBtn: { marginTop: SPACING.sm },
});
