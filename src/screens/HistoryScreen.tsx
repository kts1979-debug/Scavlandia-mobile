// src/screens/HistoryScreen.tsx
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getUserHunts } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

const HERO_BG = require("../../assets/images/hunt_bg_12_sagrada_familia_bw.jpg");

interface HuntSummary {
  huntId: string;
  huntTitle: string;
  city: string;
  stopCount: number;
  totalPoints: number;
  createdAt: any;
}

export default function HistoryScreen() {
  const { user, loading: authLoading } = useAuth();
  const [hunts, setHunts] = useState<HuntSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShareHunt = async (hunt: HuntSummary) => {
    try {
      const cityName = hunt.city?.split(",")[0] || hunt.city;
      await Share.share({
        message:
          `🗺️ I explored ${cityName} with Scavlandia!\n\n` +
          `🚩 ${hunt.stopCount} stops\n` +
          `⭐ ${hunt.totalPoints} points possible\n\n` +
          `Plan your own city adventure at Scavlandia! 🚀`,
        title: `Scavlandia — ${cityName}`,
      });
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  const loadHunts = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getUserHunts();
      setHunts(data.hunts || []);
    } catch {
      setError("Could not load your hunts. Pull down to try again.");
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      setLoading(true);
      loadHunts().finally(() => setLoading(false));
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHunts();
    setRefreshing(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Date unknown";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Date unknown";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Date unknown";
    }
  };

  // ── Not logged in ─────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Your Adventures</Text>
            <Text style={styles.heroSubtitle}>Hunt history & memories</Text>
          </View>
          <View style={styles.contentCard}>
            <View style={styles.centered}>
              <Text style={styles.stateEmoji}>🔐</Text>
              <Text style={styles.stateTitleDark}>
                Sign In to See Your Hunts
              </Text>
              <Text style={styles.stateSubtitleDark}>
                Your completed adventures will appear here.
              </Text>
              <Button
                label="Sign In"
                onPress={() => router.push("/login")}
                variant="accent"
                size="lg"
                emoji="🚀"
                style={styles.stateBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Your Adventures</Text>
            <Text style={styles.heroSubtitle}>Hunt history & memories</Text>
          </View>
          <View style={styles.contentCard}>
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Loading your adventures...</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Your Adventures</Text>
            <Text style={styles.heroSubtitle}>Hunt history & memories</Text>
          </View>
          <View style={styles.contentCard}>
            <View style={styles.centered}>
              <Text style={styles.stateEmoji}>⚠️</Text>
              <Text style={styles.stateTitleDark}>Something went wrong</Text>
              <Text style={styles.stateSubtitleDark}>{error}</Text>
              <Button
                label="Try Again"
                onPress={loadHunts}
                variant="accent"
                size="md"
                style={styles.stateBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────
  if (hunts.length === 0) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Your Adventures</Text>
            <Text style={styles.heroSubtitle}>Hunt history & memories</Text>
          </View>
          <View style={styles.contentCard}>
            <View style={styles.centered}>
              <Text style={styles.stateEmoji}>🗺️</Text>
              <Text style={styles.stateTitleDark}>No adventures yet!</Text>
              <Text style={styles.stateSubtitleDark}>
                Build your first hunt and it will show up here.
              </Text>
              <Button
                label="Start a Hunt"
                onPress={() => router.push("/(tabs)")}
                variant="accent"
                size="lg"
                emoji="🚀"
                style={styles.stateBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Hunt list ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Hero header */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Adventures</Text>
          <Text style={styles.heroSubtitle}>
            {hunts.length} hunt{hunts.length !== 1 ? "s" : ""} completed
          </Text>
        </View>

        {/* Hunt list in white card */}
        <FlatList
          data={hunts}
          keyExtractor={(item) => item.huntId}
          style={styles.contentCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/hunt-detail",
                  params: { huntId: item.huntId },
                })
              }
            >
              <Card style={styles.huntCard}>
                {/* Top row */}
                <View style={styles.cardTop}>
                  <Badge
                    label={item.city?.split(",")[0] || item.city}
                    emoji="📍"
                    color={COLORS.accentPale}
                    textColor={COLORS.accent}
                  />
                  <Text style={styles.cardDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Hunt title */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.huntTitle}
                </Text>

                {/* Bottom stats */}
                <View style={styles.cardBottom}>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillText}>
                      🚩 {item.stopCount} stops
                    </Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillText}>
                      ⭐ {item.totalPoints} pts
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.shareHuntBtn}
                    onPress={() => handleShareHunt(item)}
                  >
                    <Text style={styles.shareHuntBtnText}>📤</Text>
                  </TouchableOpacity>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.55)",
  },
  safeArea: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────
  heroSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.75)",
  },

  // ── Content card ──────────────────────────────────────────────
  contentCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 100 },

  // ── States ────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  stateEmoji: { fontSize: 64, marginBottom: SPACING.md },
  stateTitleDark: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stateSubtitleDark: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  stateBtn: { width: "100%" },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    marginTop: SPACING.md,
  },

  // ── Hunt cards ────────────────────────────────────────────────
  huntCard: { ...SHADOW.sm },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  cardDate: { fontSize: FONTS.sizes.xs, color: COLORS.midGray },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  statPill: {
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statPillText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  cardArrow: {
    marginLeft: "auto",
    fontSize: FONTS.sizes.xxl,
    color: COLORS.midGray,
  },
  shareHuntBtn: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.round,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  shareHuntBtnText: { fontSize: 13 },
});
