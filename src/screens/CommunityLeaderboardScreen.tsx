// src/screens/CommunityLeaderboardScreen.tsx
// Shows the global all-time community leaderboard
// and the current user's personal all-time stats.

import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import {
  AllTimeStats,
  CommunityLeader,
  getCommunityLeaderboard,
  getMyStats,
} from "../services/leaderboardService";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function CommunityLeaderboardScreen() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<CommunityLeader[]>([]);
  const [myStats, setMyStats] = useState<AllTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"community" | "me">("community");

  const loadData = useCallback(async () => {
    try {
      const [communityData, myData] = await Promise.all([
        getCommunityLeaderboard(),
        getMyStats(),
      ]);
      setLeaders(communityData.leaders || []);
      setMyStats(myData);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const myRank = leaders.findIndex((l) => l.userId === user?.uid) + 1;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌍 Leaderboards</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "community" && styles.tabActive]}
          onPress={() => setActiveTab("community")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "community" && styles.tabTextActive,
            ]}
          >
            🌍 Community
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "me" && styles.tabActive]}
          onPress={() => setActiveTab("me")}
        >
          <Text
            style={[styles.tabText, activeTab === "me" && styles.tabTextActive]}
          >
            👤 My Stats
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "community" ? (
        // ── Community leaderboard ────────────────────────────────────
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
            />
          }
          ListHeaderComponent={
            myRank > 0 ? (
              <Card style={styles.myRankBanner}>
                <Text style={styles.myRankLabel}>Your Community Rank</Text>
                <View style={styles.myRankRow}>
                  <Text style={styles.myRankNum}>#{myRank}</Text>
                  <Text style={styles.myRankPoints}>
                    {myStats?.totalPoints || 0} pts total
                  </Text>
                </View>
              </Card>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isMe = item.userId === user?.uid;
            const medal = MEDALS[index];

            return (
              <View
                style={[
                  styles.row,
                  isMe && styles.rowMe,
                  index === 0 && styles.rowFirst,
                ]}
              >
                <Text style={styles.rowRank}>{medal || `${index + 1}`}</Text>
                <View style={styles.rowInfo}>
                  <Text
                    style={[styles.rowName, isMe && styles.rowNameMe]}
                    numberOfLines={1}
                  >
                    {item.displayName}
                    {isMe ? " (you)" : ""}
                  </Text>
                  <Text style={styles.rowMeta}>
                    🗺️ {item.huntsCompleted} hunts · 📍{" "}
                    {item.citiesExplored?.length || 0} cities
                  </Text>
                </View>
                <View style={styles.scoreCol}>
                  <Text
                    style={[
                      styles.rowScore,
                      index === 0 && styles.rowScoreFirst,
                    ]}
                  >
                    {item.totalPoints}
                  </Text>
                  <Text style={styles.rowScoreLabel}>pts</Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        // ── My personal stats ─────────────────────────────────────────
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
            />
          }
          ListHeaderComponent={
            myStats ? (
              <View style={styles.myStatsContainer}>
                {/* Points card */}
                <Card variant="primary" style={styles.statHeroCard}>
                  <Text style={styles.statHeroEmoji}>⭐</Text>
                  <Text style={styles.statHeroValue}>
                    {myStats.totalPoints}
                  </Text>
                  <Text style={styles.statHeroLabel}>Total Points</Text>
                  {myRank > 0 && (
                    <Badge
                      label={`#${myRank} Community Rank`}
                      color="rgba(255,255,255,0.2)"
                      style={styles.rankBadge}
                    />
                  )}
                </Card>

                {/* Stats grid */}
                <View style={styles.statsGrid}>
                  {[
                    {
                      emoji: "🗺️",
                      value: myStats.huntsCompleted,
                      label: "Hunts Done",
                    },
                    {
                      emoji: "📍",
                      value: myStats.citiesExplored?.length || 0,
                      label: "Cities",
                    },
                    {
                      emoji: "🏆",
                      value: myStats.bestHuntScore,
                      label: "Best Hunt",
                    },
                    {
                      emoji: "🔥",
                      value: myStats.currentStreak || 0,
                      label: "Streak",
                    },
                  ].map((s, i) => (
                    <Card key={i} style={styles.statCard}>
                      <Text style={styles.statCardEmoji}>{s.emoji}</Text>
                      <Text style={styles.statCardValue}>{s.value}</Text>
                      <Text style={styles.statCardLabel}>{s.label}</Text>
                    </Card>
                  ))}
                </View>

                {/* Cities explored */}
                {myStats.citiesExplored &&
                  myStats.citiesExplored.length > 0 && (
                    <Card style={styles.citiesCard}>
                      <Text style={styles.citiesTitle}>📍 Cities Explored</Text>
                      <View style={styles.citiesRow}>
                        {myStats.citiesExplored.map((city, i) => (
                          <Badge
                            key={i}
                            label={city}
                            color={COLORS.accentPale}
                            textColor={COLORS.accent}
                            style={styles.cityBadge}
                          />
                        ))}
                      </View>
                    </Card>
                  )}
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.noStatsEmoji}>🗺️</Text>
                <Text style={styles.noStatsText}>
                  Complete your first hunt to see your stats!
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.darkGray },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  backBtn: { padding: SPACING.sm },
  backText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: { flex: 1, padding: SPACING.md, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.accent },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  tabTextActive: { color: COLORS.accent, fontWeight: FONTS.weights.bold },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 40 },
  myRankBanner: { marginBottom: SPACING.sm },
  myRankLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  myRankRow: { flexDirection: "row", alignItems: "baseline", gap: SPACING.sm },
  myRankNum: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  myRankPoints: { fontSize: FONTS.sizes.md, color: COLORS.darkGray },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  rowFirst: {
    backgroundColor: COLORS.goldLight,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  rowMe: {
    backgroundColor: COLORS.accentPale,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  rowRank: { fontSize: 22, width: 36, textAlign: "center" },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  rowNameMe: { color: COLORS.accent },
  rowMeta: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  scoreCol: { alignItems: "flex-end" },
  rowScore: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  rowScoreFirst: { color: COLORS.gold },
  rowScoreLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  myStatsContainer: { padding: SPACING.md, paddingBottom: 40 },
  statHeroCard: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  statHeroEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  statHeroValue: {
    fontSize: 56,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  statHeroLabel: { fontSize: FONTS.sizes.md, color: "#AED6F1", marginTop: 4 },
  rankBadge: { marginTop: SPACING.sm },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  statCardEmoji: { fontSize: 28, marginBottom: 6 },
  statCardValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statCardLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  citiesCard: { marginBottom: SPACING.md },
  citiesTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  citiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityBadge: {},
  noStatsEmoji: { fontSize: 48 },
  noStatsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
