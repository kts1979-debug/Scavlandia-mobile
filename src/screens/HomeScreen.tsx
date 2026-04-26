// src/screens/HomeScreen.tsx
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getActiveHunt } from "../services/apiService";
import { COLORS, FONTS, RADIUS, SPACING } from "../theme";

const LOGO_FULL = require("../../assets/images/scavlandia_matched_height.png");

export default function HomeScreen() {
  const { user } = useAuth();
  const [activeHunt, setActiveHunt] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getActiveHunt()
        .then((data) => setActiveHunt(data.activeHunt))
        .catch(() => {});
    } else {
      setActiveHunt(null);
    }
  }, [user]);

  const stats = [
    { emoji: "🗺️", label: "Cities", value: "500+" },
    { emoji: "🎯", label: "Stops", value: "6–12" },
    { emoji: "⚡", label: "Ready in", value: "30s" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            onPress={() => router.push("/login")}
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

        {/* Hero Banner */}
        <Card variant="primary" style={styles.heroBanner}>
          <Image
            source={LOGO_FULL}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroSub}>
            {
              "Tell us about your group and we'll build\na personalized hunt in any city or museum"
            }
          </Text>
          <Button
            label="Start a Hunt"
            onPress={() => router.push("/hunt-type")}
            variant="accent"
            size="lg"
            emoji="🚀"
            style={styles.heroBtn}
          />
        </Card>

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
            emoji: "🏛️",
            title: "Museum Hunt",
            desc: "Discover artworks and exhibits inside a museum with riddle-based clues.",
            onPress: () => router.push("/hunt-type"),
          },
          {
            emoji: "⚡",
            title: "Micro Hunt",
            desc: "A quick 1–2 stop adventure within half a mile of you. Perfect for a short break.",
            onPress: () => router.push("/micro-hunt"),
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

        {/* How it works */}
        <Text style={styles.sectionTitle}>How it works</Text>
        {[
          {
            step: "1",
            emoji: "👥",
            title: "Tell us about your group",
            desc: "Age, size, interests and vibe",
          },
          {
            step: "2",
            emoji: "📍",
            title: "Pick your city or museum",
            desc: "Works anywhere in the world",
          },
          {
            step: "3",
            emoji: "⚙️",
            title: "We build your hunt",
            desc: "Real locations, custom clues, just for you",
          },
          {
            step: "4",
            emoji: "🏆",
            title: "Play and earn points",
            desc: "Complete stops, take photos, win",
          },
        ].map((item) => (
          <Card key={item.step} style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>{item.step}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                {item.emoji} {item.title}
              </Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === "android" ? 100 : 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  headerLogo: { height: 36, width: 180 },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
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
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  resumeBannerArrow: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONTS.weights.heavy,
  },
  heroBanner: {
    marginBottom: SPACING.lg,
    alignItems: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  heroLogo: { width: "90%", height: 160, marginBottom: SPACING.md },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  heroBtn: { width: "100%" },
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, alignItems: "center", paddingVertical: SPACING.md },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  huntTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    paddingVertical: SPACING.md,
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
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNum: {
    color: COLORS.white,
    fontWeight: FONTS.weights.heavy,
    fontSize: FONTS.sizes.md,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  stepDesc: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
  tagline: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, marginTop: 2 },
});
