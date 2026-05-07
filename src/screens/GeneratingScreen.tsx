// src/screens/GeneratingScreen.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NearbyCitySuggestion from "../components/NearbyCitySuggestion";
import {
  generateHunt,
  generateMuseumHunt,
  generateRoadTripHunt,
} from "../services/apiService";
import { COLORS, FONTS, SPACING } from "../theme";

const LOGO_ICON = require("../../assets/images/icon_white_1024.png");

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

const ROAD_TRIP_STEPS = [
  { emoji: "🗺️", text: "Mapping your route..." },
  { emoji: "🛣️", text: "Exploring the highway..." },
  { emoji: "📍", text: "Finding hidden gems..." },
  { emoji: "✍️", text: "Writing road trip clues..." },
  { emoji: "🚗", text: "Ordering your stops..." },
  { emoji: "✨", text: "Almost ready to roll..." },
];

export default function GeneratingScreen() {
  const params = useLocalSearchParams();
  const [city, setCity] = useState(params.city as string);
  const [groupProfile] = useState(JSON.parse(params.groupProfile as string));
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const isMuseumHunt = groupProfile.huntType === "museum";
  const isRoadTrip = groupProfile.huntType === "road-trip";
  const activeSteps = isMuseumHunt
    ? MUSEUM_STEPS
    : isRoadTrip
      ? ROAD_TRIP_STEPS
      : STEPS;

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
        result = await generateMuseumHunt(
          profile.museum.name,
          profile.museum.address,
          profile.museum.lat,
          profile.museum.lng,
          profile,
        );
      } else if (profile.huntType === "road-trip") {
        result = await generateRoadTripHunt(
          profile.startLocation,
          profile.endLocation,
          profile.stopCount,
          profile.interests,
          profile.tone,
          profile.difficulty,
          profile.timeBetweenStops,
        );
      } else {
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
        <Text style={styles.bigEmoji}>{activeSteps[step].emoji}</Text>
        <Text style={styles.city}>
          {isMuseumHunt ? "🏛️" : isRoadTrip ? "🚗" : "📍"} {city}
        </Text>
        <Text style={styles.title}>
          {isMuseumHunt
            ? "Building your museum adventure"
            : isRoadTrip
              ? "Planning your road trip"
              : "Building your hunt"}
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

        {/* Logo watermark */}
        <View style={styles.watermark}>
          <Image
            source={LOGO_ICON}
            style={styles.watermarkIcon}
            resizeMode="contain"
          />
          <Text style={styles.watermarkTitle}>Scavlandia</Text>
          <Text style={styles.watermarkTagline}>Explore · Discover · Hunt</Text>
        </View>
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
  note: {
    fontSize: FONTS.sizes.sm,
    color: "#7FB3D3",
    marginBottom: SPACING.xl,
  },
  watermark: {
    position: "absolute",
    bottom: SPACING.xl,
    alignItems: "center",
    opacity: 0.75,
  },
  watermarkIcon: { width: 60, height: 60, marginBottom: 8 },
  watermarkTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  watermarkTagline: {
    fontSize: FONTS.sizes.xs,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2,
  },
  suggestionContent: { flex: 1, justifyContent: "center", padding: SPACING.lg },
});
