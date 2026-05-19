// src/screens/HuntStyleScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING, SPECIALTY_HUNTS } from "../theme";

const HERO_BG = require("../../assets/images/hunt_bg_5_explorer_greece.jpg");

export default function HuntStyleScreen() {
  const params = useLocalSearchParams();
  const huntType = (params.huntType as string) || "city";

  const handlePersonalized = () => {
    const destination = huntType === "micro" ? "/micro-hunt" : "/group-profile";
    router.push({
      pathname: destination as any,
      params: { huntStyle: "personalized" },
    });
  };

  const handleSpecialty = (key: string) => {
    const destination = huntType === "micro" ? "/micro-hunt" : "/group-profile";
    router.push({
      pathname: destination as any,
      params: { huntStyle: "specialty", specialtyKey: key },
    });
  };

  const specialtyEntries = Object.entries(SPECIALTY_HUNTS);

  return (
    <View style={styles.container}>
      <Image source={HERO_BG} style={styles.heroBg} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero header */}
          <View style={styles.heroSection}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>What kind of hunt?</Text>
            <Text style={styles.subtitle}>
              Choose a personalized hunt based on your interests, or pick a
              specialty experience with a unified theme from start to finish.
            </Text>
          </View>

          {/* Content card */}
          <View style={styles.contentCard}>
            {/* Personalized option */}
            <TouchableOpacity
              style={styles.personalizedCard}
              onPress={handlePersonalized}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🎯</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Personalized Hunt</Text>
                  <Text style={styles.cardSub}>
                    Built around your interests
                  </Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
              <Text style={styles.cardDesc}>
                Select interest categories like History, Art, True Crime, or
                Nature. Your hunt will mix stops from all the topics you love.
              </Text>
              <View style={styles.exampleRow}>
                {["🏛️ History", "🎨 Art", "🔪 True Crime", "🌿 Nature"].map(
                  (ex) => (
                    <View key={ex} style={styles.exampleTag}>
                      <Text style={styles.exampleTagText}>{ex}</Text>
                    </View>
                  ),
                )}
              </View>
            </TouchableOpacity>

            {/* Specialty hunts */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Specialty Hunts</Text>
              <Text style={styles.sectionSub}>
                A fully themed experience — every stop, clue, and fun fact
                matches the theme from first stop to last.
              </Text>
            </View>

            {specialtyEntries.map(([key, s]) => (
              <TouchableOpacity
                key={key}
                style={styles.specialtyCard}
                onPress={() => handleSpecialty(key)}
                activeOpacity={0.85}
              >
                <Text style={styles.specialtyEmoji}>{s.emoji}</Text>
                <View style={styles.specialtyContent}>
                  <Text style={styles.specialtyLabel}>{s.label}</Text>
                  <Text style={styles.specialtyDesc}>{s.description}</Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  heroBg: {
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
    backgroundColor: "rgba(25, 50, 85, 0.72)",
  },
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 100 }, // ← remove any paddingTop, let hero sit flush
  heroSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  backBtn: { marginBottom: SPACING.md },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },
  contentCard: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingBottom: 100,
    minHeight: 500,
  },
  personalizedCard: {
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  cardEmoji: { fontSize: 32 },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
  },
  cardSub: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray, marginTop: 2 },
  cardArrow: { fontSize: FONTS.sizes.xxl, color: COLORS.midGray },
  cardDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  exampleRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  exampleTag: {
    backgroundColor: COLORS.accentPale,
    borderRadius: RADIUS.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  exampleTagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
  },
  sectionHeader: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white, // ← was COLORS.primary, needs to be white since it's over the photo now
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: FONTS.sizes.sm,
    color: "rgba(255,255,255,0.85)", // ← was COLORS.darkGray
    lineHeight: 20,
  },
  specialtyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 248, 247, 0.75)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    gap: SPACING.sm,
  },
  specialtyEmoji: { fontSize: 28, flexShrink: 0 },
  specialtyContent: { flex: 1 },
  specialtyLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  specialtyDesc: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
});
