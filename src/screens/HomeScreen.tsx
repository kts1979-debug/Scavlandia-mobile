// src/screens/HomeScreen.tsx
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getActiveHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const LOGO_ICON = require("../../assets/images/icon_white_1024.png");
const HERO_BG = require("../../assets/images/hunt_bg_5_explorer_greece.jpg");

export default function HomeScreen() {
  const { user } = useAuth();
  const [activeHunt, setActiveHunt] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getActiveHunt()
          .then((data) => {
            const hunt = data.activeHunt;
            if (hunt && hunt.status === "in_progress" && hunt.activeState) {
              setActiveHunt(hunt);
            } else {
              setActiveHunt(null);
            }
          })
          .catch(() => setActiveHunt(null));
      } else {
        setActiveHunt(null);
      }
    }, [user]),
  );

  const stats = [
    { emoji: "🗺️", label: "Cities", value: "500+" },
    { emoji: "🎯", label: "Stops", value: "6–12" },
    { emoji: "⚡", label: "Ready in", value: "30s" },
  ];

  return (
    <View style={styles.container}>
      {/* Full screen background image */}
      <Image source={HERO_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>Scavlandia</Text>
              {user ? (
                <Text style={styles.greeting}>
                  Hey {user.displayName?.split(" ")[0] || "Explorer"} 👋
                </Text>
              ) : (
                <Text style={styles.tagline}>
                  Your personalized scavenger hunt
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.avatarBtn}
            >
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || "👤"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Resume Hunt Banner */}
          {activeHunt && (
            <TouchableOpacity
              style={styles.resumeBanner}
              onPress={() => {
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
              }}
            >
              <View style={styles.resumeBannerLeft}>
                <Text style={styles.resumeBannerEmoji}>▶️</Text>
                <View>
                  <Text style={styles.resumeBannerTitle}>Resume Your Hunt</Text>
                  <Text style={styles.resumeBannerSub} numberOfLines={1}>
                    {activeHunt.huntTitle}
                  </Text>
                </View>
              </View>
              <Text style={styles.resumeBannerArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Hero section — replaces heroBanner card */}
          <View style={styles.heroSection}>
            <Image
              source={LOGO_ICON}
              style={styles.heroIcon}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Scavlandia</Text>
            <Text style={styles.heroTagline}>Explore · Discover · Hunt</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push("/hunt-type")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Start a Hunt</Text>
            </TouchableOpacity>
            <Text style={styles.heroSub}>
              Personalized scavenger hunts in any city!
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <Card key={i} style={styles.statCard}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </Card>
            ))}
          </View>

          {/* Hunt types */}
          <Text style={styles.sectionTitle}>Three ways to explore</Text>
          {[
            {
              emoji: "🏙️",
              title: "City Hunt",
              desc: "Explore any city with custom clues that fit your vibe. Works in 500+ cities worldwide.",
              onPress: () => router.push("/hunt-type"),
            },
            {
              emoji: "🚗",
              title: "Road Trip Hunt",
              desc: "Discover roadside attractions and fun stops along your journey with riddle-based clues.",
              onPress: () => router.push("/hunt-type"),
            },
            {
              emoji: "⚡",
              title: "Micro Hunt",
              desc: "A quick 1–2 stop adventure within half a mile of you. Perfect for a short break.",
              onPress: () => router.push("/hunt-type"),
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.title}
              onPress={item.onPress}
              activeOpacity={0.85}
            >
              <Card style={styles.huntTypeCard}>
                <Text style={styles.huntTypeEmoji}>{item.emoji}</Text>
                <View style={styles.huntTypeContent}>
                  <Text style={styles.huntTypeTitle}>{item.title}</Text>
                  <Text style={styles.huntTypeDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.huntTypeArrow}>›</Text>
              </Card>
            </TouchableOpacity>
          ))}

          {/* Join a Hunt */}
          <TouchableOpacity
            onPress={() => router.push("/join-hunt")}
            activeOpacity={0.85}
          >
            <Card style={styles.joinHuntCard}>
              <Text style={styles.huntTypeEmoji}>🤝</Text>
              <View style={styles.huntTypeContent}>
                <Text style={styles.huntTypeTitle}>Join a Hunt</Text>
                <Text style={styles.huntTypeDesc}>
                  {
                    "Have a friend's share code? Enter it here to get your own copy of their hunt."
                  }
                </Text>
              </View>
              <Text style={styles.huntTypeArrow}>›</Text>
            </Card>
          </TouchableOpacity>

          {/* Onboarding link */}
          <TouchableOpacity
            style={styles.onboardingLink}
            onPress={() =>
              router.push({
                pathname: "/onboarding",
                params: { fromHome: "true" },
              })
            }
          >
            <Text style={styles.onboardingLinkEmoji}>📖</Text>
            <View style={styles.onboardingLinkContent}>
              <Text style={styles.onboardingLinkTitle}>New to Scavlandia?</Text>
              <Text style={styles.onboardingLinkDesc}>
                See how it works — takes 30 seconds
              </Text>
            </View>
            <Text style={styles.onboardingLinkArrow}>›</Text>
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
    backgroundColor: "rgba(25, 50, 85, 0.45)",
  },
  safeArea: { flex: 1 },
  scroll: {
    padding: SPACING.md,
    paddingBottom: 70,
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  tagline: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },

  // ── Resume banner ─────────────────────────────────────────────
  resumeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resumeBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  resumeBannerEmoji: { fontSize: 28 },
  resumeBannerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
  },
  resumeBannerSub: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  resumeBannerArrow: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONTS.weights.heavy,
  },

  // ── Hero section ──────────────────────────────────────────────
  heroSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  heroIcon: { width: 72, height: 72, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTagline: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  heroBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 14,
    marginBottom: SPACING.sm,
  },
  heroBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
  },

  // ── Stats ─────────────────────────────────────────────────────
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },

  // ── Hunt type cards ───────────────────────────────────────────
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  huntTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  huntTypeEmoji: { fontSize: 32, flexShrink: 0 },
  huntTypeContent: { flex: 1 },
  huntTypeTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  huntTypeDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  huntTypeArrow: { fontSize: FONTS.sizes.xxl, color: COLORS.midGray },
  joinHuntCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  onboardingLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onboardingLinkEmoji: { fontSize: 28, flexShrink: 0 },
  onboardingLinkContent: { flex: 1 },
  onboardingLinkTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  onboardingLinkDesc: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  onboardingLinkArrow: { fontSize: FONTS.sizes.xxl, color: COLORS.midGray },
});
