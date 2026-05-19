// src/screens/ActiveTabScreen.tsx
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getActiveHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";
import Button from "../components/ui/Button";

const HERO_BG = require("../../assets/images/hunt_bg_5_explorer_greece.jpg");

export default function ActiveTabScreen() {
  const { user } = useAuth();
  const [activeHunt, setActiveHunt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setLoading(true);
        getActiveHunt()
          .then((data) => {
            const hunt = data.activeHunt;
            if (hunt && hunt.status === "in_progress" && hunt.activeState) {
              setActiveHunt(hunt);
            } else {
              setActiveHunt(null);
            }
          })
          .catch(() => setActiveHunt(null))
          .finally(() => setLoading(false));
      } else {
        setActiveHunt(null);
        setLoading(false);
      }
    }, [user]),
  );

  const handleResume = () => {
    if (!activeHunt) return;
    const state = activeHunt.activeState;
    router.push({
      pathname: "/active-hunt",
      params: {
        hunt: JSON.stringify(activeHunt),
        resumeAtStop: String((state?.activeStopIndex || 0) + 1),
        totalPoints: String(state?.totalPoints || 0),
        stopPhotos: JSON.stringify(state?.stopPhotos || {}),
        skippedStops: JSON.stringify(state?.skippedStops || []),
        swapsUsed: String(state?.swapsUsed || 0),
      },
    });
  };

  // ── Not logged in ─────────────────────────────────────────────
  if (!user) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.centered}>
            <Text style={styles.stateEmoji}>🔐</Text>
            <Text style={styles.stateTitle}>Sign In to Track Your Hunts</Text>
            <Text style={styles.stateSubtitle}>
              Your active adventures will appear here.
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
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Checking for active hunts...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── No active hunt ────────────────────────────────────────────
  if (!activeHunt) {
    return (
      <View style={styles.container}>
        <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Active Hunt</Text>
            <Text style={styles.heroSubtitle}>Your current adventure</Text>
          </View>
          <View style={styles.contentCard}>
            <View style={styles.centered}>
              <Text style={styles.stateEmoji}>🗺️</Text>
              <Text style={styles.stateTitleDark}>No Active Hunt</Text>
              <Text style={styles.stateSubtitleDark}>
                {
                  "You don't have a hunt in progress. Start a new one or join a friend's hunt!"
                }
              </Text>
              <Button
                label="Start a Hunt"
                onPress={() => router.push("/hunt-type")}
                variant="accent"
                size="lg"
                emoji="🚀"
                style={styles.stateBtn}
              />
              <Button
                label="Join a Hunt"
                onPress={() => router.push("/join-hunt")}
                variant="secondary"
                size="lg"
                emoji="🤝"
                style={styles.stateBtnSecondary}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Active hunt ───────────────────────────────────────────────
  const state = activeHunt.activeState;
  const currentStopIndex = state?.activeStopIndex || 0;
  const totalStops = activeHunt.stops?.length || 0;
  const completedCount = state?.completedIndices?.length || 0;
  const totalPoints = state?.totalPoints || 0;
  const currentStop = activeHunt.stops?.[currentStopIndex];
  const progressPercent =
    totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0;

  return (
    <View style={styles.container}>
      <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Active Hunt</Text>
          <Text style={styles.heroSubtitle}>Your adventure is in progress</Text>
        </View>

        {/* Content card */}
        <ScrollView
          style={styles.contentCard}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hunt title */}
          <View style={styles.huntTitleCard}>
            <Text style={styles.huntEmoji}>▶️</Text>
            <View style={styles.huntTitleContent}>
              <Text style={styles.huntTitle} numberOfLines={2}>
                {activeHunt.huntTitle}
              </Text>
              <Text style={styles.huntCity}>📍 {activeHunt.city}</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressSub}>
              {completedCount} of {totalStops} stops completed
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalStops - completedCount}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          {/* Current stop */}
          {currentStop && (
            <View style={styles.currentStopCard}>
              <Text style={styles.currentStopLabel}>📍 Current Stop</Text>
              <Text style={styles.currentStopName}>
                {currentStop.locationName}
              </Text>
              <Text style={styles.currentStopAddress} numberOfLines={1}>
                {currentStop.address}
              </Text>
            </View>
          )}

          {/* Resume button */}
          <TouchableOpacity style={styles.resumeBtn} onPress={handleResume}>
            <Text style={styles.resumeBtnText}>▶️ Resume Hunt</Text>
          </TouchableOpacity>

          {/* Share hunt link */}
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() =>
              router.push({
                pathname: "/hunt-setup",
                params: { hunt: JSON.stringify(activeHunt), playMode: "solo" },
              })
            }
          >
            <Text style={styles.joinBtnText}>🔗 Share This Hunt</Text>
          </TouchableOpacity>
        </ScrollView>
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
  cardContent: { padding: SPACING.lg, paddingBottom: 40 },

  // ── Centered states ───────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  stateEmoji: { fontSize: 64, marginBottom: SPACING.md, textAlign: "center" },
  stateTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stateTitleDark: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  stateSubtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  stateSubtitleDark: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  stateBtn: { width: "100%", marginBottom: SPACING.sm },
  stateBtnSecondary: { width: "100%" },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.md,
  },

  // ── Hunt info cards ───────────────────────────────────────────
  huntTitleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  huntEmoji: { fontSize: 32, flexShrink: 0 },
  huntTitleContent: { flex: 1 },
  huntTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  huntCity: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },

  // ── Progress ──────────────────────────────────────────────────
  progressCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  progressPercent: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.accent,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
  },
  progressSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },

  // ── Stats ─────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },

  // ── Current stop ──────────────────────────────────────────────
  currentStopCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  currentStopLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentStopName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  currentStopAddress: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },

  // ── Buttons ───────────────────────────────────────────────────
  resumeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  resumeBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
  },
  joinBtn: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  joinBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
