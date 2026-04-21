// src/screens/HomeScreen.tsx
import { router } from "expo-router";
import React from "react";
import {
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
import { COLORS, FONTS, SPACING } from "../theme";

export default function HomeScreen() {
  const { user } = useAuth();

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

        {/* Hero Banner */}
        <Card variant="primary" style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🗺️</Text>
          <Text style={styles.heroTitle}>Welcome to{`\n`}Scavlandia!</Text>
          <Text style={styles.heroSub}>
            Tell us about your group and we'll build{`\n`}a personalized hunt in
            any city or museum
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
            desc: "Explore a city with custom clues at real locations. Works in 500+ cities worldwide.",
          },
          {
            emoji: "🏛️",
            title: "Museum Hunt",
            desc: "Discover artworks and exhibits inside a museum with riddle-based clues.",
          },
          {
            emoji: "⚡",
            title: "Micro Hunt",
            desc: "A quick 1–2 stop adventure within half a mile of you. Perfect for a short break.",
          },
        ].map((item) => (
          <Card key={item.title} style={styles.huntTypeCard}>
            <Text style={styles.huntTypeEmoji}>{item.emoji}</Text>
            <View style={styles.huntTypeContent}>
              <Text style={styles.huntTypeTitle}>{item.title}</Text>
              <Text style={styles.huntTypeDesc}>{item.desc}</Text>
            </View>
          </Card>
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
  scroll: { padding: SPACING.md, paddingBottom: 40 },
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
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  tagline: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, marginTop: 2 },
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
  heroBanner: {
    marginBottom: SPACING.lg,
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
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
});
