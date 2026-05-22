// src/screens/HomeScreen.tsx
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const LOGO_ICON = require("../../assets/images/icon_white_1024.png");
const HERO_BG = require("../../assets/images/hunt_bg_5_explorer_greece.jpg");

export default function HomeScreen() {
  const { user } = useAuth();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  const stats = [
    { emoji: "🗺️", label: "Anywhere", value: "Any City" },
    { emoji: "🎯", label: "Stops", value: "1–12" },
    { emoji: "⚡", label: "Ready in", value: "60s" },
  ];

  useEffect(() => {
    const checkReviewPrompt = async () => {
      try {
        const reviewed = await AsyncStorage.getItem(
          "scavlandia_review_completed",
        );
        if (reviewed) return;
        const countStr = await AsyncStorage.getItem(
          "scavlandia_hunts_since_review",
        );
        const count = countStr ? parseInt(countStr) : 0;
        if (count >= 1) setShowReviewPrompt(true);
      } catch {}
    };
    checkReviewPrompt();
  }, []);

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
                  Hey {user.displayName?.split(" ")[0] || "Explorer"}
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
              desc: "Explore any city with custom clues that fit your vibe. Works in any city worldwide.",
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
              desc: "A quick 1–3 stop adventure within half a mile of you. Perfect for a short break.",
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

          {/* Review prompt */}
          {showReviewPrompt && (
            <TouchableOpacity
              style={styles.reviewCard}
              onPress={async () => {
                try {
                  const isAvailable = await StoreReview.isAvailableAsync();
                  if (isAvailable) {
                    await StoreReview.requestReview();
                  } else {
                    const url =
                      Platform.OS === "ios"
                        ? "https://apps.apple.com/app/id6763187578/action=write-review"
                        : "https://play.google.com/store/apps/details?id=com.katesauls.scavlandia";
                    await Linking.openURL(url);
                  }
                  await AsyncStorage.setItem(
                    "scavlandia_review_completed",
                    "true",
                  );
                  setShowReviewPrompt(false);
                } catch {}
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewEmoji}>⭐</Text>
              <View style={styles.reviewContent}>
                <Text style={styles.reviewTitle}>Enjoying Scavlandia?</Text>
                <Text style={styles.reviewDesc}>
                  Tap to leave a review — it helps us a lot!
                </Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.setItem(
                    "scavlandia_review_completed",
                    "true",
                  );
                  setShowReviewPrompt(false);
                }}
                style={styles.reviewDismiss}
              >
                <Text style={styles.reviewDismissText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

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
              <Text style={styles.onboardingLinkDesc}>See how it works.</Text>
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
    color: COLORS.accent,
  },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
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
    backgroundColor: "rgba(232, 248, 247,0.75)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.primary,
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
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  reviewEmoji: { fontSize: 28, flexShrink: 0 },
  reviewContent: { flex: 1 },
  reviewTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  reviewDesc: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  reviewDismiss: { padding: 4 },
  reviewDismissText: { fontSize: FONTS.sizes.md, color: COLORS.midGray },
});
