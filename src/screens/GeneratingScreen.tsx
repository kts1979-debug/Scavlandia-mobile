// src/screens/GeneratingScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NearbyCitySuggestion from "../components/NearbyCitySuggestion";
import { generateHunt, generateMuseumHunt } from "../services/apiService";
import { COLORS, FONTS, SPACING } from "../theme";

const STEPS = [
  { emoji: "🗺️", text: "Mapping your city..." },
  { emoji: "📍", text: "Finding real locations..." },
  { emoji: "⚙️", text: "Crafting your hunt..." },
  { emoji: "✍️", text: "Writing custom clues..." },
  { emoji: "🎯", text: "Ordering stops perfectly..." },
  { emoji: "✨", text: "Almost ready..." },
];

const MUSEUM_STEPS = [
  { emoji: "🏛️", text: "Exploring the museum..." },
  { emoji: "🎨", text: "Finding iconic artworks..." },
  { emoji: "⚙️", text: "Crafting your art clues..." },
  { emoji: "🔍", text: "Writing mystery riddles..." },
  { emoji: "🗺️", text: "Mapping gallery stops..." },
  { emoji: "✨", text: "Your hunt is almost ready..." },
];

export default function GeneratingScreen() {
  const params = useLocalSearchParams();
  const [city, setCity] = useState(params.city as string);
  const [groupProfile] = useState(JSON.parse(params.groupProfile as string));
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Determine which step messages to use
  const isMuseumHunt = groupProfile.huntType === "museum";
  const activeSteps = isMuseumHunt ? MUSEUM_STEPS : STEPS;

  useEffect(() => {
    const stepInterval = setInterval(
      () => setStep((i) => (i + 1) % activeSteps.length),
      4000,
    );
    const dotInterval = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      500,
    );
    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runGeneration = async (huntCity: string, profile: any) => {
    try {
      let result;

      if (profile.huntType === "museum" && profile.museum) {
        // Museum hunt — use museum endpoint
        result = await generateMuseumHunt(
          profile.museum.name,
          profile.museum.address,
          profile.museum.lat,
          profile.museum.lng,
          profile,
        );
      } else {
        // Regular city hunt
        result = await generateHunt(huntCity, profile);
      }

      router.replace({
        pathname: "/hunt-setup",
        params: { hunt: JSON.stringify(result.hunt) },
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "";

      if (
        errorMsg.includes("Only found") ||
        errorMsg.includes("too few") ||
        errorMsg.includes("not enough")
      ) {
        setShowSuggestion(true);
      } else {
        Alert.alert(
          "Hunt Generation Failed",
          errorMsg || "Something went wrong. Please try again.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    }
  };

  useEffect(() => {
    runGeneration(city, groupProfile);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nearby city suggestion screen ──────────────────────────────
  if (showSuggestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.suggestionContent}>
          <NearbyCitySuggestion
            currentCity={city}
            onSelectCity={(newCity) => {
              setCity(newCity);
              setStep(0);
              runGeneration(newCity, groupProfile);
            }}
            onDismiss={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Generating screen ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Dynamic emoji and text based on hunt type */}
        <Text style={styles.bigEmoji}>{activeSteps[step].emoji}</Text>
        <Text style={styles.city}>
          {isMuseumHunt ? "🏛️" : "📍"} {city}
        </Text>
        <Text style={styles.title}>
          {isMuseumHunt
            ? "Building your museum adventure"
            : "Building your adventure"}
          {dots}
        </Text>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={styles.spinner}
        />
        <Text style={styles.stepText}>{activeSteps[step].text}</Text>
        <View style={styles.stepsRow}>
          {activeSteps.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>
        <Text style={styles.note}>
          {isMuseumHunt
            ? "Crafting your artwork clues..."
            : "This takes about 20–30 seconds"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  bigEmoji: { fontSize: 80, marginBottom: SPACING.md },
  city: {
    fontSize: FONTS.sizes.lg,
    color: "#AED6F1",
    marginBottom: SPACING.xl,
    fontWeight: FONTS.weights.medium,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  spinner: { marginBottom: SPACING.lg },
  stepText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.xl,
    minHeight: 28,
  },
  stepsRow: { flexDirection: "row", gap: 8, marginBottom: SPACING.xl },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: { backgroundColor: COLORS.accent, width: 24 },
  note: { fontSize: FONTS.sizes.sm, color: "#7FB3D3" },
  suggestionContent: { flex: 1, justifyContent: "center", padding: SPACING.lg },
});
